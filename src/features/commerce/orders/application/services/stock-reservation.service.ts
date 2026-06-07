import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';

@Injectable()
export class StockReservationService {
  private readonly logger = new Logger(StockReservationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async cleanupExpiredReservations(): Promise<number> {
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const expiredOrders = await tx.orders.findMany({
        where: {
          order_type: 'product',
          payment_expires_at: { lt: now },
          payment_status: { in: ['pending', 'payment_pending', 'unpaid'] },
          status: { notIn: ['cancelled', 'delivered', 'refunded'] },
        },
        select: { order_id: true, business_id: true },
        orderBy: { payment_expires_at: 'asc' },
        take: 200,
      });

      for (const order of expiredOrders) {
        const productOrder = await tx.product_orders.findUnique({
          where: { legacy_order_id: order.order_id },
          select: { product_order_id: true, business_id: true, status: true },
        });

        await this.releaseReservation(order.order_id, tx);

        await tx.orders.update({
          where: { order_id: order.order_id },
          data: {
            status: 'cancelled',
            payment_status: 'cancelled',
            cancelled_at: now,
            admin_notes: 'Payment window expired; stock released automatically',
            updated_at: now,
          },
        });

        if (productOrder) {
          await tx.product_orders.update({
            where: { product_order_id: productOrder.product_order_id },
            data: {
              status: 'cancelled',
              payment_status: 'cancelled',
              cancelled_at: now,
              updated_at: now,
            },
          });
          await tx.product_order_status_events.create({
            data: {
              product_order_id: productOrder.product_order_id,
              business_id: productOrder.business_id,
              from_status: productOrder.status,
              to_status: 'cancelled',
              actor: 'system',
              data: { reason: 'payment_window_expired', legacy_order_id: order.order_id },
            },
          });
        }
      }

      if (expiredOrders.length) {
        this.logger.log(`Cancelled ${expiredOrders.length} expired product orders and restored stock`);
      }
      return expiredOrders.length;
    });
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
      for (const itemId of restoredProductIds) {
        await this.markWhatsAppCatalogAvailabilityPending(tx, itemId);
      }
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
      for (const itemId of restoredProductIds) {
        await this.markWhatsAppCatalogAvailabilityPending(tx, itemId);
      }
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
      await this.markWhatsAppCatalogAvailabilityPending(tx, itemId);
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
    await this.markWhatsAppCatalogAvailabilityPending(tx, itemId);
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
        await this.markWhatsAppCatalogAvailabilityPending(tx, item.item_id);
      } else {
        await tx.catalog_items.updateMany({
          where: { item_id: item.item_id, stock_quantity: { not: null } },
          data: {
            stock_quantity: { increment: item.quantity },
            updated_at: new Date(),
          },
        });
        await this.markWhatsAppCatalogAvailabilityPending(tx, item.item_id);
      }
    }

    this.logger.debug(`Released stock reservation for order ${orderId}`);
  }

  private async markWhatsAppCatalogAvailabilityPending(tx: any, itemId: string): Promise<void> {
    await tx.external_catalog_items.updateMany({
      where: {
        item_id: itemId,
        provider: 'whatsapp',
        sync_status: { not: 'local_only' },
      },
      data: {
        sync_status: 'pending',
        updated_at: new Date(),
      },
    }).catch((error: any) => {
      this.logger.warn(`Failed to mark WhatsApp catalog availability pending for ${itemId}: ${error.message}`);
    });
  }
}
