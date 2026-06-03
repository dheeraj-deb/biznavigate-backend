import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma';
import { PrismaService } from '../../../prisma/prisma.service';
import { InventoryTransactionService } from '../../inventory/application/services/inventory-transaction.service';

@Injectable()
export class SellerOrderPaymentSafetyService {
  private readonly logger = new Logger(SellerOrderPaymentSafetyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryTransactions: InventoryTransactionService,
  ) {}

  async createPaymentAttempt(tx: any, ctx: any, args: {
    order: any;
    reservation?: any;
    paymentMethod?: string;
    paymentReference?: string;
    paymentProvider?: string;
    source?: string;
    idempotencyKey?: string;
    createdBy?: string;
    metadata?: Record<string, any>;
  }) {
    const order = args.order;
    const reservation = args.reservation;
    const paymentMethod = args.paymentMethod || order.payment_method || 'upi';
    const idempotencyKey =
      args.idempotencyKey ||
      `seller:${ctx.businessId}:order:${order.order_id}:payment-request:${reservation?.seller_reservation_id || paymentMethod}`;
    const metadataJson = JSON.stringify(args.metadata || {});
    const reservationSql = reservation?.seller_reservation_id
      ? Prisma.sql`${reservation.seller_reservation_id}::uuid`
      : Prisma.sql`NULL`;
    const createdBySql = args.createdBy || ctx.userId
      ? Prisma.sql`${args.createdBy || ctx.userId}::uuid`
      : Prisma.sql`NULL`;
    const expiresAt = order.payment_expires_at || reservation?.expires_at;
    const expiresSql = expiresAt ? Prisma.sql`${expiresAt}::timestamptz` : Prisma.sql`NULL`;

    const rows = (await tx.$queryRaw(
      Prisma.sql`
        INSERT INTO seller_order_payment_attempts (
          business_id,
          tenant_id,
          order_id,
          reservation_id,
          payment_provider,
          payment_method,
          amount,
          currency,
          status,
          idempotency_key,
          payment_reference,
          expires_at,
          source,
          created_by,
          metadata
        )
        VALUES (
          ${ctx.businessId}::uuid,
          ${ctx.tenantId}::uuid,
          ${order.order_id}::uuid,
          ${reservationSql},
          ${args.paymentProvider || 'manual'},
          ${paymentMethod},
          ${Number(order.total_amount || 0)}::numeric,
          ${order.currency || 'INR'},
          'pending',
          ${idempotencyKey},
          ${args.paymentReference || order.payment_reference || null},
          ${expiresSql},
          ${args.source || order.source || 'payment_desk'},
          ${createdBySql},
          ${metadataJson}::jsonb
        )
        ON CONFLICT (idempotency_key)
        DO UPDATE SET
          payment_reference = COALESCE(EXCLUDED.payment_reference, seller_order_payment_attempts.payment_reference),
          expires_at = COALESCE(EXCLUDED.expires_at, seller_order_payment_attempts.expires_at),
          metadata = COALESCE(seller_order_payment_attempts.metadata, '{}'::jsonb) || EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING *
      `,
    )) as any[];

    return rows[0];
  }

  async markOrderPaid(tx: any, ctx: any, order: any, args: {
    paymentMethod?: string;
    paymentReference?: string;
    notes?: string;
    actorType?: string;
    actorId?: string;
    source?: string;
    idempotencyKey?: string;
  }) {
    const locked = await this.lockSellerProductOrder(tx, ctx.businessId, order.order_id);
    const currentOrder = await this.getOrderWithRelations(tx, locked.order_id);

    if (locked.payment_status === 'paid') {
      return { order: currentOrder, alreadyPaid: true };
    }
    if (locked.status === 'cancelled') {
      throw new BadRequestException('Cancelled order cannot be marked paid');
    }
    if (locked.payment_method === 'credit') {
      throw new BadRequestException('Use Credit page for credit payments');
    }

    const linkedHolds = await tx.seller_stock_reservations.findMany({
      where: {
        business_id: ctx.businessId,
        converted_order_id: locked.order_id,
        status: 'active',
      },
    });

    for (const hold of linkedHolds) {
      await this.inventoryTransactions.convertLinkedHoldToSale(tx, hold);
    }

    const paymentMethod = args.paymentMethod || locked.payment_method || 'upi';
    const paid = await tx.orders.update({
      where: { order_id: locked.order_id },
      data: {
        payment_status: 'paid',
        payment_method: paymentMethod,
        payment_reference: args.paymentReference || currentOrder.payment_reference,
        paid_at: new Date(),
        status: 'paid',
        admin_notes: args.notes || currentOrder.admin_notes,
        updated_at: new Date(),
      },
      include: { order_items: true, customers: true },
    });

    await tx.seller_deliveries.updateMany({
      where: { business_id: ctx.businessId, order_id: locked.order_id },
      data: {
        collect_payment: false,
        updated_at: new Date(),
      },
    });

    await this.markPaymentAttemptsCaptured(tx, ctx, paid, {
      paymentMethod,
      paymentReference: args.paymentReference,
      source: args.source || 'payment_desk',
      actorId: args.actorId,
    });

    await this.recordOrderStateEvent(tx, ctx, {
      orderId: locked.order_id,
      eventType: 'payment_marked_paid',
      fromStatus: locked.status,
      toStatus: 'paid',
      fromPaymentStatus: locked.payment_status,
      toPaymentStatus: 'paid',
      actorType: args.actorType || 'owner',
      actorId: args.actorId || ctx.userId,
      source: args.source || 'payment_desk',
      idempotencyKey: args.idempotencyKey || `seller:${ctx.businessId}:order:${locked.order_id}:paid`,
      metadata: {
        payment_method: paymentMethod,
        payment_reference: args.paymentReference,
        converted_holds: linkedHolds.map((hold: any) => hold.seller_reservation_id),
      },
    });

    return { order: paid, alreadyPaid: false };
  }

