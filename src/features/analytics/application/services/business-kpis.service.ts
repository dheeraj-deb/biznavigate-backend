import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BusinessKPIsDto } from '../dto/analytics-response.dto';

/**
 * Business KPIs Service
 * Provides key performance indicators for overall business health
 */
@Injectable()
export class BusinessKPIsService {
  private readonly logger = new Logger(BusinessKPIsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive business KPIs
   */
  async getBusinessKPIs(
    businessId: string,
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BusinessKPIsDto> {
    this.logger.log(`Getting business KPIs for business ${businessId}`);

    const [
      orderStats,
      orderTimingStats,
      inventoryStats,
      returnedOrders,
      customerCount,
    ] = await Promise.all([
      // Order statistics
      this.prisma.orders.aggregate({
        where: {
          business_id: businessId,
          tenant_id: tenantId,
          created_at: { gte: startDate, lte: endDate },
          status: { not: 'cancelled' },
        },
        _count: { order_id: true },
        _sum: { total_amount: true },
      }),

      // Order processing time statistics
      this.prisma.$queryRaw<
        Array<{
          avg_processing_hours: number;
          shipped_count: bigint;
          total_count: bigint;
        }>
      >`
        SELECT
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600)::DECIMAL as avg_processing_hours,
          COUNT(CASE WHEN status IN ('shipped', 'delivered') THEN 1 END)::BIGINT as shipped_count,
          COUNT(*)::BIGINT as total_count
        FROM orders
        WHERE business_id = ${businessId}::uuid
          AND tenant_id = ${tenantId}::uuid
          AND created_at >= ${startDate}::timestamp
          AND created_at <= ${endDate}::timestamp
          AND status != 'cancelled'
      `,

      // Inventory statistics for turnover
      this.prisma.$queryRaw<
        Array<{
          avg_inventory_value: number;
          total_sold_value: number;
        }>
      >`
        SELECT
          AVG(il.available_quantity * pv.price)::DECIMAL as avg_inventory_value,
          COALESCE(SUM(
            CASE WHEN im.movement_type IN ('deduct', 'sale')
            THEN ABS(im.quantity_change) * pv.price
            ELSE 0 END
          ), 0)::DECIMAL as total_sold_value
        FROM inventory_levels il
        JOIN product_variants pv ON il.variant_id = pv.variant_id
        LEFT JOIN inventory_movements im ON il.variant_id = im.variant_id
          AND im.business_id = ${businessId}::uuid
          AND im.movement_date >= ${startDate}::timestamp
          AND im.movement_date <= ${endDate}::timestamp
        WHERE il.business_id = ${businessId}::uuid
          AND il.tenant_id = ${tenantId}::uuid
      `,

      // Returned/cancelled orders
      this.prisma.orders.count({
        where: {
          business_id: businessId,
          tenant_id: tenantId,
          created_at: { gte: startDate, lte: endDate },
          status: { in: ['returned', 'refunded'] },
        },
      }),

      // Total customers who placed orders
      this.prisma.orders.findMany({
        where: {
          business_id: businessId,
          tenant_id: tenantId,
          created_at: { gte: startDate, lte: endDate },
          status: { not: 'cancelled' },
        },
        select: { customer_id: true },
        distinct: ['customer_id'],
      }),
    ]);

    // Calculate KPIs
    const totalOrders = orderStats._count.order_id;
    const totalRevenue = Number(orderStats._sum.total_amount || 0);

    // Average Order Value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order Fulfillment Rate
    const shippedCount = Number(orderTimingStats[0]?.shipped_count || 0);
    const totalCount = Number(orderTimingStats[0]?.total_count || 0);
    const orderFulfillmentRate =
      totalCount > 0 ? (shippedCount / totalCount) * 100 : 0;

    // Average Processing Time
    const averageProcessingTime = Number(
      orderTimingStats[0]?.avg_processing_hours || 0,
    );

    // Return Rate
    const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;

    // Revenue Per Customer
    const uniqueCustomers = customerCount.length;
    const revenuePerCustomer =
      uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

    // Inventory Turnover Ratio
    const avgInventoryValue = Number(
      inventoryStats[0]?.avg_inventory_value || 0,
    );
    const totalSoldValue = Number(inventoryStats[0]?.total_sold_value || 0);
    const inventoryTurnoverRatio =
      avgInventoryValue > 0 ? totalSoldValue / avgInventoryValue : 0;

    // Conversion Rate (placeholder - would need session tracking data)
    const conversionRate = 0; // TODO: Implement when session tracking is available

    // Customer Acquisition Cost (placeholder - would need marketing spend data)
    const customerAcquisitionCost = 0; // TODO: Implement when marketing data is available

    // Gross Profit Margin (placeholder - would need cost data)
    const grossProfitMargin = 0; // TODO: Implement when product cost data is available

    return {
      conversionRate,
      averageOrderValue,
      customerAcquisitionCost,
      orderFulfillmentRate,
      averageProcessingTime,
      returnRate,
      revenuePerCustomer,
      inventoryTurnoverRatio,
      grossProfitMargin,
    };
  }

  /**
   * Get dashboard summary with all key metrics
   */
  async getDashboardSummary(businessId: string, tenantId: string) {
    this.logger.log(`Getting dashboard summary for business ${businessId}`);
    return this.getMonthlyComparison(businessId, tenantId);
  }

  async getMonthlyComparison(businessId: string, tenantId: string) {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currOrders, prevOrders, currCustomers, prevCustomers] = await Promise.all([
      this.prisma.orders.aggregate({
        where: { business_id: businessId, tenant_id: tenantId, created_at: { gte: thisMonthStart }, status: { not: 'cancelled' } },
        _sum: { total_amount: true },
        _count: { _all: true },
      }),
      this.prisma.orders.aggregate({
        where: { business_id: businessId, tenant_id: tenantId, created_at: { gte: lastMonthStart, lte: lastMonthEnd }, status: { not: 'cancelled' } },
        _sum: { total_amount: true },
        _count: { _all: true },
      }),
      this.prisma.customers.count({
        where: { business_id: businessId, tenant_id: tenantId },
      }),
      this.prisma.customers.count({
        where: { business_id: businessId, tenant_id: tenantId, created_at: { lte: lastMonthEnd } },
      }),
    ]);

    const pct = (curr: number, prev: number): number => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 1000) / 10;
    };

