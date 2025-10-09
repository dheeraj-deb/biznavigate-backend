import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ProductSyncService } from '../services/product-sync.service';

@Controller('api/ai/products/sync')
export class ProductSyncController {
  constructor(private productSync: ProductSyncService) {}

  /**
   * Sync all products for an organization to vector database
   */
  @Post(':organizationId/all')
  async syncAllProducts(@Param('organizationId') organizationId: string) {
    try {
      const result = await this.productSync.syncAllProductsToVector(organizationId);

      return {
        success: true,
        message: `Synced ${result.synced} products in ${result.timeElapsed}ms`,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sync a single product to vector database
   */
  @Post(':organizationId/product/:productId')
  async syncSingleProduct(
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string
  ) {
    try {
      await this.productSync.syncProductToVector(productId, organizationId);

      return {
        success: true,
        message: `Product ${productId} synced successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check sync status for an organization
   */
  @Get(':organizationId/status')
  async getSyncStatus(@Param('organizationId') organizationId: string) {
    try {
      const status = await this.productSync.checkSyncStatus(organizationId);

      return {
        success: true,
        data: status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove a product from vector database
   */
  @Post(':organizationId/product/:productId/remove')
  async removeProduct(
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string
  ) {
    try {
      await this.productSync.removeProductFromVector(productId, organizationId);

      return {
        success: true,
        message: `Product ${productId} removed from vector database`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Manual trigger for product update (for testing)
   */
  @Post(':organizationId/product/:productId/update')
  async handleProductUpdate(
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string,
    @Body() body: { action: 'created' | 'updated' | 'deleted' }
  ) {
    try {
      await this.productSync.handleProductUpdate(productId, organizationId, body.action);

      return {
        success: true,
        message: `Product ${body.action} event handled for ${productId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}