  async cancelPendingOrder(tx: any, ctx: any, order: any, args: {
    reason?: string;
    actorType?: string;
    actorId?: string;
    source?: string;
    status?: 'cancelled' | 'expired';
    idempotencyKey?: string;
  }) {
    const locked = await this.lockSellerProductOrder(tx, ctx.businessId, order.order_id);
    const currentOrder = await this.getOrderWithRelations(tx, locked.order_id);

    if (locked.payment_status === 'paid') {
      throw new BadRequestException('Paid orders must use refund or return flow');
    }
    if (locked.status === 'cancelled' || locked.status === 'expired') {
      return { order: currentOrder, alreadyClosed: true };
    }

    const linkedHolds = await tx.seller_stock_reservations.findMany({
      where: {
        business_id: ctx.businessId,
        converted_order_id: locked.order_id,
        status: 'active',
      },
    });

    if (linkedHolds.length) {
      for (const hold of linkedHolds) {
        await this.inventoryTransactions.releaseLinkedHold(tx, hold, args.status || 'cancelled');
      }
    } else {
      await this.inventoryTransactions.restoreStockForUnpaidOrder(tx, currentOrder);
    }

    await tx.seller_deliveries.updateMany({
      where: { business_id: ctx.businessId, order_id: locked.order_id },
      data: { status: 'cancelled', updated_at: new Date() },
    });

    const finalStatus = args.status || 'cancelled';
    const updated = await tx.orders.update({
      where: { order_id: locked.order_id },
      data: {
        status: finalStatus,
        payment_status: 'failed',
        cancelled_at: new Date(),
        admin_notes: args.reason || (finalStatus === 'expired' ? 'Payment time expired' : 'Payment order cancelled'),
        updated_at: new Date(),
      },
      include: { order_items: true, customers: true },
    });

    await this.closePaymentAttempts(tx, ctx, updated, {
      status: finalStatus === 'expired' ? 'expired' : 'cancelled',
      reason: args.reason,
    });

    await this.recordOrderStateEvent(tx, ctx, {
      orderId: locked.order_id,
      eventType: finalStatus === 'expired' ? 'payment_order_expired' : 'payment_order_cancelled',
      fromStatus: locked.status,
      toStatus: finalStatus,
      fromPaymentStatus: locked.payment_status,
      toPaymentStatus: 'failed',
      actorType: args.actorType || 'owner',
      actorId: args.actorId || ctx.userId,
      source: args.source || 'payment_desk',
      idempotencyKey:
        args.idempotencyKey || `seller:${ctx.businessId}:order:${locked.order_id}:${finalStatus}`,
      metadata: {
        reason: args.reason,
        released_holds: linkedHolds.map((hold: any) => hold.seller_reservation_id),
      },
    });

    return { order: updated, alreadyClosed: false };
  }

  async expirePendingPaymentOrders(limit = 200) {
    const db = this.prisma as any;
    const expiredOrders = await db.orders.findMany({
      where: {
        order_type: 'product',
        payment_status: 'pending',
        payment_expires_at: { lt: new Date() },
        status: { notIn: ['paid', 'cancelled', 'expired'] },
      },
      include: { order_items: true, customers: true },
      take: limit,
      orderBy: { payment_expires_at: 'asc' },
    });

    const expiredOrderIds: string[] = [];
    for (const order of expiredOrders) {
      try {
        await this.prisma.$transaction(async (tx: any) => {
          const ctx = {
            businessId: order.business_id,
            tenantId: order.tenant_id,
            userId: undefined,
          };
          const result = await this.cancelPendingOrder(tx, ctx, order, {
            status: 'expired',
            reason: 'Payment time expired',
            actorType: 'system',
            source: 'expiry_worker',
            idempotencyKey: `seller:${order.business_id}:order:${order.order_id}:expired`,
          });
          if (!result.alreadyClosed) expiredOrderIds.push(order.order_id);
        });
      } catch (error) {
        this.logger.warn(`Could not expire seller order ${order.order_id}: ${error.message}`);
      }
    }

    return { count: expiredOrderIds.length, expiredOrderIds };
  }

