import { Injectable, Logger, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../domain/entities/order.entity';
import { CreateOrderDto } from '../application/dto/create-order.dto';
import { UpdateOrderDto } from '../application/dto/update-order.dto';
import { OrderQueryDto } from '../application/dto/order-query.dto';
import { StockReservationService } from '../application/services/stock-reservation.service';

@Injectable()
export class OrderRepositoryPrisma {
  private readonly logger = new Logger(OrderRepositoryPrisma.name);
  private readonly PAYMENT_TIMEOUT_MINUTES = 15;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stockReservationService: StockReservationService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const order = await this.prisma.$transaction(async (tx) => {
        // MEDIUM-7: Catalog cache — each item_id fetched exactly once per transaction
        const catalogCache = new Map<string, any>();
        const getCatalogItem = async (itemId: string) => {
          if (!catalogCache.has(itemId)) {
            const item = await tx.catalog_items.findUnique({
              where: { item_id: itemId },
              include: { variants: true },
            });
            catalogCache.set(itemId, item);
          }
          return catalogCache.get(itemId);
        };

        // Single pass — subtotal computed from cache, no second DB round-trip
        let subtotal = 0;
        for (const item of createOrderDto.items) {
          const catalogItem = await getCatalogItem(item.item_id);
          if (!catalogItem) throw new NotFoundException(`Item not found: ${item.item_id}`);
          const variant = item.variant_id
            ? catalogItem.variants.find((v: any) => v.variant_id === item.variant_id)
            : null;
          const unitPrice = variant ? Number(variant.price) : Number(catalogItem.base_price || 0);
          subtotal += unitPrice * item.quantity - (item.discount || 0);
        }

        const totalAmount =
          subtotal +
          (createOrderDto.tax_amount || 0) +
          (createOrderDto.shipping_fee || 0) -
          (createOrderDto.discount_amount || 0);

        // CRITICAL-1: Order number generated INSIDE the transaction, collision-safe
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
        const orderNumber = `ORD-${datePart}-${randomPart}`;

        const createdOrder = await tx.orders.create({
          data: {
            business_id: createOrderDto.business_id,
            tenant_id: createOrderDto.tenant_id,
            customer_id: createOrderDto.customer_id,
            order_number: orderNumber,
            order_type: createOrderDto.order_type || 'product',
            status: 'pending',
            subtotal,
            discount_amount: createOrderDto.discount_amount || 0,
            tax_amount: createOrderDto.tax_amount || 0,
            shipping_fee: createOrderDto.shipping_fee || 0,
            total_amount: totalAmount,
            payment_status: 'pending',
            payment_expires_at: new Date(Date.now() + this.PAYMENT_TIMEOUT_MINUTES * 60 * 1000),
            shipping_address: createOrderDto.shipping_address,
            shipping_city: createOrderDto.shipping_city,
            shipping_state: createOrderDto.shipping_state,
            shipping_pincode: createOrderDto.shipping_pincode,
            shipping_phone: createOrderDto.shipping_phone,
            notes: createOrderDto.notes,
            source: createOrderDto.source || 'whatsapp',
          },
          include: { order_items: true },
        });

        // Create order items using already-cached catalog data
        for (const item of createOrderDto.items) {
          const catalogItem = await getCatalogItem(item.item_id);
          const variant = item.variant_id
            ? catalogItem.variants.find((v: any) => v.variant_id === item.variant_id)
            : null;
          const unitPrice = variant ? Number(variant.price) : Number(catalogItem.base_price || 0);
          const totalPrice = unitPrice * item.quantity - (item.discount || 0);

          await tx.order_items.create({
            data: {
              order_id: createdOrder.order_id,
              item_id: item.item_id,
              variant_id: item.variant_id,
              product_name: catalogItem.name || 'Unknown Item',
              variant_name: variant?.name,
              sku: variant?.sku ?? undefined,
              quantity: item.quantity,
              unit_price: unitPrice,
              discount: item.discount || 0,
              total_price: totalPrice,
              snapshot: {
                item_name: catalogItem.name,
                item_description: catalogItem.description,
                item_type: catalogItem.item_type,
                variant_name: variant?.name,
                variant_options: variant?.options,
                price: unitPrice,
              },
            },
          });

          if (catalogItem.stock_quantity !== null && catalogItem.stock_quantity !== undefined) {
            await this.stockReservationService.reserveStock(
              createdOrder.order_id,
              item.item_id,
              item.variant_id,
              item.quantity,
              tx,
            );
          }
        }

        if ((createOrderDto.order_type || 'product') === 'product') {
          const productOrder = await tx.product_orders.create({
            data: {
              business_id: createdOrder.business_id,
              tenant_id: createdOrder.tenant_id,
              legacy_order_id: createdOrder.order_id,
              customer_id: createdOrder.customer_id,
              lead_id: createdOrder.lead_id,
              order_number: createdOrder.order_number,
              status: createdOrder.status ?? 'pending',
              payment_status: createdOrder.payment_status ?? 'pending',
              subtotal,
              discount_amount: createOrderDto.discount_amount || 0,
              tax_amount: createOrderDto.tax_amount || 0,
              shipping_fee: createOrderDto.shipping_fee || 0,
              total_amount: totalAmount,
              source: createOrderDto.source || 'whatsapp',
              shipping_address: createOrderDto.shipping_address,
              shipping_city: createOrderDto.shipping_city,
              shipping_state: createOrderDto.shipping_state,
              shipping_pincode: createOrderDto.shipping_pincode,
              shipping_phone: createOrderDto.shipping_phone,
              notes: createOrderDto.notes,
              metadata: { compatibility_order_id: createdOrder.order_id },
            },
          });

          for (const item of createOrderDto.items) {
            const catalogItem = await getCatalogItem(item.item_id);
            const variant = item.variant_id
              ? catalogItem.variants.find((v: any) => v.variant_id === item.variant_id)
              : null;
            const unitPrice = variant ? Number(variant.price) : Number(catalogItem.base_price || 0);
            const totalPrice = unitPrice * item.quantity - (item.discount || 0);

            await tx.product_order_items.create({
              data: {
                product_order_id: productOrder.product_order_id,
                item_id: item.item_id,
                variant_id: item.variant_id,
                product_name: catalogItem.name || 'Unknown Item',
                variant_name: variant?.name,
                sku: variant?.sku ?? undefined,
                quantity: item.quantity,
                unit_price: unitPrice,
                discount: item.discount || 0,
                total_price: totalPrice,
                snapshot: {
                  item_name: catalogItem.name,
                  item_description: catalogItem.description,
                  item_type: catalogItem.item_type,
                  variant_name: variant?.name,
                  variant_options: variant?.options,
                  price: unitPrice,
                },
              },
            });
          }

          await tx.product_order_status_events.create({
            data: {
              product_order_id: productOrder.product_order_id,
              business_id: createdOrder.business_id,
              from_status: null,
              to_status: productOrder.status,
              actor: 'system',
              data: { legacy_order_id: createdOrder.order_id },
            },
          });
        }

        return tx.orders.findUnique({
          where: { order_id: createdOrder.order_id },
          include: { order_items: true },
        });
      });

      this.logger.log(`Order created: ${order.order_number} (${order.order_id})`);
      return this.toDomainOrder(order);
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(orderId: string): Promise<Order | null> {
    try {
      const order = await this.prisma.orders.findUnique({
        where: { order_id: orderId },
        include: { order_items: true, customers: true },
      });
      return order ? this.toDomainOrder(order) : null;
    } catch (error) {
      this.logger.error(`Failed to find order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    query: OrderQueryDto,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    try {
      const {
        business_id,
        customer_id,
        status,
        payment_status,
        source,
        from_date,
        to_date,
        min_amount,
        max_amount,
        search,
        page = 1,
        limit = 20,
        sort_by = 'created_at',
        order = 'desc',
      } = query;

      const where: any = {};
      if (business_id) where.business_id = business_id;
      if (customer_id) where.customer_id = customer_id;
      if (status) where.status = status;
      if (payment_status) where.payment_status = payment_status;
      if (source) where.source = source;

      if (from_date || to_date) {
        where.created_at = {};
        if (from_date) where.created_at.gte = new Date(from_date);
        if (to_date) where.created_at.lte = new Date(to_date);
      }

      if (min_amount !== undefined || max_amount !== undefined) {
        where.total_amount = {};
        if (min_amount !== undefined) where.total_amount.gte = min_amount;
        if (max_amount !== undefined) where.total_amount.lte = max_amount;
      }

      if (search) {
        where.OR = [
          { order_number: { contains: search, mode: 'insensitive' } },
          {
            customers: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
              ],
            },
          },
        ];
      }

      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        this.prisma.orders.findMany({
          where,
          include: { order_items: true, customers: true },
          skip,
          take: limit,
          orderBy: { [sort_by]: order },
        }),
        this.prisma.orders.count({ where }),
      ]);

      return {
        data: orders.map((o) => this.toDomainOrder(o)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to find orders: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(orderId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    try {
      const updated = await this.prisma.orders.update({
        where: { order_id: orderId },
        data: {
          shipping_address: updateOrderDto.shipping_address,
          shipping_city: updateOrderDto.shipping_city,
          shipping_state: updateOrderDto.shipping_state,
          shipping_pincode: updateOrderDto.shipping_pincode,
          shipping_phone: updateOrderDto.shipping_phone,
          notes: updateOrderDto.notes,
          admin_notes: updateOrderDto.admin_notes,
          updated_at: new Date(),
        },
        include: { order_items: true },
      });
      this.logger.log(`Order updated: ${orderId}`);
      return this.toDomainOrder(updated);
    } catch (error) {
      this.logger.error(`Failed to update order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order> {
    try {
      const data: any = { status, updated_at: new Date() };
      if (notes) data.admin_notes = notes;
      if (status === OrderStatus.SHIPPED) data.shipped_at = new Date();
      else if (status === OrderStatus.DELIVERED) data.delivered_at = new Date();
      else if (status === OrderStatus.CANCELLED) data.cancelled_at = new Date();

      const updated = await this.prisma.orders.update({
        where: { order_id: orderId },
        data,
        include: { order_items: true },
      });
      await this.syncProductOrderStatus(orderId, status, { notes });
      this.logger.log(`Order status updated: ${orderId} → ${status}`);
      return this.toDomainOrder(updated);
    } catch (error) {
      this.logger.error(`Failed to update order status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async confirmPayment(
    orderId: string,
    paymentMethod: string,
    paymentReference?: string,
  ): Promise<Order> {
    try {
      // MEDIUM-3: Guard against double-confirmation
      const existing = await this.prisma.orders.findUnique({
        where: { order_id: orderId },
        select: { payment_status: true },
      });
      if (!existing) throw new NotFoundException(`Order not found: ${orderId}`);
      if (existing.payment_status === 'paid') {
        throw new ConflictException('Order is already marked as paid');
      }

      await this.stockReservationService.convertReservationToSale(orderId);

      const updated = await this.prisma.orders.update({
        where: { order_id: orderId },
        data: {
          payment_status: 'paid',
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          paid_at: new Date(),
          status: 'paid',
          updated_at: new Date(),
        },
        include: { order_items: true, customers: true },
      });
      const productOrder = await this.syncProductOrderPayment(orderId, paymentMethod, paymentReference);
      await this.recordDashboardPayment(updated, paymentMethod, paymentReference);
      await this.closeProductPaymentApprovals(
        updated.business_id,
        updated.order_id,
        productOrder?.product_order_id,
        updated.order_number,
        paymentMethod,
        paymentReference,
      );

      this.logger.log(`Payment confirmed for order: ${orderId} via ${paymentMethod}`);
      return this.toDomainOrder(updated);
    } catch (error) {
      this.logger.error(`Failed to confirm payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateShipping(orderId: string, trackingNumber: string, carrier?: string): Promise<Order> {
    try {
      const updated = await this.prisma.orders.update({
        where: { order_id: orderId },
        data: {
          tracking_number: trackingNumber,
          admin_notes: carrier ? `Carrier: ${carrier}` : undefined,
          updated_at: new Date(),
        },
        include: { order_items: true },
      });
      this.logger.log(`Shipping info updated for order: ${orderId}`);
      return this.toDomainOrder(updated);
    } catch (error) {
      this.logger.error(`Failed to update shipping: ${error.message}`, error.stack);
      throw error;
    }
  }

  async cancel(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await this.prisma.$transaction(async (tx) => {
        const existingOrder = await tx.orders.findUnique({
          where: { order_id: orderId },
          include: { order_items: true },
        });

        if (!existingOrder) throw new NotFoundException(`Order not found: ${orderId}`);

        // MEDIUM-2: Prevent re-cancelling or cancelling terminal states
        if (existingOrder.status === OrderStatus.CANCELLED) {
          throw new ConflictException('Order is already cancelled');
        }
        if (existingOrder.status === OrderStatus.DELIVERED) {
          throw new BadRequestException('Cannot cancel a delivered order — initiate a refund instead');
        }

        await this.stockReservationService.releaseReservation(orderId);

        return tx.orders.update({
          where: { order_id: orderId },
          data: {
            status: OrderStatus.CANCELLED,
            cancelled_at: new Date(),
            admin_notes: reason || 'Order cancelled',
            updated_at: new Date(),
          },
          include: { order_items: true },
        });
      });
      await this.syncProductOrderStatus(orderId, OrderStatus.CANCELLED, { reason });

      this.logger.log(`Order cancelled: ${orderId}`);
      return this.toDomainOrder(order);
    } catch (error) {
      this.logger.error(`Failed to cancel order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getOrderStats(
    businessId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    completed_orders: number;
    average_order_value: number;
  }> {
    try {
      const where: any = { business_id: businessId };
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at.gte = startDate;
        if (endDate) where.created_at.lte = endDate;
      }

      const [total, pending, completed, paidCount, revenueAgg] = await Promise.all([
        this.prisma.orders.count({ where }),
        this.prisma.orders.count({ where: { ...where, status: 'pending' } }),
        this.prisma.orders.count({ where: { ...where, status: 'delivered' } }),
        // MEDIUM-9: Count paid orders separately for correct AOV denominator
        this.prisma.orders.count({ where: { ...where, payment_status: 'paid' } }),
        this.prisma.orders.aggregate({
          where: { ...where, payment_status: 'paid' },
          _sum: { total_amount: true },
        }),
      ]);

      const totalRevenue = Number(revenueAgg._sum.total_amount || 0);
      // AOV = revenue / paid orders only (not all orders)
      const averageOrderValue = paidCount > 0 ? totalRevenue / paidCount : 0;

      return {
        total_orders: total,
        total_revenue: totalRevenue,
        pending_orders: pending,
        completed_orders: completed,
        average_order_value: averageOrderValue,
      };
    } catch (error) {
      this.logger.error(`Failed to get order stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  private toDomainOrder(prismaOrder: any): Order {
    const order: any = {
      order_id: prismaOrder.order_id,
      business_id: prismaOrder.business_id,
      tenant_id: prismaOrder.tenant_id,
      customer_id: prismaOrder.customer_id,
      order_number: prismaOrder.order_number,
      order_type: prismaOrder.order_type,
      status: prismaOrder.status as OrderStatus,
      subtotal: Number(prismaOrder.subtotal || 0),
      discount_amount: Number(prismaOrder.discount_amount || 0),
      tax_amount: Number(prismaOrder.tax_amount || 0),
      shipping_fee: Number(prismaOrder.shipping_fee || 0),
      total_amount: Number(prismaOrder.total_amount || 0),
      payment_method: prismaOrder.payment_method,
      payment_status: prismaOrder.payment_status as PaymentStatus,
      payment_reference: prismaOrder.payment_reference,
      paid_at: prismaOrder.paid_at,
      shipping_address: prismaOrder.shipping_address,
      shipping_city: prismaOrder.shipping_city,
      shipping_state: prismaOrder.shipping_state,
      shipping_pincode: prismaOrder.shipping_pincode,
      shipping_phone: prismaOrder.shipping_phone,
      tracking_number: prismaOrder.tracking_number,
      shipped_at: prismaOrder.shipped_at,
      delivered_at: prismaOrder.delivered_at,
      notes: prismaOrder.notes,
      admin_notes: prismaOrder.admin_notes,
      source: prismaOrder.source,
      created_at: prismaOrder.created_at,
      updated_at: prismaOrder.updated_at,
      cancelled_at: prismaOrder.cancelled_at,
      items: prismaOrder.order_items?.map((item: any) => this.toDomainOrderItem(item)),
    };

    if (prismaOrder.customers) {
      order.customer = {
        customer_id: prismaOrder.customers.customer_id,
        name: prismaOrder.customers.name,
        firstName: prismaOrder.customers.name,
        lastName: '',
        phone: prismaOrder.customers.phone ?? prismaOrder.customers.whatsapp_number,
        whatsapp_number: prismaOrder.customers.whatsapp_number,
        email: prismaOrder.customers.email,
      };
    }

    return order;
  }

  private async syncProductOrderStatus(
    legacyOrderId: string,
    nextStatus: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const productOrder = await this.prisma.product_orders.findUnique({
      where: { legacy_order_id: legacyOrderId },
      select: { product_order_id: true, business_id: true, status: true },
    });
    if (!productOrder) return;

    await this.prisma.$transaction([
      this.prisma.product_orders.update({
        where: { product_order_id: productOrder.product_order_id },
        data: {
          status: nextStatus,
          ...(nextStatus === OrderStatus.CANCELLED && { cancelled_at: new Date() }),
          updated_at: new Date(),
        },
      }),
      this.prisma.product_order_status_events.create({
        data: {
          product_order_id: productOrder.product_order_id,
          business_id: productOrder.business_id,
          from_status: productOrder.status,
          to_status: nextStatus,
          actor: 'system',
          data: data ?? {},
        },
      }),
    ]);
  }

  private async syncProductOrderPayment(
    legacyOrderId: string,
    paymentMethod: string,
    paymentReference?: string,
  ): Promise<{ product_order_id: string; business_id: string } | null> {
    const productOrder = await this.prisma.product_orders.findUnique({
      where: { legacy_order_id: legacyOrderId },
      select: { product_order_id: true, business_id: true, metadata: true },
    });
    if (!productOrder) return null;

    await this.prisma.product_orders.update({
      where: { product_order_id: productOrder.product_order_id },
      data: {
        payment_status: 'paid',
        status: 'paid',
        paid_at: new Date(),
        metadata: {
          ...((productOrder.metadata as Record<string, any>) ?? {}),
          payment_method: paymentMethod,
          payment_reference: paymentReference,
        },
        updated_at: new Date(),
      },
    });
    return {
      product_order_id: productOrder.product_order_id,
      business_id: productOrder.business_id,
    };
  }

  private async recordDashboardPayment(
    order: any,
    paymentMethod: string,
    paymentReference?: string,
  ): Promise<void> {
    if (!order.customer_id || !order.tenant_id) return;

    const existing = await this.prisma.payments.findFirst({
      where: { order_id: order.order_id },
      orderBy: { created_at: 'desc' },
    });
    const now = new Date();
    const notes = {
      source: 'dashboard_order_desk',
      manual_confirmation: true,
      payment_reference: paymentReference ?? null,
      order_number: order.order_number ?? null,
    };

    if (existing) {
      await this.prisma.payments.update({
        where: { payment_id: existing.payment_id },
        data: {
          amount: order.total_amount,
          status: 'captured',
          method: paymentMethod,
          captured_at: now,
          notes,
          updated_at: now,
        },
      });
      return;
    }

    await this.prisma.payments.create({
      data: {
        business_id: order.business_id,
        tenant_id: order.tenant_id,
        order_id: order.order_id,
        customer_id: order.customer_id,
        razorpay_order_id: `manual_${order.order_id}`,
        amount: order.total_amount,
        currency: 'INR',
        status: 'captured',
        method: paymentMethod,
        receipt: order.order_number,
        description: 'Payment confirmed from order dashboard',
        notes,
        captured_at: now,
      },
    });
  }

  private async closeProductPaymentApprovals(
    businessId: string,
    legacyOrderId?: string | null,
    productOrderId?: string | null,
    orderNumber?: string | null,
    paymentMethod?: string | null,
    paymentReference?: string | null,
  ): Promise<void> {
    try {
      await this.prisma.$queryRawUnsafe(
        `UPDATE seller_owner_approvals
         SET status = 'approved',
             decided_at = now(),
             updated_at = now(),
             payload = COALESCE(payload, '{}'::jsonb) || $5::jsonb
         WHERE business_id = $1
           AND status = 'pending'
           AND action_type IN ('payment_followup', 'payment_review', 'owner_payment_approval')
           AND (
             (entity_type = 'product_order' AND entity_id = $3)
             OR (entity_type = 'order' AND entity_id = $2)
             OR payload->>'product_order_id' = $3
             OR payload->>'legacy_order_id' = $2
             OR payload->>'order_id' = $2
             OR payload->>'order_number' = $4
           )`,
        businessId,
        legacyOrderId ?? '',
        productOrderId ?? '',
        orderNumber ?? '',
        JSON.stringify({
          resolved_by: 'dashboard_payment_confirmation',
          legacy_order_id: legacyOrderId ?? null,
          product_order_id: productOrderId ?? null,
          order_number: orderNumber ?? null,
          payment_method: paymentMethod ?? null,
          payment_reference: paymentReference ?? null,
        }),
      );
    } catch (error: any) {
      const message = String(error?.message ?? error?.meta?.message ?? '');
      if (!message.includes('seller_owner_approvals') && !message.includes('does not exist')) {
        throw error;
      }
    }
  }

  private toDomainOrderItem(prismaItem: any): OrderItem {
    return {
      order_item_id: prismaItem.order_item_id,
      order_id: prismaItem.order_id,
      item_id: prismaItem.item_id,   // MEDIUM-10: corrected from product_id (non-existent field)
      variant_id: prismaItem.variant_id,
      product_name: prismaItem.product_name,
      variant_name: prismaItem.variant_name,
      sku: prismaItem.sku,
      quantity: prismaItem.quantity,
      unit_price: Number(prismaItem.unit_price),
      discount: Number(prismaItem.discount || 0),
      total_price: Number(prismaItem.total_price),
      snapshot: prismaItem.snapshot,
      created_at: prismaItem.created_at,
      updated_at: prismaItem.updated_at,
    };
  }
}
