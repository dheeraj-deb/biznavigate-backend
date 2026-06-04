import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';

@Injectable()
export class StockReservationService {
  private readonly logger = new Logger(StockReservationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async cleanupExpiredReservations(): Promise<number> {
    // Order stock is deducted at order creation and is released by cancel flows.
    // Cart/seller holds are cleaned by the dedicated methods below.
    return 0;
  }

  async cleanupExpiredCartHolds(): Promise<{ count: number; restoredProductIds: string[] }> {
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const expired = await tx.cart_reservations.findMany({
        where: { status: 'active', expires_at: { lt: now } },
        select: { reservation_id: true, item_id: true, variant_id: true, quantity: true },
        take: 500,
      });

      if (!expired.length) return { count: 0, restoredProductIds: [] };

      const reservationIds = expired.map((hold) => hold.reservation_id);
      const updated = await tx.cart_reservations.updateMany({
        where: { reservation_id: { in: reservationIds }, status: 'active' },
        data: { status: 'released', updated_at: new Date() },
      });

      for (const hold of expired) {
        if (hold.variant_id) {
          await tx.item_variants.updateMany({
            where: { variant_id: hold.variant_id, item_id: hold.item_id },
            data: { stock_quantity: { increment: hold.quantity }, updated_at: new Date() },
          });
        } else {
          await tx.catalog_items.updateMany({
            where: { item_id: hold.item_id, stock_quantity: { not: null } },
            data: { stock_quantity: { increment: hold.quantity }, updated_at: new Date() },
          });
        }
      }

      const restoredProductIds = [...new Set(expired.map((r) => r.item_id))];
      this.logger.log(`Released ${updated.count} expired cart holds and restored stock`);

      return { count: updated.count, restoredProductIds };
    });
  }

  async cleanupExpiredSellerHolds(): Promise<{ count: number; restoredProductIds: string[] }> {
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const expired = await tx.$queryRawUnsafe<any[]>(
        `SELECT reservation_id, item_id, variant_id, quantity
         FROM seller_stock_reservations
         WHERE status = 'active' AND expires_at < $1
         ORDER BY expires_at ASC
         LIMIT 500
         FOR UPDATE`,
        now,
      ).catch((error) => {
        if (String(error?.message ?? '').includes('seller_stock_reservations')) return [];
        throw error;
      });

      if (!expired.length) return { count: 0, restoredProductIds: [] };

      for (const hold of expired) {
        if (hold.variant_id) {
          await tx.item_variants.updateMany({
            where: { variant_id: hold.variant_id, item_id: hold.item_id },
            data: { stock_quantity: { increment: Number(hold.quantity) }, updated_at: new Date() },
          });
        } else {
          await tx.catalog_items.updateMany({
            where: { item_id: hold.item_id, stock_quantity: { not: null } },
            data: { stock_quantity: { increment: Number(hold.quantity) }, updated_at: new Date() },
          });
        }
      }

      await tx.$queryRawUnsafe(
        `UPDATE seller_stock_reservations
         SET status = 'released', released_at = now(), updated_at = now(), metadata = COALESCE(metadata, '{}'::jsonb) || '{"released_by":"expiry_job"}'::jsonb
         WHERE reservation_id = ANY($1::uuid[]) AND status = 'active'`,
        expired.map((hold) => hold.reservation_id),
      );

      const restoredProductIds = [...new Set(expired.map((hold) => hold.item_id))];
      this.logger.log(`Released ${expired.length} expired seller holds and restored stock`);
      return { count: expired.length, restoredProductIds };
    });
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
