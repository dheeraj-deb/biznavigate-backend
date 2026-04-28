import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SalesAnalyticsService } from '../application/services/sales-analytics.service';
import { InventoryAnalyticsService } from '../application/services/inventory-analytics.service';
import { CustomerAnalyticsService } from '../application/services/customer-analytics.service';
import { BusinessKPIsService } from '../application/services/business-kpis.service';
import {
  AnalyticsQueryDto,
  TopProductsQueryDto,
} from '../application/dto/analytics-query.dto';
import {
  SalesAnalyticsDto,
  TopProductDto,
  InventoryAnalyticsDto,
  CustomerAnalyticsDto,
  BusinessKPIsDto,
  DashboardSummaryDto,
} from '../application/dto/analytics-response.dto';

/**
 * Analytics Controller
 * Provides comprehensive business analytics and reporting endpoints
 */@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly salesAnalyticsService: SalesAnalyticsService,
    private readonly inventoryAnalyticsService: InventoryAnalyticsService,
    private readonly customerAnalyticsService: CustomerAnalyticsService,
    private readonly businessKPIsService: BusinessKPIsService,
  ) {}

  /**
   * Get dashboard summary with all key metrics
   */
  @Get('dashboard')  async getDashboardSummary(
    @Query('businessId') businessId: string,
    @Query('tenantId') tenantId: string,
  ) {
    this.logger.log(`Dashboard summary requested for business ${businessId}`);
    return this.businessKPIsService.getMonthlyComparison(businessId, tenantId);
  }

  /**
   * Get sales analytics
   */
  @Get('sales')  async getSalesAnalytics(@Query() query: AnalyticsQueryDto) {
    this.logger.log(`Sales analytics requested for business ${query.businessId}`);

    const { startDate, endDate } = this.parseDateRange(query);

    return this.salesAnalyticsService.getSalesAnalytics(
      query.businessId,
      query.tenantId,
      startDate,
      endDate,
    );
  }

  /**
   * Get top selling products
   */
  @Get('sales/top-products')  async getTopProducts(@Query() query: TopProductsQueryDto) {
    this.logger.log(`Top products requested for business ${query.businessId}`);

    const { startDate, endDate } = this.parseDateRange(query);

    return this.salesAnalyticsService.getTopProducts(
      query.businessId,
      query.tenantId,
      startDate,
      endDate,
      query.limit || 10,
    );
  }

  /**
   * Get revenue by time period
   */
  @Get('sales/revenue-by-period')  async getRevenueByPeriod(
    @Query('businessId') businessId: string,
    @Query('tenantId') tenantId: string,
    @Query('period') period: 'hour' | 'day' | 'week' | 'month' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Revenue by period requested for business ${businessId}`);

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const raw = await this.salesAnalyticsService.getRevenueByPeriod(
      businessId,
      tenantId,
      start,
      end,
      period,
    );
    return raw.map((r) => ({ date: r.period, revenue: r.revenue, orders: r.orders }));
  }

  @Get('funnel')  getFunnel(@Query('businessId') businessId: string) {
    return this.businessKPIsService.getLeadFunnel(businessId);
  }

  @Get('occupancy')  getOccupancy(
    @Query('businessId') businessId: string,
    @Query('tenantId') tenantId: string,
    @Query('days') days?: string,
  ) {
    return this.businessKPIsService.getOccupancy(businessId, tenantId, days ? Number(days) : 30);
  }

  /**
   * Get inventory analytics
   */
  @Get('inventory')  async getInventoryAnalytics(
    @Query('businessId') businessId: string,
    @Query('tenantId') tenantId: string,
  ) {
    this.logger.log(`Inventory analytics requested for business ${businessId}`);

    return this.inventoryAnalyticsService.getInventoryAnalytics(
      businessId,
      tenantId,
    );
  }

  /**
   * Get low stock alerts
   */
  @Get('inventory/low-stock-alerts')  async getLowStockAlerts(
    @Query('businessId') businessId: string,
    @Query('tenantId') tenantId: string,
  ) {
    this.logger.log(`Low stock alerts requested for business ${businessId}`);

    return this.inventoryAnalyticsService.getLowStockAlerts(businessId, tenantId);
  }

  /**
   * Get inventory turnover by product
   */
  @Get('inventory/turnover-by-product')  async getInventoryTurnoverByProduct(@Query() query: AnalyticsQueryDto) {
    this.logger.log(`Inventory turnover requested for business ${query.businessId}`);

    const { startDate, endDate } = this.parseDateRange(query);

    return this.inventoryAnalyticsService.getInventoryTurnoverByProduct(
      query.businessId,
      query.tenantId,
      startDate,
      endDate,
    );
  }

  /**
   * Get customer analytics
   */
  @Get('customers')  async getCustomerAnalytics(@Query() query: AnalyticsQueryDto) {
    this.logger.log(`Customer analytics requested for business ${query.businessId}`);

    const { startDate, endDate } = this.parseDateRange(query);

    return this.customerAnalyticsService.getCustomerAnalytics(
      query.businessId,
      query.tenantId,
      startDate,
      endDate,
    );
  }

  /**
   * Get customer cohort analysis
   */
  @Get('customers/cohort-analysis')  async getCustomerCohortAnalysis(
    @Query('businessId') businessId: string,
    @Query('tenantId') tenantId: string,
    @Query('cohortMonth') cohortMonth: string,
  ) {
    this.logger.log(`Cohort analysis requested for business ${businessId}`);

    const cohortDate = new Date(cohortMonth);

    return this.customerAnalyticsService.getCustomerCohortAnalysis(
      businessId,
      tenantId,
      cohortDate,
    );
  }

  /**
   * Get customer churn analysis
   */
  @Get('customers/churn-analysis')  async getCustomerChurnAnalysis(
    @Query('businessId') businessId: string,
    @Query('tenantId') tenantId: string,
    @Query('inactiveDays') inactiveDays?: string,
  ) {
    this.logger.log(`Churn analysis requested for business ${businessId}`);

    return this.customerAnalyticsService.getCustomerChurnAnalysis(
      businessId,
      tenantId,
      Number(inactiveDays || '90'),
    );
  }

  /**
   * Get business KPIs
   */
  @Get('kpis')  async getBusinessKPIs(@Query() query: AnalyticsQueryDto) {
    this.logger.log(`Business KPIs requested for business ${query.businessId}`);

    const { startDate, endDate } = this.parseDateRange(query);

    return this.businessKPIsService.getBusinessKPIs(
      query.businessId,
      query.tenantId,
      startDate,
      endDate,
    );
  }

  /**
   * Parse date range from query parameters
   */
  private parseDateRange(query: AnalyticsQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();

    // If period preset is provided, use it
    if (query.period) {
      switch (query.period) {
        case 'today':
          return {
            startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            endDate: now,
          };
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return {
            startDate: new Date(
              yesterday.getFullYear(),
              yesterday.getMonth(),
              yesterday.getDate(),
            ),
            endDate: new Date(
              yesterday.getFullYear(),
              yesterday.getMonth(),
              yesterday.getDate(),
              23,
              59,
              59,
            ),
          };
        case 'last7days':
          return {
            startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            endDate: now,
          };
        case 'last30days':
          return {
            startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: now,
          };
        case 'thisMonth':
          return {
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: now,
          };
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return {
            startDate: lastMonth,
            endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
          };
        case 'thisYear':
          return {
            startDate: new Date(now.getFullYear(), 0, 1),
            endDate: now,
          };
      }
    }

    // If custom dates provided, use them
    if (query.startDate && query.endDate) {
      return {
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
      };
    }

    // Default to last 30 days
    return {
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: now,
    };
  }
}
