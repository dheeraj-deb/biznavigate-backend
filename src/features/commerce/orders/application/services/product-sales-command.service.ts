import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { LeadTypes } from '../../../../crm/lead/application/lead-types';
import { LeadCommandService } from '../../../../crm/lead/application/services/lead-command.service';
import { CreateProductSaleDto, CreateProductSaleItemDto } from '../dto/create-product-sale.dto';

type TxClient = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

interface ResolvedSaleItem {
  item_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  stock_tracked: boolean;
  snapshot: Record<string, any>;
}

@Injectable()
export class ProductSalesCommandService {
  private readonly logger = new Logger(ProductSalesCommandService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leadCommands: LeadCommandService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createDirectSale(
    businessId: string,
    tenantId: string,
    dto: CreateProductSaleDto,
    actorId?: string | null,
  ) {
    this.validatePaymentState(dto);
    const idempotencyKey = this.normalizeIdempotencyKey(businessId, dto.idempotency_key);
    let idempotencyReserved = false;

    if (idempotencyKey) {
      const existing = await this.prisma.workflow_idempotency_keys.findUnique({
        where: { idempotency_key: idempotencyKey },
      });
      if (existing?.status === 'completed' && existing.response) return existing.response;
      if (existing?.status === 'started' && (!existing.locked_until || existing.locked_until > new Date())) {
        throw new ConflictException('Product sale is already being processed');
      }
    }

    const response = await this.prisma.$transaction(async (tx) => {
      if (idempotencyKey) {
        await this.reserveIdempotencyKey(tx, idempotencyKey, businessId, tenantId, dto.lead_id);
        idempotencyReserved = true;
      }

      const lead = dto.lead_id
        ? await tx.leads.findFirst({
            where: { business_id: businessId, lead_id: dto.lead_id, deleted_at: null },
            select: { lead_id: true, context: true },
          })
        : null;
      if (dto.lead_id && !lead) throw new NotFoundException('Lead not found for this business');

      const customer = await this.resolveCustomer(tx, businessId, tenantId, dto);
      const items = await this.resolveAndHoldItems(tx, businessId, dto.items);
      const totals = this.computeTotals(items, dto);
      const paymentStatus = this.resolvePaymentStatus(dto);
      const orderStatus = this.resolveOrderStatus(dto, paymentStatus);
      const source = dto.source ?? (dto.sale_mode === 'shop_sale' ? 'shop' : 'whatsapp');
      const orderNumber = this.makeOrderNumber(source === 'shop' ? 'SHOP' : 'ORD');
      const paidAt = paymentStatus === 'paid' ? new Date() : null;
      const paymentExpiresAt = paymentStatus === 'pending'
        ? await this.resolvePaymentExpiry(tx, businessId)
        : null;

      const order = await tx.orders.create({
        data: {
          business_id: businessId,
          tenant_id: tenantId,
          customer_id: customer?.customer_id ?? null,
          lead_id: dto.lead_id ?? null,
          order_number: orderNumber,
          order_type: 'product',
          status: orderStatus,
          delivery_status: orderStatus,
          subtotal: totals.subtotal,
          discount_amount: totals.discountAmount,
          tax_amount: totals.taxAmount,
          shipping_fee: totals.shippingFee,
          total_amount: totals.totalAmount,
          payment_status: paymentStatus,
          payment_method: dto.payment_method ?? null,
          payment_reference: dto.payment_reference ?? null,
          paid_at: paidAt,
          payment_expires_at: paymentExpiresAt,
          shipping_address: dto.shipping_address,
          shipping_city: dto.shipping_city,
          shipping_state: dto.shipping_state,
          shipping_pincode: dto.shipping_pincode,
          shipping_phone: dto.shipping_phone ?? customer?.phone ?? null,
          source,
          notes: dto.notes,
          delivered_at: orderStatus === 'delivered' ? new Date() : null,
        },
      });

      const productOrder = await tx.product_orders.create({
        data: {
          business_id: businessId,
          tenant_id: tenantId,
          legacy_order_id: order.order_id,
          customer_id: customer?.customer_id ?? null,
          lead_id: dto.lead_id ?? null,
          order_number: orderNumber,
          status: orderStatus,
          payment_status: paymentStatus,
          subtotal: totals.subtotal,
          discount_amount: totals.discountAmount,
          tax_amount: totals.taxAmount,
          shipping_fee: totals.shippingFee,
          total_amount: totals.totalAmount,
          source,
          shipping_address: dto.shipping_address,
          shipping_city: dto.shipping_city,
          shipping_state: dto.shipping_state,
          shipping_pincode: dto.shipping_pincode,
          shipping_phone: dto.shipping_phone ?? customer?.phone ?? null,
          notes: dto.notes,
          paid_at: paidAt,
          metadata: {
            direct_sale: true,
            sale_mode: dto.sale_mode ?? 'assisted',
            payment_method: dto.payment_method ?? null,
            payment_reference: dto.payment_reference ?? null,
            payment_expires_at: paymentExpiresAt?.toISOString?.() ?? null,
            idempotency_key: idempotencyKey,
          },
        },
      });

      for (const item of items) {
        await tx.order_items.create({
          data: {
            order_id: order.order_id,
            item_id: item.item_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            variant_name: item.variant_name,
            sku: item.sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            total_price: item.total_price,
            snapshot: item.snapshot,
          },
        });
        await tx.product_order_items.create({
          data: {
            product_order_id: productOrder.product_order_id,
            item_id: item.item_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            variant_name: item.variant_name,
            sku: item.sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            total_price: item.total_price,
            snapshot: item.snapshot,
          },
        });
      }

      await tx.product_order_status_events.create({
        data: {
          product_order_id: productOrder.product_order_id,
          business_id: businessId,
          from_status: null,
          to_status: orderStatus,
          actor: actorId ? 'human' : 'system',
          actor_id: actorId ?? null,
          data: {
            legacy_order_id: order.order_id,
            payment_status: paymentStatus,
            source,
          },
        },
      });

      if (paymentStatus === 'paid' && customer) {
        await this.recordManualPayment(tx, businessId, tenantId, order, customer.customer_id, dto);
      }

      if (dto.lead_id) {
        await this.updateLeadForSale(tx, businessId, tenantId, dto.lead_id, items, totals.totalAmount, {
          order_id: order.order_id,
          product_order_id: productOrder.product_order_id,
          order_number: orderNumber,
          order_status: orderStatus,
          payment_status: paymentStatus,
          source,
        });
      }

      if (paymentStatus === 'pending') {
        await this.createOwnerPaymentApproval(tx, businessId, tenantId, productOrder.product_order_id, order, items, dto, paymentExpiresAt);
      }

      const result = {
        order_id: order.order_id,
        product_order_id: productOrder.product_order_id,
        order_number: orderNumber,
        status: orderStatus,
        payment_status: paymentStatus,
        total_amount: totals.totalAmount,
        payment_expires_at: paymentExpiresAt,
        stock_held: paymentStatus === 'pending',
      };

      if (idempotencyKey) {
        await tx.workflow_idempotency_keys.update({
          where: { idempotency_key: idempotencyKey },
          data: {
            status: 'completed',
            response: result,
            node_id: 'direct_product_sale_create',
            locked_until: null,
            updated_at: new Date(),
          },
        });
      }

      return result;
    }).catch(async (error) => {
      if (idempotencyKey && idempotencyReserved) {
        await this.prisma.workflow_idempotency_keys.update({
          where: { idempotency_key: idempotencyKey },
          data: { status: 'failed', locked_until: null, updated_at: new Date() },
        }).catch(() => undefined);
      }
      throw error;
    });

    if (dto.lead_id) this.leadCommands.recalculateQualification(dto.lead_id).catch(() => undefined);
    this.emitOrderPlaced(businessId, tenantId, dto.lead_id, response);
    return response;
  }

  private validatePaymentState(dto: CreateProductSaleDto) {
    if (dto.payment_status === 'paid' && !dto.payment_method) {
      throw new BadRequestException('payment_method is required when payment_status is paid');
    }
    if (dto.order_status === 'delivered' && dto.payment_status !== 'paid' && dto.payment_method !== 'cod') {
      throw new BadRequestException('Delivered product orders must be paid unless payment method is COD');
    }
  }

  private resolvePaymentStatus(dto: CreateProductSaleDto): 'pending' | 'paid' {
    if (dto.payment_status) return dto.payment_status;
    return dto.sale_mode === 'shop_sale' && dto.payment_method && dto.payment_method !== 'cod' ? 'paid' : 'pending';
  }

  private resolveOrderStatus(dto: CreateProductSaleDto, paymentStatus: 'pending' | 'paid') {
    if (dto.order_status) return dto.order_status;
    if (dto.sale_mode === 'shop_sale' && paymentStatus === 'paid') return 'delivered';
    return paymentStatus === 'paid' ? 'confirmed' : 'pending';
  }

  private computeTotals(items: ResolvedSaleItem[], dto: CreateProductSaleDto) {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const discountAmount = Number(dto.discount_amount ?? 0);
    const taxAmount = Number(dto.tax_amount ?? 0);
    const shippingFee = Number(dto.shipping_fee ?? 0);
    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount + shippingFee);
    return { subtotal, discountAmount, taxAmount, shippingFee, totalAmount };
  }

