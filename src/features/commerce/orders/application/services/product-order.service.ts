import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ProductOrderQueryDto } from '../dto/product-order-query.dto';
import { ProductOrderStatus, UpdateProductOrderStatusDto } from '../dto/update-product-order-status.dto';
import { StockReservationService } from './stock-reservation.service';

@Injectable()
export class ProductOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockReservationService: StockReservationService,
  ) {}

  async findAll(businessId: string, query: ProductOrderQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const where: any = { business_id: businessId };
    if (query.status) where.status = query.status;
    if (query.payment_status) where.payment_status = query.payment_status;
    if (query.customer_id) where.customer_id = query.customer_id;
    if (query.lead_id) where.lead_id = query.lead_id;
    if (query.from_date || query.to_date) {
      where.created_at = {};
      if (query.from_date) where.created_at.gte = new Date(query.from_date);
      if (query.to_date) where.created_at.lte = new Date(query.to_date);
    }

    const [rows, total] = await Promise.all([
      this.prisma.product_orders.findMany({
        where,
        include: {
          items: true,
          customer: { select: { customer_id: true, name: true, phone: true, email: true } },
          lead: { select: { lead_id: true, name: true, phone: true, status: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product_orders.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toResponse(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(businessId: string, productOrderId: string) {
    const order = await this.prisma.product_orders.findFirst({
      where: { product_order_id: productOrderId, business_id: businessId },
      include: {
        items: true,
        events: { orderBy: { created_at: 'desc' } },
        customer: { select: { customer_id: true, name: true, phone: true, email: true } },
        lead: { select: { lead_id: true, name: true, phone: true, status: true } },
        legacy_order: { select: { order_id: true, order_number: true, status: true, payment_status: true } },
      },
    });

    if (!order) throw new NotFoundException('Product order not found');
    return this.toResponse(order);
  }

  async updateStatus(businessId: string, productOrderId: string, dto: UpdateProductOrderStatusDto) {
    const existing = await this.prisma.product_orders.findFirst({
      where: { product_order_id: productOrderId, business_id: businessId },
      select: {
        product_order_id: true,
        business_id: true,
        status: true,
        legacy_order_id: true,
        legacy_order: { select: { status: true } },
      },
    });

    if (!existing) throw new NotFoundException('Product order not found');

    if (existing.status === dto.status) {
      return this.findById(businessId, productOrderId);
    }

    this.assertProductStatusTransition(existing.status, dto.status);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.product_orders.update({
        where: { product_order_id: productOrderId },
        data: {
          status: dto.status,
          ...(dto.status === 'cancelled' && { cancelled_at: now }),
          updated_at: now,
        },
      });

      await tx.product_order_status_events.create({
        data: {
          product_order_id: productOrderId,
          business_id: existing.business_id,
          from_status: existing.status,
          to_status: dto.status,
          actor: 'human',
          data: {
            notes: dto.notes ?? null,
            legacy_order_id: existing.legacy_order_id,
          },
        },
      });

      if (existing.legacy_order_id) {
        if (dto.status === 'cancelled' && existing.legacy_order?.status !== 'cancelled') {
          await this.stockReservationService.releaseReservation(existing.legacy_order_id, tx);
        }

        await tx.orders.update({
          where: { order_id: existing.legacy_order_id },
          data: this.legacyOrderStatusData(dto.status, now),
        });
      }
    });

    return this.findById(businessId, productOrderId);
  }

  async cancel(businessId: string, productOrderId: string, notes?: string) {
    return this.updateStatus(businessId, productOrderId, { status: 'cancelled', notes });
  }

  private assertProductStatusTransition(currentStatus: string, nextStatus: ProductOrderStatus) {
    if (currentStatus === 'cancelled') {
      throw new BadRequestException('Product order is already cancelled');
    }

    if (currentStatus === 'delivered' && nextStatus !== 'delivered') {
      throw new BadRequestException('Cannot change the status of a delivered product order');
    }
  }

  private legacyOrderStatusData(status: ProductOrderStatus, now: Date) {
    return {
      status,
      delivery_status: status,
      ...(status === 'cancelled' && { cancelled_at: now }),
      ...(status === 'shipped' && { shipped_at: now }),
      ...(status === 'delivered' && { delivered_at: now }),
      updated_at: now,
    };
  }

  private toResponse(order: any) {
    return {
      product_order_id: order.product_order_id,
      business_id: order.business_id,
      tenant_id: order.tenant_id,
      legacy_order_id: order.legacy_order_id,
      customer_id: order.customer_id,
      lead_id: order.lead_id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      subtotal: Number(order.subtotal ?? 0),
      discount_amount: Number(order.discount_amount ?? 0),
      tax_amount: Number(order.tax_amount ?? 0),
      shipping_fee: Number(order.shipping_fee ?? 0),
      total_amount: Number(order.total_amount ?? 0),
      source: order.source,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      shipping_pincode: order.shipping_pincode,
      shipping_phone: order.shipping_phone,
      notes: order.notes,
      metadata: order.metadata,
      paid_at: order.paid_at,
      cancelled_at: order.cancelled_at,
      created_at: order.created_at,
      updated_at: order.updated_at,
      customer: order.customer ?? null,
      lead: order.lead ?? null,
      legacy_order: order.legacy_order ?? null,
      items: (order.items ?? []).map((item: any) => ({
        product_order_item_id: item.product_order_item_id,
        item_id: item.item_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: Number(item.unit_price ?? 0),
        discount: Number(item.discount ?? 0),
        total_price: Number(item.total_price ?? 0),
        snapshot: item.snapshot,
      })),
      events: order.events ?? undefined,
    };
  }
}
