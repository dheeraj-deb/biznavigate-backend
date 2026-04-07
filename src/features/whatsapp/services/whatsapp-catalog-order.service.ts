import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma';
import { CartService } from '../../cart/application/services/cart.service';
import { WhatsAppApiClientService } from '../infrastructure/whatsapp-api-client.service';
import { WhatsAppCatalogService } from './whatsapp-catalog.service';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { SendMessageType, InteractiveSendType } from '../dto/whatsapp-message.dto';
import * as crypto from 'crypto';
import { ConversationService } from '../../conversation/conversation.service';

/**
 * Handles WhatsApp Catalog Order events
 * When users interact with catalog (Add to Cart, Place Order)
 */
@Injectable()
export class WhatsAppCatalogOrderService {
  private readonly logger = new Logger(WhatsAppCatalogOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly apiClient: WhatsAppApiClientService,
    private readonly catalogService: WhatsAppCatalogService,
    private readonly configService: ConfigService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly conversationService: ConversationService,
  ) { }

  /**
   * Handle WhatsApp catalog order webhook
   * Called when user clicks "Add to Cart" or "Place Order" in WhatsApp catalog
   */
  async handleCatalogOrder(orderPayload: any, metadata: any, contacts: any[]): Promise<void> {
    try {

      console.log("ORDER PAYLOAD", orderPayload);
      console.log("METADATA", metadata);

      const phoneNumberId = metadata.phone_number_id;
      const from = orderPayload.from;
      const catalogId = orderPayload.order?.catalog_id;
      const productItems = orderPayload.order?.product_items || [];

      // Find business account
      const account = await this.prisma.social_accounts.findFirst({
        where: {
          platform: 'whatsapp',
          page_id: phoneNumberId,
          is_active: true,
        },
        include: {
          businesses: true,
        },
      });

      if (!account) {
        this.logger.warn(`No WhatsApp account found for phone number: ${phoneNumberId}`);
        return;
      }

      const customer = this.prisma.customers.findFirst({
        where: { business_id: account.business_id, platform_user_id: from }
      })

      // Find or create lead
      let lead = await this.prisma.leads.findFirst({
        where: {
          business_id: account.business_id,
          platform_user_id: from,
          source: 'whatsapp',
        },
      });

      if (!lead) {
        const contact = contacts?.find(c => c.wa_id === from);
        const contactName = contact?.profile?.name || from;
        const nameParts = contactName.split(' ');

        lead = await this.prisma.leads.create({
          data: {
            business_id: account.business_id,
            tenant_id: account.businesses.tenant_id,
            source: 'whatsapp',
            platform_user_id: from,
            first_name: nameParts[0] || contactName,
            last_name: nameParts.slice(1).join(' ') || null,
            phone: from,
            status: 'new',
            lead_score: 5,
          },
        });

        this.logger.log(`Created new lead ${lead.lead_id} from catalog order`);
      }

      console.log("productItems", productItems)

      for (const item of productItems) {
        const productRetailerId = item.product_retailer_id;
        const quantity = item.quantity || 1;
        const itemPrice = item.item_price || 0;
        const currency = item.currency || 'INR';

        const product = await this.prisma.products.findFirst({
          where: {
            business_id: account.business_id,
            product_id: productRetailerId,
            in_whatsapp_catalog: true,
          },
        });

        if (!product) {
          this.logger.warn(`Product not found for retailer_id: ${productRetailerId}`);

          await this.sendMessage(
            phoneNumberId,
            from,
            `Sorry, the product you selected is no longer available.`,
          );
          continue;
        }

        try {
          await this.cartService.addToCart({
            customer_id: (await customer).customer_id,
            business_id: account.business_id,
            product_id: product.product_id,
            variant_id: undefined,
            quantity: quantity,
          });

          this.logger.log(
            `Added ${product.name} x${quantity} to cart for lead ${lead.lead_id}`,
          );

          try {
            await this.createTemporaryHold(product.product_id, quantity, lead.lead_id);
            this.logger.log(`Reserved ${quantity} unit(s) of "${product.name}" for lead ${lead.lead_id}`);
          } catch (holdError) {
            this.logger.warn(`Stock hold failed for "${product.name}": ${holdError.message}`);
          }
        } catch (error) {
          this.logger.error(`Failed to add product to cart: ${error.message}`);

          await this.sendMessage(
            phoneNumberId,
            from,
            `Sorry, we couldn't add "${product.name}" to your cart. ${error.message}`,
          );
        }
      }

      // Get updated cart
      const cart = await this.cartService.getCart((await customer).customer_id, account.business_id);

      if (!cart || cart.items.length === 0) {
        this.logger.warn('Cart is empty after processing order');
        return;
      }

      // Always publish Kafka event — workflow service looks up paused execution in MongoDB
      const conversation = await this.conversationService.findActiveConversation(lead.lead_id, 'whatsapp', account.business_id);

      await this.kafkaProducer.publishCatalogOrderCompleted({
        execution_id: null,
        lead_id: lead.lead_id,
        business_id: account.business_id,
        tenant_id: account.businesses.tenant_id,
        cart_info: {
          cart_id: cart.cart_id,
          total_items: cart.total_items,
          total_amount: cart.total_amount,
          items: cart.items,
        },
        context: {
          message_id: null,
          conversation_id: conversation?.conversation_id || null,
          channel: 'whatsapp',
          contactName: contacts?.find(c => c.wa_id === from)?.profile?.name || from,
          phoneNumberId,
          from,
          business_name: account.businesses.business_name,
          lead_info: {
            lead_id: lead.lead_id,
            first_name: lead.first_name,
            last_name: lead.last_name,
            status: lead.status,
            lead_score: lead.lead_score,
          },
          message_type: 'order',
        },
      });

      this.logger.log(`Published catalog order completed event for lead ${lead.lead_id}`);

    } catch (error) {
      this.logger.error('Error processing catalog order:', error);
    }
  }

