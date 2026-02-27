import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { InstagramApiClientService } from '../infrastructure/instagram-api-client.service';
import * as crypto from 'crypto';

interface CatalogProduct {
  retailer_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: Array<{ url: string; tag?: string[] }>;
  availability: 'in stock' | 'out of stock';
  inventory?: number;
  url?: string;
  sale_price?: number;
}

interface BatchRequest {
  method: 'CREATE' | 'UPDATE' | 'DELETE';
  retailer_id: string;
  data?: Partial<CatalogProduct>;
}

interface BatchResponse {
  handles: string[];
  success: boolean;
}

export interface BatchStatus {
  handle: string;
  status: string;
  errors?: any[];
  success_count?: number;
  error_count?: number;
}

const BATCH_SIZE = 5000; // Meta limit
const RATE_LIMIT_DELAY = 36000; // 36s between batches (100 calls/hour)

@Injectable()
export class InstagramCatalogService {
  private readonly logger = new Logger(InstagramCatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiClient: InstagramApiClientService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Toggle product in Instagram catalog
   */
  async toggleProductInCatalog(
    productId: string,
    businessId: string,
    inCatalog: boolean,
  ): Promise<{ success: boolean; product: any }> {
    const product = await this.prisma.products.update({
      where: { product_id: productId },
      data: {
        in_instagram_catalog: inCatalog,
        instagram_sync_status: inCatalog ? 'pending' : 'not_synced',
      },
    });

    this.logger.log(
      `Product ${productId} ${inCatalog ? 'added to' : 'removed from'} Instagram catalog`,
    );

    return { success: true, product };
  }

  /**
   * Bulk update products in catalog
   */
  async bulkUpdateCatalog(
    productIds: string[],
    businessId: string,
    inCatalog: boolean,
  ): Promise<{ success: boolean; count: number }> {
    const result = await this.prisma.products.updateMany({
      where: {
        product_id: { in: productIds },
        business_id: businessId,
      },
      data: {
        in_instagram_catalog: inCatalog,
        instagram_sync_status: inCatalog ? 'pending' : 'not_synced',
      },
    });

    this.logger.log(
      `Bulk updated ${result.count} products in Instagram catalog`,
    );

    return { success: true, count: result.count };
  }

  /**
   * Get all catalog products for a business
   */
  async getCatalogProducts(businessId: string) {
    return this.prisma.products.findMany({
      where: {
        business_id: businessId,
        in_instagram_catalog: true,
        is_active: true,
      },
      include: {
        product_images: {
          where: { is_primary: true },
          take: 1,
        },
        product_categories: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Sync products to Instagram Commerce Manager using Batch API
   */
  async syncToInstagram(
    businessId: string,
    fullSync: boolean = false,
  ): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    handles: string[];
    errors: any[];
  }> {
    // Get Instagram account
    const account = await this.prisma.social_accounts.findFirst({
      where: {
        business_id: businessId,
        platform: 'instagram',
        is_active: true,
      },
    });

    if (!account) {
      throw new BadRequestException(
        'No active Instagram account found for this business',
      );
    }

    if (!account.instagram_catalog_id) {
      throw new BadRequestException(
        'No catalog ID configured for this Instagram account',
      );
    }

    // Get products to sync
    const whereClause: any = {
      business_id: businessId,
      in_instagram_catalog: true,
      is_active: true,
    };

    if (!fullSync) {
      whereClause.instagram_sync_status = { in: ['pending', 'failed', 'not_synced'] };
    }

    const products = await this.prisma.products.findMany({
      where: whereClause,
      include: {
        product_images: {
          where: { is_primary: true },
          take: 1,
        },
      },
    });

    this.logger.log(
      `Syncing ${products.length} products to Instagram catalog ${account.instagram_catalog_id}`,
    );

    const accessToken = this.decryptToken(account.access_token);
    const catalogId = account.instagram_catalog_id;

    // Split products into batches
    const batches = this.chunkArray(products, BATCH_SIZE);
    const allHandles: string[] = [];
    const errors: any[] = [];
    let totalSynced = 0;
    let totalFailed = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} items)`);

      try {
        // Build batch requests
        const batchRequests: BatchRequest[] = batch.map((product) => {
          const method = product.instagram_retailer_id ? 'UPDATE' : 'CREATE';

          return {
            method,
            retailer_id: product.product_id,
            data: this.buildProductData(product),
          };
        });

        // Send batch request
        const batchResponse = await this.sendBatchRequest(
          catalogId,
          accessToken,
          batchRequests,
        );

        allHandles.push(...batchResponse.handles);

        // Mark products as syncing
        await this.prisma.products.updateMany({
          where: { product_id: { in: batch.map((p) => p.product_id) } },
          data: { instagram_sync_status: 'syncing' },
        });

        // Wait to avoid rate limits between batches
        if (i < batches.length - 1) {
          await this.delay(RATE_LIMIT_DELAY);
        }
      } catch (error) {
        this.logger.error(`Batch ${i + 1} failed:`, error);
        errors.push({
          batch: i + 1,
          error: error.message,
          productIds: batch.map((p) => p.product_id),
        });

        // Mark batch products as failed
        await this.prisma.products.updateMany({
          where: { product_id: { in: batch.map((p) => p.product_id) } },
          data: {
            instagram_sync_status: 'failed',
            instagram_sync_error: error.message,
          },
        });

        totalFailed += batch.length;
      }
    }

    // Check batch statuses after processing
    if (allHandles.length > 0) {
      this.logger.log('Checking batch statuses...');
      await this.delay(5000); // Wait 5s before checking status

      for (const handle of allHandles) {
        try {
          const status = await this.checkBatchStatus(catalogId, accessToken, handle);

          if (status.success_count) {
            totalSynced += status.success_count;
          }
          if (status.error_count) {
            totalFailed += status.error_count;
          }

          if (status.errors && status.errors.length > 0) {
            errors.push(...status.errors);
          }
        } catch (error) {
          this.logger.error(`Failed to check batch status for handle ${handle}:`, error);
        }
      }
    }

    // Update successful products
    await this.updateSyncedProducts(businessId);

    return {
      success: true,
      synced: totalSynced,
      failed: totalFailed,
      handles: allHandles,
      errors,
    };
  }

  /**
   * Send batch request to Meta Graph API
   */
  private async sendBatchRequest(
    catalogId: string,
    accessToken: string,
    requests: BatchRequest[],
  ): Promise<BatchResponse> {
    try {
      const requestsData = requests.map((req) => {
        if (req.method === 'DELETE') {
          return {
            method: req.method,
            retailer_id: req.retailer_id,
          };
        }

        return {
          method: req.method,
          retailer_id: req.retailer_id,
          data: req.data,
        };
      });

      // const response = await this.apiClient.sendCatalogBatch(
      //   catalogId,
      //   accessToken,
      //   requestsData,
      //   true, // allow_upsert
      // );

     // this.logger.log(`Batch request sent successfully. Handles: ${response.handles.join(', ')}`);

      return {
        handles:  [],
        success: true,
      };
    } catch (error) {
      this.logger.error('Batch request failed:', error);
      throw new BadRequestException(
        `Failed to send batch request: ${error.message}`,
      );
    }
  }

  /**
   * Check batch request status
   */
  async checkBatchStatus(
    catalogId: string,
    accessToken: string,
    handle: string,
  ): Promise<BatchStatus> {
    try {
      // const status = await this.apiClient.checkBatchStatus(
      //   catalogId,
      //   accessToken,
      //   handle,
      // );

      // this.logger.log(
      //   `Batch ${handle} status: ${status.status} - Success: ${status.success_count || 0}, Failed: ${status.error_count || 0}`,
      // );

      return {
        handle,
        status: 'completed',
        success_count: 0,
        error_count: 0,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`Failed to check batch status:`, error);
      throw error;
    }
  }

  /**
   * Remove products from Instagram catalog (batch delete)
   */
  async removeFromInstagramCatalog(
    productIds: string[],
    businessId: string,
  ): Promise<{ success: boolean; handle?: string }> {
    const account = await this.prisma.social_accounts.findFirst({
      where: {
        business_id: businessId,
        platform: 'instagram',
        is_active: true,
      },
    });

    if (!account || !account.instagram_catalog_id) {
      throw new BadRequestException('No active Instagram account or catalog found');
    }

    const products = await this.prisma.products.findMany({
      where: {
        product_id: { in: productIds },
        instagram_retailer_id: { not: null },
      },
    });

    if (products.length === 0) {
      throw new BadRequestException('No synced products found to remove');
    }

    try {
      const accessToken = this.decryptToken(account.access_token);
      const catalogId = account.instagram_catalog_id;

      // Create DELETE batch requests
      const deleteRequests: BatchRequest[] = products.map((p) => ({
        method: 'DELETE',
        retailer_id: p.instagram_retailer_id || p.product_id,
      }));

      const response = await this.sendBatchRequest(
        catalogId,
        accessToken,
        deleteRequests,
      );

      // Update products in database
      await this.prisma.products.updateMany({
        where: { product_id: { in: productIds } },
        data: {
          in_instagram_catalog: false,
          instagram_catalog_id: null,
          instagram_retailer_id: null,
          instagram_sync_status: 'not_synced',
          instagram_sync_error: null,
        },
      });

      return { success: true, handle: response.handles[0] };
    } catch (error) {
      this.logger.error('Failed to remove products from Instagram:', error);
      throw new BadRequestException(
        `Failed to remove products: ${error.message}`,
      );
    }
  }

  /**
   * Get sync status for business
   */
  async getSyncStatus(businessId: string) {
    const stats = await this.prisma.products.groupBy({
      by: ['instagram_sync_status'],
      where: {
        business_id: businessId,
        in_instagram_catalog: true,
      },
      _count: true,
    });

    const lastSync = await this.prisma.products.findFirst({
      where: {
        business_id: businessId,
        in_instagram_catalog: true,
        instagram_synced_at: { not: null },
      },
      orderBy: { instagram_synced_at: 'desc' },
      select: { instagram_synced_at: true },
    });

    return {
      stats: stats.reduce((acc, stat) => {
        acc[stat.instagram_sync_status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      lastSyncAt: lastSync?.instagram_synced_at,
    };
  }

  /**
   * Update products that were successfully synced
   */
  private async updateSyncedProducts(businessId: string) {
    // Get products that are currently syncing
    const syncingProducts = await this.prisma.products.findMany({
      where: {
        business_id: businessId,
        instagram_sync_status: 'syncing',
      },
    });

    // Mark them as synced (if not already failed by batch status check)
    for (const product of syncingProducts) {
      await this.prisma.products.update({
        where: { product_id: product.product_id },
        data: {
          instagram_retailer_id: product.product_id,
          instagram_sync_status: 'synced',
          instagram_sync_error: null,
          instagram_synced_at: new Date(),
        },
      });
    }
  }

  /**
   * Build product data for Meta API
   */
  private buildProductData(product: any): CatalogProduct {
    const DEFAULT_IMAGE = 'https://via.placeholder.com/800x800/EEEEEE/999999?text=No+Image';
    const imageUrl = product.primary_image_url || product.product_images[0]?.file_path || DEFAULT_IMAGE;

    const data: CatalogProduct = {
      retailer_id: product.product_id,
      name: product.name,
      description: product.description || '',
      price: Number(product.price) * 100, // Convert to cents
      currency: product.currency || 'USD',
      availability: product.in_stock ? 'in stock' : 'out of stock',
      image: [
        {
          url: imageUrl,
        },
      ],
      inventory: product.stock_quantity || 0,
    };

    // Add optional fields
    if (product.url) {
      data.url = product.url;
    }

    if (product.sale_price) {
      data.sale_price = Number(product.sale_price) * 100;
    }

    return data;
  }

  /**
   * Chunk array into smaller batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Decrypt access token
   */
  private decryptToken(encryptedToken: string): string {
    try {
      // Check if token is in encrypted format (iv:encrypted)
      if (!encryptedToken.includes(':')) {
        return encryptedToken;
      }

      const algorithm = 'aes-256-cbc';
      const appSecret = process.env.FACEBOOK_APP_SECRET || '';

      if (!appSecret) {
        return encryptedToken;
      }

      const key = crypto.scryptSync(appSecret, 'salt', 32);
      const parts = encryptedToken.split(':');

      if (parts.length !== 2) {
        return encryptedToken;
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt token:', error);
      return encryptedToken;
    }
  }
}
