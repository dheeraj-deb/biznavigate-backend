import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class StockReservationService {
  private readonly logger = new Logger(StockReservationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async cleanupExpiredReservations(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.cart_reservations.updateMany({
      where: { status: 'active', expires_at: { lt: now } },
      data: { status: 'released' },
    });
    return result.count;
  }

  async cleanupExpiredCartHolds(): Promise<{ count: number; restoredProductIds: string[] }> {
    const now = new Date();
    const expired = await this.prisma.cart_reservations.findMany({
      where: { status: 'active', expires_at: { lt: now } },
      select: { item_id: true },
    });

    if (!expired.length) return { count: 0, restoredProductIds: [] };

    await this.prisma.cart_reservations.updateMany({
      where: { status: 'active', expires_at: { lt: now } },
      data: { status: 'released' },
    });

    const restoredProductIds = [...new Set(expired.map((r) => r.item_id))];
    this.logger.log(`Released ${expired.length} expired cart holds`);

    return { count: expired.length, restoredProductIds };
  }

  async releaseExpiredReservations(): Promise<void> {
    await this.cleanupExpiredReservations();
  }

  /**
   * Reserve stock for an order item by decrementing available inventory inside
   * the caller's transaction. This project uses immediate stock holds rather
   * than a separate order_reservations table.
   */
  async reserveStock(
    orderId: string,
    itemId: string,
    variantId: string | null | undefined,
    quantity: number,
    tx: any = this.prisma,
  ): Promise<void> {
    if (quantity <= 0) {
      throw new ConflictException(`Invalid reservation quantity for order ${orderId}: ${quantity}`);
    }

    if (variantId) {
      const updated = await tx.item_variants.updateMany({
        where: {
          variant_id: variantId,
          item_id: itemId,
          stock_quantity: { gte: quantity },
        },
        data: {
          stock_quantity: { decrement: quantity },
          updated_at: new Date(),
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          `Insufficient stock for item ${itemId}, variant ${variantId} on order ${orderId}`,
        );
      }
      return;
    }

    const updated = await tx.catalog_items.updateMany({
      where: {
        item_id: itemId,
        stock_quantity: { not: null, gte: quantity },
      },
      data: {
        stock_quantity: { decrement: quantity },
        updated_at: new Date(),
      },
    });

    if (updated.count === 0) {
      throw new ConflictException(`Insufficient stock for item ${itemId} on order ${orderId}`);
    }
  }

  /**
   * Stock is already deducted at order creation time, so confirming payment only
   * converts the hold conceptually. No database mutation is needed here.
   */
  async convertReservationToSale(orderId: string): Promise<void> {
    this.logger.debug(`Stock reservation converted to sale for order ${orderId}`);
  }

  /**
   * Release an order's held stock, used when an order is cancelled before it is
   * terminally delivered.
   */
  async releaseReservation(orderId: string, tx: any = this.prisma): Promise<void> {
    const order = await tx.orders.findUnique({
      where: { order_id: orderId },
      include: { order_items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    for (const item of order.order_items ?? []) {
      if (item.variant_id) {
        await tx.item_variants.update({
          where: { variant_id: item.variant_id },
          data: {
            stock_quantity: { increment: item.quantity },
            updated_at: new Date(),
          },
        });
      } else {
        await tx.catalog_items.updateMany({
          where: { item_id: item.item_id, stock_quantity: { not: null } },
          data: {
            stock_quantity: { increment: item.quantity },
            updated_at: new Date(),
          },
        });
      }
    }

    this.logger.debug(`Released stock reservation for order ${orderId}`);
  }
}
