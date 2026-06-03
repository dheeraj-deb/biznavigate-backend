// @ts-nocheck
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma';
import { InventoryTransactionService } from '../../inventory/application/services/inventory-transaction.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { SellerOrderPaymentSafetyService } from './seller-order-payment-safety.service';
import {
  AgentCreateOrderDto,
  AgentProductSearchDto,
  AiGuardrailCheckDto,
  CollectCreditPaymentDto,
  CancelSellerPaymentOrderDto,
  CompleteSellerSetupDto,
  CreateCreditCustomerDto,
  CreateDeliveryDto,
  CreateManualSaleDto,
  CreatePaymentRequestFromHoldDto,
  CreateReturnCaseDto,
  CreateStockReservationDto,
  MarkSellerOrderPaidDto,
  SellerProductBulkImportDto,
  SellerProductsStockQueryDto,
  SellerStockAdjustmentDto,
  SellerLeadListQueryDto,
  UpdateSellerLeadStatusDto,
} from './dto/seller-os.dto';

const SELLER_BUSINESS_TYPES = new Set(['products', 'retail', 'ecommerce', 'product_seller']);

@Injectable()
export class SellerOsService {
  private readonly logger = new Logger(SellerOsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryTransactions: InventoryTransactionService,
    private readonly orderPaymentSafety: SellerOrderPaymentSafetyService,
  ) {}