  private async markPaymentAttemptsCaptured(tx: any, ctx: any, order: any, args: any) {
    const updatedCount = await tx.$executeRaw(
      Prisma.sql`
        UPDATE seller_order_payment_attempts
        SET status = 'captured',
            payment_method = ${args.paymentMethod || order.payment_method || 'upi'},
            payment_reference = COALESCE(${args.paymentReference || null}, payment_reference),
            paid_at = NOW(),
            updated_at = NOW()
        WHERE business_id = ${ctx.businessId}::uuid
          AND order_id = ${order.order_id}::uuid
          AND status IN ('created', 'pending', 'authorized')
      `,
    );

    if (Number(updatedCount || 0) > 0) return;

    await this.createPaymentAttempt(tx, ctx, {
      order,
      paymentMethod: args.paymentMethod || order.payment_method || 'upi',
      paymentReference: args.paymentReference || order.payment_reference,
      source: args.source || order.source || 'payment_desk',
      createdBy: args.actorId || ctx.userId,
      idempotencyKey: `seller:${ctx.businessId}:order:${order.order_id}:manual-paid-attempt`,
      metadata: { created_from: 'manual_paid_without_prior_attempt' },
    });

    await tx.$executeRaw(
      Prisma.sql`
        UPDATE seller_order_payment_attempts
        SET status = 'captured',
            paid_at = NOW(),
            updated_at = NOW()
        WHERE idempotency_key = ${`seller:${ctx.businessId}:order:${order.order_id}:manual-paid-attempt`}
      `,
    );
  }

  private async closePaymentAttempts(tx: any, ctx: any, order: any, args: { status: string; reason?: string }) {
    await tx.$executeRaw(
      Prisma.sql`
        UPDATE seller_order_payment_attempts
        SET status = ${args.status},
            failed_at = CASE WHEN ${args.status} = 'expired' THEN NOW() ELSE failed_at END,
            cancelled_at = CASE WHEN ${args.status} = 'cancelled' THEN NOW() ELSE cancelled_at END,
            metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ reason: args.reason })}::jsonb,
            updated_at = NOW()
        WHERE business_id = ${ctx.businessId}::uuid
          AND order_id = ${order.order_id}::uuid
          AND status IN ('created', 'pending', 'authorized')
      `,
    );
  }

  private async recordOrderStateEvent(tx: any, ctx: any, event: {
    orderId: string;
    eventType: string;
    fromStatus?: string;
    toStatus?: string;
    fromPaymentStatus?: string;
    toPaymentStatus?: string;
    actorType?: string;
    actorId?: string;
    source?: string;
    idempotencyKey: string;
    metadata?: Record<string, any>;
  }) {
    const actorIdSql = event.actorId ? Prisma.sql`${event.actorId}::uuid` : Prisma.sql`NULL`;
    const metadataJson = JSON.stringify(event.metadata || {});

    await tx.$executeRaw(
      Prisma.sql`
        INSERT INTO seller_order_state_events (
          business_id,
          tenant_id,
          order_id,
          event_type,
          from_status,
          to_status,
          from_payment_status,
          to_payment_status,
          actor_type,
          actor_id,
          source,
          idempotency_key,
          metadata
        )
        VALUES (
          ${ctx.businessId}::uuid,
          ${ctx.tenantId}::uuid,
          ${event.orderId}::uuid,
          ${event.eventType},
          ${event.fromStatus || null},
          ${event.toStatus || null},
          ${event.fromPaymentStatus || null},
          ${event.toPaymentStatus || null},
          ${event.actorType || 'system'},
          ${actorIdSql},
          ${event.source || null},
          ${event.idempotencyKey},
          ${metadataJson}::jsonb
        )
        ON CONFLICT (idempotency_key) DO NOTHING
      `,
    );
  }

  private async lockSellerProductOrder(tx: any, businessId: string, orderId: string) {
    const rows = (await tx.$queryRaw(
      Prisma.sql`
        SELECT order_id, business_id, tenant_id, payment_status, status, payment_method
        FROM orders
        WHERE order_id = ${orderId}::uuid
          AND business_id = ${businessId}::uuid
          AND order_type = 'product'
        FOR UPDATE
      `,
    )) as any[];

    const order = rows[0];
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async getOrderWithRelations(tx: any, orderId: string) {
    return tx.orders.findUnique({
      where: { order_id: orderId },
      include: { order_items: true, customers: true },
    });
  }
}
