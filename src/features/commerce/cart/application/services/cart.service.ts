import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { CartRepositoryPrisma } from '../../infrastructure/cart.repository.prisma';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { Cart, CartWithItems } from '../../domain/entities/cart.entity';
import { AddToCartDto, UpdateCartItemDto, CheckoutCartDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepositoryPrisma,
    private readonly prisma: PrismaService,
  ) { }

  private buildCheckoutIdempotencyKey(cart: CartWithItems) {
    const itemFingerprint = cart.items
      .map((item) => [
        item.item_id,
        item.variant_id ?? '',
        item.quantity,
        Number(item.unit_price),
      ].join(':'))
      .sort()
      .join('|');
    const raw = [
      cart.business_id,
      cart.lead_id,
      cart.cart_id,
      Number(cart.total_amount),
      itemFingerprint,
    ].join(':');

    return `product_order:${createHash('sha256').update(raw).digest('hex')}`;
  }

  private serializeOrderResponse(order: any) {
    return {
      ...order,
      subtotal: order.subtotal != null ? Number(order.subtotal) : null,
      discount_amount: order.discount_amount != null ? Number(order.discount_amount) : null,
      tax_amount: order.tax_amount != null ? Number(order.tax_amount) : null,
      shipping_fee: order.shipping_fee != null ? Number(order.shipping_fee) : null,
      total_amount: order.total_amount != null ? Number(order.total_amount) : null,
      created_at: order.created_at instanceof Date ? order.created_at.toISOString() : order.created_at,
      updated_at: order.updated_at instanceof Date ? order.updated_at.toISOString() : order.updated_at,
      paid_at: order.paid_at instanceof Date ? order.paid_at.toISOString() : order.paid_at,
      cancelled_at: order.cancelled_at instanceof Date ? order.cancelled_at.toISOString() : order.cancelled_at,
    };
  }


  async addToCart(dto: AddToCartDto): Promise<CartWithItems> {
    try {

      const customer = await this.prisma.customers.findUnique({
        where: { customer_id: dto.customer_id, business_id: dto.business_id },
      });

      if (!customer) {
        throw new NotFoundException(`Customer not found: ${dto.customer_id}`);
      }

      const cart = await this.cartRepository.getOrCreateCart(
        dto.customer_id,
        dto.business_id,
        customer.tenant_id,
      );

      const item = await this.prisma.catalog_items.findFirst({
        where: { item_id: dto.product_id, deleted_at: null },
        include: {
          variants: dto.variant_id
            ? { where: { variant_id: dto.variant_id } }
            : undefined,
        },
      });

      if (!item) {
        throw new NotFoundException(`Item not found: ${dto.product_id}`);
      }

      if (!item.is_active) {
        throw new BadRequestException(`Item ${item.name} is not available`);
      }

      // Determine price and stock based on variant or item
      let unitPrice: number;
      let availableStock: number;
      let productName: string = item.name;
      let variantName: string | null = null;

      if (dto.variant_id) {
        const variant = item.variants?.[0];
        if (!variant) {
          throw new NotFoundException(`Variant not found: ${dto.variant_id}`);
        }

        if (!variant.is_active || variant.stock_quantity <= 0) {
          throw new BadRequestException(
            `${item.name} - ${variant.name} is out of stock`,
          );
        }

        unitPrice = Number(variant.price);
        availableStock = variant.stock_quantity;
        variantName = variant.name;
      } else {
        if (item.stock_quantity !== null && item.stock_quantity <= 0) {
          throw new BadRequestException(`${item.name} is out of stock`);
        }

        unitPrice = Number(item.base_price);
        availableStock = item.stock_quantity ?? 0;
      }

      if (item.stock_quantity !== null) {
        const existingCartItem = await this.prisma.cart_items.findFirst({
          where: {
            cart_id: cart.cart_id,
            item_id: dto.product_id,
            variant_id: dto.variant_id || null,
          },
        });

        const currentCartQty = existingCartItem?.quantity || 0;
        const totalRequested = currentCartQty + dto.quantity;

        if (totalRequested > availableStock) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${availableStock}, In cart: ${currentCartQty}, Requested: ${dto.quantity}`,
          );
        }
      }

      // Add item to cart
      await this.cartRepository.addItem(
        cart.cart_id,
        dto.product_id,
        dto.variant_id || null,
        dto.quantity,
        productName,
        variantName,
        unitPrice,
      );

      this.logger.log(
        `Added to cart: ${productName}${variantName ? ` - ${variantName}` : ''} x${dto.quantity} for customer ${dto.customer_id}`,
      );

      // Return updated cart with items
      return await this.cartRepository.getCartWithItems(cart.cart_id);
    } catch (error) {
      this.logger.error(`Failed to add to cart: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get active cart for a customer
   */
  async getCart(customer_id: string, businessId: string): Promise<CartWithItems | null> {
    return await this.cartRepository.getActiveCartByCustomerId(customer_id, businessId);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartWithItems> {
    try {
      const cartItem = await this.prisma.cart_items.findUnique({
        where: { cart_item_id: cartItemId },
        include: {
          catalog_item: true,
          item_variant: true,
        },
      });

      if (!cartItem) {
        throw new NotFoundException(`Cart item not found: ${cartItemId}`);
      }

      // Check stock availability
      const catalogItem = cartItem.catalog_item;
      if (catalogItem.stock_quantity !== null) {
        const availableStock = cartItem.variant_id
          ? cartItem.item_variant?.stock_quantity || 0
          : catalogItem.stock_quantity || 0;

        if (dto.quantity > availableStock) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${availableStock}, Requested: ${dto.quantity}`,
          );
        }
      }

      await this.cartRepository.updateItemQuantity(cartItemId, dto.quantity);

      return await this.cartRepository.getCartWithItems(cartItem.cart_id);
    } catch (error) {
      this.logger.error(`Failed to update cart item: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string): Promise<CartWithItems> {
    try {
      const cartItem = await this.prisma.cart_items.findUnique({
        where: { cart_item_id: cartItemId },
      });

      if (!cartItem) {
        throw new NotFoundException(`Cart item not found: ${cartItemId}`);
      }

      const cartId = cartItem.cart_id;
      await this.cartRepository.removeItem(cartItemId);

      return await this.cartRepository.getCartWithItems(cartId);
    } catch (error) {
      this.logger.error(`Failed to remove from cart: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: string): Promise<Cart> {
    try {
      await this.cartRepository.clearCart(cartId);
      const cart = await this.prisma.carts.findUnique({
        where: { cart_id: cartId },
      });

      if (!cart) {
        throw new NotFoundException(`Cart not found: ${cartId}`);
      }

      return {
        ...cart,
        total_amount: Number(cart.total_amount),
      } as Cart;
    } catch (error) {
      this.logger.error(`Failed to clear cart: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Checkout cart - Create order and reserve inventory
   */
  async checkoutCart(dto: CheckoutCartDto): Promise<any> {
    try {
      // Get cart with items
      const cart = await this.cartRepository.getCartWithItems(dto.cart_id);

      if (!cart) {
        throw new NotFoundException(`Cart not found: ${dto.cart_id}`);
      }

      if (cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const idempotencyKey = this.buildCheckoutIdempotencyKey(cart);
      const existingKey = await this.prisma.workflow_idempotency_keys.findUnique({
        where: { idempotency_key: idempotencyKey },
      });

      if (existingKey?.status === 'completed' && existingKey.response) {
        this.logger.warn(`Duplicate checkout returned existing order for cart ${dto.cart_id}`);
        return existingKey.response;
      }

      if (existingKey?.status === 'started' && (!existingKey.locked_until || existingKey.locked_until > new Date())) {
        throw new ConflictException('Checkout is already being processed');
      }
      const shouldReclaimKey = existingKey?.status === 'failed' ||
        (existingKey?.status === 'started' && existingKey.locked_until && existingKey.locked_until <= new Date());

      // Validate all items still have stock
      for (const item of cart.items) {
        const catalogItem = await this.prisma.catalog_items.findFirst({
          where: { item_id: item.item_id ?? (item as any).product_id, deleted_at: null },
          include: {
            variants: item.variant_id
              ? { where: { variant_id: item.variant_id } }
              : undefined,
          },
        });

        if (!catalogItem) {
          throw new BadRequestException(`Item ${item.product_name} no longer exists`);
        }

        if (catalogItem.stock_quantity !== null) {
          const availableStock = item.variant_id
            ? catalogItem.variants?.[0]?.stock_quantity || 0
            : catalogItem.stock_quantity || 0;

          if (item.quantity > availableStock) {
            throw new BadRequestException(
              `${item.product_name} is out of stock. Available: ${availableStock}`,
            );
          }
        }
      }

      // Prepare order items
      const orderItems = cart.items.map((item) => ({
        item_id: item.item_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      let order: any;
      try {
        order = await this.createOrderFromCart(
          cart,
          orderItems,
          dto.delivery_address,
          dto.payment_method,
          idempotencyKey,
          shouldReclaimKey,
        );
      } catch (error) {
        if (error?.code === 'P2002') {
          const key = await this.prisma.workflow_idempotency_keys.findUnique({
            where: { idempotency_key: idempotencyKey },
          });
          if (key?.status === 'completed' && key.response) {
            return key.response;
          }
          throw new ConflictException('Checkout is already being processed');
        }

        await this.prisma.workflow_idempotency_keys.update({
          where: { idempotency_key: idempotencyKey },
          data: { status: 'failed', locked_until: null, updated_at: new Date() },
        }).catch(() => undefined);
        throw error;
      }

      this.logger.log(
        `Created order ${order.order_id} from cart ${dto.cart_id} with ${cart.items.length} items`,
      );

      return order;
    } catch (error) {
      this.logger.error(`Failed to checkout cart: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Decrement stock on checkout
   */
  private async decrementStock(
    itemId: string,
    variantId: string | null,
    quantity: number,
    tx: any = this.prisma,
  ): Promise<void> {
    if (variantId) {
      await tx.item_variants.update({
        where: { variant_id: variantId },
        data: { stock_quantity: { decrement: quantity } },
      });
    } else {
      await tx.catalog_items.updateMany({
        where: { item_id: itemId, stock_quantity: { not: null } },
        data: { stock_quantity: { decrement: quantity }, updated_at: new Date() },
      });
    }
  }

  /**
   * Create order from cart
   */
  private async createOrderFromCart(
    cart: CartWithItems,
    orderItems: any[],
    deliveryAddress?: string,
    paymentMethod?: string,
    idempotencyKey?: string,
    reclaimFailedKey = false,
  ): Promise<any> {
    const lead = await this.prisma.leads.findUnique({
      where: { lead_id: cart.lead_id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead not found: ${cart.lead_id}`);
    }

    return this.prisma.$transaction(async (tx) => {
      if (idempotencyKey) {
        if (reclaimFailedKey) {
          await tx.workflow_idempotency_keys.update({
            where: { idempotency_key: idempotencyKey },
            data: {
              status: 'started',
              response: null,
              locked_until: new Date(Date.now() + 5 * 60 * 1000),
              updated_at: new Date(),
            },
          });
        } else {
          await tx.workflow_idempotency_keys.create({
            data: {
              idempotency_key: idempotencyKey,
              business_id: cart.business_id,
              tenant_id: cart.tenant_id,
              lead_id: cart.lead_id,
              purpose: 'create_product_order',
              status: 'started',
              locked_until: new Date(Date.now() + 5 * 60 * 1000),
            },
          });
        }
      }

      // Decrement stock inside the order transaction so retries cannot double-decrement.
      for (const item of cart.items) {
        await this.decrementStock(item.item_id, item.variant_id, item.quantity, tx);
      }
      this.logger.log(`Decremented inventory for cart ${cart.cart_id}`);

      // Legacy compatibility order.
      const order = await tx.orders.create({
        data: {
          business_id: cart.business_id,
          tenant_id: cart.tenant_id,
          customer_id: (cart as any).customer_id ?? null,
          lead_id: cart.lead_id,
          order_type: 'product',
          total_amount: cart.total_amount,
          payment_status: 'pending',
          delivery_status: 'pending',
          status: 'pending',
        },
      });

      const productOrder = await tx.product_orders.create({
        data: {
          business_id: cart.business_id,
          tenant_id: cart.tenant_id,
          legacy_order_id: order.order_id,
          customer_id: (cart as any).customer_id ?? null,
          lead_id: cart.lead_id,
          status: 'pending',
          payment_status: 'pending',
          subtotal: cart.total_amount,
          total_amount: cart.total_amount,
          source: 'whatsapp',
          metadata: {
            cart_id: cart.cart_id,
            delivery_address: deliveryAddress,
            payment_method: paymentMethod,
            idempotency_key: idempotencyKey,
          },
        },
      });

      for (const item of orderItems) {
        const snapshot = {
          cart_id: cart.cart_id,
          delivery_address: deliveryAddress,
          payment_method: paymentMethod,
        };

        await tx.order_items.create({
          data: {
            order_id: order.order_id,
            item_id: item.item_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            variant_name: item.variant_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            discount: 0,
            snapshot,
          },
        });

        await tx.product_order_items.create({
          data: {
            product_order_id: productOrder.product_order_id,
            item_id: item.item_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            variant_name: item.variant_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            discount: 0,
            snapshot,
          },
        });
      }

      await tx.product_order_status_events.create({
        data: {
          product_order_id: productOrder.product_order_id,
          business_id: cart.business_id,
          from_status: null,
          to_status: 'pending',
          actor: 'system',
          data: { legacy_order_id: order.order_id, cart_id: cart.cart_id },
        },
      });

      await tx.carts.update({
        where: { cart_id: cart.cart_id },
        data: { status: 'converted', updated_at: new Date() },
      });

      const response = this.serializeOrderResponse({ ...order, product_order_id: productOrder.product_order_id });
      if (idempotencyKey) {
        await tx.workflow_idempotency_keys.update({
          where: { idempotency_key: idempotencyKey },
          data: {
            status: 'completed',
            response,
            node_id: 'product_checkout_create_order',
            locked_until: null,
            updated_at: new Date(),
          },
        });
      }

      if (cart.lead_id) {
        for (const item of orderItems) {
          await tx.product_inquiries.create({
            data: {
              business_id: cart.business_id,
              tenant_id: cart.tenant_id,
              lead_id: cart.lead_id,
              item_id: item.item_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              status: 'ordered',
              metadata: { product_order_id: productOrder.product_order_id, idempotency_key: idempotencyKey },
            },
          });
        }
      }

      return response;
    });
  }
}
