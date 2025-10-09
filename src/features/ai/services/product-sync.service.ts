import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VectorDatabaseService } from './vector-database.service';
import { AIProductMatcherService } from './ai-product-matcher.service';

@Injectable()
export class ProductSyncService {
  private readonly logger = new Logger(ProductSyncService.name);

  constructor(
    private prisma: PrismaService,
    private vectorDb: VectorDatabaseService,
    private aiMatcher: AIProductMatcherService
  ) {}

  /**
   * Sync a single product to vector database
   */
  async syncProductToVector(productId: string, organizationId: string): Promise<void> {
    try {
      const product = await this.prisma.products.findUnique({
        where: {
          id: productId,
          organization_id: organizationId,
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          description: true,
          category_id: true,
          sku: true,
          selling_price: true
        }
      });

      if (!product) {
        this.logger.warn(`Product ${productId} not found or inactive`);
        return;
      }

      // Generate embedding for product
      const searchText = `${product.name} ${product.description || ''}`;
      const embedding = await this.aiMatcher.generateEmbedding(searchText);

      // Store in vector database
      await this.vectorDb.storeProductEmbeddings(organizationId, [{
        productId: product.id,
        name: product.name,
        description: product.description,
        category: product.category_id,
        embedding,
        metadata: {
          sku: product.sku,
          sellingPrice: product.selling_price,
          lastSynced: new Date().toISOString()
        }
      }]);

      this.logger.log(`Synced product ${product.name} to vector database`);

    } catch (error) {
      this.logger.error(`Failed to sync product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Sync all products for an organization to vector database
   */
  async syncAllProductsToVector(organizationId: string): Promise<{
    synced: number;
    errors: number;
    timeElapsed: number;
  }> {
    const startTime = Date.now();
    let synced = 0;
    let errors = 0;

    try {
      this.logger.log(`Starting full product sync for organization: ${organizationId}`);

      // Get all active products
      const products = await this.prisma.products.findMany({
        where: {
          organization_id: organizationId,
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          description: true,
          category_id: true,
          sku: true,
          selling_price: true
        }
      });

      this.logger.log(`Found ${products.length} products to sync`);

      // Process in batches
      const batchSize = 10;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        try {
          // Generate embeddings for the batch
          const embeddings = await Promise.all(
            batch.map(async (product) => {
              const searchText = `${product.name} ${product.description || ''}`;
              const embedding = await this.aiMatcher.generateEmbedding(searchText);

              return {
                productId: product.id,
                name: product.name,
                description: product.description,
                category: product.category_id,
                embedding,
                metadata: {
                  sku: product.sku,
                  sellingPrice: product.selling_price,
                  lastSynced: new Date().toISOString()
                }
              };
            })
          );

          // Store batch in vector database
          await this.vectorDb.storeProductEmbeddings(organizationId, embeddings);

          synced += batch.length;
          this.logger.log(`Synced batch ${Math.floor(i / batchSize) + 1}: ${batch.length} products`);

        } catch (error) {
          this.logger.error(`Failed to sync batch starting at index ${i}:`, error);
          errors += batch.length;
        }
      }

      const timeElapsed = Date.now() - startTime;

      this.logger.log(
        `Product sync completed: ${synced} synced, ${errors} errors in ${timeElapsed}ms`
      );

      return { synced, errors, timeElapsed };

    } catch (error) {
      const timeElapsed = Date.now() - startTime;
      this.logger.error('Product sync failed:', error);
      return { synced, errors: errors + 1, timeElapsed };
    }
  }

  /**
   * Remove product from vector database
   */
  async removeProductFromVector(productId: string, organizationId: string): Promise<void> {
    try {
      // For pgvector implementation
      await this.prisma.$executeRaw`
        DELETE FROM product_embeddings
        WHERE product_id = ${productId} AND organization_id = ${organizationId}
      `;

      this.logger.log(`Removed product ${productId} from vector database`);

    } catch (error) {
      this.logger.error(`Failed to remove product ${productId} from vector:`, error);
      throw error;
    }
  }

  /**
   * Check if organization's products are synced to vector database
   */
  async checkSyncStatus(organizationId: string): Promise<{
    totalProducts: number;
    syncedProducts: number;
    lastSyncDate: string | null;
    needsSync: boolean;
  }> {
    try {
      // Count total active products
      const totalProducts = await this.prisma.products.count({
        where: {
          organization_id: organizationId,
          status: 'active'
        }
      });

      // Count synced products in vector database
      const syncedResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as synced_count
        FROM product_embeddings
        WHERE organization_id = ${organizationId}
      `;

      const syncedProducts = parseInt((syncedResult as any[])[0]?.synced_count || '0');

      // Get last sync date
      const lastSyncResult = await this.prisma.$queryRaw`
        SELECT MAX(updated_at) as last_sync
        FROM product_embeddings
        WHERE organization_id = ${organizationId}
      `;

      const lastSyncDate = (lastSyncResult as any[])[0]?.last_sync?.toISOString() || null;

      const needsSync = syncedProducts < totalProducts || !lastSyncDate;

      return {
        totalProducts,
        syncedProducts,
        lastSyncDate,
        needsSync
      };

    } catch (error) {
      this.logger.error('Failed to check sync status:', error);
      return {
        totalProducts: 0,
        syncedProducts: 0,
        lastSyncDate: null,
        needsSync: true
      };
    }
  }

  /**
   * Auto-sync products based on database triggers/events
   */
  async handleProductUpdate(productId: string, organizationId: string, action: 'created' | 'updated' | 'deleted'): Promise<void> {
    try {
      switch (action) {
        case 'created':
        case 'updated':
          await this.syncProductToVector(productId, organizationId);
          break;
        case 'deleted':
          await this.removeProductFromVector(productId, organizationId);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to handle product ${action} for ${productId}:`, error);
    }
  }
}