  private async resolveAndHoldItems(tx: TxClient, businessId: string, items: CreateProductSaleItemDto[]) {
    const resolved: ResolvedSaleItem[] = [];
    const seen = new Set<string>();

    for (const raw of items) {
      const key = `${raw.item_id}:${raw.variant_id ?? ''}`;
      if (seen.has(key)) throw new BadRequestException('Duplicate product lines are not allowed; merge the quantity first');
      seen.add(key);

      const item = await tx.catalog_items.findFirst({
        where: {
          business_id: businessId,
          item_id: raw.item_id,
          item_type: 'physical_product',
          is_active: true,
          deleted_at: null,
        },
        include: {
          variants: { where: { is_active: true } },
          product_detail: true,
        },
      });
      if (!item) throw new NotFoundException(`Product not found: ${raw.item_id}`);

      const variant = raw.variant_id
        ? item.variants.find((entry: any) => entry.variant_id === raw.variant_id)
        : null;
      if (raw.variant_id && !variant) throw new NotFoundException(`Variant not found for ${item.name}`);
      if (!raw.variant_id && item.stock_quantity == null && item.variants.length > 0) {
        throw new BadRequestException(`Choose a variant for ${item.name}`);
      }

      const quantity = Number(raw.quantity);
      const discount = Number(raw.discount ?? 0);
      const unitPrice = variant ? Number(variant.price) : Number(item.base_price ?? 0);
      const totalPrice = Math.max(0, unitPrice * quantity - discount);

      if (variant) {
        const updated = await tx.item_variants.updateMany({
          where: {
            variant_id: variant.variant_id,
            item_id: item.item_id,
            business_id: businessId,
            is_active: true,
            stock_quantity: { gte: quantity },
          },
          data: { stock_quantity: { decrement: quantity }, updated_at: new Date() },
        });
        if (updated.count === 0) throw new ConflictException(`${item.name} (${variant.name}) has only ${variant.stock_quantity} in stock`);
      } else if (item.stock_quantity != null) {
        const updated = await tx.catalog_items.updateMany({
          where: {
            item_id: item.item_id,
            business_id: businessId,
            item_type: 'physical_product',
            is_active: true,
            deleted_at: null,
            stock_quantity: { gte: quantity },
          },
          data: { stock_quantity: { decrement: quantity }, updated_at: new Date() },
        });
        if (updated.count === 0) throw new ConflictException(`${item.name} has only ${item.stock_quantity ?? 0} in stock`);
      }

      await tx.external_catalog_items.updateMany({
        where: { business_id: businessId, item_id: item.item_id, provider: 'whatsapp', sync_status: { not: 'local_only' } },
        data: { sync_status: 'pending', updated_at: new Date() },
      }).catch(() => undefined);

      resolved.push({
        item_id: item.item_id,
        variant_id: variant?.variant_id ?? null,
        product_name: item.name,
        variant_name: variant?.name ?? null,
        sku: variant?.sku ?? item.product_detail?.sku ?? null,
        quantity,
        unit_price: unitPrice,
        discount,
        total_price: totalPrice,
        stock_tracked: Boolean(variant || item.stock_quantity != null),
        snapshot: {
          item_name: item.name,
          item_type: item.item_type,
          variant_name: variant?.name ?? null,
          variant_options: variant?.options ?? null,
          sku: variant?.sku ?? item.product_detail?.sku ?? null,
          price: unitPrice,
          stock_tracked: Boolean(variant || item.stock_quantity != null),
        },
      });
    }

    return resolved;
  }

