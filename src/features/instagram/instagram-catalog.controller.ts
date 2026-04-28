import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import { InstagramCatalogService } from './services/instagram-catalog.service';
import {
  ToggleProductInCatalogDto,
  BulkToggleCatalogDto,
  SyncCatalogDto,
  CheckBatchStatusDto,
} from './dto/instagram-catalog.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('instagram/catalog')
@UseGuards(JwtAuthGuard)
export class InstagramCatalogController {
  private readonly logger = new Logger(InstagramCatalogController.name);

  constructor(
    private readonly catalogService: InstagramCatalogService,
  ) {}

  /**
   * Get all products in Instagram catalog
   */
  @Get(':businessId')  async getCatalogProducts(@Param('businessId') businessId: string) {
    this.logger.log(`Getting catalog products for business ${businessId}`);
    const products = await this.catalogService.getCatalogProducts(businessId);
    return {
      success: true,
      data: products,
      count: products.length,
    };
  }

  /**
   * Toggle single product in Instagram catalog
   */
  @Post(':businessId/toggle')  async toggleProduct(
    @Param('businessId') businessId: string,
    @Body() dto: ToggleProductInCatalogDto,
  ) {
    this.logger.log(
      `Toggling product ${dto.productId} - inCatalog: ${dto.inCatalog}`,
    );
    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  /**
   * Bulk toggle products in Instagram catalog
   */
  @Post(':businessId/bulk-toggle')  async bulkToggle(
    @Param('businessId') businessId: string,
    @Body() dto: BulkToggleCatalogDto,
  ) {
    this.logger.log(
      `Bulk toggling ${dto.productIds.length} products - inCatalog: ${dto.inCatalog}`,
    );
    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  /**
   * Sync catalog products to Instagram using Meta Graph API Batch
   */
  @Post(':businessId/sync')
  @HttpCode(HttpStatus.OK)  async syncCatalog(
    @Param('businessId') businessId: string,
    @Body() dto: SyncCatalogDto,
  ) {
    this.logger.log(
      `Starting catalog sync for business ${businessId} - Full sync: ${dto.fullSync || false}`,
    );

    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  /**
   * Check batch request status
   */
  @Get(':businessId/batch-status')  async checkBatchStatus(
    @Param('businessId') businessId: string,
    @Query() dto: CheckBatchStatusDto,
  ) {
    this.logger.log(`Checking batch status for handle: ${dto.handle}`);

    // Get Instagram account to retrieve catalog ID and token
    const account = await this.catalogService['prisma'].social_accounts.findFirst({
      where: {
        business_id: businessId,
        platform: 'instagram',
        is_active: true,
      },
    });

    if (!account || !account.instagram_catalog_id) {
      return {
        success: false,
        message: 'No active Instagram account or catalog found',
      };
    }

    throw new NotImplementedException('Instagram catalog sync not yet migrated to catalog_items');
  }

  /**
   * Remove products from Instagram catalog (batch delete)
   */
  @Delete(':businessId/products')  async removeProducts(
    @Param('businessId') businessId: string,
    @Body() dto: { productIds: string[] },
  ) {
    this.logger.log(
      `Removing ${dto.productIds.length} products from Instagram catalog`,
    );

    const result = await this.catalogService.removeFromInstagramCatalog(
      dto.productIds,
      businessId,
    );

    return {
      success: true,
      data: result,
      message: `${dto.productIds.length} products removed from Instagram catalog`,
    };
  }

  /**
   * Get sync status for business
   */
  @Get(':businessId/sync-status')  async getSyncStatus(@Param('businessId') businessId: string) {
    this.logger.log(`Getting sync status for business ${businessId}`);

    const status = await this.catalogService.getSyncStatus(businessId);

    return {
      success: true,
      data: status,
    };
  }
}
