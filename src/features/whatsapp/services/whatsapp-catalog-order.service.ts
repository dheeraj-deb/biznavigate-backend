import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { CartService } from '../../cart/application/services/cart.service';
import { WhatsAppApiClientService } from '../infrastructure/whatsapp-api-client.service';
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
      this.logger.log('📦 Processing WhatsApp catalog order:', JSON.stringify(orderPayload));

      const phoneNumberId = metadata.phone_number_id;
      const from = orderPayload.from; // Customer phone number
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

      // Process each product item
      for (const item of productItems) {
        const productRetailerId = item.product_retailer_id; // This is our product_id
        const quantity = item.quantity || 1;
        const itemPrice = item.item_price || 0;
        const currency = item.currency || 'INR';

        // Find product by retailer_id (which we set as product_id during sync)
        const product = await this.prisma.products.findFirst({
          where: {
            business_id: account.business_id,
            // whatsapp_retailer_id: productRetailerId,
            in_whatsapp_catalog: true,
          },
        });

        if (!product) {
          this.logger.warn(`Product not found for retailer_id: ${productRetailerId}`);

          // Send message to customer
          const accessToken = this.decryptToken(account.access_token);
          await this.sendMessage(
            phoneNumberId,
            from,
            `Sorry, the product you selected is no longer available.`,
            accessToken,
          );
          continue;
        }

        try {
          // Add to cart
          await this.cartService.addToCart({
            business_id: account.business_id,
            lead_id: lead.lead_id,
            product_id: product.product_id,
            variant_id: undefined, // WhatsApp catalog doesn't support variants yet
            quantity: quantity,
          });

          this.logger.log(
            `Added ${product.name} x${quantity} to cart for lead ${lead.lead_id}`,
          );
        } catch (error) {
          this.logger.error(`Failed to add product to cart: ${error.message}`);

          // Send error message to customer
          const accessToken = this.decryptToken(account.access_token);
          await this.sendMessage(
            phoneNumberId,
            from,
            `Sorry, we couldn't add "${product.name}" to your cart. ${error.message}`,
            accessToken,
          );
        }
      }

      // Get updated cart
      const cart = await this.cartService.getCart(lead.lead_id, account.business_id);

      if (!cart || cart.items.length === 0) {
        this.logger.warn('Cart is empty after processing order');
        return;
      }

      // Find paused workflow for this lead
      const pausedWorkflow = await this.findPausedWorkflow(lead.lead_id, account.business_id);

      if (pausedWorkflow) {
        // Resume workflow with cart context
        this.logger.log(`Found paused workflow ${pausedWorkflow.execution_id}, resuming...`);

        // Get active conversation from MongoDB
        const conversation = await this.conversationService.findActiveConversation(lead.lead_id, 'whatsapp');

        await this.kafkaProducer.publishCatalogOrderCompleted({
          execution_id: pausedWorkflow.execution_id,
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
      } else {
        // Fallback: No paused workflow, send default cart confirmation
        this.logger.warn(`No paused workflow found for lead ${lead.lead_id}, sending default cart confirmation`);

        const cartSummary = this.buildCartSummary(cart);
        const accessToken = this.decryptToken(account.access_token);

        await this.sendCartConfirmation(
          phoneNumberId,
          from,
          cart,
          cartSummary,
          accessToken,
        );

        this.logger.log(`Cart summary sent to ${from} with ${cart.items.length} items`);
      }

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
    accessToken: string,
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

      await this.apiClient.sendMessage(phoneNumberId, accessToken, messagePayload);
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
    accessToken: string,
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

      await this.apiClient.sendMessage(phoneNumberId, accessToken, messagePayload);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  /**
   * Decrypt access token
   */
  private decryptToken(encryptedToken: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const encryptionKey = this.configService.get<string>('encryption.key');

      if (!encryptionKey) {
        throw new Error('ENCRYPTION_KEY not configured');
      }

      if (!encryptedToken || !encryptedToken.includes(':')) {
        throw new Error('Invalid encrypted token format');
      }

      const key = Buffer.from(encryptionKey, 'hex');
      const parts = encryptedToken.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt token:', error);
      throw new Error('Token decryption failed');
    }
  }

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
}