  private async resolveCustomer(tx: TxClient, businessId: string, tenantId: string, dto: CreateProductSaleDto) {
    if (dto.customer_id) {
      const customer = await tx.customers.findFirst({
        where: { business_id: businessId, customer_id: dto.customer_id, deleted_at: null },
      });
      if (!customer) throw new NotFoundException('Customer not found for this business');
      return customer;
    }

    const phone = this.normalizePhone(dto.customer?.phone ?? dto.shipping_phone);
    const email = dto.customer?.email?.trim();
    if (!phone && !email && !dto.customer?.name) return null;

    const existing = await tx.customers.findFirst({
      where: {
        business_id: businessId,
        deleted_at: null,
        OR: [
          ...(phone ? [{ phone }, { whatsapp_number: phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });
    if (existing) {
      return tx.customers.update({
        where: { customer_id: existing.customer_id },
        data: {
          ...(dto.customer?.name && !existing.name ? { name: dto.customer.name } : {}),
          ...(phone && !existing.phone ? { phone } : {}),
          ...(phone && !existing.whatsapp_number ? { whatsapp_number: phone } : {}),
          ...(email && !existing.email ? { email } : {}),
          updated_at: new Date(),
        },
      });
    }

    return tx.customers.create({
      data: {
        business_id: businessId,
        tenant_id: tenantId,
        name: dto.customer?.name ?? null,
        phone: phone || null,
        whatsapp_number: phone || null,
        email: email || null,
        engagement_score: 10,
      },
    });
  }

  private async updateLeadForSale(
    tx: TxClient,
    businessId: string,
    tenantId: string,
    leadId: string,
    items: ResolvedSaleItem[],
    totalAmount: number,
    order: Record<string, any>,
  ) {
    const paid = order.payment_status === 'paid';
    const first = items[0];
    await tx.leads.updateMany({
      where: { business_id: businessId, lead_id: leadId, deleted_at: null },
      data: {
        status: paid ? 'won' : 'contacted',
        lead_type: paid ? LeadTypes.PRODUCT_ORDERED : LeadTypes.PRODUCT_ORDER_PENDING,
        quoted_amount: totalAmount,
        ...(paid ? { converted_value: totalAmount, converted_at: new Date() } : {}),
        context: {
          type: 'product',
          items: items.map((item) => ({
            id: item.item_id,
            variant_id: item.variant_id,
            name: item.product_name,
            variant: item.variant_name,
            qty: item.quantity,
          })),
          product_order_id: order.product_order_id,
          order_id: order.order_id,
          order_number: order.order_number,
          order_status: order.order_status,
          payment_status: order.payment_status,
        },
        updated_at: new Date(),
      },
    });

    for (const item of items) {
      await tx.product_inquiries.create({
        data: {
          business_id: businessId,
          tenant_id: tenantId,
          lead_id: leadId,
          item_id: item.item_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          budget: item.total_price,
          status: 'ordered',
          metadata: {
            direct_sale: true,
            product_order_id: order.product_order_id,
            order_number: order.order_number,
          },
        },
      });
    }

    await tx.lead_events.create({
      data: {
        lead_id: leadId,
        business_id: businessId,
        type: paid ? 'product_order_paid' : 'stock_held',
        actor: 'system',
        data: {
          ...order,
          item_id: first?.item_id,
          item_name: first?.product_name,
          total_amount: totalAmount,
        },
      },
    });
  }

  private async recordManualPayment(
    tx: TxClient,
    businessId: string,
    tenantId: string,
    order: any,
    customerId: string,
    dto: CreateProductSaleDto,
  ) {
    await tx.payments.create({
      data: {
        business_id: businessId,
        tenant_id: tenantId,
        order_id: order.order_id,
        customer_id: customerId,
        razorpay_order_id: `manual_${order.order_id}`,
        amount: order.total_amount,
        currency: 'INR',
        status: 'captured',
        method: dto.payment_method,
        receipt: order.order_number,
        description: 'Payment recorded during direct product sale',
        notes: {
          source: 'direct_product_sale',
          payment_reference: dto.payment_reference ?? null,
        },
        captured_at: new Date(),
      },
    });
  }

  private async createOwnerPaymentApproval(
    tx: TxClient,
    businessId: string,
    tenantId: string,
    productOrderId: string,
    order: any,
    items: ResolvedSaleItem[],
    dto: CreateProductSaleDto,
    paymentExpiresAt: Date | null,
  ) {
    await tx.$queryRawUnsafe(
      `INSERT INTO seller_owner_approvals
         (business_id, tenant_id, title, simple_summary, action_type, risk_level, source, entity_type, entity_id, payload, due_at, expires_at)
       VALUES ($1, $2, 'Confirm product order payment', $3, 'payment_followup', 'medium', $4, 'product_order', $5, $6::jsonb, $7, $7)`,
      businessId,
      tenantId,
      `${order.order_number} for ${items.length} item${items.length === 1 ? '' : 's'} is waiting for payment confirmation.`,
      dto.source ?? 'direct_sale',
      productOrderId,
      JSON.stringify({
        order_id: order.order_id,
        legacy_order_id: order.order_id,
        product_order_id: productOrderId,
        order_number: order.order_number,
        total_amount: Number(order.total_amount),
        payment_method: dto.payment_method ?? null,
        payment_expires_at: paymentExpiresAt?.toISOString?.() ?? null,
      }),
      paymentExpiresAt,
    ).catch(() => undefined);
  }

  private async resolvePaymentExpiry(tx: TxClient, businessId: string) {
    const rows = await tx.$queryRawUnsafe<Array<{ stock_hold_minutes: number }>>(
      `SELECT stock_hold_minutes FROM seller_store_settings WHERE business_id = $1 LIMIT 1`,
      businessId,
    ).catch(() => []);
    const minutes = Math.max(5, Math.min(Number(rows[0]?.stock_hold_minutes ?? 60), 24 * 60));
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private async reserveIdempotencyKey(
    tx: TxClient,
    idempotencyKey: string,
    businessId: string,
    tenantId: string,
    leadId?: string | null,
  ) {
    const now = new Date();
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
    const reclaimed = await tx.workflow_idempotency_keys.updateMany({
      where: {
        idempotency_key: idempotencyKey,
        business_id: businessId,
        purpose: 'direct_product_sale',
        status: { in: ['failed', 'started'] },
        OR: [
          { status: 'failed' },
          { locked_until: null },
          { locked_until: { lte: now } },
        ],
      },
      data: {
        status: 'started',
        response: null,
        tenant_id: tenantId,
        lead_id: leadId ?? null,
        locked_until: lockedUntil,
        updated_at: new Date(),
      },
    });

    if (reclaimed.count > 0) return;

    try {
      await tx.workflow_idempotency_keys.create({
        data: {
          idempotency_key: idempotencyKey,
          business_id: businessId,
          tenant_id: tenantId,
          lead_id: leadId ?? null,
          purpose: 'direct_product_sale',
          status: 'started',
          locked_until: lockedUntil,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Product sale is already being processed');
      }
      throw error;
    }
  }

  private emitOrderPlaced(businessId: string, tenantId: string, leadId: string | undefined, response: any) {
    try {
      this.eventEmitter.emit('workflow.event.order.placed', {
        business_id: businessId,
        tenant_id: tenantId,
        lead_id: leadId,
        order_id: response.order_id,
        product_order_id: response.product_order_id,
        order_number: response.order_number,
        status: response.status,
        payment_status: response.payment_status,
        emitted_at: new Date().toISOString(),
      });
    } catch (error: any) {
      this.logger.warn(`Could not emit order.placed for ${response.order_id}: ${error.message}`);
    }
  }

  private normalizePhone(value?: string | null) {
    const cleaned = String(value ?? '').trim().replace(/[^\d+]/g, '');
    return cleaned || null;
  }

  private normalizeIdempotencyKey(businessId: string, value?: string | null) {
    const key = String(value ?? '').trim();
    if (!key) return null;
    const digest = createHash('sha256').update(`${businessId}:${key}`).digest('hex');
    return `direct_product_sale:${digest}`;
  }

  private makeOrderNumber(prefix: string) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${prefix}-${datePart}-${randomPart}`;
  }
}
