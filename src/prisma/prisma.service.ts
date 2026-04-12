import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../../generated/prisma";
import { TenantContext } from "./tenant-context";

/**
 * Models that have a tenant_id column and must be automatically scoped.
 * All read/write operations on these models will have tenant_id injected
 * from TenantContext when it's available.
 */
const TENANT_SCOPED_MODELS = new Set([
  'leads',
  'lead_activities',
  'lead_conversations',
  'lead_messages',
  'tags',
  'lead_notes',
  'lead_status_history',
  'lead_followups',
  'lead_duplicates',
  'lead_scoring_rules',
  'lead_score_history',
  'products',
  'product_categories',
  'product_reviews',
  'customers',
  'orders',
  'order_items',
  'payments',
  'carts',
  'cart_items',
  'campaigns',
  'campaign_recipients',
  'tasks',
  'business_workflows',
  'workflow_executions',
  'inventory_levels',
  'stock_movements',
  'stock_transfers',
  'stock_alerts',
  'stock_counts',
  'warehouses',
  'notification_templates',
  'notification_messages',
  'service_bookings',
  'pricing_rules',
  'hotel_pricing_recommendations',
  'course_batches',
]);

/** Operations where tenant_id goes into args.where */
const READ_OPS = new Set([
  'findFirst',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
]);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.registerTenantMiddleware();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private registerTenantMiddleware(): void {
    this.$use(async (params, next) => {
      const tenantId = TenantContext.getTenantId();

      // Skip if no tenant context (background jobs, superadmin, public routes)
      if (!tenantId || !params.model) {
        return next(params);
      }

      const model = params.model.toLowerCase();

      // Skip models that don't have tenant_id
      if (!TENANT_SCOPED_MODELS.has(model)) {
        return next(params);
      }

      const action = params.action;

      if (READ_OPS.has(action)) {
        params.args = params.args ?? {};
        params.args.where = params.args.where ?? {};
        // Only inject if not already explicitly set (respects service-level overrides)
        if (!params.args.where.tenant_id) {
          params.args.where.tenant_id = tenantId;
        }
      } else if (action === 'create') {
        params.args = params.args ?? {};
        params.args.data = params.args.data ?? {};
        if (!params.args.data.tenant_id) {
          params.args.data.tenant_id = tenantId;
        }
      } else if (action === 'createMany') {
        params.args = params.args ?? {};
        if (Array.isArray(params.args.data)) {
          params.args.data = params.args.data.map((item: any) => ({
            tenant_id: tenantId,
            ...item,
          }));
        }
      } else if (action === 'upsert') {
        params.args = params.args ?? {};
        params.args.where = params.args.where ?? {};
        params.args.create = params.args.create ?? {};
        if (!params.args.where.tenant_id) {
          params.args.where.tenant_id = tenantId;
        }
        if (!params.args.create.tenant_id) {
          params.args.create.tenant_id = tenantId;
        }
      }

      return next(params);
    });
  }
}
