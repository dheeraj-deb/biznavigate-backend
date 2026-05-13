import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { WhatsAppApiClientService } from '../../infrastructure/whatsapp-api-client.service';

/**
 * WhatsApp catalog sync — pending migration to catalog_items.
 * The old products table has been replaced by catalog_items.
 * These methods need to be rebuilt to sync catalog_items to Meta's catalog API.
 */
@Injectable()
export class WhatsAppCatalogService {
  private readonly logger = new Logger(WhatsAppCatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappApiClient: WhatsAppApiClientService,
    private readonly configService: ConfigService,
  ) {}

  async toggleProductInCatalog(productId: string, businessId: string, inCatalog: boolean) {
    throw new NotImplementedException('WhatsApp catalog sync not yet migrated to catalog_items');
  }

  async bulkUpdateCatalog(businessId: string, updates: any[]) {
    throw new NotImplementedException('WhatsApp catalog sync not yet migrated to catalog_items');
  }

  async getCatalogProducts(businessId: string, filters?: Record<string, any>) {
    return this.prisma.catalog_items.findMany({
      where: { business_id: businessId, is_active: true, deleted_at: null },
      select: { item_id: true, name: true, base_price: true, stock_quantity: true, primary_image_url: true, item_type: true },
      take: 100,
    });
  }

  async syncToWhatsApp(businessId: string) {
    throw new NotImplementedException('WhatsApp catalog sync not yet migrated to catalog_items');
  }

  async removeFromWhatsAppCatalog(productId: string, businessId: string) {
    throw new NotImplementedException('WhatsApp catalog sync not yet migrated to catalog_items');
  }

  async syncProductAvailabilityToCatalog(productId: string): Promise<void> {
    this.logger.warn(`syncProductAvailabilityToCatalog stub called for item ${productId}`);
  }

  async getCatalogId(business_id: string): Promise<string> {
    throw new NotImplementedException('WhatsApp catalog sync not yet migrated to catalog_items');
  }

  async getSyncStatus(businessId: string) {
    return { totalProducts: 0, synced: 0, pending: 0, failed: 0, lastSync: null };
  }
}
