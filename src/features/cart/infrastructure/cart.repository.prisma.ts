import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Cart, CartItem, CartWithItems, CartStatus } from '../domain/entities/cart.entity';

@Injectable()
export class CartRepositoryPrisma {
  private readonly logger = new Logger(CartRepositoryPrisma.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Get or create active cart for a lead
   */
  async getOrCreateCart(customer_id: string, businessId: string, tenantId: string): Promise<Cart> {
    let cart = await this.prisma.carts.findFirst({
      where: {
        customer_id: customer_id,
        business_id: businessId,
        status: CartStatus.ACTIVE,
      },
    });

    if (!cart) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      cart = await this.prisma.carts.create({
        data: {
          customer_id: customer_id,
          business_id: businessId,
          tenant_id: tenantId,
          status: CartStatus.ACTIVE,
          expires_at: expiresAt,
        },
      });

      this.logger.log(`Created new cart ${cart.cart_id} for customer ${customer_id}`);
    }

    return {
      ...cart,
      total_amount: Number(cart.total_amount),
    } as Cart;
  }

  /**
   * Get cart with all items
   */
  async getCartWithItems(cartId: string): Promise<CartWithItems | null> {
    const cart = await this.prisma.carts.findUnique({
      where: { cart_id: cartId },
      include: {
        cart_items: {
          include: {
            products: {
              select: {
                product_id: true,
                name: true,
                price: true,
                primary_image_url: true,
                in_stock: true,
                stock_quantity: true,
                track_inventory: true,
              },
            },
            product_variants: {
              select: {
                variant_id: true,
                name: true,
                price: true,
                quantity: true,
                in_stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) return null;

    return {
      ...cart,
      total_amount: Number(cart.total_amount),
      items: cart.cart_items.map((item) => ({
        ...item,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        variant_id: item.variant_id || null,
        variant_name: item.variant_name || null,
        snapshot: item.snapshot || null,
      })),
    } as CartWithItems;
  }

  /**
   * Add item to cart or update quantity if exists
   */
  async addItem(
    cartId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
    productName: string,
    variantName: string | null,
    unitPrice: number,
  ): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await this.prisma.cart_items.findFirst({
      where: {
        cart_id: cartId,
        product_id: productId,
        variant_id: variantId || null,
      },
    });

    let cartItem: any;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      cartItem = await this.prisma.cart_items.update({
        where: { cart_item_id: existingItem.cart_item_id },
        data: {
          quantity: newQuantity,
          total_price: newQuantity * unitPrice,
          updated_at: new Date(),
        },
      });

      this.logger.log(`Updated cart item ${cartItem.cart_item_id}: qty ${existingItem.quantity} → ${newQuantity}`);
    } else {
      // Create new cart item
      cartItem = await this.prisma.cart_items.create({
        data: {
          cart_id: cartId,
          product_id: productId,
          variant_id: variantId,
          product_name: productName,
          variant_name: variantName,
          quantity,
          unit_price: unitPrice,
          total_price: quantity * unitPrice,
        },
      });

      this.logger.log(`Added new item to cart ${cartId}: ${productName} x${quantity}`);
    }

    // Recalculate cart totals
    await this.recalculateCartTotals(cartId);

    return {
      ...cartItem,
      unit_price: Number(cartItem.unit_price),
      total_price: Number(cartItem.total_price),
      variant_id: cartItem.variant_id || null,
      variant_name: cartItem.variant_name || null,
    } as CartItem;
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
    const item = await this.prisma.cart_items.findUnique({
      where: { cart_item_id: cartItemId },
    });

    if (!item) {
      throw new Error(`Cart item ${cartItemId} not found`);
    }

    const updatedItem = await this.prisma.cart_items.update({
      where: { cart_item_id: cartItemId },
      data: {
        quantity,
        total_price: quantity * Number(item.unit_price),
        updated_at: new Date(),
      },
    });

    // Recalculate cart totals
    await this.recalculateCartTotals(item.cart_id);

    return {
      ...updatedItem,
      unit_price: Number(updatedItem.unit_price),
      total_price: Number(updatedItem.total_price),
      variant_id: updatedItem.variant_id || null,
      variant_name: updatedItem.variant_name || null,
    } as CartItem;
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: string): Promise<void> {
    const item = await this.prisma.cart_items.findUnique({
      where: { cart_item_id: cartItemId },
    });

    if (!item) {
      throw new Error(`Cart item ${cartItemId} not found`);
    }

    await this.prisma.cart_items.delete({
      where: { cart_item_id: cartItemId },
    });

    this.logger.log(`Removed item ${cartItemId} from cart ${item.cart_id}`);

    // Recalculate cart totals
    await this.recalculateCartTotals(item.cart_id);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cart_items.deleteMany({
      where: { cart_id: cartId },
    });

    await this.prisma.carts.update({
      where: { cart_id: cartId },
      data: {
        total_amount: 0,
        total_items: 0,
        updated_at: new Date(),
      },
    });

    this.logger.log(`Cleared all items from cart ${cartId}`);
  }

  /**
   * Convert cart to order (mark as converted)
   */
  async convertCart(cartId: string): Promise<Cart> {
    const cart = await this.prisma.carts.update({
      where: { cart_id: cartId },
      data: {
        status: CartStatus.CONVERTED,
        updated_at: new Date(),
      },
    });

    this.logger.log(`Cart ${cartId} converted to order`);

    return {
      ...cart,
      total_amount: Number(cart.total_amount),
    } as Cart;
  }

  /**
   * Mark cart as abandoned
   */
  async markAsAbandoned(cartId: string): Promise<Cart> {
    const cart = await this.prisma.carts.update({
      where: { cart_id: cartId },
      data: {
        status: CartStatus.ABANDONED,
        updated_at: new Date(),
      },
    });

    return {
      ...cart,
      total_amount: Number(cart.total_amount),
    } as Cart;
  }

  /**
   * Recalculate cart totals based on items
   */
  private async recalculateCartTotals(cartId: string): Promise<void> {
    const items = await this.prisma.cart_items.findMany({
      where: { cart_id: cartId },
    });

    const totalAmount = items.reduce((sum, item) => sum + Number(item.total_price), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    await this.prisma.carts.update({
      where: { cart_id: cartId },
      data: {
        total_amount: totalAmount,
        total_items: totalItems,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get cart by lead ID
   */
  async getActiveCartByCustomerId(customer_id: string, businessId: string): Promise<CartWithItems | null> {
    const cart = await this.prisma.carts.findFirst({
      where: {
        customer_id: customer_id,
        business_id: businessId,
        status: CartStatus.ACTIVE,
      },
      include: {
        cart_items: true,
      },
    });

    if (!cart) return null;

    return {
      ...cart,
      total_amount: Number(cart.total_amount),
      items: cart.cart_items.map((item) => ({
        ...item,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        variant_id: item.variant_id || null,
        variant_name: item.variant_name || null,
        snapshot: item.snapshot || null,
      })),
    } as CartWithItems;
  }
}
