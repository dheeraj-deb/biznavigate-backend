import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepositoryPrisma } from '../../infrastructure/cart.repository.prisma';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Cart, CartWithItems } from '../../domain/entities/cart.entity';
import { AddToCartDto, UpdateCartItemDto, CheckoutCartDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepositoryPrisma,
    private readonly prisma: PrismaService,
  ) { }


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

      // Decrement stock for physical items
      for (const item of cart.items) {
        await this.decrementStock(item.item_id, item.variant_id, item.quantity);
      }

      this.logger.log(`Decremented inventory for cart ${dto.cart_id}`);

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

      // Create order
      const order = await this.createOrderFromCart(
        cart,
        orderItems,
        dto.delivery_address,
        dto.payment_method,
      );

      // Mark cart as converted
      await this.cartRepository.convertCart(dto.cart_id);

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
  ): Promise<void> {
    if (variantId) {
      await this.prisma.item_variants.update({
        where: { variant_id: variantId },
        data: { stock_quantity: { decrement: quantity } },
      });
    } else {
      await this.prisma.catalog_items.updateMany({
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
  ): Promise<any> {
    const lead = await this.prisma.leads.findUnique({
      where: { lead_id: cart.lead_id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead not found: ${cart.lead_id}`);
    }

    // Create order
    const order = await this.prisma.orders.create({
      data: {
        business_id: cart.business_id,
        tenant_id: cart.tenant_id,
        lead_id: cart.lead_id,
        order_type: 'product',
        total_amount: cart.total_amount,
        payment_status: 'pending',
        delivery_status: 'pending',
      },
    });

    // Create order items
    for (const item of orderItems) {
      await this.prisma.order_items.create({
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
        },
      });
    }

    return order;
  }
}
