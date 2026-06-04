import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SalesAnalyticsService } from '../application/services/sales-analytics.service';
import { InventoryAnalyticsService } from '../application/services/inventory-analytics.service';
import { CustomerAnalyticsService } from '../application/services/customer-analytics.service';
import { BusinessKPIsService } from '../application/services/business-kpis.service';
import {
  AnalyticsQueryDto,
  TopProductsQueryDto,
} from '../application/dto/analytics-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly salesAnalyticsService: SalesAnalyticsService,
    private readonly inventoryAnalyticsService: InventoryAnalyticsService,
    private readonly customerAnalyticsService: CustomerAnalyticsService,
    private readonly businessKPIsService: BusinessKPIsService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  @Get('dashboard')
  async getDashboardSummary(@Req() req: any) {
    const businessId: string = req.user.business_id;
    const tenantId: string = req.user.tenant_id;
    const cacheKey = `analytics:dashboard:${businessId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    const result = await this.businessKPIsService.getMonthlyComparison(businessId, tenantId);
    await this.cache.set(cacheKey, result, 300);
    return result;
  }

  @Get('sales')
  async getSalesAnalytics(@Query() query: AnalyticsQueryDto, @Req() req: any) {
    const businessId: string = req.user.business_id;
    const tenantId: string = req.user.tenant_id;
    const { startDate, endDate } = this.parseDateRange(query);
    return this.salesAnalyticsService.getSalesAnalytics(businessId, tenantId, startDate, endDate);
  }

  @Get('sales/top-products')
  async getTopProducts(@Query() query: TopProductsQueryDto, @Req() req: any) {
    const businessId: string = req.user.business_id;
    const tenantId: string = req.user.tenant_id;
    const { startDate, endDate } = this.parseDateRange(query);
    return this.salesAnalyticsService.getTopProducts(businessId, tenantId, startDate, endDate, query.limit || 10);
  }

  @Get('sales/revenue-by-period')
  async getRevenueByPeriod(
    @Req() req: any,
    @Query('period') period: 'hour' | 'day' | 'week' | 'month' = 'day',
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    const businessId: string = req.user.business_id;
    const tenantId: string = req.user.tenant_id;
    const start = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDateStr ? new Date(endDateStr) : new Date();
    const raw = await this.salesAnalyticsService.getRevenueByPeriod(businessId, tenantId, start, end, period);
    return raw.map((r) => ({ date: r.period, revenue: r.revenue, orders: r.orders }));
  }

  @Get('funnel')
  getFunnel(@Req() req: any) {
    return this.businessKPIsService.getLeadFunnel(req.user.business_id);
  }

  @Get('occupancy')
  getOccupancy(@Query('days') days: string, @Req() req: any) {
    return this.businessKPIsService.getOccupancy(
      req.user.business_id,
      req.user.tenant_id,
      days ? Number(days) : 30,
    );
  }

  @Get('inventory')
  async getInventoryAnalytics(@Req() req: any) {
    return this.inventoryAnalyticsService.getInventoryAnalytics(req.user.business_id, req.user.tenant_id);
  }

  @Get('inventory/low-stock-alerts')
  async getLowStockAlerts(@Req() req: any) {
    return this.inventoryAnalyticsService.getLowStockAlerts(req.user.business_id, req.user.tenant_id);
  }

  @Get('inventory/turnover-by-product')
  async getInventoryTurnoverByProduct(@Query() query: AnalyticsQueryDto, @Req() req: any) {
    const businessId: string = req.user.business_id;
    const tenantId: string = req.user.tenant_id;
    const { startDate, endDate } = this.parseDateRange(query);
    return this.inventoryAnalyticsService.getInventoryTurnoverByProduct(businessId, tenantId, startDate, endDate);
  }

  @Get('customers')
  async getCustomerAnalytics(@Query() query: AnalyticsQueryDto, @Req() req: any) {
    const businessId: string = req.user.business_id;
    const tenantId: string = req.user.tenant_id;
    const { startDate, endDate } = this.parseDateRange(query);
    return this.customerAnalyticsService.getCustomerAnalytics(businessId, tenantId, startDate, endDate);
  }

  @Get('customers/cohort-analysis')
  async getCustomerCohortAnalysis(
    @Query('cohortMonth') cohortMonth: string,
    @Req() req: any,
  ) {
    return this.customerAnalyticsService.getCustomerCohortAnalysis(
      req.user.business_id,
      req.user.tenant_id,
      new Date(cohortMonth),
    );
  }

  @Get('customers/churn-analysis')
  async getCustomerChurnAnalysis(
    @Query('inactiveDays') inactiveDays: string,
    @Req() req: any,
  ) {
    return this.customerAnalyticsService.getCustomerChurnAnalysis(
      req.user.business_id,
      req.user.tenant_id,
      Number(inactiveDays || '90'),
    );
  }

  @Get('kpis')
  async getBusinessKPIs(@Query() query: AnalyticsQueryDto, @Req() req: any) {
    const businessId: string = req.user.business_id;
    const tenantId: string = req.user.tenant_id;
    const { startDate, endDate } = this.parseDateRange(query);
    return this.businessKPIsService.getBusinessKPIs(businessId, tenantId, startDate, endDate);
  }

  private parseDateRange(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    const now = new Date();
    if (query.period) {
      switch (query.period) {
        case 'today':
          return { startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()), endDate: now };
        case 'yesterday': {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return {
            startDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
            endDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59),
          };
        }
        case 'last7days':
          return { startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), endDate: now };
        case 'last30days':
          return { startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), endDate: now };
        case 'thisMonth':
          return { startDate: new Date(now.getFullYear(), now.getMonth(), 1), endDate: now };
        case 'lastMonth': {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return { startDate: lastMonth, endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59) };
        }
        case 'thisYear':
          return { startDate: new Date(now.getFullYear(), 0, 1), endDate: now };
      }
    }
    if (query.startDate && query.endDate) {
      return { startDate: new Date(query.startDate), endDate: new Date(query.endDate) };
    }
    return { startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), endDate: now };
  }
}