  /**
   * Build cart summary text for WhatsApp message
   */
  private buildCartSummary(cart: any): string {
    return cart.items
      .map((item: any, index: number) => {
        return `${index + 1}. ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''
          }\n   Qty: ${item.quantity} × ₹${item.unit_price.toFixed(2)} = ₹${item.total_price.toFixed(2)}`;
      })
      .join('\n\n');
  }

  /**
   * Send cart confirmation with interactive buttons
   */
  private async sendCartConfirmation(
    phoneNumberId: string,
    to: string,
    cart: any,
    cartSummary: string,
  ): Promise<void> {
    try {
      const messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: SendMessageType.INTERACTIVE,
        interactive: {
          type: InteractiveSendType.BUTTON,
          body: {
            text: `🛒 *Your Cart*\n\n${cartSummary}\n\n*Total Items: ${cart.total_items}*\n*Total: ₹${cart.total_amount.toFixed(2)}*\n\nWhat would you like to do?`,
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: 'confirm_cart',
                  title: '✅ Confirm Order',
                },
              },
              {
                type: 'reply',
                reply: {
                  id: 'update_cart',
                  title: '✏️ Update Cart',
                },
              },
              {
                type: 'reply',
                reply: {
                  id: 'add_more_products',
                  title: '➕ Add Products',
                },
              },
            ],
          },
        },
      };

      await this.apiClient.sendMessage(phoneNumberId, messagePayload);
    } catch (error) {
      this.logger.error(`Failed to send cart confirmation: ${error.message}`);
    }
  }

  /**
   * Send WhatsApp message
   */
  private async sendMessage(
    phoneNumberId: string,
    to: string,
    message: string,
  ): Promise<void> {
    try {
      const messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: SendMessageType.TEXT,
        text: {
          body: message,
          preview_url: false,
        },
      };

      await this.apiClient.sendMessage(phoneNumberId, messagePayload);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  /**
   * Decrypt access token
   */

  /**
   * Find paused workflow execution for a lead
   */
  private async findPausedWorkflow(lead_id: string, business_id: string) {
    try {
      return await this.prisma.workflow_executions.findFirst({
        where: {
          lead_id,
          business_id,
          channel: 'whatsapp',
          status: 'paused',
        },
        orderBy: {
          updated_at: 'desc', // Get most recent
        },
      });
    } catch (error) {
      this.logger.error('Failed to find paused workflow:', error);
      return null;
    }
  }

  private readonly HOLD_MINUTES = 5;

  /**
   * Reserve stock when a lead adds to cart (pre-order hold).
   * - SELECT FOR UPDATE prevents concurrent over-reservation on the same product.
   * - Increments reserved_stock on the product row atomically.
   * - Creates a cart_reservations record with expires_at for the cleanup job.
   */
  async createTemporaryHold(productId: string, qty: number, leadId: string): Promise<string> {
    let stockHitZero = false;

    const reservationId = await this.prisma.$transaction(async (tx) => {
      // 1. Pessimistic lock — blocks concurrent holds on the same product
      const rows = await tx.$queryRaw<{ stock_quantity: number; reserved_stock: number }[]>(
        Prisma.sql`SELECT stock_quantity, reserved_stock FROM products WHERE product_id = ${productId}::uuid FOR UPDATE`,
      );

      const product = rows[0];
      if (!product) {
        throw new BadRequestException(`Product not found: ${productId}`);
      }

      // 2. Available = stock not yet committed to pending orders
      const available = (Number(product.stock_quantity) ?? 0) - (Number(product.reserved_stock) ?? 0);

      if (available < qty) {
        throw new ConflictException(
          `Insufficient stock for product ${productId} (lead: ${leadId}). Available: ${available}, Requested: ${qty}`,
        );
      }

      // 3. Deduct from stock_quantity immediately — physically locks units for this cart hold.
      const newStock = Number(product.stock_quantity) - qty;
      stockHitZero = newStock === 0;

      await tx.$executeRaw(
        Prisma.sql`UPDATE products
          SET stock_quantity = ${newStock}::integer,
              in_stock       = ${newStock > 0},
              version        = version + 1,
              updated_at     = NOW()
          WHERE product_id = ${productId}::uuid`,
      );

      // 4. Record the hold so the cleanup job can reverse it on expiry
      const expiresAt = new Date(Date.now() + this.HOLD_MINUTES * 60 * 1000);
      const inserted = await tx.$queryRaw<{ reservation_id: string }[]>(
        Prisma.sql`INSERT INTO cart_reservations (lead_id, product_id, quantity, expires_at, status)
          VALUES (${leadId}::uuid, ${productId}::uuid, ${qty}::integer, ${expiresAt}, 'active')
          RETURNING reservation_id`,
      );

      return inserted[0].reservation_id;
    });

    // After the transaction commits, push availability change to WhatsApp catalog.
    // Fire-and-forget — catalog sync failure must not roll back the stock hold.
    if (stockHitZero) {
      this.catalogService
        .syncProductAvailabilityToCatalog(productId)
        .catch((err) => this.logger.warn(`Catalog availability sync failed for ${productId}: ${err.message}`));
    }

    return reservationId;
  }
}
