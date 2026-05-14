import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';
import { InstagramApiClientService } from '../infrastructure/instagram-api-client.service';

/**
 * Instagram catalog sync — pending migration to catalog_items.
 * The old products table has been replaced by catalog_items.
 * These methods need to be rebuilt to sync catalog_items to Meta's Instagram catalog API.
 */
@Injectable()
export class InstagramCatalogService {
  private readonly logger = new Logger(InstagramCatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly instagramApiClient: InstagramApiClientService,
    private readonly configService: ConfigService,
  ) {}

  async toggleProductInCatalog(productId: string, businessId: string, inCatalog: boolean) {
    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  async bulkUpdateCatalog(businessId: string, updates: any[]) {
    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  async getCatalogProducts(businessId: string) {
    return this.prisma.catalog_items.findMany({
      where: { business_id: businessId, is_active: true, deleted_at: null },
      select: { item_id: true, name: true, base_price: true, stock_quantity: true, primary_image_url: true, item_type: true },
      take: 100,
    });
  }

  async syncToInstagram(businessId: string, fullSync = false) {
    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  async checkBatchStatus(businessId: string, handles: string[]) {
    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  async removeFromInstagramCatalog(productIds: string[], businessId: string) {
    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  async getSyncStatus(businessId: string) {
    return { totalProducts: 0, synced: 0, pending: 0, failed: 0, lastSync: null };
  }

  private async updateSyncedProducts(businessId: string) {
    this.logger.warn(`updateSyncedProducts stub called for business ${businessId}`);
  }

  private buildProductData(product: any): any {
    return {
      retailer_id: product.item_id,
      name: product.name,
      price: Number(product.base_price),
      currency: product.currency ?? 'INR',
      availability: (product.stock_quantity ?? 1) > 0 ? 'in stock' : 'out of stock',
      image: product.primary_image_url ? [{ url: product.primary_image_url }] : [],
    };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
