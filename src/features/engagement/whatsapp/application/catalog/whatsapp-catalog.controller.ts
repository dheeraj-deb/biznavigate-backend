import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Delete,
  Query,
} from '@nestjs/common';
import { WhatsAppCatalogService } from './whatsapp-catalog.service';
import {
  ToggleProductInCatalogDto,
  BulkToggleCatalogDto,
  SyncCatalogDto,
  ImportWhatsAppCatalogDto,
} from '../../dto/whatsapp-catalog.dto';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';

@Controller('whatsapp/catalog')
@UseGuards(JwtAuthGuard)
export class WhatsAppCatalogController {
  constructor(
    private readonly catalogService: WhatsAppCatalogService,
  ) {}

  /**
   * Get all products in catalog
   */
  @Get()
  async getCatalogProducts(@Req() req: any) {
    return this.catalogService.getCatalogProducts(req.user.business_id);
  }

  /**
   * Preview existing WhatsApp catalog before importing to local inventory.
   */
  @Get('import/preview')
  async previewImport(@Req() req: any, @Query('limit') limit?: string) {
    return this.catalogService.previewImport(req.user.business_id, Number(limit) || 100);
  }

  /**
   * Import existing WhatsApp catalog products into catalog_items.
   */
  @Post('import')
  async importCatalog(@Req() req: any, @Body() dto: ImportWhatsAppCatalogDto) {
    return this.catalogService.importFromWhatsApp(
      req.user.business_id,
      req.user.tenant_id,
      dto.limit ?? 100,
    );
  }

  /**
   * Toggle single product in catalog
   */
  @Post('toggle')
  async toggleProduct(
    @Req() req: any,
    @Body() dto: ToggleProductInCatalogDto,
  ) {
    return this.catalogService.toggleProductInCatalog(
      dto.productId,
      req.user.business_id,
      dto.inCatalog,
    );
  }

  @Post(':businessId/toggle')
  async toggleProductLegacy(
    @Req() req: any,
    @Param('businessId') _businessId: string,
    @Body() dto: ToggleProductInCatalogDto,
  ) {
    return this.catalogService.toggleProductInCatalog(dto.productId, req.user.business_id, dto.inCatalog);
  }

  /**
   * Bulk toggle products in catalog
   */
  @Post('bulk-toggle')
  async bulkToggle(
    @Req() req: any,
    @Body() dto: BulkToggleCatalogDto,
  ) {
    return this.catalogService.bulkUpdateCatalog(req.user.business_id, dto.productIds);
  }

  /**
   * Sync catalog products to WhatsApp
   */
  @Post('sync')
  async syncCatalog(
    @Req() req: any,
    @Body() dto: SyncCatalogDto,
  ) {
    return this.catalogService.syncToWhatsApp(req.user.business_id);
  }

  /**
   * Remove product from WhatsApp catalog
   */
  @Delete('product/:productId')
  async removeProduct(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    return this.catalogService.removeFromWhatsAppCatalog(productId, req.user.business_id);
  }

  /**
   * Get sync status
   */
  @Get('sync-status')
  async getSyncStatus(@Req() req: any) {
    return this.catalogService.getSyncStatus(req.user.business_id);
  }

  @Get(':businessId/sync-status')
  async getSyncStatusLegacy(@Req() req: any, @Param('businessId') _businessId: string) {
    return this.catalogService.getSyncStatus(req.user.business_id);
  }

  /**
   * Backward-compatible route. The URL businessId is ignored for tenant safety.
   */
  @Get(':businessId')
  async getCatalogProductsLegacy(@Req() req: any, @Param('businessId') _businessId: string) {
    return this.catalogService.getCatalogProducts(req.user.business_id);
  }
}
