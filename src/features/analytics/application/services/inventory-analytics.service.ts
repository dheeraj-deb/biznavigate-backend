import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class InventoryAnalyticsService {
  private readonly logger = new Logger(InventoryAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getInventoryAnalytics(businessId: string, tenantId: string) {
    this.logger.log(`Getting inventory analytics for business ${businessId}`);

    const [totalItems, lowStockItems] = await Promise.all([
      this.prisma.catalog_items.count({ where: { business_id: businessId, is_active: true, deleted_at: null } }),
      this.prisma.catalog_items.count({
        where: {
          business_id: businessId,
          is_active: true,
          deleted_at: null,
          stock_quantity: { not: null, lt: 10 },
        },
      }),
    ]);

    return { totalProducts: totalItems, lowStockAlerts: lowStockItems, activeBookings: 0 };
  }

  async getLowStockAlerts(businessId: string, tenantId: string) {
    return this.prisma.catalog_items.findMany({
      where: {
        business_id: businessId,
        is_active: true,
        deleted_at: null,
        stock_quantity: { not: null, lt: 10 },
      },
      select: { item_id: true, name: true, stock_quantity: true, category: true },
      orderBy: { stock_quantity: 'asc' },
    });
  }

  async getInventoryTurnoverByProduct(
    businessId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.prisma.catalog_items.findMany({
      where: { business_id: businessId, is_active: true, deleted_at: null },
      select: {
        item_id: true,
        name: true,
        stock_quantity: true,
        category: true,
        item_type: true,
      },
    });
  }
}
