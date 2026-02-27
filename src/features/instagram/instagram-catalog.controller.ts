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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InstagramCatalogService } from './services/instagram-catalog.service';
import {
  ToggleProductInCatalogDto,
  BulkToggleCatalogDto,
  SyncCatalogDto,
  CheckBatchStatusDto,
} from './dto/instagram-catalog.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Instagram Catalog')
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
  @Get(':businessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all products in Instagram catalog for a business' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getCatalogProducts(@Param('businessId') businessId: string) {
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
  @Post(':businessId/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or remove a single product from Instagram catalog' })
  @ApiResponse({ status: 200, description: 'Product toggled successfully' })
  async toggleProduct(
    @Param('businessId') businessId: string,
    @Body() dto: ToggleProductInCatalogDto,
  ) {
    this.logger.log(
      `Toggling product ${dto.productId} - inCatalog: ${dto.inCatalog}`,
    );
    const result = await this.catalogService.toggleProductInCatalog(
      dto.productId,
      businessId,
      dto.inCatalog,
    );
    return {
      success: true,
      data: result.product,
      message: `Product ${dto.inCatalog ? 'added to' : 'removed from'} Instagram catalog`,
    };
  }

  /**
   * Bulk toggle products in Instagram catalog
   */
  @Post(':businessId/bulk-toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk add or remove products from Instagram catalog' })
  @ApiResponse({ status: 200, description: 'Products toggled successfully' })
  async bulkToggle(
    @Param('businessId') businessId: string,
    @Body() dto: BulkToggleCatalogDto,
  ) {
    this.logger.log(
      `Bulk toggling ${dto.productIds.length} products - inCatalog: ${dto.inCatalog}`,
    );
    const result = await this.catalogService.bulkUpdateCatalog(
      dto.productIds,
      businessId,
      dto.inCatalog,
    );
    return {
      success: true,
      count: result.count,
      message: `${result.count} products ${dto.inCatalog ? 'added to' : 'removed from'} Instagram catalog`,
    };
  }

  /**
   * Sync catalog products to Instagram using Meta Graph API Batch
   */
  @Post(':businessId/sync')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sync products to Instagram Commerce Manager using Meta Graph API v24.0 Batch',
    description: 'Syncs products in batches of up to 5,000 items. Returns batch handles for status tracking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync initiated successfully',
  })
  async syncCatalog(
    @Param('businessId') businessId: string,
    @Body() dto: SyncCatalogDto,
  ) {
    this.logger.log(
      `Starting catalog sync for business ${businessId} - Full sync: ${dto.fullSync || false}`,
    );

    const result = await this.catalogService.syncToInstagram(
      businessId,
      dto.fullSync,
    );

    return {
      success: true,
      data: {
        synced: result.synced,
        failed: result.failed,
        handles: result.handles,
        errors: result.errors,
      },
      message: `Sync completed. ${result.synced} products synced, ${result.failed} failed.`,
    };
  }

  /**
   * Check batch request status
   */
  @Get(':businessId/batch-status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check the status of a batch request',
    description: 'Get detailed status of a batch sync operation using the batch handle',
  })
  @ApiResponse({ status: 200, description: 'Batch status retrieved' })
  async checkBatchStatus(
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

    const accessToken = this.catalogService['decryptToken'](account.access_token);
    const status = await this.catalogService.checkBatchStatus(
      account.instagram_catalog_id,
      accessToken,
      dto.handle,
    );

    return {
      success: true,
      data: status,
    };
  }

  /**
   * Remove products from Instagram catalog (batch delete)
   */
  @Delete(':businessId/products')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove products from Instagram catalog',
    description: 'Batch delete products from Instagram Commerce Manager',
  })
  @ApiResponse({ status: 200, description: 'Products removed successfully' })
  async removeProducts(
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
  @Get(':businessId/sync-status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get catalog sync status and statistics',
    description: 'Returns sync statistics and last sync timestamp',
  })
  @ApiResponse({ status: 200, description: 'Sync status retrieved' })
  async getSyncStatus(@Param('businessId') businessId: string) {
    this.logger.log(`Getting sync status for business ${businessId}`);

    const status = await this.catalogService.getSyncStatus(businessId);

    return {
      success: true,
      data: status,
    };
  }
}
