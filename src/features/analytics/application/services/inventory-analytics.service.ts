import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class InventoryAnalyticsService {
  private readonly logger = new Logger(InventoryAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getInventoryAnalytics(businessId: string, tenantId: string) {
    this.logger.log(`Getting inventory analytics for business ${businessId}`);

    const [totalProducts, lowStockAlerts, activeBookings] = await Promise.all([
      this.prisma.products.count({ where: { business_id: businessId, is_active: true } }),
      this.prisma.product_stock_alerts.count({ where: { business_id: businessId, status: 'active' } }),
      this.prisma.service_bookings.count({ where: { business_id: businessId, status: 'confirmed' } }),
    ]);

    return { totalProducts, lowStockAlerts, activeBookings };
  }

  async getLowStockAlerts(businessId: string, tenantId: string) {
    return this.prisma.product_stock_alerts.findMany({
      where: { business_id: businessId, status: 'active' },
      orderBy: { created_at: 'desc' },
    });
  }

  async getInventoryTurnoverByProduct(
    businessId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.prisma.products.findMany({
      where: { business_id: businessId, is_active: true },
      select: {
        product_id: true,
        name: true,
        stock_quantity: true,
        low_stock_threshold: true,
        sku: true,
      },
    });
  }
}
