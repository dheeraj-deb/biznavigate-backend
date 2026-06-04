import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { StockReservationService } from '../../commerce/orders/application/services/stock-reservation.service';
import {
  AiGuardrailCheckDto,
  CompleteSellerSetupDto,
  CreateCreditCustomerDto,
  CreateDeliveryDto,
  CreateManualSaleDto,
  CreateOwnerApprovalDto,
  CreateReturnCaseDto,
  CreateStockReservationDto,
  SellerProductBulkImportDto,
  SellerProductImportRowDto,
  SellerProductsStockQueryDto,
  SellerSaleItemDto,
  SellerSetupProductDto,
  SellerStockAdjustmentDto,
  UpdateCreditCustomerDto,
  UpdateSellerStatusDto,
} from './dto/seller-os.dto';

type AuthUser = {
  business_id: string;
  tenant_id?: string;
  user_id?: string;
};

type SaleLine = {
  item_id: string;
  variant_id?: string | null;
  product_name: string;
  variant_name?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  snapshot: Record<string, any>;
};

@Injectable()
export class SellerOsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockReservationService: StockReservationService,
  ) {}

  async getOverview(user: AuthUser) {
    const businessId = user.business_id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      openInquiries,
      pendingOrders,
      todayOrders,
      activeProducts,
      lowStockProducts,
      cartHolds,
      approvals,
      reservations,
      returnsQueue,
      deliveriesQueue,
      creditSummaryRows,
      auditRows,
      demandRows,
      deadStockRows,
    ] = await Promise.all([
      this.prisma.product_inquiries.count({
        where: { business_id: businessId, status: 'open' },
      }),
      this.prisma.product_orders.count({
        where: {
          business_id: businessId,
          status: { in: ['pending', 'paid', 'processing'] },
        },
      }),
      this.prisma.product_orders.count({
        where: { business_id: businessId, created_at: { gte: today } },
      }),
      this.prisma.catalog_items.count({
        where: {
          business_id: businessId,
          item_type: 'physical_product',
          is_active: true,
          deleted_at: null,
        },
      }),
      this.prisma.catalog_items.findMany({
        where: {
          business_id: businessId,
          item_type: 'physical_product',
          is_active: true,
          deleted_at: null,
          stock_quantity: { lte: 5 },
        },
        orderBy: { stock_quantity: 'asc' },
        take: 6,
        select: {
          item_id: true,
          name: true,
          category: true,
          stock_quantity: true,
          base_price: true,
        },
      }),
      this.prisma.cart_reservations.count({
        where: {
          status: 'active',
          catalog_item: { business_id: businessId },
        },
      }),
      this.optionalQuery<any>(
        `SELECT approval_id, title, simple_summary, action_type, risk_level, status, payload, created_at
         FROM seller_owner_approvals
         WHERE business_id = $1 AND status = 'pending'
         ORDER BY created_at DESC
         LIMIT 8`,
        [businessId],
      ),
      this.optionalQuery<any>(
        `SELECT reservation_id, item_id, variant_id, quantity, status, reason, expires_at, created_at
         FROM seller_stock_reservations
         WHERE business_id = $1 AND status = 'active'
         ORDER BY expires_at ASC
         LIMIT 8`,
        [businessId],
      ),
      this.optionalQuery<any>(
        `SELECT return_id, return_type, status, reason, requested_amount, created_at
         FROM seller_return_cases
         WHERE business_id = $1 AND status IN ('requested', 'checking', 'approved')
         ORDER BY created_at DESC
         LIMIT 8`,
        [businessId],
      ),
      this.optionalQuery<any>(
        `SELECT delivery_id, status, delivery_mode, delivery_person, phone, pincode, scheduled_at, created_at
         FROM seller_deliveries
         WHERE business_id = $1 AND status IN ('waiting', 'assigned', 'out_for_delivery')
         ORDER BY COALESCE(scheduled_at, created_at) ASC
         LIMIT 8`,
        [businessId],
      ),
      this.optionalQuery<any>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_customers,
           COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_customers,
           COALESCE(SUM(current_balance) FILTER (WHERE status = 'approved'), 0) AS total_credit_due
         FROM seller_customer_credit_accounts
         WHERE business_id = $1`,
        [businessId],
      ),
      this.optionalQuery<any>(
        `SELECT ai_audit_id, ai_employee, action, decision, risk_level, output_summary, created_at
         FROM seller_ai_audit_logs
         WHERE business_id = $1 AND owner_visible = TRUE
         ORDER BY created_at DESC
         LIMIT 8`,
        [businessId],
      ),
      this.query<any>(
        `SELECT COALESCE(ci.category, 'Unsorted') AS category, COUNT(*)::int AS inquiry_count
         FROM product_inquiries pi
         LEFT JOIN catalog_items ci ON ci.item_id = pi.item_id
         WHERE pi.business_id = $1
           AND pi.created_at >= now() - interval '30 days'
         GROUP BY COALESCE(ci.category, 'Unsorted')
         ORDER BY inquiry_count DESC
         LIMIT 6`,
        [businessId],
      ),
      this.query<any>(
        `SELECT ci.item_id, ci.name, ci.category, ci.stock_quantity, ci.base_price, ci.created_at
         FROM catalog_items ci
         LEFT JOIN product_order_items poi ON poi.item_id = ci.item_id
         LEFT JOIN product_orders po
           ON po.product_order_id = poi.product_order_id
          AND po.created_at >= now() - interval '60 days'
         WHERE ci.business_id = $1
           AND ci.item_type = 'physical_product'
           AND ci.is_active = TRUE
           AND ci.deleted_at IS NULL
           AND COALESCE(ci.stock_quantity, 0) > 0
         GROUP BY ci.item_id, ci.name, ci.category, ci.stock_quantity, ci.base_price, ci.created_at
         HAVING COUNT(po.product_order_id) = 0
         ORDER BY ci.created_at ASC
         LIMIT 6`,
        [businessId],
      ),
    ]);

    const creditSummary = creditSummaryRows[0] ?? {
      approved_customers: 0,
      pending_customers: 0,
      total_credit_due: 0,
    };

    const ownerQueue = [
      ...approvals.map((approval) => ({
        id: approval.approval_id,
        type: approval.action_type,
        title: approval.title,
        text: approval.simple_summary ?? approval.title,
        risk: approval.risk_level,
        source: 'approval',
      })),
      ...(pendingOrders > 0
        ? [{
            id: 'pending-orders',
            type: 'orders',
            title: 'Confirm product orders',
            text: `${pendingOrders} orders are waiting for packing, payment, or delivery.`,
            risk: 'medium',
            source: 'system',
          }]
        : []),
      ...(openInquiries > 0
        ? [{
            id: 'open-inquiries',
            type: 'leads',
            title: 'Reply to product enquiries',
            text: `${openInquiries} WhatsApp enquiries are still open.`,
            risk: 'low',
            source: 'ai_sales_employee',
          }]
        : []),
      ...(lowStockProducts.length > 0
        ? [{
            id: 'low-stock',
            type: 'stock',
            title: 'Restock low items',
            text: `${lowStockProducts.length} products are close to empty.`,
            risk: 'high',
            source: 'ai_inventory_employee',
          }]
        : []),
    ].slice(0, 10);

    const totalCreditDue = this.toNumber(creditSummary.total_credit_due);

    return {
      business_type: 'product_seller',
      title: 'Store Desk',
      summary: {
        owner_queue: ownerQueue.length,
        today_orders: todayOrders,
        open_enquiries: openInquiries,
        active_products: activeProducts,
        low_stock: lowStockProducts.length,
        stock_holds: reservations.length + cartHolds,
        returns_waiting: returnsQueue.length,
        deliveries_waiting: deliveriesQueue.length,
        credit_due: totalCreditDue,
      },
      primary_actions: [
        { key: 'approval_queue', label: 'Approve work', count: approvals.length },
        { key: 'counter_sale', label: 'Counter sale', count: todayOrders },
        { key: 'stock_hold', label: 'Hold stock', count: reservations.length + cartHolds },
        { key: 'credit_customers', label: 'Credit customers', count: Number(creditSummary.approved_customers ?? 0) },
      ],
      owner_queue: ownerQueue,
      ai_employees: [
        {
          key: 'sales',
          name: 'AI Sales Employee',
          simple_job: 'Replies on WhatsApp, shows products, and brings ready buyers.',
          today: `${openInquiries} open enquiries`,
          next: openInquiries > 0 ? 'Follow up hot buyers' : 'Watch new WhatsApp messages',
        },
        {
          key: 'inventory',
          name: 'AI Inventory Employee',
          simple_job: 'Prevents overselling and warns before stock runs out.',
          today: `${lowStockProducts.length} low stock items`,
          next: lowStockProducts.length > 0 ? 'Ask owner to restock' : 'Keep checking stock',
        },
        {
          key: 'credit',
          name: 'AI Credit Desk',
          simple_job: 'Allows credit only for seller-approved customers.',
          today: `${Number(creditSummary.pending_customers ?? 0)} credit requests`,
          next: totalCreditDue > 0 ? 'Remind due customers' : 'Keep credit list clean',
        },
        {
          key: 'delivery',
          name: 'AI Delivery Desk',
          simple_job: 'Keeps local deliveries visible until completed.',
          today: `${deliveriesQueue.length} delivery jobs`,
          next: deliveriesQueue.length > 0 ? 'Mark delivery progress' : 'Wait for packed orders',
        },
        {
          key: 'profit',
          name: 'AI Profit Coach',
          simple_job: 'Finds slow stock, weak margin, and demand chances.',
          today: `${deadStockRows.length} old stock alerts`,
          next: deadStockRows.length > 0 ? 'Suggest offer or bundle' : 'Watch product movement',
        },
        {
          key: 'guard',
          name: 'AI Mistake Prevention',
          simple_job: 'Stops risky actions before the AI or staff make them.',
          today: `${auditRows.length} checks recorded`,
          next: approvals.length > 0 ? 'Wait for owner approval' : 'Approve safe actions automatically',
        },
      ],
      workspaces: {
        approvals,
        stock_reservations: reservations,
        returns: returnsQueue,
        deliveries: deliveriesQueue,
        credit: {
          approved_customers: Number(creditSummary.approved_customers ?? 0),
          pending_customers: Number(creditSummary.pending_customers ?? 0),
          total_credit_due: totalCreditDue,
        },
      },
      stock: {
        low_stock: lowStockProducts.map((item) => ({
          ...item,
          base_price: this.toNumber(item.base_price),
        })),
        active_cart_holds: cartHolds,
      },
      demand_heatmap: demandRows,
      dead_stock: deadStockRows.map((item) => ({
        ...item,
        base_price: this.toNumber(item.base_price),
      })),
      ai_audit_log: auditRows,
      feature_map: [
        'Owner approvals',
        'Counter sale',
        'Stock holds',
        'AI inventory checks',
        'Returns and refunds',
        'Local delivery',
        'AI audit log',
        'Profit coach',
        'Dead stock recovery',
        'Demand heatmap',
        'Credit customers',
        'AI mistake prevention',
      ],
    };
  }

  async getSetup(user: AuthUser) {
    const businessId = user.business_id;
    const [settingsRows, productCount, connectedCatalog, sampleProducts] = await Promise.all([
      this.optionalQuery<any>(
        `SELECT *
         FROM seller_store_settings
         WHERE business_id = $1
         LIMIT 1`,
        [businessId],
      ),
      this.prisma.catalog_items.count({
        where: {
          business_id: businessId,
          item_type: 'physical_product',
          deleted_at: null,
        },
      }),
      this.prisma.external_catalog_items.count({
        where: { business_id: businessId, provider: 'whatsapp' },
      }),
      this.prisma.catalog_items.findMany({
        where: {
          business_id: businessId,
          item_type: 'physical_product',
          deleted_at: null,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          item_id: true,
          name: true,
          category: true,
          base_price: true,
          stock_quantity: true,
          primary_image_url: true,
        },
      }),
    ]);

    const settings = settingsRows[0] ?? null;
    const checklist = {
      seller_rules: Boolean(settings),
      products_added: productCount > 0,
      whatsapp_catalog_linked: connectedCatalog > 0,
      stock_ready: productCount > 0 && sampleProducts.some((item) => (item.stock_quantity ?? 0) > 0),
      ai_ready: Boolean(settings?.ai_guardrails),
    };

    return {
      status: settings?.onboarding_status ?? (productCount > 0 ? 'in_progress' : 'not_started'),
      settings,
      counts: {
        products: productCount,
        whatsapp_catalog_items: connectedCatalog,
      },
      checklist,
      products: sampleProducts.map((item) => ({
        ...item,
        base_price: this.toNumber(item.base_price),
      })),
    };
  }

  async completeSetup(user: AuthUser, dto: CompleteSellerSetupDto) {
    const businessId = user.business_id;
    const tenantId = this.requireTenant(user);
    const stockHoldMinutes = dto.stock_hold_minutes ?? 15;
    const lowStockThreshold = dto.low_stock_threshold ?? 5;
    const paymentModes = this.cleanStringList(dto.payment_modes, ['cash', 'upi', 'cod']);
    const deliveryModes = this.cleanStringList(dto.delivery_modes, ['pickup', 'local_delivery']);
    const deliveryAreas = this.cleanStringList(dto.delivery_areas, []);
    const aiGuardrails = {
      high_value_approval_amount: dto.high_value_approval_amount ?? 10000,
      require_owner_approval_for_credit: dto.require_owner_approval_for_credit ?? true,
      prevent_oversell: true,
      block_unapproved_credit: true,
      require_stock_before_payment: true,
    };
    const creditDefaults = {
      default_credit_limit: dto.default_credit_limit ?? 0,
      require_owner_approval: dto.require_owner_approval_for_credit ?? true,
      due_days: 30,
    };

    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdProducts: any[] = [];
        for (const product of dto.products ?? []) {
          const saved = await this.upsertSetupProduct(
            tx,
            businessId,
            tenantId,
            product,
            lowStockThreshold,
          );
          createdProducts.push(saved);
        }

        const productCount = await tx.catalog_items.count({
          where: {
            business_id: businessId,
            item_type: 'physical_product',
            deleted_at: null,
          },
        });

        const setupChecklist = {
          seller_rules: true,
          products_added: productCount > 0,
          whatsapp_catalog_linked: false,
          store_desk_ready: true,
          ai_ready: true,
        };

        const settingsRows = await tx.$queryRawUnsafe<any[]>(
          `INSERT INTO seller_store_settings
             (business_id, tenant_id, store_type, onboarding_status, default_currency,
              low_stock_threshold, stock_hold_minutes, payment_modes, delivery_modes,
              delivery_areas, credit_defaults, ai_guardrails, setup_checklist)
           VALUES ($1, $2, $3, 'completed', 'INR', $4, $5, $6::text[], $7::text[], $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb)
           ON CONFLICT (business_id) DO UPDATE SET
             tenant_id = EXCLUDED.tenant_id,
             store_type = EXCLUDED.store_type,
             onboarding_status = 'completed',
             low_stock_threshold = EXCLUDED.low_stock_threshold,
             stock_hold_minutes = EXCLUDED.stock_hold_minutes,
             payment_modes = EXCLUDED.payment_modes,
             delivery_modes = EXCLUDED.delivery_modes,
             delivery_areas = EXCLUDED.delivery_areas,
             credit_defaults = EXCLUDED.credit_defaults,
             ai_guardrails = EXCLUDED.ai_guardrails,
             setup_checklist = EXCLUDED.setup_checklist,
             updated_at = now()
           RETURNING *`,
          businessId,
          tenantId,
          dto.store_type ?? 'local_retail',
          lowStockThreshold,
          stockHoldMinutes,
          paymentModes,
          deliveryModes,
          JSON.stringify({ areas: deliveryAreas }),
          JSON.stringify(creditDefaults),
          JSON.stringify(aiGuardrails),
          JSON.stringify(setupChecklist),
        );

        const businessSettings = await tx.business_settings.findUnique({
          where: { business_id: businessId },
          select: { booking_methods: true, booking_link: true },
        });
        const bookingMethods = (businessSettings?.booking_methods as any) ?? {};
        await tx.business_settings.upsert({
          where: { business_id: businessId },
          update: {
            booking_methods: {
              ...bookingMethods,
              catalog: {
                ...(bookingMethods.catalog ?? {}),
                enabled: true,
                send_product_messages: true,
              },
              ai_chat: {
                ...(bookingMethods.ai_chat ?? {}),
                enabled: true,
                collect_guest_details: false,
                require_confirmation: true,
              },
              product_selling: {
                enabled: true,
                stock_hold_minutes: stockHoldMinutes,
                payment_modes: paymentModes,
                delivery_modes: deliveryModes,
                ai_guardrails: aiGuardrails,
              },
            },
            updated_at: new Date(),
          },
          create: {
            business_id: businessId,
            booking_methods: {
              catalog: { enabled: true, send_product_messages: true },
              ai_chat: { enabled: true, collect_guest_details: false, require_confirmation: true },
              product_selling: {
                enabled: true,
                stock_hold_minutes: stockHoldMinutes,
                payment_modes: paymentModes,
                delivery_modes: deliveryModes,
                ai_guardrails: aiGuardrails,
              },
            },
          },
        });

        await tx.audit_logs.create({
          data: {
            business_id: businessId,
            user_id: user.user_id,
            action: 'seller_setup_completed',
            entity_type: 'seller_store_settings',
            entity_id: settingsRows[0]?.seller_store_settings_id,
            new_values: {
              product_count: productCount,
              seeded_products: createdProducts.length,
              stock_hold_minutes: stockHoldMinutes,
              payment_modes: paymentModes,
            },
          },
        });

        await this.insertAiAudit(tx, businessId, tenantId, {
          ai_employee: 'AI Store Setup',
          action: 'product_seller_setup',
          decision: 'completed',
          risk_level: 'low',
          entity_type: 'seller_store_settings',
          entity_id: settingsRows[0]?.seller_store_settings_id,
          input_summary: 'Owner completed product seller setup',
          output_summary: 'Store rules, products, stock and AI guardrails are ready',
          guardrails: aiGuardrails,
        });

        return {
          settings: settingsRows[0],
          products_created_or_updated: createdProducts.length,
          product_count: productCount,
          checklist: setupChecklist,
          next: productCount > 0 ? '/seller-os' : '/inventory/products',
        };
      });
    } catch (error) {
      return this.handleSellerOpsMutationError(error);
    }
  }

  async createManualSale(user: AuthUser, dto: CreateManualSaleDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Add at least one product to create a sale');
    }

    const businessId = user.business_id;
    const tenantId = this.requireTenant(user);
    const paymentMethod = (dto.payment_method ?? 'cash').toLowerCase();
    const isCredit = paymentMethod === 'credit';
    const isPaidNow = ['cash', 'upi', 'card', 'other'].includes(paymentMethod);
    const paymentStatus = isCredit ? 'credit_due' : isPaidNow ? 'paid' : 'pending';
    const orderStatus = isPaidNow ? 'paid' : 'pending';

    return this.prisma.$transaction(async (tx) => {
      const customer = await this.findOrCreateCustomer(
        tx,
        businessId,
        tenantId,
        dto.customer_phone,
        dto.customer_name,
      );
      const lines = await this.buildSaleLines(tx, businessId, dto.items);
      const totals = this.calculateTotals(lines);

      let creditAccount: any = null;
      if (isCredit) {
        creditAccount = await this.getApprovedCreditAccountForUpdate(
          tx,
          businessId,
          customer.phone,
          totals.total_amount,
        );
      }

      const orderNumber = this.makeOrderNumber('CTR');
      const order = await tx.orders.create({
        data: {
          business_id: businessId,
          tenant_id: tenantId,
          customer_id: customer.customer_id,
          order_number: orderNumber,
          order_type: 'product',
          status: orderStatus,
          subtotal: totals.subtotal,
          discount_amount: totals.discount_amount,
          tax_amount: 0,
          shipping_fee: 0,
          total_amount: totals.total_amount,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          payment_reference: dto.payment_reference,
          paid_at: isPaidNow ? new Date() : null,
          shipping_address: dto.shipping_address,
          shipping_phone: customer.phone,
          shipping_pincode: dto.shipping_pincode,
          notes: dto.notes,
          source: 'counter',
        },
      });

      const productOrder = await tx.product_orders.create({
        data: {
          business_id: businessId,
          tenant_id: tenantId,
          legacy_order_id: order.order_id,
          customer_id: customer.customer_id,
          order_number: orderNumber,
          status: orderStatus,
          payment_status: paymentStatus,
          subtotal: totals.subtotal,
          discount_amount: totals.discount_amount,
          tax_amount: 0,
          shipping_fee: 0,
          total_amount: totals.total_amount,
          source: 'counter',
          shipping_address: dto.shipping_address,
          shipping_phone: customer.phone,
          shipping_pincode: dto.shipping_pincode,
          notes: dto.notes,
          paid_at: isPaidNow ? new Date() : null,
          metadata: {
            counter_sale: true,
            payment_method: paymentMethod,
            created_by: user.user_id,
          },
        },
      });

      for (const line of lines) {
        await this.stockReservationService.reserveStock(
          order.order_id,
          line.item_id,
          line.variant_id,
          line.quantity,
          tx,
        );

        await tx.order_items.create({
          data: {
            order_id: order.order_id,
            item_id: line.item_id,
            variant_id: line.variant_id,
            product_name: line.product_name,
            variant_name: line.variant_name,
            sku: line.sku,
            quantity: line.quantity,
            unit_price: line.unit_price,
            discount: line.discount,
            total_price: line.total_price,
            snapshot: line.snapshot,
          },
        });

        await tx.product_order_items.create({
          data: {
            product_order_id: productOrder.product_order_id,
            item_id: line.item_id,
            variant_id: line.variant_id,
            product_name: line.product_name,
            variant_name: line.variant_name,
            sku: line.sku,
            quantity: line.quantity,
            unit_price: line.unit_price,
            discount: line.discount,
            total_price: line.total_price,
            snapshot: line.snapshot,
          },
        });
      }

      await tx.product_order_status_events.create({
        data: {
          product_order_id: productOrder.product_order_id,
          business_id: businessId,
          from_status: null,
          to_status: orderStatus,
          actor: 'owner',
          actor_id: user.user_id,
          data: { legacy_order_id: order.order_id, source: 'counter' },
        },
      });

      await tx.customers.update({
        where: { customer_id: customer.customer_id },
        data: {
          total_orders: { increment: 1 },
          total_spent: { increment: totals.total_amount },
          last_order_date: new Date(),
          updated_at: new Date(),
        },
      });

      if (creditAccount) {
        const nextBalance = this.toNumber(creditAccount.current_balance) + totals.total_amount;
        await tx.$queryRawUnsafe(
          `UPDATE seller_customer_credit_accounts
           SET current_balance = $3, updated_at = now()
           WHERE business_id = $1 AND credit_account_id = $2`,
          businessId,
          creditAccount.credit_account_id,
          nextBalance,
        );
        await tx.$queryRawUnsafe(
          `INSERT INTO seller_customer_credit_transactions
             (credit_account_id, business_id, order_id, transaction_type, amount, balance_after, note, created_by, metadata)
           VALUES ($1, $2, $3, 'sale_credit', $4, $5, $6, $7, $8::jsonb)`,
          creditAccount.credit_account_id,
          businessId,
          order.order_id,
          totals.total_amount,
          nextBalance,
          'Counter sale on credit',
          user.user_id ?? null,
          JSON.stringify({ product_order_id: productOrder.product_order_id }),
        );
      }

      if (dto.delivery_required) {
        await this.insertDelivery(tx, businessId, tenantId, {
          order_id: order.order_id,
          product_order_id: productOrder.product_order_id,
          customer_id: customer.customer_id,
          delivery_mode: 'local',
          phone: customer.phone,
          address: dto.shipping_address,
          pincode: dto.shipping_pincode,
          notes: dto.notes,
        });
      }

      await tx.audit_logs.create({
        data: {
          business_id: businessId,
          user_id: user.user_id,
          action: 'counter_sale_created',
          entity_type: 'order',
          entity_id: order.order_id,
          new_values: {
            product_order_id: productOrder.product_order_id,
            total_amount: totals.total_amount,
            payment_status: paymentStatus,
          },
        },
      });

      await this.insertAiAudit(tx, businessId, tenantId, {
        ai_employee: 'AI Mistake Prevention',
        action: 'counter_sale_guardrail',
        decision: 'allowed',
        risk_level: isCredit ? 'medium' : 'low',
        entity_type: 'order',
        entity_id: order.order_id,
        input_summary: 'Owner created a counter sale',
        output_summary: isCredit
          ? 'Credit sale allowed for an approved customer'
          : 'Stock and sale checks passed',
        guardrails: {
          payment_method: paymentMethod,
          stock_checked: true,
          credit_checked: isCredit,
        },
      });

      return {
        order_id: order.order_id,
        product_order_id: productOrder.product_order_id,
        order_number: orderNumber,
        customer,
        payment_status: paymentStatus,
        total_amount: totals.total_amount,
        items: lines,
      };
    });
  }

  async createStockReservation(user: AuthUser, dto: CreateStockReservationDto) {
    const businessId = user.business_id;
    const tenantId = user.tenant_id;
    const reservationId = randomUUID();
    const holdMinutes = dto.hold_minutes ?? 60;
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

    try {
      return await this.prisma.$transaction(async (tx) => {
        let customerId = dto.customer_id ?? null;
        if (!customerId && dto.customer_phone) {
          const customer = await this.findOrCreateCustomer(
            tx,
            businessId,
            tenantId,
            dto.customer_phone,
            dto.customer_name,
          );
          customerId = customer.customer_id;
        }

        await this.buildSaleLines(tx, businessId, [{
          item_id: dto.item_id,
          variant_id: dto.variant_id,
          quantity: dto.quantity,
        }]);

        await this.stockReservationService.reserveStock(
          reservationId,
          dto.item_id,
          dto.variant_id,
          dto.quantity,
          tx,
        );

        const rows = await tx.$queryRawUnsafe<any[]>(
          `INSERT INTO seller_stock_reservations
             (reservation_id, business_id, tenant_id, customer_id, item_id, variant_id, quantity, reason, source, expires_at, created_by, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'manual', $9, $10, $11::jsonb)
           RETURNING *`,
          reservationId,
          businessId,
          tenantId ?? null,
          customerId,
          dto.item_id,
          dto.variant_id ?? null,
          dto.quantity,
          dto.reason ?? null,
          expiresAt,
          user.user_id ?? null,
          JSON.stringify({ hold_minutes: holdMinutes }),
        );

        await this.insertAiAudit(tx, businessId, tenantId, {
          ai_employee: 'AI Inventory Employee',
          action: 'manual_stock_hold',
          decision: 'reserved',
          risk_level: 'low',
          entity_type: 'seller_stock_reservation',
          entity_id: reservationId,
          input_summary: 'Owner held stock for a local customer',
          output_summary: 'Stock was reserved and cannot be double sold',
          guardrails: { quantity: dto.quantity, expires_at: expiresAt },
        });

        return rows[0];
      });
    } catch (error) {
      return this.handleSellerOpsMutationError(error);
    }
  }

  async releaseStockReservation(user: AuthUser, reservationId: string) {
    const businessId = user.business_id;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRawUnsafe<any[]>(
          `SELECT *
           FROM seller_stock_reservations
           WHERE business_id = $1 AND reservation_id = $2
           FOR UPDATE`,
          businessId,
          reservationId,
        );
        const reservation = rows[0];
        if (!reservation) throw new NotFoundException('Stock hold not found');
        if (reservation.status !== 'active') {
          throw new ConflictException('This stock hold is already closed');
        }

        if (reservation.variant_id) {
          await tx.item_variants.updateMany({
            where: {
              variant_id: reservation.variant_id,
              item_id: reservation.item_id,
            },
            data: {
              stock_quantity: { increment: reservation.quantity },
              updated_at: new Date(),
            },
          });
        } else {
          await tx.catalog_items.updateMany({
            where: {
              business_id: businessId,
              item_id: reservation.item_id,
              stock_quantity: { not: null },
            },
            data: {
              stock_quantity: { increment: reservation.quantity },
              updated_at: new Date(),
            },
          });
        }

        const updated = await tx.$queryRawUnsafe<any[]>(
          `UPDATE seller_stock_reservations
           SET status = 'released', released_at = now(), updated_at = now()
           WHERE business_id = $1 AND reservation_id = $2
           RETURNING *`,
          businessId,
          reservationId,
        );

        await this.insertAiAudit(tx, businessId, user.tenant_id, {
          ai_employee: 'AI Inventory Employee',
          action: 'release_stock_hold',
          decision: 'released',
          risk_level: 'low',
          entity_type: 'seller_stock_reservation',
          entity_id: reservationId,
          input_summary: 'Owner released a stock hold',
          output_summary: 'Reserved stock was added back',
          guardrails: { quantity: reservation.quantity },
        });

        return updated[0];
      });
    } catch (error) {
      return this.handleSellerOpsMutationError(error);
    }
  }

  async listCreditCustomers(user: AuthUser) {
    return this.optionalQuery<any>(
      `SELECT credit_account_id, customer_id, customer_name, phone, status, credit_limit,
              current_balance, due_days, approved_at, notes, created_at, updated_at
       FROM seller_customer_credit_accounts
       WHERE business_id = $1
       ORDER BY
         CASE WHEN status = 'pending' THEN 0 WHEN status = 'approved' THEN 1 ELSE 2 END,
         current_balance DESC,
         updated_at DESC
       LIMIT 100`,
      [user.business_id],
    );
  }

  async upsertCreditCustomer(user: AuthUser, dto: CreateCreditCustomerDto) {
    const businessId = user.business_id;
    const tenantId = this.requireTenant(user);
    const phone = this.normalizePhone(dto.phone);
    const status = dto.status ?? 'approved';

    try {
      return await this.prisma.$transaction(async (tx) => {
        const customer = await this.findOrCreateCustomer(
          tx,
          businessId,
          tenantId,
          phone,
          dto.customer_name,
        );

        const rows = await tx.$queryRawUnsafe<any[]>(
          `INSERT INTO seller_customer_credit_accounts
             (business_id, tenant_id, customer_id, customer_name, phone, status, credit_limit, due_days, approved_by, approved_at, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $6 = 'approved' THEN now() ELSE NULL END, $10)
           ON CONFLICT (business_id, phone) DO UPDATE SET
             customer_id = EXCLUDED.customer_id,
             customer_name = EXCLUDED.customer_name,
             status = EXCLUDED.status,
             credit_limit = EXCLUDED.credit_limit,
             due_days = EXCLUDED.due_days,
             approved_by = CASE WHEN EXCLUDED.status = 'approved' THEN EXCLUDED.approved_by ELSE seller_customer_credit_accounts.approved_by END,
             approved_at = CASE WHEN EXCLUDED.status = 'approved' THEN COALESCE(seller_customer_credit_accounts.approved_at, now()) ELSE seller_customer_credit_accounts.approved_at END,
             notes = EXCLUDED.notes,
             updated_at = now()
           RETURNING *`,
          businessId,
          tenantId ?? null,
          customer.customer_id,
          dto.customer_name ?? customer.name ?? null,
          phone,
          status,
          dto.credit_limit,
          dto.due_days ?? 30,
          user.user_id ?? null,
          dto.notes ?? null,
        );

        await this.insertAiAudit(tx, businessId, tenantId, {
          ai_employee: 'AI Credit Desk',
          action: 'credit_customer_saved',
          decision: status,
          risk_level: status === 'approved' ? 'medium' : 'low',
          entity_type: 'seller_customer_credit_account',
          entity_id: rows[0]?.credit_account_id,
          input_summary: 'Owner updated a credit customer',
          output_summary: `${phone} is ${status} for credit sales`,
          guardrails: { credit_limit: dto.credit_limit, due_days: dto.due_days ?? 30 },
        });

        return rows[0];
      });
    } catch (error) {
      return this.handleSellerOpsMutationError(error);
    }
  }

  async updateCreditCustomer(user: AuthUser, creditAccountId: string, dto: UpdateCreditCustomerDto) {
    const businessId = user.business_id;
    const existing = await this.requiredQuery<any>(
      `SELECT *
       FROM seller_customer_credit_accounts
       WHERE business_id = $1 AND credit_account_id = $2`,
      [businessId, creditAccountId],
    );
    if (!existing[0]) throw new NotFoundException('Credit customer not found');

    const current = existing[0];
    const nextStatus = dto.status ?? current.status;
    const rows = await this.requiredQuery<any>(
      `UPDATE seller_customer_credit_accounts
       SET status = $3,
           credit_limit = $4,
           due_days = $5,
           notes = $6,
           approved_by = CASE WHEN $3 = 'approved' AND approved_by IS NULL THEN $7 ELSE approved_by END,
           approved_at = CASE WHEN $3 = 'approved' AND approved_at IS NULL THEN now() ELSE approved_at END,
           updated_at = now()
       WHERE business_id = $1 AND credit_account_id = $2
       RETURNING *`,
      [
        businessId,
        creditAccountId,
        nextStatus,
        dto.credit_limit ?? this.toNumber(current.credit_limit),
        dto.due_days ?? Number(current.due_days ?? 30),
        dto.notes ?? current.notes ?? null,
        user.user_id ?? null,
      ],
    );
    return rows[0];
  }

  async createReturnCase(user: AuthUser, dto: CreateReturnCaseDto) {
    try {
      const rows = await this.requiredQuery<any>(
        `INSERT INTO seller_return_cases
           (business_id, tenant_id, order_id, product_order_id, customer_id, return_type, reason, requested_amount, items)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
         RETURNING *`,
        [
          user.business_id,
          user.tenant_id ?? null,
          dto.order_id ?? null,
          dto.product_order_id ?? null,
          dto.customer_id ?? null,
          dto.return_type ?? 'return',
          dto.reason ?? null,
          dto.requested_amount ?? null,
          JSON.stringify(dto.items ?? []),
        ],
      );
      return rows[0];
    } catch (error) {
      return this.handleSellerOpsMutationError(error);
    }
  }

  async updateReturnStatus(user: AuthUser, returnId: string, dto: UpdateSellerStatusDto) {
    const closedStatuses = ['completed', 'refunded', 'exchanged', 'rejected'];
    const rows = await this.requiredQuery<any>(
      `UPDATE seller_return_cases
       SET status = $3,
           resolution = $4::jsonb,
           closed_at = CASE WHEN $5 THEN now() ELSE closed_at END,
           updated_at = now()
       WHERE business_id = $1 AND return_id = $2
       RETURNING *`,
      [
        user.business_id,
        returnId,
        dto.status,
        JSON.stringify({ note: dto.note ?? null, updated_by: user.user_id ?? null }),
        closedStatuses.includes(dto.status),
      ],
    );
    if (!rows[0]) throw new NotFoundException('Return case not found');
    return rows[0];
  }

  async createDelivery(user: AuthUser, dto: CreateDeliveryDto) {
    return this.insertDelivery(this.prisma, user.business_id, user.tenant_id, dto);
  }

  async updateDeliveryStatus(user: AuthUser, deliveryId: string, dto: UpdateSellerStatusDto) {
    const rows = await this.requiredQuery<any>(
      `UPDATE seller_deliveries
       SET status = $3,
           picked_at = CASE WHEN $3 = 'out_for_delivery' AND picked_at IS NULL THEN now() ELSE picked_at END,
           delivered_at = CASE WHEN $3 = 'delivered' THEN now() ELSE delivered_at END,
           notes = COALESCE($4, notes),
           updated_at = now()
       WHERE business_id = $1 AND delivery_id = $2
       RETURNING *`,
      [user.business_id, deliveryId, dto.status, dto.note ?? null],
    );
    if (!rows[0]) throw new NotFoundException('Delivery job not found');
    return rows[0];
  }

  async createApproval(user: AuthUser, dto: CreateOwnerApprovalDto) {
    return this.createApprovalRecord(this.prisma, user, dto, true);
  }

  async decideApproval(user: AuthUser, approvalId: string, status: 'approved' | 'rejected') {
    const rows = await this.requiredQuery<any>(
      `UPDATE seller_owner_approvals
       SET status = $3, decided_by = $4, decided_at = now(), updated_at = now()
       WHERE business_id = $1 AND approval_id = $2 AND status = 'pending'
       RETURNING *`,
      [user.business_id, approvalId, status, user.user_id ?? null],
    );
    if (!rows[0]) throw new NotFoundException('Pending approval not found');
    return rows[0];
  }

  async checkAiGuardrails(user: AuthUser, dto: AiGuardrailCheckDto) {
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let decision: 'allow' | 'review' | 'block' = 'allow';

    if (dto.item_id && dto.quantity) {
      const item = await this.prisma.catalog_items.findFirst({
        where: {
          business_id: user.business_id,
          item_id: dto.item_id,
          deleted_at: null,
        },
        include: {
          variants: dto.variant_id
            ? { where: { variant_id: dto.variant_id } }
            : undefined,
        },
      });

      if (!item) {
        warnings.push('Product was not found in this seller account');
        decision = 'block';
        riskLevel = 'high';
      } else {
        const stock = dto.variant_id
          ? item.variants?.[0]?.stock_quantity ?? 0
          : item.stock_quantity ?? 0;
        if (stock < dto.quantity) {
          warnings.push(`Only ${stock} in stock, but ${dto.quantity} requested`);
          decision = 'block';
          riskLevel = 'high';
        } else if (stock - dto.quantity <= 2) {
          warnings.push('This sale will leave very low stock');
          decision = 'review';
          riskLevel = 'medium';
        }
      }
    }

    if ((dto.payment_method ?? '').toLowerCase() === 'credit') {
      const phone = dto.customer_phone ? this.normalizePhone(dto.customer_phone) : '';
      const accountRows = phone
        ? await this.optionalQuery<any>(
            `SELECT status, credit_limit, current_balance
             FROM seller_customer_credit_accounts
             WHERE business_id = $1 AND phone = $2`,
            [user.business_id, phone],
          )
        : [];
      const account = accountRows[0];
      if (!account || account.status !== 'approved') {
        warnings.push('Credit sale needs an owner-approved customer');
        decision = 'block';
        riskLevel = 'high';
      } else if (dto.amount && this.toNumber(account.current_balance) + dto.amount > this.toNumber(account.credit_limit)) {
        warnings.push('Credit limit will be crossed');
        decision = 'block';
        riskLevel = 'high';
      }
    }

    if ((dto.amount ?? 0) >= 10000 && decision === 'allow') {
      warnings.push('High value action should be checked by owner');
      decision = 'review';
      riskLevel = 'medium';
    }

    const requiresOwnerApproval = decision === 'review' || riskLevel === 'high';
    let approval: any = null;
    if (requiresOwnerApproval) {
      approval = await this.createApprovalRecord(
        this.prisma,
        user,
        {
          title: 'Check before continuing',
          simple_summary: warnings[0] ?? 'AI wants owner confirmation before this action',
          action_type: dto.action,
          risk_level: riskLevel,
          entity_type: dto.item_id ? 'catalog_item' : undefined,
          entity_id: dto.item_id,
          payload: dto as Record<string, any>,
        },
        false,
      );
    }

    await this.insertAiAudit(this.prisma, user.business_id, user.tenant_id, {
      ai_employee: 'AI Mistake Prevention',
      action: dto.action,
      decision,
      risk_level: riskLevel,
      entity_type: dto.item_id ? 'catalog_item' : undefined,
      entity_id: dto.item_id,
      input_summary: 'Guardrail check requested',
      output_summary: warnings.length ? warnings.join('; ') : 'No risk found',
      guardrails: {
        warnings,
        requires_owner_approval: requiresOwnerApproval,
        approval_id: approval?.approval_id,
      },
    });

    return {
      safe: decision === 'allow',
      decision,
      risk_level: riskLevel,
      requires_owner_approval: requiresOwnerApproval,
      warnings,
      approval,
      next_step:
        decision === 'allow'
          ? 'Go ahead'
          : requiresOwnerApproval
            ? 'Ask owner to approve'
            : 'Stop this action',
    };
  }

  async getProductsStock(user: AuthUser, query: SellerProductsStockQueryDto) {
    const businessId = user.business_id;
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(Math.max(1, Number(query.limit ?? 50)), 100);
    const skip = (page - 1) * limit;
    const search = String(query.search ?? '').trim();
    const status = query.status ?? 'all';
    const settingsRows = await this.optionalQuery<any>(
      `SELECT low_stock_threshold
       FROM seller_store_settings
       WHERE business_id = $1
       LIMIT 1`,
      [businessId],
    );
    const lowStockThreshold = Number(settingsRows[0]?.low_stock_threshold ?? 5);

    const where: any = {
      business_id: businessId,
      item_type: 'physical_product',
      deleted_at: null,
    };

    if (status === 'active') where.is_active = true;
    if (status === 'inactive') where.is_active = false;
    if (status === 'low_stock') {
      where.is_active = true;
      where.stock_quantity = { gt: 0, lte: lowStockThreshold };
    }
    if (status === 'out_of_stock') {
      where.is_active = true;
      where.OR = [{ stock_quantity: null }, { stock_quantity: { lte: 0 } }];
    }

    if (search) {
      const searchFilters = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { product_detail: { is: { sku: { contains: search, mode: 'insensitive' } } } },
      ];
      where.OR = where.OR ? [{ AND: [{ OR: where.OR }, { OR: searchFilters }] }] : searchFilters;
    }

    const [total, items, summaryRows, heldTotalRows] = await Promise.all([
      this.prisma.catalog_items.count({ where }),
      this.prisma.catalog_items.findMany({
        where,
        include: { product_detail: true, variants: true },
        orderBy: [{ updated_at: 'desc' }],
        skip,
        take: limit,
      }),
      this.optionalQuery<any>(
        `SELECT
           COUNT(*)::int AS total_products,
           COUNT(*) FILTER (
             WHERE is_active = true AND COALESCE(stock_quantity, 0) > 0 AND COALESCE(stock_quantity, 0) <= $2
           )::int AS low_stock,
           COUNT(*) FILTER (
             WHERE is_active = true AND COALESCE(stock_quantity, 0) <= 0
           )::int AS out_of_stock
         FROM catalog_items
         WHERE business_id = $1 AND item_type = 'physical_product' AND deleted_at IS NULL`,
        [businessId, lowStockThreshold],
      ),
      this.optionalQuery<any>(
        `SELECT COALESCE(SUM(quantity), 0)::int AS held_stock
         FROM (
           SELECT quantity
           FROM seller_stock_reservations
           WHERE business_id = $1 AND status = 'active'
           UNION ALL
           SELECT cr.quantity
           FROM cart_reservations cr
           JOIN catalog_items ci ON ci.item_id = cr.item_id
           WHERE ci.business_id = $1 AND cr.status = 'active'
         ) holds`,
        [businessId],
      ),
    ]);

    const itemIds = items.map((item) => item.item_id);
    const holdRows = itemIds.length
      ? await this.optionalQuery<any>(
          `SELECT item_id, SUM(quantity)::int AS held_quantity
           FROM (
             SELECT item_id, quantity
             FROM seller_stock_reservations
             WHERE business_id = $1 AND status = 'active' AND item_id = ANY($2::uuid[])
             UNION ALL
             SELECT cr.item_id, cr.quantity
             FROM cart_reservations cr
             JOIN catalog_items ci ON ci.item_id = cr.item_id
             WHERE ci.business_id = $1 AND cr.status = 'active' AND cr.item_id = ANY($2::uuid[])
           ) holds
           GROUP BY item_id`,
          [businessId, itemIds],
        )
      : [];
    const heldByItem = new Map<string, number>(
      holdRows.map((row) => [row.item_id, Number(row.held_quantity ?? 0)]),
    );
    const summary = summaryRows[0] ?? {
      total_products: 0,
      low_stock: 0,
      out_of_stock: 0,
    };

    return {
      products: items.map((item: any) =>
        this.publicStockProduct(item, heldByItem.get(item.item_id) ?? 0, lowStockThreshold),
      ),
      summary: {
        total_products: Number(summary.total_products ?? 0),
        low_stock: Number(summary.low_stock ?? 0),
        out_of_stock: Number(summary.out_of_stock ?? 0),
        held_stock: Number(heldTotalRows[0]?.held_stock ?? 0),
      },
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
      low_stock_threshold: lowStockThreshold,
    };
  }

  async importProductsStock(user: AuthUser, dto: SellerProductBulkImportDto) {
    const businessId = user.business_id;
    const tenantId = this.requireTenant(user);
    const rows = dto.rows ?? [];

    if (!rows.length) throw new BadRequestException('Add at least one product row');
    if (rows.length > 5000) {
      throw new BadRequestException('Import at most 5000 products in one job');
    }

    const jobRows = await this.requiredQuery<any>(
      `INSERT INTO seller_product_import_jobs
         (business_id, tenant_id, source, status, total_rows, created_by)
       VALUES ($1, $2, $3, 'processing', $4, $5)
       RETURNING *`,
      [businessId, tenantId, dto.source ?? 'dashboard', rows.length, user.user_id ?? null],
    );
    const job = jobRows[0];
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (const [index, row] of rows.entries()) {
      try {
        const result = await this.prisma.$transaction((tx) =>
          this.upsertImportedCatalogItem(tx, businessId, tenantId, row, job.import_job_id),
        );
        if (result.action === 'created') createdCount += 1;
        else if (result.action === 'updated') updatedCount += 1;
        else skippedCount += 1;
      } catch (error) {
        errors.push({
          row: index + 1,
          message: error?.message ?? 'Could not import this row',
        });
      }
    }

    const status = errors.length === rows.length ? 'failed' : errors.length ? 'completed_with_errors' : 'completed';
    const finishedRows = await this.requiredQuery<any>(
      `UPDATE seller_product_import_jobs
       SET status = $2,
           created_count = $3,
           updated_count = $4,
           skipped_count = $5,
           failed_count = $6,
           errors = $7::jsonb,
           summary = $8::jsonb,
           finished_at = now(),
           updated_at = now()
       WHERE import_job_id = $1
       RETURNING *`,
      [
        job.import_job_id,
        status,
        createdCount,
        updatedCount,
        skippedCount,
        errors.length,
        JSON.stringify(errors.slice(0, 100)),
        JSON.stringify({
          total_rows: rows.length,
          created_count: createdCount,
          updated_count: updatedCount,
          skipped_count: skippedCount,
          failed_count: errors.length,
        }),
      ],
    );

    return {
      import_job: finishedRows[0],
      summary: {
        total_rows: rows.length,
        created_count: createdCount,
        updated_count: updatedCount,
        skipped_count: skippedCount,
        failed_count: errors.length,
      },
      errors: errors.slice(0, 100),
    };
  }

  async adjustProductStock(user: AuthUser, dto: SellerStockAdjustmentDto) {
    const businessId = user.business_id;
    const tenantId = this.requireTenant(user);
    const itemId = dto.item_id ?? dto.product_id;
    if (!itemId) throw new BadRequestException('Product is required');
    if (dto.adjustment_type !== 'set' && dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    return this.prisma.$transaction(async (tx) => {
      const current = dto.variant_id
        ? await this.lockVariantStock(tx, businessId, itemId, dto.variant_id)
        : await this.lockCatalogItemStock(tx, businessId, itemId);
      const previousQuantity = Number(current.stock_quantity ?? 0);
      const nextQuantity = this.nextStockQuantity(previousQuantity, dto.adjustment_type, dto.quantity);

      if (dto.variant_id) {
        await tx.item_variants.update({
          where: { variant_id: dto.variant_id },
          data: { stock_quantity: nextQuantity, updated_at: new Date() },
        });
      } else {
        await tx.catalog_items.update({
          where: { item_id: itemId },
          data: { stock_quantity: nextQuantity, updated_at: new Date() },
        });
      }

      const adjustment = await this.insertStockAdjustment(tx, {
        businessId,
        tenantId,
        itemId,
        variantId: dto.variant_id ?? null,
        adjustmentType: dto.adjustment_type,
        quantityChange: nextQuantity - previousQuantity,
        quantityBefore: previousQuantity,
        quantityAfter: nextQuantity,
        reason: this.cleanStockReason(dto.reason),
        source: 'manual',
        note: dto.note,
        createdBy: user.user_id,
      });

      await this.insertAiAudit(tx, businessId, tenantId, {
        ai_employee: 'AI Inventory Employee',
        action: 'manual_stock_adjustment',
        decision: 'recorded',
        risk_level: 'low',
        entity_type: 'catalog_item',
        entity_id: itemId,
        input_summary: `Owner changed stock for ${current.name}`,
        output_summary: `Stock changed from ${previousQuantity} to ${nextQuantity}`,
        guardrails: {
          adjustment_type: dto.adjustment_type,
          quantity: dto.quantity,
        },
      });

      return {
        product_id: itemId,
        item_id: itemId,
        variant_id: dto.variant_id ?? null,
        previous_stock: previousQuantity,
        new_stock: nextQuantity,
        adjustment,
      };
    });
  }

  async getStockAdjustments(user: AuthUser, query: SellerProductsStockQueryDto) {
    const businessId = user.business_id;
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(Math.max(1, Number(query.limit ?? 50)), 100);
    const offset = (page - 1) * limit;
    const search = String(query.search ?? '').trim();
    const params: any[] = [businessId];
    let searchSql = '';

    if (search) {
      params.push(`%${search}%`);
      searchSql = `AND (ci.name ILIKE $${params.length} OR pd.sku ILIKE $${params.length})`;
    }

    params.push(limit, offset);
    const rows = await this.optionalQuery<any>(
      `SELECT a.*, ci.name AS product_name, pd.sku
       FROM seller_stock_adjustments a
       JOIN catalog_items ci ON ci.item_id = a.item_id
       LEFT JOIN product_item_details pd ON pd.item_id = ci.item_id
       WHERE a.business_id = $1
       ${searchSql}
       ORDER BY a.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      adjustments: rows.map((row) => ({
        ...row,
        product_id: row.item_id,
        quantity_change: Number(row.quantity_change ?? 0),
        quantity_before: Number(row.quantity_before ?? 0),
        quantity_after: Number(row.quantity_after ?? 0),
      })),
      pagination: {
        page,
        limit,
        has_more: rows.length === limit,
      },
    };
  }

  private async upsertImportedCatalogItem(
    tx: any,
    businessId: string,
    tenantId: string,
    row: SellerProductImportRowDto,
    importJobId: string,
  ) {
    const itemId = row.item_id ?? row.product_id;
    const sku = row.sku?.trim() || null;
    const name = row.name?.trim();
    const stockProvided = row.stock_quantity !== undefined && row.stock_quantity !== null;
    const nextStock = stockProvided ? Math.max(0, Number(row.stock_quantity)) : undefined;
    const priceProvided = row.price !== undefined && row.price !== null;
    const nextPrice = priceProvided ? Math.max(0, Number(row.price)) : undefined;

    let existing = await this.findImportTarget(tx, businessId, itemId, sku, name);

    if (!existing && !name) {
      throw new BadRequestException('Product name is required for new rows');
    }

    if (existing) {
      const locked = await this.lockCatalogItemStock(tx, businessId, existing.item_id);
      const beforeStock = Number(locked.stock_quantity ?? 0);
      const updateData: any = {
        updated_at: new Date(),
      };

      if (name) updateData.name = name;
      if (row.description !== undefined) updateData.description = row.description;
      if (row.category !== undefined) updateData.category = row.category;
      if (nextPrice !== undefined) updateData.base_price = nextPrice;
      if (nextStock !== undefined) updateData.stock_quantity = nextStock;
      if (row.image_url) updateData.primary_image_url = row.image_url;
      if (row.is_active !== undefined) updateData.is_active = row.is_active;
      updateData.ai_tags = this.buildImportTags(row, existing.name);

      await tx.catalog_items.update({
        where: { item_id: existing.item_id },
        data: updateData,
      });

      await this.upsertProductImportDetails(tx, businessId, existing.item_id, sku, row);

      if (nextStock !== undefined && nextStock !== beforeStock) {
        await this.insertStockAdjustment(tx, {
          businessId,
          tenantId,
          itemId: existing.item_id,
          variantId: null,
          importJobId,
          adjustmentType: 'set',
          quantityChange: nextStock - beforeStock,
          quantityBefore: beforeStock,
          quantityAfter: nextStock,
          reason: 'bulk_import',
          source: 'import',
          note: 'Stock set from product import',
          createdBy: null,
        });
      }

      return { action: 'updated', item_id: existing.item_id };
    }

    const created = await tx.catalog_items.create({
      data: {
        business_id: businessId,
        tenant_id: tenantId,
        item_type: 'physical_product',
        name,
        description: row.description,
        category: row.category,
        base_price: nextPrice ?? 0,
        currency: 'INR',
        stock_quantity: nextStock ?? 0,
        primary_image_url: row.image_url,
        attributes: {
          source: 'bulk_import',
          cost_price: row.cost_price ?? null,
        },
        ai_tags: this.buildImportTags(row, name),
        is_active: row.is_active ?? true,
      },
    });

    await this.upsertProductImportDetails(tx, businessId, created.item_id, sku, row);
    await this.insertStockAdjustment(tx, {
      businessId,
      tenantId,
      itemId: created.item_id,
      variantId: null,
      importJobId,
      adjustmentType: 'set',
      quantityChange: Number(created.stock_quantity ?? 0),
      quantityBefore: 0,
      quantityAfter: Number(created.stock_quantity ?? 0),
      reason: 'bulk_import',
      source: 'import',
      note: 'Initial stock from product import',
      createdBy: null,
    });

    return { action: 'created', item_id: created.item_id };
  }

  private async findImportTarget(
    tx: any,
    businessId: string,
    itemId?: string,
    sku?: string | null,
    name?: string,
  ) {
    const baseWhere = {
      business_id: businessId,
      item_type: 'physical_product',
      deleted_at: null,
    };

    if (itemId) {
      return tx.catalog_items.findFirst({
        where: { ...baseWhere, item_id: itemId },
        include: { product_detail: true },
      });
    }

    if (sku) {
      const bySku = await tx.catalog_items.findFirst({
        where: { ...baseWhere, product_detail: { is: { sku } } },
        include: { product_detail: true },
      });
      if (bySku) return bySku;
    }

    if (name) {
      return tx.catalog_items.findFirst({
        where: { ...baseWhere, name: { equals: name, mode: 'insensitive' } },
        include: { product_detail: true },
      });
    }

    return null;
  }

  private async upsertProductImportDetails(
    tx: any,
    businessId: string,
    itemId: string,
    sku: string | null,
    row: SellerProductImportRowDto,
  ) {
    if (!sku && row.cost_price === undefined) return;

    const metadata = {
      source: 'bulk_import',
      cost_price: row.cost_price ?? null,
    };

    await tx.product_item_details.upsert({
      where: { item_id: itemId },
      create: {
        item_id: itemId,
        business_id: businessId,
        sku,
        metadata,
      },
      update: {
        sku,
        metadata,
        updated_at: new Date(),
      },
    });

    if (row.cost_price !== undefined || row.price !== undefined) {
      const sellingPrice = Number(row.price ?? 0);
      const costPrice = row.cost_price !== undefined ? Number(row.cost_price) : null;
      await tx.$queryRawUnsafe(
        `INSERT INTO seller_product_profit_snapshots
           (business_id, item_id, cost_price, selling_price, gross_margin, margin_percentage, source, recommendation)
         VALUES ($1, $2, $3, $4, $5, $6, 'bulk_import', $7)`,
        businessId,
        itemId,
        costPrice,
        sellingPrice,
        costPrice === null ? null : sellingPrice - costPrice,
        costPrice === null || sellingPrice <= 0 ? null : ((sellingPrice - costPrice) / sellingPrice) * 100,
        'Cost and selling price captured from product import',
      ).catch(() => undefined);
    }
  }

  private publicStockProduct(item: any, heldQuantity: number, lowStockThreshold: number) {
    const availableStock = item.stock_quantity === null ? null : Number(item.stock_quantity ?? 0);
    const totalStock = availableStock === null ? null : availableStock + heldQuantity;
    const status = !item.is_active
      ? 'inactive'
      : availableStock === null
        ? 'not_tracked'
        : availableStock <= 0
          ? 'out_of_stock'
          : availableStock <= lowStockThreshold
            ? 'low_stock'
            : 'in_stock';

    return {
      product_id: item.item_id,
      item_id: item.item_id,
      name: item.name,
      category: item.category,
      description: item.description,
      sku: item.product_detail?.sku ?? item.variants?.find((variant) => variant.sku)?.sku ?? null,
      price: this.toNumber(item.base_price),
      cost_price: this.toNumber(item.product_detail?.metadata?.cost_price ?? item.attributes?.cost_price),
      stock_quantity: totalStock,
      available_stock: availableStock,
      reserved_stock: heldQuantity,
      stock_status: status,
      image_url: item.primary_image_url,
      is_active: item.is_active,
      updated_at: item.updated_at,
    };
  }

  private async lockCatalogItemStock(tx: any, businessId: string, itemId: string) {
    const rows = (await tx.$queryRawUnsafe(
      `SELECT item_id, name, stock_quantity
       FROM catalog_items
       WHERE business_id = $1 AND item_id = $2 AND item_type = 'physical_product' AND deleted_at IS NULL
       FOR UPDATE`,
      businessId,
      itemId,
    )) as any[];
    const item = rows[0];
    if (!item) throw new NotFoundException('Product not found');
    return item;
  }

  private async lockVariantStock(tx: any, businessId: string, itemId: string, variantId: string) {
    const rows = (await tx.$queryRawUnsafe(
      `SELECT v.variant_id, v.item_id, v.stock_quantity, CONCAT(ci.name, ' - ', v.name) AS name
       FROM item_variants v
       JOIN catalog_items ci ON ci.item_id = v.item_id
       WHERE ci.business_id = $1 AND v.item_id = $2 AND v.variant_id = $3 AND ci.deleted_at IS NULL
       FOR UPDATE`,
      businessId,
      itemId,
      variantId,
    )) as any[];
    const variant = rows[0];
    if (!variant) throw new NotFoundException('Product variant not found');
    return variant;
  }

  private nextStockQuantity(previous: number, adjustmentType: string, quantity: number) {
    if (adjustmentType === 'add') return previous + quantity;
    if (adjustmentType === 'reduce') {
      if (previous < quantity) throw new ConflictException('Stock cannot go below zero');
      return previous - quantity;
    }
    return quantity;
  }

  private async insertStockAdjustment(tx: any, data: {
    businessId: string;
    tenantId: string;
    itemId: string;
    variantId?: string | null;
    importJobId?: string | null;
    adjustmentType: string;
    quantityChange: number;
    quantityBefore: number;
    quantityAfter: number;
    reason: string;
    source: string;
    note?: string | null;
    createdBy?: string | null;
  }) {
    const rows = (await tx.$queryRawUnsafe(
      `INSERT INTO seller_stock_adjustments
         (business_id, tenant_id, item_id, variant_id, import_job_id, adjustment_type,
          quantity_change, quantity_before, quantity_after, reason, source, note, created_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, '{}'::jsonb)
       RETURNING *`,
      data.businessId,
      data.tenantId,
      data.itemId,
      data.variantId ?? null,
      data.importJobId ?? null,
      data.adjustmentType,
      data.quantityChange,
      data.quantityBefore,
      data.quantityAfter,
      data.reason,
      data.source,
      data.note ?? null,
      data.createdBy ?? null,
    )) as any[];
    return rows[0];
  }

  private buildImportTags(row: SellerProductImportRowDto, fallbackName?: string) {
    return [
      row.name ?? fallbackName,
      row.description,
      row.category,
      row.sku,
    ]
      .filter(Boolean)
      .flatMap((value) => String(value).toLowerCase().split(/[,\s]+/))
      .filter((value, index, values) => value.length > 1 && values.indexOf(value) === index)
      .slice(0, 20);
  }

  private cleanStockReason(reason?: string | null) {
    const cleaned = String(reason || 'manual_correction')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase();
    return cleaned.slice(0, 80) || 'manual_correction';
  }

  private async buildSaleLines(db: any, businessId: string, items: SellerSaleItemDto[]): Promise<SaleLine[]> {
    const itemIds = [...new Set(items.map((item) => item.item_id))];
    const catalogItems: any[] = await db.catalog_items.findMany({
      where: {
        business_id: businessId,
        item_id: { in: itemIds },
        item_type: 'physical_product',
        deleted_at: null,
      },
      include: { variants: true },
    });
    const catalogById = new Map<string, any>(catalogItems.map((item) => [item.item_id, item]));

    return items.map((item) => {
      const catalogItem = catalogById.get(item.item_id);
      if (!catalogItem) {
        throw new NotFoundException(`Product not found: ${item.item_id}`);
      }
      if (!catalogItem.is_active) {
        throw new BadRequestException(`${catalogItem.name} is inactive`);
      }

      const variant = item.variant_id
        ? catalogItem.variants.find((candidate) => candidate.variant_id === item.variant_id)
        : null;
      if (item.variant_id && !variant) {
        throw new NotFoundException(`Variant not found: ${item.variant_id}`);
      }
      if (variant && !variant.is_active) {
        throw new BadRequestException(`${catalogItem.name} - ${variant.name} is inactive`);
      }

      const unitPrice = this.toNumber(variant?.price ?? catalogItem.base_price);
      const discount = Number(item.discount ?? 0);
      const totalPrice = Math.max(unitPrice * item.quantity - discount, 0);

      return {
        item_id: item.item_id,
        variant_id: item.variant_id ?? null,
        product_name: catalogItem.name,
        variant_name: variant?.name ?? null,
        sku: variant?.sku ?? null,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount,
        total_price: totalPrice,
        snapshot: {
          item_name: catalogItem.name,
          item_type: catalogItem.item_type,
          category: catalogItem.category,
          variant_name: variant?.name,
          variant_options: variant?.options,
          price: unitPrice,
          source: 'seller_os',
        },
      };
    });
  }

  private async upsertSetupProduct(
    db: any,
    businessId: string,
    tenantId: string,
    product: SellerSetupProductDto,
    lowStockThreshold: number,
  ) {
    const normalizedSku = product.sku?.trim() || null;
    const existing = normalizedSku
      ? await db.catalog_items.findFirst({
          where: {
            business_id: businessId,
            item_type: 'physical_product',
            deleted_at: null,
            product_detail: { is: { sku: normalizedSku } },
          },
          include: { product_detail: true },
        })
      : await db.catalog_items.findFirst({
          where: {
            business_id: businessId,
            item_type: 'physical_product',
            deleted_at: null,
            name: { equals: product.name.trim(), mode: 'insensitive' },
          },
          include: { product_detail: true },
        });

    const attributes = {
      source: 'seller_setup',
      low_stock_threshold: lowStockThreshold,
      cost_price: product.cost_price ?? null,
    };

    if (existing) {
      await db.catalog_items.update({
        where: { item_id: existing.item_id },
        data: {
          name: product.name.trim(),
          description: product.description ?? existing.description,
          category: product.category ?? existing.category,
          base_price: product.price,
          stock_quantity: product.stock_quantity,
          attributes,
          ai_tags: this.buildProductTags(product),
          is_active: true,
          updated_at: new Date(),
        },
      });
      await db.product_item_details.upsert({
        where: { item_id: existing.item_id },
        create: {
          item_id: existing.item_id,
          business_id: businessId,
          sku: normalizedSku,
          metadata: attributes,
        },
        update: {
          sku: normalizedSku,
          metadata: attributes,
          updated_at: new Date(),
        },
      });
      return { item_id: existing.item_id, name: product.name, action: 'updated' };
    }

    const created = await db.catalog_items.create({
      data: {
        business_id: businessId,
        tenant_id: tenantId,
        item_type: 'physical_product',
        name: product.name.trim(),
        description: product.description,
        category: product.category,
        base_price: product.price,
        currency: 'INR',
        stock_quantity: product.stock_quantity,
        attributes,
        ai_tags: this.buildProductTags(product),
        is_active: true,
      },
    });

    await db.product_item_details.create({
      data: {
        item_id: created.item_id,
        business_id: businessId,
        sku: normalizedSku,
        metadata: attributes,
      },
    });

    if (product.cost_price !== undefined) {
      await db.$queryRawUnsafe(
        `INSERT INTO seller_product_profit_snapshots
           (business_id, item_id, cost_price, selling_price, gross_margin, margin_percentage, source, recommendation)
         VALUES ($1, $2, $3, $4, $5, $6, 'seller_setup', $7)`,
        businessId,
        created.item_id,
        product.cost_price,
        product.price,
        product.price - product.cost_price,
        product.price > 0 ? ((product.price - product.cost_price) / product.price) * 100 : null,
        'Initial cost and price captured during seller setup',
      ).catch(() => undefined);
    }

    return { item_id: created.item_id, name: product.name, action: 'created' };
  }

  private buildProductTags(product: SellerSetupProductDto) {
    return [
      product.name,
      product.description,
      product.category,
      product.sku,
    ]
      .filter(Boolean)
      .flatMap((value) => String(value).toLowerCase().split(/[,\s]+/))
      .filter((value, index, values) => value.length > 1 && values.indexOf(value) === index)
      .slice(0, 20);
  }

  private calculateTotals(lines: SaleLine[]) {
    const subtotal = lines.reduce((sum, line) => sum + line.unit_price * line.quantity, 0);
    const discountAmount = lines.reduce((sum, line) => sum + line.discount, 0);
    const totalAmount = lines.reduce((sum, line) => sum + line.total_price, 0);
    return {
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
    };
  }

  private async findOrCreateCustomer(
    db: any,
    businessId: string,
    tenantId: string | undefined,
    phone: string,
    name?: string,
  ) {
    const normalizedPhone = this.normalizePhone(phone);
    const existing = await db.customers.findFirst({
      where: {
        business_id: businessId,
        phone: normalizedPhone,
        deleted_at: null,
      },
    });
    if (existing) {
      if (name && !existing.name) {
        return db.customers.update({
          where: { customer_id: existing.customer_id },
          data: { name, updated_at: new Date() },
        });
      }
      return existing;
    }

    if (!tenantId) {
      throw new BadRequestException('Authenticated user is missing tenant_id');
    }

    return db.customers.create({
      data: {
        business_id: businessId,
        tenant_id: tenantId,
        phone: normalizedPhone,
        whatsapp_number: normalizedPhone,
        name,
        engagement_score: 10,
      },
    });
  }

  private async getApprovedCreditAccountForUpdate(
    db: any,
    businessId: string,
    phone: string,
    saleAmount: number,
  ) {
    try {
      const rows = await db.$queryRawUnsafe(
        `SELECT *
         FROM seller_customer_credit_accounts
         WHERE business_id = $1 AND phone = $2
         FOR UPDATE`,
        businessId,
        this.normalizePhone(phone),
      );
      const account = (rows as any[])[0];
      if (!account || account.status !== 'approved') {
        throw new BadRequestException('Credit sale is allowed only for owner-approved customers');
      }
      const nextBalance = this.toNumber(account.current_balance) + saleAmount;
      if (nextBalance > this.toNumber(account.credit_limit)) {
        throw new ConflictException('Credit limit will be crossed for this customer');
      }
      return account;
    } catch (error) {
      return this.handleSellerOpsMutationError(error);
    }
  }

  private async insertDelivery(db: any, businessId: string, tenantId: string | undefined, dto: CreateDeliveryDto) {
    try {
      const rows = await db.$queryRawUnsafe(
        `INSERT INTO seller_deliveries
           (business_id, tenant_id, order_id, product_order_id, customer_id, delivery_mode,
            delivery_person, phone, address, pincode, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        businessId,
        tenantId ?? null,
        dto.order_id ?? null,
        dto.product_order_id ?? null,
        dto.customer_id ?? null,
        dto.delivery_mode ?? 'local',
        dto.delivery_person ?? null,
        dto.phone ?? null,
        dto.address ?? null,
        dto.pincode ?? null,
        dto.notes ?? null,
      );
      return (rows as any[])[0];
    } catch (error) {
      return this.handleSellerOpsMutationError(error);
    }
  }

  private async createApprovalRecord(
    db: any,
    user: AuthUser,
    dto: CreateOwnerApprovalDto,
    required: boolean,
  ) {
    try {
      const rows = await db.$queryRawUnsafe(
        `INSERT INTO seller_owner_approvals
           (business_id, tenant_id, title, simple_summary, action_type, risk_level, source,
            entity_type, entity_id, requested_by, payload)
         VALUES ($1, $2, $3, $4, $5, $6, 'ai', $7, $8, $9, $10::jsonb)
         RETURNING *`,
        user.business_id,
        user.tenant_id ?? null,
        dto.title,
        dto.simple_summary ?? null,
        dto.action_type,
        dto.risk_level ?? 'medium',
        dto.entity_type ?? null,
        dto.entity_id ?? null,
        user.user_id ?? null,
        JSON.stringify(dto.payload ?? {}),
      );
      return (rows as any[])[0];
    } catch (error) {
      if (!required && this.isMissingSellerOpsTable(error)) return null;
      return this.handleSellerOpsMutationError(error);
    }
  }

  private async insertAiAudit(
    db: any,
    businessId: string,
    tenantId: string | undefined,
    data: {
      ai_employee: string;
      action: string;
      decision: string;
      risk_level: string;
      entity_type?: string;
      entity_id?: string;
      input_summary?: string;
      output_summary?: string;
      guardrails?: Record<string, any>;
    },
  ) {
    try {
      await db.$queryRawUnsafe(
        `INSERT INTO seller_ai_audit_logs
           (business_id, tenant_id, ai_employee, action, decision, risk_level,
            entity_type, entity_id, input_summary, output_summary, guardrails)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)`,
        businessId,
        tenantId ?? null,
        data.ai_employee,
        data.action,
        data.decision,
        data.risk_level,
        data.entity_type ?? null,
        data.entity_id ?? null,
        data.input_summary ?? null,
        data.output_summary ?? null,
        JSON.stringify(data.guardrails ?? {}),
      );
    } catch (error) {
      if (!this.isMissingSellerOpsTable(error)) throw error;
    }
  }

  private async optionalQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      return await this.query<T>(sql, params);
    } catch (error) {
      if (this.isMissingSellerOpsTable(error)) return [];
      throw error;
    }
  }

  private async requiredQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      return await this.query<T>(sql, params);
    } catch (error) {
      return this.handleSellerOpsMutationError(error);
    }
  }

  private async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return this.prisma.$queryRawUnsafe<T[]>(sql, ...params);
  }

  private handleSellerOpsMutationError(error: any): never {
    if (this.isMissingSellerOpsTable(error)) {
      throw new BadRequestException(
        'Seller Store Desk tables are not available yet. Apply prisma/migrations/20260603_seller_ops_product_business/migration.sql',
      );
    }
    throw error;
  }

  private isMissingSellerOpsTable(error: any): boolean {
    const text = [
      error?.code,
      error?.message,
      error?.meta?.message,
      error?.cause?.message,
    ].filter(Boolean).join(' ');
    return text.includes('42P01') || text.includes('does not exist');
  }

  private makeOrderNumber(prefix: string) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `${prefix}-${datePart}-${randomPart}`;
  }

  private normalizePhone(phone: string) {
    return phone.trim().replace(/[^\d+]/g, '');
  }

  private cleanStringList(input: string[] | undefined, fallback: string[]) {
    const list = (input?.length ? input : fallback)
      .map((value) => String(value).trim())
      .filter(Boolean);
    return [...new Set(list)];
  }

  private requireTenant(user: AuthUser) {
    if (!user.tenant_id) {
      throw new BadRequestException('Authenticated user is missing tenant_id');
    }
    return user.tenant_id;
  }

  private toNumber(value: any) {
    if (value === null || value === undefined) return 0;
    return Number(value);
  }
}