    const totalRevenue   = Number(currOrders._sum.total_amount ?? 0);
    const totalOrders    = currOrders._count._all;
    const totalCustomers = currCustomers;
    const conversionRate = totalOrders > 0
      ? Math.round((totalOrders / Math.max(totalCustomers, 1)) * 1000) / 10
      : 0;

    const prevRevenue   = Number(prevOrders._sum.total_amount ?? 0);
    const prevOrders_   = prevOrders._count._all;
    const prevCustomers_ = prevCustomers;
    const prevConvRate  = prevOrders_ > 0
      ? Math.round((prevOrders_ / Math.max(prevCustomers_, 1)) * 1000) / 10
      : 0;

    return {
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        conversionRate,
        revenueChange:    pct(totalRevenue, prevRevenue),
        ordersChange:     pct(totalOrders, prevOrders_),
        customersChange:  pct(totalCustomers, prevCustomers_),
        conversionChange: pct(conversionRate, prevConvRate),
      },
    };
  }

  async getLeadFunnel(businessId: string) {
    const rows = await this.prisma.$queryRaw<{ status: string; count: number }[]>`
      SELECT status, COUNT(*)::int AS count
      FROM leads
      WHERE business_id = ${businessId}::uuid AND deleted_at IS NULL
      GROUP BY status
    `;
    const map = Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
    return ['new', 'active', 'quoted', 'booked', 'won', 'lost'].map((stage) => ({
      stage,
      count: map[stage] ?? 0,
    }));
  }
}
