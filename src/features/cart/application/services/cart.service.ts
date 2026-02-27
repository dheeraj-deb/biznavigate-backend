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
  ) {}

  /**
   * Add product to cart from WhatsApp catalog
   * Validates inventory and reserves stock
   */
  async addToCart(dto: AddToCartDto): Promise<CartWithItems> {
    try {
      // Get or create active cart for this lead
      const lead = await this.prisma.leads.findUnique({
        where: { lead_id: dto.lead_id },
      });

      if (!lead) {
        throw new NotFoundException(`Lead not found: ${dto.lead_id}`);
      }

      const cart = await this.cartRepository.getOrCreateCart(
        dto.lead_id,
        dto.business_id,
        lead.tenant_id,
      );

      // Validate product exists and is in WhatsApp catalog
      const product = await this.prisma.products.findUnique({
        where: { product_id: dto.product_id },
        include: {
          product_variants: dto.variant_id
            ? { where: { variant_id: dto.variant_id } }
            : undefined,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product not found: ${dto.product_id}`);
      }

      if (!product.in_whatsapp_catalog) {
        throw new BadRequestException(
          `Product ${product.name} is not available in WhatsApp catalog`,
        );
      }

      if (!product.is_active) {
        throw new BadRequestException(`Product ${product.name} is not active`);
      }

      // Determine price and stock based on variant or product
      let unitPrice: number;
      let availableStock: number;
      let productName: string = product.name;
      let variantName: string | null = null;

      if (dto.variant_id) {
        const variant = product.product_variants?.[0];
        if (!variant) {
          throw new NotFoundException(`Variant not found: ${dto.variant_id}`);
        }

        if (!variant.in_stock) {
          throw new BadRequestException(
            `${product.name} - ${variant.name} is out of stock`,
          );
        }

        unitPrice = Number(variant.price);
        availableStock = variant.quantity;
        variantName = variant.name;
      } else {
        if (!product.in_stock) {
          throw new BadRequestException(`${product.name} is out of stock`);
        }

        unitPrice = Number(product.price);
        availableStock = product.stock_quantity || 0;
      }

      // Check if we have enough stock
      if (product.track_inventory) {
        // Get current cart quantity for this product
        const existingCartItem = await this.prisma.cart_items.findFirst({
          where: {
            cart_id: cart.cart_id,
            product_id: dto.product_id,
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
        `Added to cart: ${productName}${variantName ? ` - ${variantName}` : ''} x${dto.quantity} for lead ${dto.lead_id}`,
      );

      // Return updated cart with items
      return await this.cartRepository.getCartWithItems(cart.cart_id);
    } catch (error) {
      this.logger.error(`Failed to add to cart: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get active cart for a lead
   */
  async getCart(leadId: string, businessId: string): Promise<CartWithItems | null> {
    return await this.cartRepository.getActiveCartByLeadId(leadId, businessId);
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
          products: true,
          product_variants: true,
        },
      });

      if (!cartItem) {
        throw new NotFoundException(`Cart item not found: ${cartItemId}`);
      }

      // Check stock availability
      const product = cartItem.products;
      if (product.track_inventory) {
        const availableStock = cartItem.variant_id
          ? cartItem.product_variants?.quantity || 0
          : product.stock_quantity || 0;

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
   * This is called when user clicks "Place Order" in WhatsApp catalog
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
        const product = await this.prisma.products.findUnique({
          where: { product_id: item.product_id },
          include: {
            product_variants: item.variant_id
              ? { where: { variant_id: item.variant_id } }
              : undefined,
          },
        });

        if (!product) {
          throw new BadRequestException(`Product ${item.product_name} no longer exists`);
        }

        if (product.track_inventory) {
          const availableStock = item.variant_id
            ? product.product_variants?.[0]?.quantity || 0
            : product.stock_quantity || 0;

          if (item.quantity > availableStock) {
            throw new BadRequestException(
              `${item.product_name} is out of stock. Available: ${availableStock}`,
            );
          }
        }
      }

      // Reserve inventory for all items
      for (const item of cart.items) {
        await this.reserveStock(item.product_id, item.variant_id, item.quantity);
      }

      this.logger.log(`Reserved inventory for cart ${dto.cart_id}`);

      // Prepare order items
      const orderItems = cart.items.map((item) => ({
        product_id: item.product_id,
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
   * Reserve stock for a product/variant
   */
  private async reserveStock(
    productId: string,
    variantId: string | null,
    quantity: number,
  ): Promise<void> {
    if (variantId) {
      // Reserve variant stock
      await this.prisma.product_variants.update({
        where: { variant_id: variantId },
        data: {
          reserved_stock: { increment: quantity },
          version: { increment: 1 },
        },
      });
    } else {
      // Reserve product stock
      await this.prisma.products.update({
        where: { product_id: productId },
        data: {
          reserved_stock: { increment: quantity },
          version: { increment: 1 },
        },
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
    // Get lead info
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
        items: orderItems, // Store as JSON for now
      },
    });

    // Create order items
    for (const item of orderItems) {
      await this.prisma.order_items.create({
        data: {
          order_id: order.order_id,
          product_id: item.product_id,
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