  async getSetup(user: any) {
    const ctx = await this.getSellerContext(user);
    const settings = await this.getSettings(ctx);
    const features = this.buildSellerFeatures(settings);
    const [productCount, recentProducts] = await Promise.all([
      this.db.products.count({
        where: { business_id: ctx.businessId, tenant_id: ctx.tenantId, product_type: 'physical' },
      }),
      this.db.products.findMany({
        where: { business_id: ctx.businessId, tenant_id: ctx.tenantId, product_type: 'physical' },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
    ]);

    return {
      business: {
        business_id: ctx.business.business_id,
        business_name: ctx.business.business_name,
        business_type: ctx.business.business_type,
      },
      settings,
      seller_mode: settings?.store_type || 'product_seller',
      features,
      product_count: productCount,
      recent_products: recentProducts.map((product: any) => this.publicProduct(product)),
      setup_needed: !settings || settings.onboarding_status !== 'completed' || productCount === 0,
    };
  }

  async completeSetup(user: any, dto: CompleteSellerSetupDto) {
    const ctx = await this.getSellerContext(user);

    const storeType = dto.store_type || 'online_seller';
    const creditEnabled = dto.enable_credit ?? storeType === 'wholesale_seller';
    const paymentModes = this.cleanStringList(dto.payment_modes, ['cash', 'upi', 'cod']);
    const effectivePaymentModes = creditEnabled
      ? [...new Set([...paymentModes, 'credit'])]
      : paymentModes.filter((mode) => mode !== 'credit');
    const deliveryModes = this.cleanStringList(dto.delivery_modes, ['pickup', 'local_delivery']);
    const deliveryAreas = this.cleanStringList(dto.delivery_areas, []);
    const holdMinutes = dto.stock_hold_minutes ?? 15;
    const lowStockThreshold = dto.low_stock_threshold ?? 5;
    const highValueApprovalAmount = dto.high_value_approval_amount ?? 10000;

    const result = await this.prisma.$transaction(async (tx) => {
      const settings = await tx.seller_store_settings.upsert({
        where: { business_id: ctx.businessId },
        create: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          store_type: storeType,
          onboarding_status: 'completed',
          low_stock_threshold: lowStockThreshold,
          stock_hold_minutes: holdMinutes,
          payment_modes: effectivePaymentModes,
          delivery_modes: deliveryModes,
          delivery_areas: { areas: deliveryAreas },
          credit_defaults: {
            enabled: creditEnabled,
            default_limit: dto.default_credit_limit ?? 0,
            due_days: dto.default_credit_due_days ?? 30,
            require_owner_approval: dto.require_owner_approval_for_credit ?? true,
          },
          ai_guardrails: {
            high_value_approval_amount: highValueApprovalAmount,
            credit_enabled: creditEnabled,
            require_owner_approval_for_credit: dto.require_owner_approval_for_credit ?? true,
            block_unapproved_credit: true,
            block_negative_stock: true,
          },
          setup_checklist: {
            store_rules: true,
            starter_products: (dto.products?.length ?? 0) > 0,
            whatsapp_connected: true,
          },
        },
        update: {
          store_type: storeType,
          onboarding_status: 'completed',
          low_stock_threshold: lowStockThreshold,
          stock_hold_minutes: holdMinutes,
          payment_modes: effectivePaymentModes,
          delivery_modes: deliveryModes,
          delivery_areas: { areas: deliveryAreas },
          credit_defaults: {
            enabled: creditEnabled,
            default_limit: dto.default_credit_limit ?? 0,
            due_days: dto.default_credit_due_days ?? 30,
            require_owner_approval: dto.require_owner_approval_for_credit ?? true,
          },
          ai_guardrails: {
            high_value_approval_amount: highValueApprovalAmount,
            credit_enabled: creditEnabled,
            require_owner_approval_for_credit: dto.require_owner_approval_for_credit ?? true,
            block_unapproved_credit: true,
            block_negative_stock: true,
          },
          setup_checklist: {
            store_rules: true,
            starter_products: (dto.products?.length ?? 0) > 0,
            whatsapp_connected: true,
          },
          updated_at: new Date(),
        },
      });

      const products = [];
      for (const product of dto.products ?? []) {
        products.push(await this.upsertSetupProduct(tx, ctx, product));
      }

      await tx.seller_ai_audit_logs.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          ai_employee_key: 'setup_assistant',
          action: 'seller_setup_completed',
          risk_level: 'low',
          decision: 'completed',
          input_summary: `Configured product seller setup with ${products.length} starter products`,
          metadata: { payment_modes: paymentModes, delivery_modes: deliveryModes },
        },
      });

      return { settings, products };
    });

    return {
      setup: result.settings,
      products: result.products.map((product: any) => this.publicProduct(product)),
    };
  }

  async getOverview(user: any) {
    const ctx = await this.getSellerContext(user);
    const settings = await this.getSettings(ctx);
    const features = this.buildSellerFeatures(settings);
    const lowStockThreshold = settings?.low_stock_threshold ?? 5;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const demandSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      ownerQueue,
      todayOrders,
      openEnquiries,
      activeProducts,
      lowStock,
      stockHolds,
      pendingPayments,
      codCollections,
      returnsWaiting,
      deliveriesWaiting,
      creditAgg,
      approvals,
      reservations,
      returns,
      deliveries,
      creditApproved,
      creditPending,
      demandSignals,
      deadStock,
      aiAudit,
    ] = await Promise.all([
      this.db.seller_owner_approvals.count({ where: { business_id: ctx.businessId, status: 'pending' } }),
      this.db.orders.count({ where: { business_id: ctx.businessId, created_at: { gte: today } } }),
      this.db.leads.count({
        where: { business_id: ctx.businessId, is_converted: false, status: { notIn: ['lost', 'invalid'] } },
      }),
      this.db.products.count({
        where: { business_id: ctx.businessId, product_type: 'physical', is_active: true },
      }),
      this.db.products.findMany({
        where: {
          business_id: ctx.businessId,
          product_type: 'physical',
          is_active: true,
          track_inventory: true,
          stock_quantity: { lte: lowStockThreshold },
        },
        orderBy: { stock_quantity: 'asc' },
        take: 8,
      }),
      this.db.seller_stock_reservations.count({
        where: { business_id: ctx.businessId, status: 'active', expires_at: { gt: new Date() } },
      }),
      this.db.orders.count({
        where: {
          business_id: ctx.businessId,
          order_type: 'product',
          payment_status: 'pending',
          payment_method: { notIn: ['credit', 'cod'] },
          status: { notIn: ['cancelled', 'refunded', 'failed'] },
        },
      }),
      this.db.orders.count({
        where: {
          business_id: ctx.businessId,
          order_type: 'product',
          payment_status: 'pending',
          payment_method: 'cod',
          status: { notIn: ['cancelled', 'refunded', 'failed'] },
        },
      }),
      this.db.seller_return_cases.count({ where: { business_id: ctx.businessId, status: { in: ['open', 'review'] } } }),
      this.db.seller_deliveries.count({ where: { business_id: ctx.businessId, status: { in: ['pending', 'assigned', 'out_for_delivery'] } } }),
      this.db.seller_customer_credit_accounts.aggregate({
        where: { business_id: ctx.businessId, status: 'approved' },
        _sum: { current_balance: true },
      }),
      this.db.seller_owner_approvals.findMany({
        where: { business_id: ctx.businessId, status: 'pending' },
        orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
        take: 8,
      }),
      this.db.seller_stock_reservations.findMany({
        where: { business_id: ctx.businessId, status: 'active' },
        orderBy: { expires_at: 'asc' },
        take: 8,
      }),
      this.db.seller_return_cases.findMany({
        where: { business_id: ctx.businessId, status: { in: ['open', 'review'] } },
        orderBy: { created_at: 'desc' },
        take: 8,
      }),
      this.db.seller_deliveries.findMany({
        where: { business_id: ctx.businessId, status: { in: ['pending', 'assigned', 'out_for_delivery'] } },
        orderBy: { created_at: 'desc' },
        take: 8,
      }),
      this.db.seller_customer_credit_accounts.count({ where: { business_id: ctx.businessId, status: 'approved' } }),
      this.db.seller_customer_credit_accounts.count({ where: { business_id: ctx.businessId, status: 'pending' } }),
      this.db.seller_demand_signals.findMany({
        where: { business_id: ctx.businessId, created_at: { gte: demandSince } },
        orderBy: { created_at: 'desc' },
        take: 500,
      }),
      this.findDeadStock(ctx.businessId),
      this.db.seller_ai_audit_logs.findMany({
        where: { business_id: ctx.businessId },
        orderBy: { created_at: 'desc' },
        take: 8,
      }),
    ]);

    const demandHeatmap = this.buildDemandHeatmap(demandSignals);
    const onlineIntelligence = await this.buildOnlineSellerIntelligence(ctx, demandSignals, lowStock, deadStock, lowStockThreshold);
    const creditDue = Number(creditAgg._sum.current_balance || 0);

    return {
      business_type: ctx.business.business_type,
      seller_mode: settings?.store_type || 'product_seller',
      features,
      title: 'Store Desk',
      summary: {
        owner_queue: ownerQueue,
        today_orders: todayOrders,
        open_enquiries: openEnquiries,
        active_products: activeProducts,
        low_stock: lowStock.length,
        stock_holds: stockHolds,
        pending_payments: pendingPayments,
        cod_collections: codCollections,
        returns_waiting: returnsWaiting,
        deliveries_waiting: deliveriesWaiting,
        credit_due: features.credit_sales ? creditDue : 0,
      },
      primary_actions: [
        { key: 'approval_queue', label: 'Needs owner decision', count: ownerQueue },
        { key: 'manual_sale', label: 'Counter sale', count: todayOrders },
        { key: 'stock_holds', label: 'Stock holds', count: stockHolds },
        { key: 'payment_desk', label: 'Payment waiting', count: pendingPayments },
        { key: 'delivery_desk', label: 'Delivery desk', count: deliveriesWaiting },
        ...(features.credit_sales ? [{ key: 'credit', label: 'Credit', count: creditApproved }] : []),
      ],
      owner_queue: approvals.map((item: any) => ({
        id: item.approval_id,
        type: item.entity_type,
        title: item.title,
        text: item.description,
        risk: item.risk_level,
        source: item.source,
      })),
      ai_employees: this.buildAiEmployees({
        todayOrders,
        ownerQueue,
        stockHolds,
        returnsWaiting,
        deliveriesWaiting,
        lowStock: lowStock.length,
        creditDue,
        creditEnabled: features.credit_sales,
        demandHeatmap,
      }),
      workspaces: {
        approvals,
        stock_reservations: reservations,
        returns,
        deliveries,
        credit: {
          enabled: features.credit_sales,
          approved_customers: creditApproved,
          pending_customers: creditPending,
          total_credit_due: features.credit_sales ? creditDue : 0,
        },
      },
      stock: {
        low_stock: lowStock.map((product: any) => this.publicProduct(product)),
        active_cart_holds: stockHolds,
      },
      online_intelligence: onlineIntelligence,
      demand_heatmap: demandHeatmap,
      dead_stock: deadStock,
      ai_audit_log: aiAudit,
      feature_map: [
        'owner_approval_queue',
        'manual_counter_sale',
        'stock_reservation',
        'ai_inventory_employee',
        'returns_exchange_refund',
        'local_delivery_desk',
        'ai_guardrails_audit',
        'profit_coach',
        'dead_stock_recovery',
        'demand_heatmap',
        'online_demand_intelligence',
        ...(features.credit_sales ? ['credit_sales'] : []),
        'ai_mistake_prevention',
      ],
    };
  }

  async getProductsStock(user: any, query: SellerProductsStockQueryDto = {}) {
    const ctx = await this.getSellerContext(user);
    const settings = await this.getSettings(ctx);
    const lowStockThreshold = settings?.low_stock_threshold ?? 5;
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 50), 1), 500);
    const skip = (page - 1) * limit;
    const search = String(query.search || '').trim();

    const where: any = {
      business_id: ctx.businessId,
      tenant_id: ctx.tenantId,
      product_type: 'physical',
    };

    if (query.category) where.category = query.category;
    if (query.status === 'active') where.is_active = true;
    if (query.status === 'inactive') where.is_active = false;
    if (query.status === 'out_of_stock') {
      where.track_inventory = true;
      where.stock_quantity = { lte: 0 };
    }
    if (query.status === 'low_stock') {
      where.track_inventory = true;
      where.stock_quantity = { gt: 0, lte: lowStockThreshold };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total, summary, categories, recentAdjustments] = await Promise.all([
      this.db.products.findMany({
        where,
        include: { product_variants: true },
        orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
        skip,
        take: limit,
      }),
      this.db.products.count({ where }),
      this.getProductStockSummary(ctx, lowStockThreshold),
      this.db.products.findMany({
        where: { business_id: ctx.businessId, tenant_id: ctx.tenantId, product_type: 'physical', category: { not: null } },
        distinct: ['category'],
        select: { category: true },
        orderBy: { category: 'asc' },
        take: 200,
      }),
      this.fetchStockAdjustments(ctx, { limit: 8 }),
    ]);

    const productIds = products.map((product: any) => product.product_id);
    const profitSnapshots = productIds.length
      ? await this.db.seller_product_profit_snapshots.findMany({
          where: { business_id: ctx.businessId, product_id: { in: productIds } },
        })
      : [];
    const profitMap = new Map(profitSnapshots.map((item: any) => [item.product_id, item]));

    return {
      summary,
      products: products.map((product: any) => this.publicStockProduct(product, profitMap.get(product.product_id), lowStockThreshold)),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
      categories: categories.map((item: any) => item.category).filter(Boolean),
      recent_adjustments: recentAdjustments.adjustments,
    };
  }

  async importProductsStock(user: any, dto: SellerProductBulkImportDto) {
    const ctx = await this.getSellerContext(user);
    const rows = Array.isArray(dto.products) ? dto.products : [];
    if (!rows.length) throw new BadRequestException('Add at least one product row');
    if (rows.length > 5000) throw new BadRequestException('Import maximum is 5000 rows at a time');

    const prepared = rows.map((row, index) => this.prepareImportProductRow(row, index));
    const validationErrors = this.validateImportRows(prepared);
    const job = await this.createImportJob(ctx, dto.source || 'csv', rows.length, validationErrors);

    if (validationErrors.length) {
      await this.finishImportJob(ctx, job.import_job_id, {
        status: 'failed',
        total_rows: rows.length,
        failed_count: validationErrors.length,
        errors: validationErrors.slice(0, 200),
        summary: { reason: 'validation_failed' },
      });
      return {
        import_job_id: job.import_job_id,
        status: 'failed',
        total_rows: rows.length,
        created_count: 0,
        updated_count: 0,
        failed_count: validationErrors.length,
        errors: validationErrors.slice(0, 200),
      };
    }

    const result = {
      import_job_id: job.import_job_id,
      status: 'completed',
      total_rows: rows.length,
      created_count: 0,
      updated_count: 0,
      failed_count: 0,
      skipped_count: 0,
      errors: [] as any[],
    };

    for (const row of prepared) {
      try {
        const outcome = await this.prisma.$transaction(async (tx) => this.upsertImportedProduct(tx, ctx, row, job.import_job_id));
        if (outcome === 'created') result.created_count += 1;
        else if (outcome === 'updated') result.updated_count += 1;
        else result.skipped_count += 1;
      } catch (error) {
        result.failed_count += 1;
        result.errors.push({
          row: row.row_number,
          sku: row.sku,
          name: row.name,
          message: this.simpleImportError(error),
        });
      }
    }

    result.status = result.failed_count > 0 ? (result.created_count || result.updated_count ? 'partial' : 'failed') : 'completed';
    await this.finishImportJob(ctx, job.import_job_id, {
      status: result.status,
      total_rows: result.total_rows,
      created_count: result.created_count,
      updated_count: result.updated_count,
      skipped_count: result.skipped_count,
      failed_count: result.failed_count,
      errors: result.errors.slice(0, 200),
      summary: {
        source: dto.source || 'csv',
        created_count: result.created_count,
        updated_count: result.updated_count,
      },
    });

    await this.recordAudit(ctx, {
      ai_employee_key: 'inventory_ai',
      action: 'products_bulk_imported',
      entity_type: 'product_import',
      entity_id: job.import_job_id,
      decision: result.status,
      input_summary: `Imported ${rows.length} product row(s)`,
      output_summary: `${result.created_count} created, ${result.updated_count} updated, ${result.failed_count} failed`,
      metadata: result,
    });

    return result;
  }

  async adjustProductStock(user: any, dto: SellerStockAdjustmentDto) {
    const ctx = await this.getSellerContext(user);
    const adjustment = await this.prisma.$transaction(async (tx) => {
      const product = await this.findProductForBusiness(tx, ctx, dto.product_id);
      if (dto.variant_id && !product.product_variants?.some((variant: any) => variant.variant_id === dto.variant_id)) {
        throw new NotFoundException('Product variant not found for this business');
      }
      return this.applySellerStockAdjustment(tx, ctx, {
        product_id: dto.product_id,
        variant_id: dto.variant_id,
        adjustment_type: dto.adjustment_type,
        quantity: dto.quantity,
        reason: dto.reason,
        source: 'manual',
        reference: dto.reference,
        note: dto.note,
      });
    });

    await this.recordAudit(ctx, {
      ai_employee_key: 'inventory_ai',
      action: 'stock_adjusted',
      entity_type: 'product',
      entity_id: dto.product_id,
      decision: 'adjusted',
      input_summary: `${dto.adjustment_type} ${dto.quantity} unit(s)`,
      output_summary: `Stock changed from ${adjustment.quantity_before} to ${adjustment.quantity_after}`,
      metadata: adjustment,
    });

    return adjustment;
  }

  async getStockAdjustments(user: any, query: SellerProductsStockQueryDto = {}) {
    const ctx = await this.getSellerContext(user);
    return this.fetchStockAdjustments(ctx, {
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  async getSellerLeads(user: any, query: SellerLeadListQueryDto = {}) {
    const ctx = await this.getSellerContext(user);
    const stage = query.stage || 'all';
    const search = String(query.search || '').trim();
    const limit = Math.min(Math.max(Number(query.limit || 80), 1), 150);
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const where: any = {
      business_id: ctx.businessId,
      tenant_id: ctx.tenantId,
      deleted_at: null,
      is_active: true,
    };

    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search.replace(/\s/g, '') } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const leads = await this.db.leads.findMany({
      where,
      orderBy: [{ last_activity_at: 'desc' }, { updated_at: 'desc' }, { created_at: 'desc' }],
      take: limit,
    });

    const leadIds = leads.map((lead: any) => lead.lead_id).filter(Boolean);
    const phones = [
      ...new Set(
        leads
          .map((lead: any) => this.cleanPhone(lead.phone))
          .filter(Boolean),
      ),
    ];
    const byLeadOrPhone = [
      ...(leadIds.length ? [{ lead_id: { in: leadIds } }] : []),
      ...(phones.length ? [{ shipping_phone: { in: phones } }] : []),
    ];
    const byLeadEntityOrPhone = [
      ...(leadIds.length ? [{ entity_id: { in: leadIds } }] : []),
      ...(phones.length ? [{ customer_phone: { in: phones } }] : []),
    ];

    const [orders, holds, approvals, demandSignals, audits] = await Promise.all([
      byLeadOrPhone.length
        ? this.db.orders.findMany({
            where: {
              business_id: ctx.businessId,
              tenant_id: ctx.tenantId,
              order_type: 'product',
              OR: byLeadOrPhone,
            },
            include: { order_items: true, customers: true },
            orderBy: { created_at: 'desc' },
            take: 300,
          })
        : [],
      byLeadOrPhone.length
        ? this.db.seller_stock_reservations.findMany({
            where: {
              business_id: ctx.businessId,
              tenant_id: ctx.tenantId,
              OR: [
                ...(leadIds.length ? [{ lead_id: { in: leadIds } }] : []),
                ...(phones.length ? [{ customer_phone: { in: phones } }] : []),
              ],
            },
            orderBy: { created_at: 'desc' },
            take: 300,
          })
        : [],
      byLeadEntityOrPhone.length
        ? this.db.seller_owner_approvals.findMany({
            where: {
              business_id: ctx.businessId,
              tenant_id: ctx.tenantId,
              OR: byLeadEntityOrPhone,
            },
            orderBy: { created_at: 'desc' },
            take: 200,
          })
        : [],
      phones.length
        ? this.db.seller_demand_signals.findMany({
            where: {
              business_id: ctx.businessId,
              tenant_id: ctx.tenantId,
              customer_phone: { in: phones },
              created_at: { gte: since },
            },
            orderBy: { created_at: 'desc' },
            take: 500,
          })
        : [],
      byLeadEntityOrPhone.length
        ? this.db.seller_ai_audit_logs.findMany({
            where: {
              business_id: ctx.businessId,
              tenant_id: ctx.tenantId,
              OR: byLeadEntityOrPhone,
            },
            orderBy: { created_at: 'desc' },
            take: 250,
          })
        : [],
    ]);

    const productIds = [
      ...new Set(
        [
          ...orders.flatMap((order: any) => (order.order_items || []).map((item: any) => item.product_id)),
          ...holds.map((hold: any) => hold.product_id),
          ...demandSignals.map((signal: any) => signal.product_id),
        ].filter(Boolean),
      ),
    ];
    const products = productIds.length
      ? await this.db.products.findMany({
          where: { business_id: ctx.businessId, product_id: { in: productIds } },
          select: {
            product_id: true,
            name: true,
            category: true,
            price: true,
            stock_quantity: true,
            reserved_stock: true,
          },
        })
      : [];
    const productMap = new Map(products.map((product: any) => [product.product_id, product]));

    const ordersByLead = this.groupByValue(orders, 'lead_id');
    const ordersByPhone = this.groupByPhone(orders, (order: any) => order.shipping_phone || order.customers?.phone);
    const holdsByLead = this.groupByValue(holds, 'lead_id');
    const holdsByPhone = this.groupByPhone(holds, (hold: any) => hold.customer_phone);
    const approvalsByEntity = this.groupByValue(approvals, 'entity_id');
    const approvalsByPhone = this.groupByPhone(approvals, (approval: any) => approval.customer_phone);
    const signalsByPhone = this.groupByPhone(demandSignals, (signal: any) => signal.customer_phone);
    const auditsByEntity = this.groupByValue(audits, 'entity_id');
    const auditsByPhone = this.groupByPhone(audits, (audit: any) => audit.customer_phone);

    const cards = leads.map((lead: any) => {
      const phone = this.cleanPhone(lead.phone);
      const leadOrders = this.dedupeById(
        [
          ...(ordersByLead.get(lead.lead_id) || []),
          ...(phone ? ordersByPhone.get(phone) || [] : []),
        ],
        'order_id',
      );
      const leadHolds = this.dedupeById(
        [
          ...(holdsByLead.get(lead.lead_id) || []),
          ...(phone ? holdsByPhone.get(phone) || [] : []),
        ],
        'seller_reservation_id',
      );
      const leadApprovals = this.dedupeById(
        [
          ...(approvalsByEntity.get(lead.lead_id) || []),
          ...(phone ? approvalsByPhone.get(phone) || [] : []),
        ],
        'approval_id',
      );
      const leadSignals = phone ? signalsByPhone.get(phone) || [] : [];
      const leadAudits = this.dedupeById(
        [
          ...(auditsByEntity.get(lead.lead_id) || []),
          ...(phone ? auditsByPhone.get(phone) || [] : []),
        ],
        'audit_id',
      );

      return this.publicSellerLead(lead, {
        orders: leadOrders,
        holds: leadHolds,
        approvals: leadApprovals,
        demandSignals: leadSignals,
        audits: leadAudits,
        productMap,
      });
    });

    const counts = this.buildSellerLeadCounts(cards);
    const visible = stage === 'all' ? cards : cards.filter((lead: any) => lead.stage === stage);

    return {
      summary: {
        total: cards.length,
        open: cards.filter((lead: any) => !['won', 'lost'].includes(lead.stage)).length,
        needs_owner: counts.needs_owner,
        stock_held: counts.stock_held,
        payment_waiting: counts.payment_waiting,
        won: counts.won,
      },
      stages: this.sellerLeadStages(counts),
      leads: visible,
      returned_count: visible.length,
      generated_at: new Date().toISOString(),
    };
  }

  async updateSellerLeadStatus(user: any, leadId: string, dto: UpdateSellerLeadStatusDto) {
    const ctx = await this.getSellerContext(user);
    const existing = await this.db.leads.findFirst({
      where: {
        lead_id: leadId,
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        deleted_at: null,
      },
    });
    if (!existing) throw new NotFoundException('Customer enquiry not found');

    const result = await this.prisma.$transaction(async (tx) => {
      await this.updateLeadProgress(tx, ctx, leadId, {
        status: dto.status,
        converted: dto.status === 'won',
        lost: dto.status === 'lost',
        next_followup_at: dto.next_followup_at,
        activity_type: 'seller_lead_status_changed',
        description: dto.note || dto.reason || `Seller changed enquiry status to ${dto.status}`,
        actor_type: 'agent',
        metadata: { status: dto.status, reason: dto.reason },
      });

      return tx.leads.findUnique({ where: { lead_id: leadId } });
    });

    return result;
  }

  async createManualSale(user: any, dto: CreateManualSaleDto) {
    const ctx = await this.getSellerContext(user);
    return this.createSale(ctx, dto, 'manual_counter', false);
  }

  async createAgentOrder(user: any, dto: AgentCreateOrderDto) {
    const ctx = await this.getSellerContext(user);
    return this.createSale(ctx, dto, 'whatsapp_ai', true, dto.lead_id);
  }

  async searchProductsForAgent(user: any, dto: AgentProductSearchDto) {
    const ctx = await this.getSellerContext(user);
    const limit = Math.min(dto.limit ?? 8, 20);
    const where: any = {
      business_id: ctx.businessId,
      tenant_id: ctx.tenantId,
      product_type: 'physical',
      is_active: true,
    };

    if (dto.category) where.category = { equals: dto.category, mode: 'insensitive' };
    if (dto.query) {
      where.OR = [
        { name: { contains: dto.query, mode: 'insensitive' } },
        { description: { contains: dto.query, mode: 'insensitive' } },
        { category: { contains: dto.query, mode: 'insensitive' } },
        { sku: { contains: dto.query, mode: 'insensitive' } },
      ];
    }

    const products = await this.db.products.findMany({
      where,
      include: { product_variants: true },
      orderBy: [{ in_stock: 'desc' }, { updated_at: 'desc' }],
      take: limit,
    });

    await this.recordDemandSignal(ctx, {
      signal_type: 'product_search',
      category: dto.category,
      quantity: 1,
      metadata: { query: dto.query },
    });

    return {
      products: products.map((product: any) => ({
        product_id: product.product_id,
        name: product.name,
        category: product.category,
        price: Number(product.price || 0),
        currency: product.currency || 'INR',
        in_stock: Boolean(product.in_stock),
        available_stock: Math.max(0, Number(product.stock_quantity || 0) - Number(product.reserved_stock || 0)),
        description: product.description,
        variants: (product.product_variants || []).map((variant: any) => ({
          variant_id: variant.variant_id,
          name: variant.name,
          price: Number(variant.price || 0),
          available_stock: Math.max(0, Number(variant.quantity || 0) - Number(variant.reserved_stock || 0)),
          in_stock: Boolean(variant.in_stock),
        })),
      })),
    };
  }

  async createStockReservation(user: any, dto: CreateStockReservationDto, source = 'manual') {
    const ctx = await this.getSellerContext(user);
    const settings = await this.getSettings(ctx);
    const holdMinutes = dto.hold_minutes ?? settings?.stock_hold_minutes ?? 15;
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

    const reservation = await this.prisma.$transaction(async (tx) => {
      const product = await this.findProductForBusiness(tx, ctx, dto.product_id);
      if (product.track_inventory) {
        await this.incrementReservedStock(tx, product, dto.variant_id, dto.quantity);
      }

      const created = await tx.seller_stock_reservations.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          product_id: dto.product_id,
          variant_id: dto.variant_id,
          lead_id: dto.lead_id,
          customer_phone: this.cleanPhone(dto.customer_phone),
          quantity: dto.quantity,
          reason: dto.reason || 'Customer asked to hold product',
          source,
          status: 'active',
          expires_at: expiresAt,
          created_by: ctx.userId,
          metadata: { customer_name: dto.customer_name, hold_minutes: holdMinutes },
        },
      });

      await tx.seller_ai_audit_logs.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          ai_employee_key: source === 'whatsapp_ai' ? 'sales_ai' : 'store_desk',
          action: 'stock_reserved',
          entity_type: 'product',
          entity_id: dto.product_id,
          customer_phone: this.cleanPhone(dto.customer_phone),
          risk_level: 'low',
          decision: 'reserved',
          input_summary: `Held ${dto.quantity} unit(s) of ${product.name}`,
          metadata: { reservation_id: created.seller_reservation_id },
        },
      });

      await this.updateLeadProgress(tx, ctx, dto.lead_id, {
        status: 'qualified',
        lead_quality: 'hot',
        activity_type: 'stock_reserved',
        description: `Stock held for ${product.name}`,
        actor_type: source === 'whatsapp_ai' ? 'ai' : 'agent',
        channel: source === 'whatsapp_ai' ? 'whatsapp' : 'manual',
        metadata: {
          product_id: dto.product_id,
          reservation_id: created.seller_reservation_id,
          quantity: dto.quantity,
        },
      });

      return created;
    });

    await this.recordDemandSignal(ctx, {
      signal_type: 'stock_reserved',
      product_id: dto.product_id,
      customer_phone: dto.customer_phone,
      quantity: dto.quantity,
      channel: source === 'whatsapp_ai' ? 'whatsapp' : 'manual',
    });

    return reservation;
  }

  async releaseStockReservation(user: any, reservationId: string) {
    const ctx = await this.getSellerContext(user);

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.seller_stock_reservations.findFirst({
        where: {
          seller_reservation_id: reservationId,
          business_id: ctx.businessId,
          status: 'active',
        },
      });

      if (!reservation) throw new NotFoundException('Active stock hold not found');

      const product = await this.findProductForBusiness(tx, ctx, reservation.product_id);
      if (product.track_inventory) {
        await this.decrementReservedStock(tx, reservation.product_id, reservation.variant_id, reservation.quantity);
      }

      return tx.seller_stock_reservations.update({
        where: { seller_reservation_id: reservationId },
        data: {
          status: 'released',
          released_at: new Date(),
          updated_at: new Date(),
        },
      });
    });
  }

  async createCreditCustomer(user: any, dto: CreateCreditCustomerDto) {
    const ctx = await this.getSellerContext(user);
    const features = this.buildSellerFeatures(await this.getSettings(ctx));
    if (!features.credit_sales) {
      throw new BadRequestException('Credit is not enabled for this seller type');
    }
    const phone = this.requirePhone(dto.phone);
    const openingBalance = Number(dto.opening_balance || 0);
    const status = dto.status ?? 'approved';

    const account = await this.prisma.$transaction(async (tx) => {
      const customer = await this.findOrCreateCustomer(tx, ctx, phone, dto.customer_name);
      const existing = await tx.seller_customer_credit_accounts.findFirst({
        where: { business_id: ctx.businessId, phone },
      });

      const data = {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        customer_id: customer.customer_id,
        phone,
        customer_name: dto.customer_name || customer.name,
        status,
        credit_limit: dto.credit_limit,
        due_days: dto.due_days ?? 30,
        approved_by: status === 'approved' ? ctx.userId : undefined,
        approved_at: status === 'approved' ? new Date() : undefined,
        notes: dto.notes,
        updated_at: new Date(),
      };

      const account = existing
        ? await tx.seller_customer_credit_accounts.update({
            where: { credit_account_id: existing.credit_account_id },
            data,
          })
        : await tx.seller_customer_credit_accounts.create({
            data: {
              ...data,
              current_balance: openingBalance,
            },
          });

      if (!existing && openingBalance > 0) {
        await tx.seller_customer_credit_transactions.create({
          data: {
            business_id: ctx.businessId,
            tenant_id: ctx.tenantId,
            credit_account_id: account.credit_account_id,
            transaction_type: 'opening_balance',
            amount: openingBalance,
            due_date: new Date(Date.now() + Number(account.due_days || 30) * 24 * 60 * 60 * 1000),
            notes: 'Old balance added while creating credit customer',
            created_by: ctx.userId,
          },
        });
      }

      if (existing && dto.opening_balance !== undefined) {
        const oldBalance = Number(existing.current_balance || 0);
        const diff = openingBalance - oldBalance;
        if (diff !== 0) {
          await tx.seller_customer_credit_accounts.update({
            where: { credit_account_id: account.credit_account_id },
            data: {
              current_balance: openingBalance,
              updated_at: new Date(),
            },
          });
          await tx.seller_customer_credit_transactions.create({
            data: {
              business_id: ctx.businessId,
              tenant_id: ctx.tenantId,
              credit_account_id: account.credit_account_id,
              transaction_type: 'balance_adjustment',
              amount: diff,
              notes: `Credit balance adjusted from ${oldBalance} to ${openingBalance}`,
              created_by: ctx.userId,
            },
          });
        }
      }

      return tx.seller_customer_credit_accounts.findUnique({
        where: { credit_account_id: account.credit_account_id },
      });
    });

    await this.recordAudit(ctx, {
      ai_employee_key: 'credit_guard',
      action: 'credit_customer_saved',
      entity_type: 'credit_account',
      entity_id: account.credit_account_id,
      customer_phone: phone,
      decision: account.status,
      input_summary: `Credit limit ${dto.credit_limit} saved for ${phone}`,
      metadata: { opening_balance: openingBalance },
    });

    return this.publicCreditAccount(account);
  }

  async listCreditCustomers(user: any) {
    const ctx = await this.getSellerContext(user);
    const features = this.buildSellerFeatures(await this.getSettings(ctx));
    if (!features.credit_sales) return [];
    const accounts = await this.db.seller_customer_credit_accounts.findMany({
      where: { business_id: ctx.businessId },
      orderBy: [{ status: 'asc' }, { updated_at: 'desc' }],
      take: 200,
    });
    const ids = accounts.map((account: any) => account.credit_account_id);
    const transactions = ids.length
      ? await this.db.seller_customer_credit_transactions.findMany({
          where: { credit_account_id: { in: ids } },
          orderBy: { created_at: 'desc' },
          take: 500,
        })
      : [];

    const byAccount = new Map<string, any[]>();
    for (const transaction of transactions) {
      const list = byAccount.get(transaction.credit_account_id) || [];
      if (list.length < 5) list.push(this.publicCreditTransaction(transaction));
      byAccount.set(transaction.credit_account_id, list);
    }

    return accounts.map((account: any) => ({
      ...this.publicCreditAccount(account),
      recent_transactions: byAccount.get(account.credit_account_id) || [],
    }));
  }

  async checkCreditCustomer(user: any, phone: string) {
    const ctx = await this.getSellerContext(user);
    const features = this.buildSellerFeatures(await this.getSettings(ctx));
    if (!features.credit_sales) {
      return {
        status: 'disabled',
        can_use_credit: false,
        needs_owner_approval: false,
        label: 'Credit off',
        message: 'Credit is not enabled for this seller type.',
        available_credit: 0,
      };
    }
    const cleanedPhone = this.requirePhone(phone);
    const account = await this.db.seller_customer_credit_accounts.findFirst({
      where: { business_id: ctx.businessId, phone: cleanedPhone },
    });
    return this.buildCreditDecision(account);
  }

  async collectCreditPayment(user: any, accountId: string, dto: CollectCreditPaymentDto) {
    const ctx = await this.getSellerContext(user);
    const features = this.buildSellerFeatures(await this.getSettings(ctx));
    if (!features.credit_sales) {
      throw new BadRequestException('Credit is not enabled for this seller type');
    }
    const amount = Number(dto.amount || 0);
    if (amount <= 0) throw new BadRequestException('Payment amount must be greater than zero');

    const result = await this.prisma.$transaction(async (tx) => {
      const account = await tx.seller_customer_credit_accounts.findFirst({
        where: { credit_account_id: accountId, business_id: ctx.businessId },
      });
      if (!account) throw new NotFoundException('Credit customer not found');

      const currentBalance = Number(account.current_balance || 0);
      if (amount > currentBalance) {
        throw new BadRequestException('Payment is more than the current due amount');
      }

      const updated = await tx.seller_customer_credit_accounts.update({
        where: { credit_account_id: account.credit_account_id },
        data: {
          current_balance: { decrement: amount },
          updated_at: new Date(),
        },
      });

      const transaction = await tx.seller_customer_credit_transactions.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          credit_account_id: account.credit_account_id,
          transaction_type: 'payment',
          amount,
          paid_at: new Date(),
          notes: dto.notes || `Payment collected by ${dto.payment_method || 'cash'}`,
          created_by: ctx.userId,
        },
      });

      return { account: updated, transaction };
    });

    await this.recordAudit(ctx, {
      ai_employee_key: 'credit_guard',
      action: 'credit_payment_collected',
      entity_type: 'credit_account',
      entity_id: result.account.credit_account_id,
      customer_phone: result.account.phone,
      decision: 'collected',
      input_summary: `Collected ${amount} from ${result.account.phone}`,
      metadata: { payment_method: dto.payment_method || 'cash' },
    });

    return {
      account: this.publicCreditAccount(result.account),
      transaction: this.publicCreditTransaction(result.transaction),
    };
  }

  async getPaymentDesk(user: any) {
    const ctx = await this.getSellerContext(user);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingPaymentWhere = {
      business_id: ctx.businessId,
      order_type: 'product',
      payment_status: 'pending',
      payment_method: { notIn: ['credit', 'cod'] },
      status: { notIn: ['cancelled', 'refunded', 'failed'] },
    };

    const codWhere = {
      business_id: ctx.businessId,
      order_type: 'product',
      payment_status: 'pending',
      payment_method: 'cod',
      status: { notIn: ['cancelled', 'refunded', 'failed'] },
    };

    const [pendingOrders, codOrders, activeHolds, paidToday, pendingCount, codCount] = await Promise.all([
      this.db.orders.findMany({
        where: pendingPaymentWhere,
        include: { order_items: true, customers: true },
        orderBy: [{ payment_expires_at: 'asc' }, { created_at: 'desc' }],
        take: 30,
      }),
      this.db.orders.findMany({
        where: codWhere,
        include: { order_items: true, customers: true },
        orderBy: { created_at: 'desc' },
        take: 20,
      }),
      this.db.seller_stock_reservations.findMany({
        where: {
          business_id: ctx.businessId,
          status: 'active',
          expires_at: { gt: new Date() },
        },
        orderBy: { expires_at: 'asc' },
        take: 30,
      }),
      this.db.orders.count({
        where: {
          business_id: ctx.businessId,
          order_type: 'product',
          payment_status: 'paid',
          paid_at: { gte: today },
        },
      }),
      this.db.orders.count({ where: pendingPaymentWhere }),
      this.db.orders.count({ where: codWhere }),
    ]);

    const productIds = [...new Set(activeHolds.map((hold: any) => hold.product_id).filter(Boolean))];
    const products = productIds.length
      ? await this.db.products.findMany({
          where: { business_id: ctx.businessId, product_id: { in: productIds } },
          select: { product_id: true, name: true, category: true, price: true, stock_quantity: true, reserved_stock: true },
        })
      : [];
    const productMap = new Map(products.map((product: any) => [product.product_id, product]));

    return {
      summary: {
        pending_payments: pendingCount,
        cod_collections: codCount,
        active_holds: activeHolds.length,
        paid_today: paidToday,
      },
      pending_orders: pendingOrders.map((order: any) => this.publicPaymentDeskOrder(order)),
      cod_orders: codOrders.map((order: any) => this.publicPaymentDeskOrder(order)),
      active_holds: activeHolds.map((hold: any) => this.publicPaymentHold(hold, productMap.get(hold.product_id))),
    };
  }

  async createPaymentRequestFromHold(user: any, reservationId: string, dto: CreatePaymentRequestFromHoldDto) {
    const ctx = await this.getSellerContext(user);
    const paymentMethod = dto.payment_method || 'upi';

    const result = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.seller_stock_reservations.findFirst({
        where: {
          seller_reservation_id: reservationId,
          business_id: ctx.businessId,
          status: 'active',
          expires_at: { gt: new Date() },
        },
      });
      if (!reservation) throw new NotFoundException('Active stock hold not found');
      if (reservation.converted_order_id) {
        const existingOrder = await tx.orders.findUnique({
          where: { order_id: reservation.converted_order_id },
          include: { order_items: true, customers: true },
        });
        if (existingOrder) {
          await this.orderPaymentSafety.createPaymentAttempt(tx, ctx, {
            order: existingOrder,
            reservation,
            paymentMethod,
            paymentReference: dto.payment_reference,
            source: 'payment_desk',
            idempotencyKey: dto.idempotency_key,
            createdBy: ctx.userId,
            metadata: { reused: true, reservation_id: reservation.seller_reservation_id },
          });
          return { order: existingOrder, reservation, reused: true };
        }
      }

      const product = await tx.products.findFirst({
        where: { product_id: reservation.product_id, business_id: ctx.businessId, tenant_id: ctx.tenantId },
        include: { product_variants: true },
      });
      if (!product) throw new NotFoundException('Product not found for this hold');

      const variant = reservation.variant_id
        ? product.product_variants?.find((candidate: any) => candidate.variant_id === reservation.variant_id)
        : null;
      const customerPhone = this.requirePhone(reservation.customer_phone);
      const customer = await this.findOrCreateCustomer(
        tx,
        ctx,
        customerPhone,
        reservation.metadata?.customer_name,
      );

      const unitPrice = Number(variant?.price ?? product.price ?? 0);
      const totalAmount = unitPrice * Number(reservation.quantity || 1);
      const createdOrder = await tx.orders.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          lead_id: reservation.lead_id,
          customer_id: customer.customer_id,
          order_number: this.generateOrderNumber(),
          order_type: 'product',
          items: [{
            product_id: product.product_id,
            name: variant?.name ? `${product.name} - ${variant.name}` : product.name,
            quantity: reservation.quantity,
            total: totalAmount,
          }],
          subtotal: totalAmount,
          total_amount: totalAmount,
          payment_status: 'pending',
          payment_method: paymentMethod,
          payment_reference: dto.payment_reference,
          payment_expires_at: reservation.expires_at,
          status: 'pending',
          source: 'payment_desk',
          shipping_address: dto.delivery_address,
          shipping_phone: customerPhone,
          notes: dto.notes || `Payment request created from stock hold ${reservation.seller_reservation_id}`,
        },
      });

      await tx.order_items.create({
        data: {
          order_id: createdOrder.order_id,
          product_id: product.product_id,
          variant_id: variant?.variant_id,
          product_name: product.name,
          variant_name: variant?.name,
          sku: variant?.sku || product.sku,
          quantity: reservation.quantity,
          unit_price: unitPrice,
          discount: 0,
          total_price: totalAmount,
          snapshot: {
            product_name: product.name,
            category: product.category,
            price: unitPrice,
            source: 'payment_desk',
          },
        },
      });

      await tx.seller_stock_reservations.update({
        where: { seller_reservation_id: reservation.seller_reservation_id },
        data: {
          converted_order_id: createdOrder.order_id,
          metadata: {
            ...(reservation.metadata || {}),
            payment_request_created_at: new Date().toISOString(),
            payment_method: paymentMethod,
          },
          updated_at: new Date(),
        },
      });

      await this.orderPaymentSafety.createPaymentAttempt(tx, ctx, {
        order: createdOrder,
        reservation,
        paymentMethod,
        paymentReference: dto.payment_reference,
        source: 'payment_desk',
        idempotencyKey: dto.idempotency_key,
        createdBy: ctx.userId,
        metadata: {
          reservation_id: reservation.seller_reservation_id,
          customer_phone: customerPhone,
          product_id: product.product_id,
        },
      });

      if (dto.delivery_required || dto.delivery_address || paymentMethod === 'cod') {
        await tx.seller_deliveries.create({
          data: {
            business_id: ctx.businessId,
            tenant_id: ctx.tenantId,
            order_id: createdOrder.order_id,
            customer_id: customer.customer_id,
            customer_phone: customerPhone,
            delivery_mode: dto.delivery_required ? 'local_delivery' : 'pickup',
            address: dto.delivery_address,
            area: dto.delivery_area,
            collect_payment: paymentMethod === 'cod',
            payment_amount: paymentMethod === 'cod' ? totalAmount : undefined,
            status: 'pending',
            notes: dto.notes,
          },
        });
      }

      await tx.seller_ai_audit_logs.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          ai_employee_key: 'payment_desk',
          action: 'payment_request_created',
          entity_type: 'order',
          entity_id: createdOrder.order_id,
          customer_phone: customerPhone,
          risk_level: 'low',
          decision: 'pending_payment',
          input_summary: `Payment request ${createdOrder.order_number} created from stock hold`,
          metadata: { payment_method: paymentMethod, reservation_id: reservation.seller_reservation_id },
        },
      });

      await this.updateLeadProgress(tx, ctx, reservation.lead_id, {
        status: 'qualified',
        lead_quality: 'hot',
        activity_type: 'payment_request_created',
        description: `Payment request created for ${createdOrder.order_number}`,
        actor_type: 'agent',
        channel: 'payment_desk',
        metadata: {
          order_id: createdOrder.order_id,
          order_number: createdOrder.order_number,
          reservation_id: reservation.seller_reservation_id,
          payment_method: paymentMethod,
          amount: totalAmount,
        },
      });

      const order = await tx.orders.findUnique({
        where: { order_id: createdOrder.order_id },
        include: { order_items: true, customers: true },
      });
      return { order, reservation, reused: false };
    });

    return {
      order: this.publicPaymentDeskOrder(result.order),
      payment_message: this.buildPaymentMessage(result.order, result.reservation),
      reused: result.reused,
    };
  }

  async markSellerOrderPaid(user: any, orderId: string, dto: MarkSellerOrderPaidDto) {
    const ctx = await this.getSellerContext(user);

    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.orders.findFirst({
        where: { order_id: orderId, business_id: ctx.businessId, order_type: 'product' },
        include: { order_items: true, customers: true },
      });
      if (!order) throw new NotFoundException('Order not found');
      const result = await this.orderPaymentSafety.markOrderPaid(tx, ctx, order, {
        paymentMethod: dto.payment_method,
        paymentReference: dto.payment_reference,
        notes: dto.notes,
        actorType: 'owner',
        actorId: ctx.userId,
        source: 'payment_desk',
        idempotencyKey: dto.idempotency_key,
      });

      const paid = result.order;

      await tx.seller_ai_audit_logs.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          ai_employee_key: 'payment_desk',
          action: 'payment_marked_paid',
          entity_type: 'order',
          entity_id: order.order_id,
          customer_phone: order.shipping_phone,
          risk_level: 'low',
          decision: 'paid',
          input_summary: result.alreadyPaid
            ? `Payment was already paid for ${order.order_number}`
            : `Payment marked paid for ${order.order_number}`,
          metadata: { payment_method: dto.payment_method || order.payment_method, payment_reference: dto.payment_reference },
        },
      });

      if (!result.alreadyPaid) {
        await this.updateLeadProgress(tx, ctx, order.lead_id, {
          status: 'won',
          converted: true,
          conversion_value: Number(order.total_amount || 0),
          activity_type: 'payment_marked_paid',
          description: `Payment marked paid for ${order.order_number}`,
          actor_type: 'agent',
          channel: 'payment_desk',
          metadata: {
            order_id: order.order_id,
            order_number: order.order_number,
            payment_method: dto.payment_method || order.payment_method,
          },
        });
      }

      return paid;
    });

    return this.publicPaymentDeskOrder(updated);
  }

  async cancelSellerPaymentOrder(user: any, orderId: string, dto: CancelSellerPaymentOrderDto) {
    const ctx = await this.getSellerContext(user);

    const cancelled = await this.prisma.$transaction(async (tx) => {
      const order = await tx.orders.findFirst({
        where: { order_id: orderId, business_id: ctx.businessId, order_type: 'product' },
        include: { order_items: true, customers: true },
      });
      if (!order) throw new NotFoundException('Order not found');
      const result = await this.orderPaymentSafety.cancelPendingOrder(tx, ctx, order, {
        reason: dto.reason || 'Payment order cancelled',
        actorType: 'owner',
        actorId: ctx.userId,
        source: 'payment_desk',
        status: 'cancelled',
        idempotencyKey: dto.idempotency_key,
      });

      await tx.seller_ai_audit_logs.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          ai_employee_key: 'payment_desk',
          action: 'payment_order_cancelled',
          entity_type: 'order',
          entity_id: order.order_id,
          customer_phone: order.shipping_phone,
          risk_level: 'low',
          decision: 'cancelled',
          input_summary: result.alreadyClosed
            ? `Payment order already closed ${order.order_number}`
            : dto.reason || `Cancelled payment order ${order.order_number}`,
        },
      });

      return result.order;
    });

    return this.publicPaymentDeskOrder(cancelled);
  }

  async createReturnCase(user: any, dto: CreateReturnCaseDto) {
    const ctx = await this.getSellerContext(user);
    const riskLevel = dto.refund_amount && dto.refund_amount > 0 ? 'medium' : 'low';

    const result = await this.prisma.$transaction(async (tx) => {
      let approval = null;
      if (dto.refund_amount && dto.refund_amount > 0) {
        approval = await tx.seller_owner_approvals.create({
          data: {
            business_id: ctx.businessId,
            tenant_id: ctx.tenantId,
            entity_type: 'return_case',
            title: 'Refund approval needed',
            description: `Refund request for ${dto.refund_amount}`,
            requested_action: 'approve_refund',
            priority: 'normal',
            risk_level: riskLevel,
            status: 'pending',
            source: 'manual',
            customer_phone: this.cleanPhone(dto.customer_phone),
            metadata: dto,
          },
        });
      }

      const returnCase = await tx.seller_return_cases.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          order_id: dto.order_id,
          product_id: dto.product_id,
          customer_phone: this.cleanPhone(dto.customer_phone),
          reason: dto.reason,
          resolution: dto.resolution,
          refund_amount: dto.refund_amount,
          owner_approval_id: approval?.approval_id,
          source: 'manual',
        },
      });

      return { return_case: returnCase, approval };
    });

    return result;
  }

  async createDelivery(user: any, dto: CreateDeliveryDto) {
    const ctx = await this.getSellerContext(user);
    return this.db.seller_deliveries.create({
      data: {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        order_id: dto.order_id,
        customer_id: dto.customer_id,
        customer_phone: this.cleanPhone(dto.customer_phone),
        delivery_mode: dto.delivery_mode ?? 'local_delivery',
        address: dto.address,
        area: dto.area,
        collect_payment: dto.collect_payment ?? false,
        payment_amount: dto.payment_amount,
        notes: dto.notes,
      },
    });
  }

  async updateApprovalStatus(user: any, approvalId: string, status: 'approved' | 'rejected', notes?: string) {
    const ctx = await this.getSellerContext(user);
    const approval = await this.db.seller_owner_approvals.findFirst({
      where: { approval_id: approvalId, business_id: ctx.businessId },
    });

    if (!approval) throw new NotFoundException('Approval request not found');

    const updated = await this.db.seller_owner_approvals.update({
      where: { approval_id: approvalId },
      data: {
        status,
        reviewed_by: ctx.userId,
        reviewed_at: new Date(),
        updated_at: new Date(),
        metadata: { ...(approval.metadata || {}), review_notes: notes },
      },
    });

    await this.recordAudit(ctx, {
      ai_employee_key: approval.ai_employee_key || 'owner_approval',
      action: `approval_${status}`,
      entity_type: approval.entity_type,
      entity_id: approval.entity_id,
      decision: status,
      risk_level: approval.risk_level,
      input_summary: approval.title,
    });

    return updated;
  }

  async aiGuardrailCheck(user: any, dto: AiGuardrailCheckDto) {
    const ctx = await this.getSellerContext(user);
    const settings = await this.getSettings(ctx);
    const features = this.buildSellerFeatures(settings);
    const highValueLimit = Number(settings?.ai_guardrails?.high_value_approval_amount ?? 10000);
    const amount = Number(dto.metadata?.amount ?? 0);
    const action = dto.action.toLowerCase();

    if (action.includes('credit') && !features.credit_sales) {
      const audit = await this.recordAudit(ctx, {
        ai_employee_key: dto.ai_employee_key,
        action: dto.action,
        customer_phone: dto.customer_phone,
        risk_level: 'low',
        decision: 'disabled',
        input_summary: dto.input_summary,
        output_summary: 'Credit is not enabled for this seller type.',
        guardrail_result: { credit_enabled: false },
        metadata: dto.metadata,
      });

      return {
        allowed: false,
        needs_owner_approval: false,
        risk_level: 'low',
        audit,
        approval: null,
      };
    }

    const needsOwner =
      amount >= highValueLimit ||
      action.includes('refund') ||
      action.includes('discount') ||
      action.includes('credit') ||
      action.includes('delete');

    const riskLevel = needsOwner ? (amount >= highValueLimit ? 'high' : 'medium') : 'low';
    const decision = needsOwner ? 'needs_owner_approval' : 'allowed';

    const audit = await this.recordAudit(ctx, {
      ai_employee_key: dto.ai_employee_key,
      action: dto.action,
      customer_phone: dto.customer_phone,
      risk_level: riskLevel,
      decision,
      input_summary: dto.input_summary,
      output_summary: dto.output_summary,
      guardrail_result: { needs_owner_approval: needsOwner, high_value_limit: highValueLimit },
      metadata: dto.metadata,
    });

    let approval = null;
    if (needsOwner) {
      approval = await this.db.seller_owner_approvals.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          entity_type: 'ai_action',
          entity_id: audit.audit_id,
          title: 'AI action needs approval',
          description: dto.output_summary || dto.input_summary || dto.action,
          requested_action: dto.action,
          priority: riskLevel === 'high' ? 'high' : 'normal',
          risk_level: riskLevel,
          status: 'pending',
          source: 'ai',
          ai_employee_key: dto.ai_employee_key,
          customer_phone: this.cleanPhone(dto.customer_phone),
          metadata: dto.metadata,
        },
      });
    }

    return { allowed: !needsOwner, needs_owner_approval: needsOwner, risk_level: riskLevel, audit, approval };
  }

  async cleanupExpiredSellerHolds() {
    const expired = await this.db.seller_stock_reservations.findMany({
      where: { status: 'active', expires_at: { lt: new Date() } },
      take: 500,
    });

    const restoredProductIds = new Set<string>();
    for (const reservation of expired) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await this.decrementReservedStock(tx, reservation.product_id, reservation.variant_id, reservation.quantity);
          await tx.seller_stock_reservations.update({
            where: { seller_reservation_id: reservation.seller_reservation_id },
            data: { status: 'expired', released_at: new Date(), updated_at: new Date() },
          });
        });
        restoredProductIds.add(reservation.product_id);
      } catch (error) {
        this.logger.warn(`Could not expire seller hold ${reservation.seller_reservation_id}: ${error.message}`);
      }
    }

    return { count: expired.length, restoredProductIds: [...restoredProductIds] };
  }

  private async createSale(ctx: any, dto: CreateManualSaleDto, source: string, useReservations: boolean, leadId?: string) {
    if (!dto.items?.length) throw new BadRequestException('At least one product is required');
    const customerPhone = this.requirePhone(dto.customer_phone);
    const paymentMethod = dto.payment_method ?? 'cash';
    const features = this.buildSellerFeatures(await this.getSettings(ctx));
    if (paymentMethod === 'credit' && !features.credit_sales) {
      throw new BadRequestException('Credit is not enabled for this seller type');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const customer = await this.findOrCreateCustomer(tx, ctx, customerPhone, dto.customer_name);
      const orderItems = [];
      let subtotal = 0;

      for (const item of dto.items) {
        const product = await this.findProductForBusiness(tx, ctx, item.product_id);
        const variant = item.variant_id
          ? product.product_variants?.find((candidate: any) => candidate.variant_id === item.variant_id)
          : null;

        if (item.variant_id && !variant) {
          throw new NotFoundException('Product variant not found for this business');
        }

        const unitPrice = Number(variant?.price ?? product.price ?? 0);
        const discount = Number(item.discount || 0);
        const totalPrice = unitPrice * item.quantity - discount;
        if (totalPrice < 0) throw new BadRequestException('Discount cannot exceed item total');

        if (product.track_inventory) {
          const converted = useReservations
            ? await this.tryConvertActiveHold(tx, ctx, item, customerPhone, leadId)
            : false;

          if (!converted) {
            await this.decrementStockForSale(tx, product, item.variant_id, item.quantity);
          }
        }

        orderItems.push({
          product,
          variant,
          quantity: item.quantity,
          unitPrice,
          discount,
          totalPrice,
        });
        subtotal += totalPrice;
      }

      const totalAmount = subtotal;
      const isPaid = !['credit', 'cod'].includes(paymentMethod);
      const createdOrder = await tx.orders.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          lead_id: leadId,
          customer_id: customer.customer_id,
          order_number: this.generateOrderNumber(),
          order_type: 'product',
          items: orderItems.map((item) => ({
            product_id: item.product.product_id,
            name: item.product.name,
            quantity: item.quantity,
            total: item.totalPrice,
          })),
          subtotal,
          total_amount: totalAmount,
          payment_status: isPaid ? 'paid' : 'pending',
          payment_method: paymentMethod,
          paid_at: isPaid ? new Date() : undefined,
          status: isPaid ? 'paid' : 'pending',
          source,
          shipping_address: dto.delivery_address,
          shipping_phone: customerPhone,
          notes: dto.notes,
        },
      });

      for (const item of orderItems) {
        await tx.order_items.create({
          data: {
            order_id: createdOrder.order_id,
            product_id: item.product.product_id,
            variant_id: item.variant?.variant_id,
            product_name: item.product.name,
            variant_name: item.variant?.name,
            sku: item.variant?.sku || item.product.sku,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount: item.discount,
            total_price: item.totalPrice,
            snapshot: {
              product_name: item.product.name,
              category: item.product.category,
              price: item.unitPrice,
              source,
            },
          },
        });
      }

      if (!isPaid && paymentMethod !== 'credit') {
        await this.orderPaymentSafety.createPaymentAttempt(tx, ctx, {
          order: createdOrder,
          paymentMethod,
          source,
          createdBy: ctx.userId,
          metadata: {
            created_from: source,
            customer_phone: customerPhone,
            item_count: orderItems.length,
          },
        });
      }

      if (paymentMethod === 'credit') {
        await this.applyCreditSale(tx, ctx, customer, createdOrder, totalAmount);
      }

      if (dto.delivery_required || dto.delivery_address || paymentMethod === 'cod') {
        await tx.seller_deliveries.create({
          data: {
            business_id: ctx.businessId,
            tenant_id: ctx.tenantId,
            order_id: createdOrder.order_id,
            customer_id: customer.customer_id,
            customer_phone: customerPhone,
            delivery_mode: dto.delivery_required ? 'local_delivery' : 'pickup',
            address: dto.delivery_address,
            area: dto.delivery_area,
            collect_payment: paymentMethod === 'cod',
            payment_amount: paymentMethod === 'cod' ? totalAmount : undefined,
            status: 'pending',
            notes: dto.notes,
          },
        });
      }

      await tx.customers.update({
        where: { customer_id: customer.customer_id },
        data: {
          total_orders: { increment: 1 },
          total_spent: { increment: totalAmount },
          last_order_date: new Date(),
          updated_at: new Date(),
        },
      });

      await tx.seller_ai_audit_logs.create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          ai_employee_key: source === 'whatsapp_ai' ? 'sales_ai' : 'store_desk',
          action: 'product_order_created',
          entity_type: 'order',
          entity_id: createdOrder.order_id,
          customer_phone: customerPhone,
          risk_level: totalAmount > 10000 ? 'medium' : 'low',
          decision: 'created',
          input_summary: `${source} sale for ${orderItems.length} item(s)`,
          output_summary: `Order ${createdOrder.order_number} created`,
          metadata: { payment_method: paymentMethod, total_amount: totalAmount },
        },
      });

      await this.updateLeadProgress(tx, ctx, leadId, {
        status: isPaid ? 'won' : 'qualified',
        converted: isPaid,
        conversion_value: isPaid ? totalAmount : undefined,
        lead_quality: 'hot',
        activity_type: 'product_order_created',
        description: `Product order ${createdOrder.order_number} created`,
        actor_type: source === 'whatsapp_ai' ? 'ai' : 'agent',
        channel: source === 'whatsapp_ai' ? 'whatsapp' : 'manual',
        metadata: {
          order_id: createdOrder.order_id,
          order_number: createdOrder.order_number,
          payment_method: paymentMethod,
          total_amount: totalAmount,
        },
      });

      if (totalAmount > 10000) {
        await tx.seller_owner_approvals.create({
          data: {
            business_id: ctx.businessId,
            tenant_id: ctx.tenantId,
            entity_type: 'order',
            entity_id: createdOrder.order_id,
            title: 'High value order created',
            description: `Order ${createdOrder.order_number} total ${totalAmount}`,
            requested_action: 'review_order',
            priority: totalAmount > 10000 ? 'high' : 'normal',
            risk_level: totalAmount > 10000 ? 'medium' : 'low',
            status: 'pending',
            source,
            ai_employee_key: source === 'whatsapp_ai' ? 'sales_ai' : undefined,
            customer_phone: customerPhone,
            metadata: { order_number: createdOrder.order_number, payment_method: paymentMethod },
          },
        });
      }

      return tx.orders.findUnique({
        where: { order_id: createdOrder.order_id },
        include: { order_items: true, customers: true },
      });
    });

    for (const item of dto.items) {
      await this.recordDemandSignal(ctx, {
        signal_type: 'sale',
        product_id: item.product_id,
        customer_phone: customerPhone,
        quantity: item.quantity,
        channel: source === 'whatsapp_ai' ? 'whatsapp' : 'manual',
      });
    }

    return order;
  }

  private async upsertSetupProduct(tx: any, ctx: any, dto: any) {
    const sku = dto.sku?.trim() || undefined;
    const existing = dto.product_id
      ? await tx.products.findFirst({
          where: { product_id: dto.product_id, business_id: ctx.businessId, tenant_id: ctx.tenantId },
        })
      : sku
        ? await tx.products.findFirst({ where: { business_id: ctx.businessId, sku } })
        : null;

    const data = {
      business_id: ctx.businessId,
      tenant_id: ctx.tenantId,
      product_type: 'physical',
      name: dto.name.trim(),
      slug: this.slugify(dto.name),
      description: dto.description,
      category: dto.category,
      price: dto.price,
      stock_quantity: dto.stock_quantity,
      sku,
      currency: 'INR',
      track_inventory: true,
      in_stock: dto.stock_quantity > 0,
      is_active: true,
      updated_at: new Date(),
    };

    const product = existing
      ? await tx.products.update({ where: { product_id: existing.product_id }, data })
      : await tx.products.create({ data });

    if (dto.cost_price !== undefined) {
      const margin =
        dto.price > 0 && dto.cost_price >= 0
          ? ((dto.price - dto.cost_price) / dto.price) * 100
          : null;

      const existingSnapshot = await tx.seller_product_profit_snapshots.findFirst({
        where: { business_id: ctx.businessId, product_id: product.product_id },
      });

      if (existingSnapshot) {
        await tx.seller_product_profit_snapshots.update({
          where: { profit_snapshot_id: existingSnapshot.profit_snapshot_id },
          data: {
            cost_price: dto.cost_price,
            selling_price: dto.price,
            margin_percent: margin,
            updated_at: new Date(),
          },
        });
      } else {
        await tx.seller_product_profit_snapshots.create({
          data: {
            business_id: ctx.businessId,
            tenant_id: ctx.tenantId,
            product_id: product.product_id,
            cost_price: dto.cost_price,
            selling_price: dto.price,
            margin_percent: margin,
          },
        });
      }
    }

    return product;
  }

  private async getProductStockSummary(ctx: any, lowStockThreshold: number) {
    const [total, active, lowStock, outOfStock, held, inventoryValue] = await Promise.all([
      this.db.products.count({ where: { business_id: ctx.businessId, tenant_id: ctx.tenantId, product_type: 'physical' } }),
      this.db.products.count({ where: { business_id: ctx.businessId, tenant_id: ctx.tenantId, product_type: 'physical', is_active: true } }),
      this.db.products.count({
        where: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          product_type: 'physical',
          is_active: true,
          track_inventory: true,
          stock_quantity: { gt: 0, lte: lowStockThreshold },
        },
      }),
      this.db.products.count({
        where: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          product_type: 'physical',
          is_active: true,
          track_inventory: true,
          stock_quantity: { lte: 0 },
        },
      }),
      this.db.seller_stock_reservations.count({
        where: { business_id: ctx.businessId, status: 'active', expires_at: { gt: new Date() } },
      }),
      this.db.products.aggregate({
        where: { business_id: ctx.businessId, tenant_id: ctx.tenantId, product_type: 'physical', is_active: true },
        _sum: { stock_quantity: true },
      }),
    ]);

    return {
      total_products: total,
      active_products: active,
      low_stock: lowStock,
      out_of_stock: outOfStock,
      active_holds: held,
      total_stock_units: Number(inventoryValue._sum.stock_quantity || 0),
    };
  }

  private prepareImportProductRow(row: any, index: number) {
    const name = String(row.name || '').trim();
    const sku = String(row.sku || '').trim() || undefined;
    const stockQuantity = this.toNonNegativeInt(row.stock_quantity ?? row.stock ?? row.quantity ?? 0);
    const price = this.toMoney(row.price ?? row.selling_price ?? row.rate);
    const costPrice = row.cost_price === undefined || row.cost_price === null || row.cost_price === ''
      ? undefined
      : this.toMoney(row.cost_price);

    return {
      row_number: index + 1,
      product_id: row.product_id,
      name,
      description: String(row.description || '').trim() || undefined,
      category: String(row.category || '').trim() || undefined,
      price,
      cost_price: costPrice,
      stock_quantity: stockQuantity,
      sku,
      image_url: String(row.image_url || row.primary_image_url || '').trim() || undefined,
      is_active: row.is_active === undefined ? true : Boolean(row.is_active),
    };
  }

  private validateImportRows(rows: any[]) {
    const errors: any[] = [];
    const seenSkus = new Set<string>();

    for (const row of rows) {
      if (!row.name) errors.push({ row: row.row_number, field: 'name', message: 'Product name is required' });
      if (!Number.isFinite(row.price) || row.price < 0) errors.push({ row: row.row_number, field: 'price', message: 'Price must be 0 or more' });
      if (!Number.isInteger(row.stock_quantity) || row.stock_quantity < 0) {
        errors.push({ row: row.row_number, field: 'stock_quantity', message: 'Stock must be 0 or more' });
      }
      if (row.cost_price !== undefined && (!Number.isFinite(row.cost_price) || row.cost_price < 0)) {
        errors.push({ row: row.row_number, field: 'cost_price', message: 'Cost price must be 0 or more' });
      }
      if (row.sku) {
        const key = row.sku.toLowerCase();
        if (seenSkus.has(key)) errors.push({ row: row.row_number, field: 'sku', message: `Duplicate SKU in file: ${row.sku}` });
        seenSkus.add(key);
      }
    }

    return errors;
  }

  private async createImportJob(ctx: any, source: string, totalRows: number, validationErrors: any[]) {
    const rows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`
        INSERT INTO seller_product_import_jobs (
          business_id,
          tenant_id,
          source,
          status,
          total_rows,
          failed_count,
          errors,
          created_by
        )
        VALUES (
          ${ctx.businessId}::uuid,
          ${ctx.tenantId}::uuid,
          ${source},
          ${validationErrors.length ? 'validating' : 'processing'},
          ${totalRows}::integer,
          ${validationErrors.length}::integer,
          ${JSON.stringify(validationErrors.slice(0, 200))}::jsonb,
          ${ctx.userId ? Prisma.sql`${ctx.userId}::uuid` : Prisma.sql`NULL`}
        )
        RETURNING *
      `,
    );
    return rows[0];
  }

  private async finishImportJob(ctx: any, importJobId: string, result: any) {
    const errors = JSON.stringify(result.errors || []);
    const summary = JSON.stringify(result.summary || {});
    await this.prisma.$executeRaw(
      Prisma.sql`
        UPDATE seller_product_import_jobs
        SET status = ${result.status},
            total_rows = ${Number(result.total_rows || 0)}::integer,
            created_count = ${Number(result.created_count || 0)}::integer,
            updated_count = ${Number(result.updated_count || 0)}::integer,
            skipped_count = ${Number(result.skipped_count || 0)}::integer,
            failed_count = ${Number(result.failed_count || 0)}::integer,
            errors = ${errors}::jsonb,
            summary = ${summary}::jsonb,
            finished_at = NOW(),
            updated_at = NOW()
        WHERE import_job_id = ${importJobId}::uuid
          AND business_id = ${ctx.businessId}::uuid
      `,
    );
  }

  private async upsertImportedProduct(tx: any, ctx: any, row: any, importJobId: string) {
    const existing = row.product_id
      ? await tx.products.findFirst({
          where: { product_id: row.product_id, business_id: ctx.businessId, tenant_id: ctx.tenantId },
        })
      : row.sku
        ? await tx.products.findFirst({
            where: { business_id: ctx.businessId, tenant_id: ctx.tenantId, sku: row.sku, product_type: 'physical' },
          })
        : null;

    if (existing) {
      const locked = await this.lockSellerProductStock(tx, existing.product_id);
      const reserved = Number(locked.reserved_stock || 0);
      if (row.stock_quantity < reserved) {
        throw new ConflictException(`Stock cannot be less than held quantity ${reserved}`);
      }

      const updated = await tx.products.update({
        where: { product_id: existing.product_id },
        data: {
          name: row.name,
          slug: this.slugify(row.name),
          description: row.description,
          category: row.category,
          price: row.price,
          sku: row.sku || existing.sku,
          stock_quantity: row.stock_quantity,
          primary_image_url: row.image_url || existing.primary_image_url,
          image_urls: row.image_url ? [row.image_url] : existing.image_urls,
          track_inventory: true,
          in_stock: row.stock_quantity > 0,
          is_active: row.is_active,
          version: { increment: 1 },
          updated_at: new Date(),
        },
      });

      if (Number(locked.stock_quantity || 0) !== row.stock_quantity) {
        await this.insertSellerStockAdjustment(tx, ctx, {
          product_id: existing.product_id,
          import_job_id: importJobId,
          adjustment_type: 'set',
          quantity_before: Number(locked.stock_quantity || 0),
          quantity_after: row.stock_quantity,
          reserved_before: reserved,
          reason: 'bulk_import',
          source: 'import',
          reference: row.sku,
          metadata: { row_number: row.row_number },
        });
      }

      await this.upsertProfitSnapshot(tx, ctx, updated, row.cost_price);
      return 'updated';
    }

    const created = await tx.products.create({
      data: {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        product_type: 'physical',
        name: row.name,
        slug: this.slugify(row.name),
        description: row.description,
        category: row.category,
        price: row.price,
        sku: row.sku,
        stock_quantity: row.stock_quantity,
        primary_image_url: row.image_url,
        image_urls: row.image_url ? [row.image_url] : undefined,
        currency: 'INR',
        track_inventory: true,
        in_stock: row.stock_quantity > 0,
        is_active: row.is_active,
      },
    });

    if (row.stock_quantity > 0) {
      await this.insertSellerStockAdjustment(tx, ctx, {
        product_id: created.product_id,
        import_job_id: importJobId,
        adjustment_type: 'set',
        quantity_before: 0,
        quantity_after: row.stock_quantity,
        reserved_before: 0,
        reason: 'bulk_import',
        source: 'import',
        reference: row.sku,
        metadata: { row_number: row.row_number },
      });
    }

    await this.upsertProfitSnapshot(tx, ctx, created, row.cost_price);
    return 'created';
  }

  private async upsertProfitSnapshot(tx: any, ctx: any, product: any, costPrice?: number) {
    if (costPrice === undefined) return;
    const sellingPrice = Number(product.price || 0);
    const margin = sellingPrice > 0 && costPrice >= 0
      ? ((sellingPrice - costPrice) / sellingPrice) * 100
      : null;

    const existingSnapshot = await tx.seller_product_profit_snapshots.findFirst({
      where: { business_id: ctx.businessId, product_id: product.product_id },
    });

    if (existingSnapshot) {
      await tx.seller_product_profit_snapshots.update({
        where: { profit_snapshot_id: existingSnapshot.profit_snapshot_id },
        data: {
          cost_price: costPrice,
          selling_price: sellingPrice,
          margin_percent: margin,
          updated_at: new Date(),
        },
      });
      return;
    }

    await tx.seller_product_profit_snapshots.create({
      data: {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        product_id: product.product_id,
        cost_price: costPrice,
        selling_price: sellingPrice,
        margin_percent: margin,
      },
    });
  }

  private async applySellerStockAdjustment(tx: any, ctx: any, data: any) {
    const quantity = Number(data.quantity || 0);
    if (data.adjustment_type !== 'set' && quantity <= 0) {
      throw new BadRequestException('Quantity must be more than 0');
    }

    const locked = data.variant_id
      ? await this.lockSellerVariantStock(tx, data.product_id, data.variant_id)
      : await this.lockSellerProductStock(tx, data.product_id);
    const before = Number((data.variant_id ? locked.quantity : locked.stock_quantity) || 0);
    const reserved = Number(locked.reserved_stock || 0);
    const after =
      data.adjustment_type === 'add'
        ? before + quantity
        : data.adjustment_type === 'reduce'
          ? before - quantity
          : quantity;

    if (after < reserved) {
      throw new ConflictException(`Stock cannot go below held quantity ${reserved}`);
    }
    if (after < 0) throw new ConflictException('Stock cannot be negative');

    if (data.variant_id) {
      await tx.product_variants.update({
        where: { variant_id: data.variant_id },
        data: {
          quantity: after,
          in_stock: after > 0,
          version: { increment: 1 },
          updated_at: new Date(),
        },
      });
    } else {
      await tx.products.update({
        where: { product_id: data.product_id },
        data: {
          stock_quantity: after,
          in_stock: after > 0,
          version: { increment: 1 },
          updated_at: new Date(),
        },
      });
    }

    return this.insertSellerStockAdjustment(tx, ctx, {
      ...data,
      quantity_before: before,
      quantity_after: after,
      reserved_before: reserved,
    });
  }

  private async insertSellerStockAdjustment(tx: any, ctx: any, data: any) {
    const change = Number(data.quantity_after || 0) - Number(data.quantity_before || 0);
    const availableAfter = Math.max(0, Number(data.quantity_after || 0) - Number(data.reserved_before || 0));
    const metadata = JSON.stringify(data.metadata || {});
    const rows = await tx.$queryRaw<any[]>(
      Prisma.sql`
        INSERT INTO seller_stock_adjustments (
          business_id,
          tenant_id,
          product_id,
          variant_id,
          import_job_id,
          adjustment_type,
          quantity_change,
          quantity_before,
          quantity_after,
          reserved_before,
          available_after,
          reason,
          source,
          reference,
          note,
          created_by,
          metadata
        )
        VALUES (
          ${ctx.businessId}::uuid,
          ${ctx.tenantId}::uuid,
          ${data.product_id}::uuid,
          ${data.variant_id ? Prisma.sql`${data.variant_id}::uuid` : Prisma.sql`NULL`},
          ${data.import_job_id ? Prisma.sql`${data.import_job_id}::uuid` : Prisma.sql`NULL`},
          ${data.adjustment_type},
          ${change}::integer,
          ${Number(data.quantity_before || 0)}::integer,
          ${Number(data.quantity_after || 0)}::integer,
          ${Number(data.reserved_before || 0)}::integer,
          ${availableAfter}::integer,
          ${this.cleanStockReason(data.reason)},
          ${data.source || 'manual'},
          ${data.reference || null},
          ${data.note || null},
          ${ctx.userId ? Prisma.sql`${ctx.userId}::uuid` : Prisma.sql`NULL`},
          ${metadata}::jsonb
        )
        RETURNING *
      `,
    );
    return rows[0];
  }

  private async fetchStockAdjustments(ctx: any, query: any = {}) {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
    const offset = (page - 1) * limit;
    const search = String(query.search || '').trim();

    const rows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`
        SELECT
          a.*,
          p.name AS product_name,
          p.sku AS product_sku,
          pv.name AS variant_name
        FROM seller_stock_adjustments a
        JOIN products p ON p.product_id = a.product_id
        LEFT JOIN product_variants pv ON pv.variant_id = a.variant_id
        WHERE a.business_id = ${ctx.businessId}::uuid
          AND a.tenant_id = ${ctx.tenantId}::uuid
          AND (
            ${search} = ''
            OR p.name ILIKE ${`%${search}%`}
            OR p.sku ILIKE ${`%${search}%`}
            OR a.reason ILIKE ${`%${search}%`}
          )
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    );

    const countRows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`
        SELECT COUNT(*)::integer AS count
        FROM seller_stock_adjustments a
        JOIN products p ON p.product_id = a.product_id
        WHERE a.business_id = ${ctx.businessId}::uuid
          AND a.tenant_id = ${ctx.tenantId}::uuid
          AND (
            ${search} = ''
            OR p.name ILIKE ${`%${search}%`}
            OR p.sku ILIKE ${`%${search}%`}
            OR a.reason ILIKE ${`%${search}%`}
          )
      `,
    );

    return {
      adjustments: rows.map((row: any) => ({
        ...row,
        quantity_change: Number(row.quantity_change || 0),
        quantity_before: Number(row.quantity_before || 0),
        quantity_after: Number(row.quantity_after || 0),
        reserved_before: Number(row.reserved_before || 0),
        available_after: Number(row.available_after || 0),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.count || 0),
      },
    };
  }

  private async lockSellerProductStock(tx: any, productId: string) {
    const rows = await tx.$queryRaw<any[]>(
      Prisma.sql`
        SELECT product_id, stock_quantity, COALESCE(reserved_stock, 0) AS reserved_stock
        FROM products
        WHERE product_id = ${productId}::uuid
        FOR UPDATE
      `,
    );
    const row = rows[0];
    if (!row) throw new NotFoundException('Product not found');
    return row;
  }

  private async lockSellerVariantStock(tx: any, productId: string, variantId: string) {
    const rows = await tx.$queryRaw<any[]>(
      Prisma.sql`
        SELECT pv.variant_id, pv.quantity, COALESCE(pv.reserved_stock, 0) AS reserved_stock
        FROM product_variants pv
        JOIN products p ON p.product_id = pv.product_id
        WHERE pv.variant_id = ${variantId}::uuid
          AND p.product_id = ${productId}::uuid
        FOR UPDATE
      `,
    );
    const row = rows[0];
    if (!row) throw new NotFoundException('Product variant not found');
    return row;
  }

  private async findProductForBusiness(tx: any, ctx: any, productId: string) {
    return this.inventoryTransactions.findProductForBusiness(tx, ctx, productId);
  }

  private async incrementReservedStock(tx: any, product: any, variantId: string | undefined, quantity: number) {
    return this.inventoryTransactions.reserveProductStock(tx, product, variantId, quantity);
  }

  private async decrementReservedStock(tx: any, productId: string, variantId: string | undefined, quantity: number) {
    return this.inventoryTransactions.releaseReservedProductStock(tx, productId, variantId, quantity);
  }

  private async decrementStockForSale(tx: any, product: any, variantId: string | undefined, quantity: number) {
    return this.inventoryTransactions.sellProductStock(tx, product, variantId, quantity);
  }

  private async tryConvertActiveHold(tx: any, ctx: any, item: any, customerPhone: string, leadId?: string) {
    return this.inventoryTransactions.convertActiveHoldForSale(tx, ctx, item, customerPhone, leadId);
  }

  private async applyCreditSale(tx: any, ctx: any, customer: any, order: any, totalAmount: number) {
    const account = await tx.seller_customer_credit_accounts.findFirst({
      where: { business_id: ctx.businessId, phone: customer.phone },
    });

    if (!account || account.status !== 'approved') {
      throw new BadRequestException('Customer is not approved for credit sales');
    }

    const newBalance = Number(account.current_balance || 0) + totalAmount;
    if (newBalance > Number(account.credit_limit || 0)) {
      throw new ConflictException('Credit limit exceeded for this customer');
    }

    const dueDate = new Date(Date.now() + Number(account.due_days || 30) * 24 * 60 * 60 * 1000);
    await tx.seller_customer_credit_accounts.update({
      where: { credit_account_id: account.credit_account_id },
      data: {
        current_balance: { increment: totalAmount },
        updated_at: new Date(),
      },
    });

    await tx.seller_customer_credit_transactions.create({
      data: {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        credit_account_id: account.credit_account_id,
        order_id: order.order_id,
        transaction_type: 'credit_sale',
        amount: totalAmount,
        due_date: dueDate,
        notes: `Credit sale for order ${order.order_number}`,
        created_by: ctx.userId,
      },
    });
  }

  private async convertLinkedHoldToSale(tx: any, hold: any) {
    return this.inventoryTransactions.convertLinkedHoldToSale(tx, hold);
  }

  private async releaseLinkedHold(tx: any, hold: any, status = 'released') {
    return this.inventoryTransactions.releaseLinkedHold(tx, hold, status);
  }

  private async restoreStockForUnpaidOrder(tx: any, order: any) {
    return this.inventoryTransactions.restoreStockForUnpaidOrder(tx, order);
  }

  private async findOrCreateCustomer(tx: any, ctx: any, phone: string, customerName?: string) {
    const existing = await tx.customers.findFirst({ where: { business_id: ctx.businessId, phone } });
    if (existing) {
      if (customerName && !existing.name) {
        return tx.customers.update({
          where: { customer_id: existing.customer_id },
          data: { name: customerName, updated_at: new Date() },
        });
      }
      return existing;
    }

    return tx.customers.create({
      data: {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        phone,
        whatsapp_number: phone,
        name: customerName,
      },
    });
  }

  private async getSellerContext(user: any) {
    const businessId = user?.business_id;
    const tenantId = user?.tenant_id;
    const userId = user?.user_id;
    if (!businessId || !tenantId) throw new ForbiddenException('Missing business context');

    const business = await this.db.businesses.findFirst({
      where: { business_id: businessId, tenant_id: tenantId },
    });
    if (!business) throw new ForbiddenException('Business not found for authenticated user');

    const type = String(business.business_type || '').toLowerCase();
    if (!SELLER_BUSINESS_TYPES.has(type)) {
      throw new BadRequestException('Store Desk is only for product seller businesses');
    }

    return { businessId, tenantId, userId, business };
  }

  private async getSettings(ctx: any) {
    return this.db.seller_store_settings.findUnique({
      where: { business_id: ctx.businessId },
    });
  }

  private async recordAudit(ctx: any, data: any) {
    return this.db.seller_ai_audit_logs.create({
      data: {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        ai_employee_key: data.ai_employee_key,
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        customer_phone: this.cleanPhone(data.customer_phone),
        risk_level: data.risk_level || 'low',
        confidence: data.confidence,
        decision: data.decision,
        input_summary: data.input_summary,
        output_summary: data.output_summary,
        guardrail_result: data.guardrail_result,
        metadata: data.metadata,
      },
    });
  }

  private async recordDemandSignal(ctx: any, data: any) {
    return this.db.seller_demand_signals.create({
      data: {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        product_id: data.product_id,
        category: data.category,
        customer_phone: this.cleanPhone(data.customer_phone),
        signal_type: data.signal_type,
        channel: data.channel || 'whatsapp',
        quantity: data.quantity || 1,
        metadata: data.metadata,
      },
    }).catch((error: any) => this.logger.warn(`Demand signal skipped: ${error.message}`));
  }

  private async updateLeadProgress(tx: any, ctx: any, leadId: string | undefined, options: any) {
    if (!leadId) return null;
    const now = new Date();
    const data: any = {
      last_activity_at: now,
      updated_at: now,
    };

    if (options.status) data.status = options.status;
    if (options.lead_quality) data.lead_quality = options.lead_quality;
    if (options.next_followup_at) data.next_followup_at = new Date(options.next_followup_at);
    if (options.converted) {
      data.is_converted = true;
      data.converted_at = now;
      data.status = options.status || 'won';
      if (options.conversion_value !== undefined) data.conversion_value = options.conversion_value;
    }
    if (options.lost) {
      data.lost_at = now;
      data.lost_reason = options.reason || options.description;
    }

    const updated = await tx.leads.updateMany({
      where: {
        lead_id: leadId,
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
      },
      data,
    });
    if (!updated.count) return null;

    await tx.lead_activities.create({
      data: {
        lead_id: leadId,
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        activity_type: options.activity_type || 'seller_lead_progress',
        activity_description: options.description,
        actor_type: options.actor_type || 'system',
        actor_id: ctx.userId,
        channel: options.channel,
        metadata: options.metadata,
      },
    });

    return updated;
  }

  private publicSellerLead(lead: any, related: any) {
    const orders = related.orders || [];
    const holds = related.holds || [];
    const approvals = related.approvals || [];
    const audits = related.audits || [];
    const demandSignals = related.demandSignals || [];
    const activeHold = holds.find((hold: any) => hold.status === 'active' && new Date(hold.expires_at).getTime() > Date.now());
    const pendingPayment = orders.find((order: any) =>
      order.payment_status === 'pending' &&
      order.payment_method !== 'credit' &&
      !['cancelled', 'failed', 'refunded'].includes(String(order.status || '').toLowerCase()),
    );
    const wonOrder = orders.find((order: any) =>
      order.payment_status === 'paid' ||
      order.payment_method === 'credit' ||
      ['paid', 'completed', 'delivered'].includes(String(order.status || '').toLowerCase()),
    );
    const pendingApprovals = approvals.filter((approval: any) => approval.status === 'pending');
    const stage = this.deriveSellerLeadStage(lead, {
      activeHold,
      pendingPayment,
      wonOrder,
      pendingApprovals,
      audits,
      demandSignals,
    });
    const productInterests = this.buildSellerLeadProductInterests(lead, related);
    const latestAudit = audits[0];
    const latestOrder = orders[0];
    const value = Number(pendingPayment?.total_amount ?? wonOrder?.total_amount ?? latestOrder?.total_amount ?? 0);
    const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim();

    return {
      lead_id: lead.lead_id,
      customer_name: name || lead.custom_fields?.customer_name || lead.phone || 'Customer',
      phone: this.cleanPhone(lead.phone),
      source: lead.source || 'whatsapp',
      status: lead.status,
      stage,
      stage_label: this.sellerLeadStageLabel(stage),
      priority: this.sellerLeadPriority(stage),
      lead_quality: lead.lead_quality,
      lead_score: lead.lead_score || 0,
      conversation_id: lead.extracted_entities?.conversation_id || lead.custom_fields?.conversation_id,
      interested_products: productInterests,
      value,
      order_count: orders.length,
      stock_hold_count: holds.filter((hold: any) => hold.status === 'active').length,
      owner_approval_count: pendingApprovals.length,
      active_hold: activeHold
        ? {
            reservation_id: activeHold.seller_reservation_id,
            product_id: activeHold.product_id,
            product_name: related.productMap.get(activeHold.product_id)?.name || 'Product',
            quantity: activeHold.quantity,
            expires_at: activeHold.expires_at,
          }
        : null,
      pending_payment: pendingPayment
        ? {
            order_id: pendingPayment.order_id,
            order_number: pendingPayment.order_number,
            amount: Number(pendingPayment.total_amount || 0),
            payment_method: pendingPayment.payment_method,
            expires_at: pendingPayment.payment_expires_at,
          }
        : null,
      latest_order: latestOrder
        ? {
            order_id: latestOrder.order_id,
            order_number: latestOrder.order_number,
            amount: Number(latestOrder.total_amount || 0),
            payment_status: latestOrder.payment_status,
            status: latestOrder.status,
            created_at: latestOrder.created_at,
          }
        : null,
      last_ai_action: latestAudit
        ? {
            employee: latestAudit.ai_employee_key,
            action: latestAudit.action,
            decision: latestAudit.decision,
            text: latestAudit.output_summary || latestAudit.input_summary,
            created_at: latestAudit.created_at,
          }
        : null,
      next_action: this.sellerLeadNextAction(stage, { activeHold, pendingPayment, pendingApprovals }),
      updated_at: this.latestIsoDate([
        lead.last_activity_at,
        lead.updated_at,
        latestOrder?.created_at,
        activeHold?.created_at,
        latestAudit?.created_at,
        demandSignals[0]?.created_at,
      ]),
      created_at: lead.created_at,
    };
  }

  private deriveSellerLeadStage(lead: any, related: any) {
    const rawStatus = String(lead.status || '').toLowerCase();
    if (['lost', 'cancelled', 'canceled', 'invalid'].includes(rawStatus)) return 'lost';
    if (lead.is_converted || related.wonOrder) return 'won';
    if (related.pendingApprovals?.length) return 'needs_owner';
    if (related.pendingPayment) return 'payment_waiting';
    if (related.activeHold) return 'stock_held';
    if (
      ['contacted', 'active', 'qualified', 'quoted', 'interested'].includes(rawStatus) ||
      related.audits?.length ||
      related.demandSignals?.length
    ) {
      return 'ai_chatting';
    }
    return 'new';
  }

  private sellerLeadStageLabel(stage: string) {
    const labels: Record<string, string> = {
      new: 'New enquiry',
      ai_chatting: 'AI chatting',
      stock_held: 'Stock held',
      payment_waiting: 'Payment waiting',
      needs_owner: 'Needs owner',
      won: 'Won',
      lost: 'Closed',
    };
    return labels[stage] || 'Customer enquiry';
  }

  private sellerLeadPriority(stage: string) {
    if (stage === 'needs_owner' || stage === 'payment_waiting') return 'high';
    if (stage === 'stock_held' || stage === 'new') return 'medium';
    return 'normal';
  }

  private sellerLeadNextAction(stage: string, related: any) {
    if (stage === 'needs_owner') return 'Owner decision needed';
    if (stage === 'payment_waiting') return 'Collect payment';
    if (stage === 'stock_held') return 'Send payment request';
    if (stage === 'won') return 'Prepare order or delivery';
    if (stage === 'lost') return 'Closed';
    if (stage === 'ai_chatting') return 'AI will continue follow-up';
    return 'Reply and qualify';
  }

  private buildSellerLeadProductInterests(lead: any, related: any) {
    const interests: any[] = [];
    const add = (input: any) => {
      if (!input) return;
      const productId = input.product_id || input.id;
      const name = input.name || input.product_name || input.item_name || input.title;
      if (!productId && !name) return;
      const key = productId || String(name).toLowerCase();
      if (interests.some((item) => item.key === key)) return;
      interests.push({
        key,
        product_id: productId,
        name: name || related.productMap.get(productId)?.name || 'Product',
        category: input.category || related.productMap.get(productId)?.category,
        quantity: input.quantity,
      });
    };

    const leadProducts = lead.interested_products;
    if (Array.isArray(leadProducts)) leadProducts.forEach(add);
    if (leadProducts && !Array.isArray(leadProducts)) add(leadProducts);
    add({ name: lead.extracted_entities?.product_name || lead.extracted_entities?.item_name });

    for (const order of related.orders || []) {
      for (const item of order.order_items || []) add(item);
    }
    for (const hold of related.holds || []) {
      add({
        product_id: hold.product_id,
        name: related.productMap.get(hold.product_id)?.name,
        category: related.productMap.get(hold.product_id)?.category,
        quantity: hold.quantity,
      });
    }
    for (const signal of related.demandSignals || []) {
      add({
        product_id: signal.product_id,
        name: related.productMap.get(signal.product_id)?.name || signal.metadata?.product_name,
        category: signal.category || related.productMap.get(signal.product_id)?.category,
        quantity: signal.quantity,
      });
    }

    return interests.slice(0, 4).map(({ key, ...item }) => item);
  }

  private buildSellerLeadCounts(cards: any[]) {
    const counts: Record<string, number> = {
      all: cards.length,
      new: 0,
      ai_chatting: 0,
      stock_held: 0,
      payment_waiting: 0,
      needs_owner: 0,
      won: 0,
      lost: 0,
    };
    for (const card of cards) {
      counts[card.stage] = (counts[card.stage] || 0) + 1;
    }
    return counts;
  }

  private sellerLeadStages(counts: Record<string, number>) {
    return [
      { key: 'all', label: 'All', count: counts.all || 0 },
      { key: 'new', label: 'New', count: counts.new || 0 },
      { key: 'ai_chatting', label: 'AI chatting', count: counts.ai_chatting || 0 },
      { key: 'stock_held', label: 'Stock held', count: counts.stock_held || 0 },
      { key: 'payment_waiting', label: 'Payment', count: counts.payment_waiting || 0 },
      { key: 'needs_owner', label: 'Needs owner', count: counts.needs_owner || 0 },
      { key: 'won', label: 'Won', count: counts.won || 0 },
      { key: 'lost', label: 'Closed', count: counts.lost || 0 },
    ];
  }

  private groupByValue(items: any[], key: string) {
    const grouped = new Map<string, any[]>();
    for (const item of items || []) {
      const value = item?.[key];
      if (!value) continue;
      const id = String(value);
      grouped.set(id, [...(grouped.get(id) || []), item]);
    }
    return grouped;
  }

  private groupByPhone(items: any[], getter: (item: any) => string | undefined) {
    const grouped = new Map<string, any[]>();
    for (const item of items || []) {
      const phone = this.cleanPhone(getter(item));
      if (!phone) continue;
      grouped.set(phone, [...(grouped.get(phone) || []), item]);
    }
    return grouped;
  }

  private dedupeById(items: any[], key: string) {
    const seen = new Set<string>();
    return (items || []).filter((item) => {
      const id = item?.[key];
      if (!id) return true;
      if (seen.has(String(id))) return false;
      seen.add(String(id));
      return true;
    });
  }

  private latestIsoDate(values: any[]) {
    const latest = values
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    return latest?.toISOString();
  }

  private async findDeadStock(businessId: string) {
    const rows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`
        SELECT p.product_id, p.name, p.category, p.stock_quantity, p.price, p.updated_at
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.product_id
        WHERE p.business_id = ${businessId}::uuid
          AND p.product_type = 'physical'
          AND p.is_active = true
          AND COALESCE(p.stock_quantity, 0) > 0
          AND oi.order_item_id IS NULL
        ORDER BY p.updated_at ASC
        LIMIT 8
      `,
    );

    return rows.map((row) => ({
      product_id: row.product_id,
      name: row.name,
      category: row.category,
      stock_quantity: row.stock_quantity,
      price: Number(row.price || 0),
      suggestion: 'Create a small offer or ask Marketing AI to recover dead stock',
    }));
  }

  private buildDemandHeatmap(signals: any[]) {
    const map = new Map<string, number>();
    for (const signal of signals) {
      const key = signal.category || 'Uncategorized';
      map.set(key, (map.get(key) || 0) + Number(signal.quantity || 1));
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category, inquiry_count]) => ({ category, inquiry_count }));
  }

  private async buildOnlineSellerIntelligence(
    ctx: any,
    signals: any[],
    lowStock: any[],
    deadStock: any[],
    lowStockThreshold: number,
  ) {
    const productIds = [
      ...new Set(
        [
          ...signals.map((signal: any) => signal.product_id),
          ...lowStock.map((product: any) => product.product_id),
          ...deadStock.map((product: any) => product.product_id),
        ].filter(Boolean),
      ),
    ];

    const products = productIds.length
      ? await this.db.products.findMany({
          where: { business_id: ctx.businessId, product_id: { in: productIds } },
          select: {
            product_id: true,
            name: true,
            category: true,
            price: true,
            stock_quantity: true,
            reserved_stock: true,
            in_stock: true,
            updated_at: true,
          },
        })
      : [];

    const productMap = new Map(products.map((product: any) => [product.product_id, product]));
    const demandMap = new Map<string, any>();

    for (const signal of signals) {
      if (!signal.product_id) continue;
      const product = productMap.get(signal.product_id);
      const key = signal.product_id;
      const quantity = Number(signal.quantity || 1);
      const current = demandMap.get(key) || {
        product_id: key,
        name: product?.name || signal.metadata?.product_name || 'Product',
        category: product?.category || signal.category || 'Uncategorized',
        price: Number(product?.price || 0),
        stock_quantity: Number(product?.stock_quantity || 0),
        reserved_stock: Number(product?.reserved_stock || 0),
        available_stock: Math.max(
          0,
          Number(product?.stock_quantity || 0) - Number(product?.reserved_stock || 0),
        ),
        asked_count: 0,
        sold_count: 0,
        hold_count: 0,
        out_of_stock_requests: 0,
        demand_score: 0,
        channels: {},
        last_signal_at: signal.created_at,
      };

      current.asked_count += quantity;
      current.channels[signal.channel || 'whatsapp'] = (current.channels[signal.channel || 'whatsapp'] || 0) + quantity;
      current.last_signal_at = signal.created_at || current.last_signal_at;

      switch (signal.signal_type) {
        case 'sale':
          current.sold_count += quantity;
          current.demand_score += quantity * 5;
          break;
        case 'stock_reserved':
          current.hold_count += quantity;
          current.demand_score += quantity * 3;
          break;
        case 'out_of_stock':
          current.out_of_stock_requests += quantity;
          current.demand_score += quantity * 4;
          break;
        case 'product_search':
          current.demand_score += quantity * 2;
          break;
        default:
          current.demand_score += quantity;
      }

      demandMap.set(key, current);
    }

    const demandedItems = [...demandMap.values()]
      .map((item) => ({
        ...item,
        recommendation: this.buildDemandItemRecommendation(item, lowStockThreshold),
      }))
      .sort((a, b) => b.demand_score - a.demand_score)
      .slice(0, 8);

    const outOfStockDemand = demandedItems
      .filter((item) => item.out_of_stock_requests > 0 || (item.available_stock <= 0 && item.asked_count > 0))
      .slice(0, 6);

    const fastMovingLowStock = demandedItems
      .filter((item) => item.available_stock > 0 && item.available_stock <= lowStockThreshold && item.demand_score >= 3)
      .slice(0, 6);

    return {
      period_days: 30,
      most_demanded_items: demandedItems,
      out_of_stock_demand: outOfStockDemand,
      fast_moving_low_stock: fastMovingLowStock,
      ai_recommendations: this.buildOnlineSellerRecommendations({
        demandedItems,
        outOfStockDemand,
        fastMovingLowStock,
        deadStock,
      }),
    };
  }

  private buildDemandItemRecommendation(item: any, lowStockThreshold: number) {
    if (item.out_of_stock_requests > 0 || item.available_stock <= 0) {
      return 'Restock or hide from chatbot until stock is back';
    }
    if (item.available_stock <= lowStockThreshold && item.demand_score >= 3) {
      return 'Restock before the next campaign';
    }
    if (item.sold_count > 0 || item.hold_count > 0) {
      return 'Keep visible in WhatsApp catalog';
    }
    return 'Watch demand and promote if enquiries continue';
  }

  private buildOnlineSellerRecommendations(input: any) {
    const recommendations = [];
    const topDemand = input.demandedItems[0];
    const topStockOut = input.outOfStockDemand[0];
    const topLowStock = input.fastMovingLowStock[0];
    const topDeadStock = input.deadStock[0];

    if (topStockOut) {
      recommendations.push({
        key: 'restock_out_of_stock',
        priority: 'high',
        title: `Restock ${topStockOut.name}`,
        text: `${topStockOut.out_of_stock_requests || topStockOut.asked_count} customer request(s) came when stock was unavailable.`,
        action: 'Restock or hide from chatbot',
      });
    }

    if (topLowStock) {
      recommendations.push({
        key: 'fast_moving_low_stock',
        priority: 'high',
        title: `${topLowStock.name} is moving fast`,
        text: `Only ${topLowStock.available_stock} available with strong demand.`,
        action: 'Restock before promoting',
      });
    }

    if (topDemand && !topStockOut && !topLowStock) {
      recommendations.push({
        key: 'promote_top_demand',
        priority: 'normal',
        title: `Promote ${topDemand.name}`,
        text: `${topDemand.asked_count} demand signal(s) in the last 30 days.`,
        action: 'Use in WhatsApp or Instagram campaign',
      });
    }

    if (topDeadStock) {
      recommendations.push({
        key: 'recover_dead_stock',
        priority: 'normal',
        title: `Recover old stock: ${topDeadStock.name}`,
        text: `Stock ${topDeadStock.stock_quantity ?? 0} is not moving.`,
        action: 'Create a small offer',
      });
    }

    if (!recommendations.length) {
      recommendations.push({
        key: 'collect_more_demand',
        priority: 'low',
        title: 'Keep collecting demand',
        text: 'AI will show stronger suggestions once more enquiries and sales come in.',
        action: 'Keep products visible',
      });
    }

    return recommendations.slice(0, 5);
  }

  private buildAiEmployees(input: any) {
    const employees = [
      {
        key: 'sales_ai',
        name: 'Sales AI',
        simple_job: 'Replies to WhatsApp enquiries, shows products, reserves stock and creates orders.',
        today: `${input.todayOrders} order(s), ${input.stockHolds} active hold(s)`,
        next: input.ownerQueue > 0 ? 'Waiting for owner decisions' : 'Follow up hot enquiries',
      },
      {
        key: 'marketing_ai',
        name: 'Marketing AI',
        simple_job: 'Finds products to promote and prepares campaign ideas.',
        today: input.demandHeatmap[0]?.category ? `Demand rising in ${input.demandHeatmap[0].category}` : 'Watching demand',
        next: 'Suggest campaign from demand heatmap',
      },
      {
        key: 'inventory_ai',
        name: 'Inventory AI',
        simple_job: 'Watches low stock, holds and possible double-selling risks.',
        today: `${input.lowStock} low-stock product(s)`,
        next: input.lowStock > 0 ? 'Ask owner to restock fast movers' : 'Keep stock clean',
      },
      {
        key: 'delivery_ai',
        name: 'Delivery Desk AI',
        simple_job: 'Tracks local deliveries, pickup and COD collection.',
        today: `${input.deliveriesWaiting} delivery task(s) waiting`,
        next: 'Prepare customer delivery updates',
      },
      {
        key: 'profit_coach',
        name: 'Profit Coach',
        simple_job: 'Looks for low-margin, slow-moving and dead stock products.',
        today: input.creditEnabled ? `Credit due ${input.creditDue}` : 'Watching margins',
        next: 'Recommend recovery offers',
      },
      {
        key: 'ai_guard',
        name: 'AI Guard',
        simple_job: input.creditEnabled
          ? 'Blocks risky discounts, refunds, credit and unclear promises until owner approval.'
          : 'Blocks risky discounts, refunds and unclear promises until owner approval.',
        today: `${input.ownerQueue} approval(s) queued`,
        next: 'Keep audit log clean',
      },
    ];

    if (input.creditEnabled) {
      employees.splice(4, 0, {
        key: 'credit_guard',
        name: 'Credit Guard',
        simple_job: 'Checks which buyers can use credit and tracks money due.',
        today: `Credit due ${input.creditDue}`,
        next: 'Watch due customers and owner approvals',
      });
    }

    return employees;
  }

  private publicProduct(product: any) {
    return {
      product_id: product.product_id,
      name: product.name,
      category: product.category,
      price: Number(product.price || 0),
      stock_quantity: product.stock_quantity,
      reserved_stock: product.reserved_stock || 0,
      in_stock: product.in_stock,
      sku: product.sku,
      currency: product.currency || 'INR',
    };
  }

  private publicStockProduct(product: any, profitSnapshot: any, lowStockThreshold = 5) {
    const stockQuantity = Number(product.stock_quantity || 0);
    const reservedStock = Number(product.reserved_stock || 0);
    const availableStock = Math.max(0, stockQuantity - reservedStock);
    const variants = (product.product_variants || []).map((variant: any) => {
      const quantity = Number(variant.quantity || 0);
      const reserved = Number(variant.reserved_stock || 0);
      return {
        variant_id: variant.variant_id,
        name: variant.name,
        sku: variant.sku,
        price: Number(variant.price || 0),
        quantity,
        reserved_stock: reserved,
        available_stock: Math.max(0, quantity - reserved),
        in_stock: quantity - reserved > 0,
      };
    });

    const stockStatus =
      !product.track_inventory
        ? 'not_tracked'
        : availableStock <= 0
          ? 'out_of_stock'
          : availableStock <= lowStockThreshold
            ? 'low_stock'
            : 'in_stock';

    return {
      product_id: product.product_id,
      id: product.product_id,
      name: product.name,
      description: product.description,
      category: product.category,
      sku: product.sku,
      price: Number(product.price || 0),
      compare_price: product.compare_price === null || product.compare_price === undefined ? undefined : Number(product.compare_price || 0),
      cost_price: profitSnapshot?.cost_price === null || profitSnapshot?.cost_price === undefined
        ? undefined
        : Number(profitSnapshot.cost_price || 0),
      margin_percent: profitSnapshot?.margin_percent === null || profitSnapshot?.margin_percent === undefined
        ? undefined
        : Number(profitSnapshot.margin_percent || 0),
      currency: product.currency || 'INR',
      track_inventory: product.track_inventory,
      stock_quantity: stockQuantity,
      reserved_stock: reservedStock,
      available_stock: availableStock,
      low_stock_threshold: lowStockThreshold,
      stock_status: stockStatus,
      in_stock: availableStock > 0,
      is_active: product.is_active,
      primary_image_url: product.primary_image_url,
      image_urls: product.image_urls,
      variants,
      updated_at: product.updated_at,
      created_at: product.created_at,
    };
  }

  private publicPaymentDeskOrder(order: any) {
    if (!order) return null;
    const expiresAt = order.payment_expires_at ? new Date(order.payment_expires_at) : null;
    const expiresInMinutes = expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 60000))
      : null;

    return {
      order_id: order.order_id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      customer_name: order.customers?.name,
      customer_phone: order.customers?.phone || order.shipping_phone,
      total_amount: Number(order.total_amount || 0),
      subtotal: Number(order.subtotal || 0),
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      payment_reference: order.payment_reference,
      payment_expires_at: order.payment_expires_at,
      payment_expires_in_minutes: expiresInMinutes,
      paid_at: order.paid_at,
      status: order.status,
      source: order.source,
      shipping_address: order.shipping_address,
      shipping_phone: order.shipping_phone,
      created_at: order.created_at,
      items: (order.order_items || []).map((item: any) => ({
        order_item_id: item.order_item_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.variant_name ? `${item.product_name} - ${item.variant_name}` : item.product_name,
        quantity: item.quantity,
        unit_price: Number(item.unit_price || 0),
        total_price: Number(item.total_price || 0),
      })),
    };
  }

  private publicPaymentHold(hold: any, product: any) {
    const price = Number(product?.price || 0);
    const total = price * Number(hold.quantity || 1);
    const expiresAt = hold.expires_at ? new Date(hold.expires_at) : null;
    return {
      reservation_id: hold.seller_reservation_id,
      product_id: hold.product_id,
      variant_id: hold.variant_id,
      product_name: product?.name || 'Product',
      category: product?.category,
      quantity: hold.quantity,
      customer_phone: hold.customer_phone,
      payment_order_id: hold.converted_order_id,
      estimated_amount: total,
      status: hold.status,
      expires_at: hold.expires_at,
      expires_in_minutes: expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 60000)) : null,
      source: hold.source,
    };
  }

  private buildPaymentMessage(order: any, reservation: any) {
    const amount = Number(order?.total_amount || 0);
    const method = String(order?.payment_method || 'upi').toUpperCase();
    const until = reservation?.expires_at ? new Date(reservation.expires_at).toLocaleString('en-IN') : 'the hold time';

    if (order?.payment_method === 'cod') {
      return `Order ${order.order_number} is ready for COD. Amount Rs ${amount}. Stock is held until ${until}.`;
    }

    return `Order ${order?.order_number} is ready. Amount Rs ${amount}. Please pay by ${method} and share the reference before ${until}.`;
  }

  private buildSellerFeatures(settings: any) {
    if (!settings) {
      return {
        store_type: 'not_configured',
        online_sales: true,
        whatsapp_sales: true,
        website_sales: true,
        manual_counter_sale: true,
        wholesale_sales: false,
        credit_sales: false,
        credit: false,
      };
    }

    const storeType = settings?.store_type || 'product_seller';
    const explicitCredit =
      settings?.credit_defaults?.enabled ?? settings?.ai_guardrails?.credit_enabled;
    const creditSales =
      explicitCredit !== undefined
        ? Boolean(explicitCredit)
        : storeType !== 'online_seller';

    return {
      store_type: storeType,
      online_sales: true,
      whatsapp_sales: true,
      website_sales: storeType === 'online_seller',
      manual_counter_sale: storeType !== 'online_seller',
      wholesale_sales: storeType === 'wholesale_seller',
      credit_sales: creditSales,
      credit: creditSales,
    };
  }

  private publicCreditAccount(account: any) {
    if (!account) return null;
    const creditLimit = Number(account.credit_limit || 0);
    const currentBalance = Number(account.current_balance || 0);
    const availableCredit = Math.max(0, creditLimit - currentBalance);
    const decision = this.buildCreditDecision(account);

    return {
      credit_account_id: account.credit_account_id,
      customer_id: account.customer_id,
      phone: account.phone,
      customer_name: account.customer_name,
      status: account.status,
      credit_limit: creditLimit,
      current_balance: currentBalance,
      available_credit: availableCredit,
      due_days: account.due_days,
      notes: account.notes,
      can_use_credit: decision.can_use_credit,
      credit_label: decision.label,
      credit_message: decision.message,
      created_at: account.created_at,
      updated_at: account.updated_at,
    };
  }

  private publicCreditTransaction(transaction: any) {
    return {
      credit_transaction_id: transaction.credit_transaction_id,
      credit_account_id: transaction.credit_account_id,
      order_id: transaction.order_id,
      transaction_type: transaction.transaction_type,
      amount: Number(transaction.amount || 0),
      due_date: transaction.due_date,
      paid_at: transaction.paid_at,
      notes: transaction.notes,
      created_at: transaction.created_at,
    };
  }

  private buildCreditDecision(account: any, amount = 0) {
    if (!account) {
      return {
        status: 'unknown',
        can_use_credit: false,
        needs_owner_approval: true,
        label: 'Ask owner',
        message: 'This customer is not added for credit yet.',
        available_credit: 0,
      };
    }

    const creditLimit = Number(account.credit_limit || 0);
    const currentBalance = Number(account.current_balance || 0);
    const availableCredit = Math.max(0, creditLimit - currentBalance);

    if (account.status !== 'approved') {
      return {
        status: account.status,
        can_use_credit: false,
        needs_owner_approval: account.status !== 'blocked',
        label: account.status === 'blocked' ? 'Credit blocked' : 'Ask owner',
        message:
          account.status === 'blocked'
            ? 'Credit is blocked for this customer.'
            : 'Owner approval is needed before giving credit.',
        available_credit: availableCredit,
      };
    }

    if (amount > 0 && amount > availableCredit) {
      return {
        status: 'over_limit',
        can_use_credit: false,
        needs_owner_approval: true,
        label: 'Limit reached',
        message: `This customer can use ${availableCredit} more credit.`,
        available_credit: availableCredit,
      };
    }

    return {
      status: 'approved',
      can_use_credit: true,
      needs_owner_approval: false,
      label: 'Credit allowed',
      message: `Credit allowed. Available credit ${availableCredit}.`,
      available_credit: availableCredit,
    };
  }

  private cleanStringList(value: string[] | undefined, fallback: string[]) {
    const cleaned = (value || [])
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    return cleaned.length > 0 ? [...new Set(cleaned)] : fallback;
  }

  private cleanPhone(phone?: string) {
    return phone ? phone.replace(/[^\d+]/g, '') : undefined;
  }

  private requirePhone(phone?: string) {
    const cleaned = this.cleanPhone(phone);
    if (!cleaned) throw new BadRequestException('Customer phone is required');
    return cleaned;
  }

  private toMoney(value: any) {
    const parsed = Number(String(value ?? 0).replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  private toNonNegativeInt(value: any) {
    const parsed = Math.floor(Number(String(value ?? 0).replace(/[^\d.-]/g, '')));
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  private cleanStockReason(value: any) {
    const cleaned = String(value || 'manual_correction')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_ -]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 80);
    return cleaned || 'manual_correction';
  }

  private simpleImportError(error: any) {
    const message = String(error?.message || error || 'Could not save row');
    if (message.includes('Stock cannot be less than held quantity')) return message;
    if (message.includes('Unique constraint') || message.includes('duplicate key')) return 'SKU already exists';
    if (message.includes('Product not found')) return 'Product not found for this seller';
    return message.replace(/\n/g, ' ').slice(0, 180);
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateOrderNumber() {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `SO-${stamp}-${random}`;
  }

  private get db(): any {
    return this.prisma as any;
  }
}
