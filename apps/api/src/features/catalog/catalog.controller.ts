import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CatalogService, CreateCatalogItemDto, UpdateCatalogItemDto, QueryCatalogDto, SetAvailabilityDto, BlockDateDto, CreateVariantDto, UpdateVariantDto } from '@biznavigate/catalog';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  BUSINESS_CATALOG_CONFIG,
  DEFAULT_ITEM_TYPES,
  ATTRIBUTE_SCHEMAS,
} from './catalog.config';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Config (frontend form schema) ───────────────────────────────────────

  @Get('config')
  async getConfig(@Query('businessId') businessId: string) {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: { business_type: true },
    });

    const businessType = business?.business_type ?? null;
    const config = businessType ? BUSINESS_CATALOG_CONFIG[businessType] : null;

    const allowed_item_types = config?.item_types ?? DEFAULT_ITEM_TYPES;
    const item_type_labels = config?.labels ?? {
      physical_product: 'Products',
      accommodation: 'Accommodation',
      activity: 'Activities',
      service: 'Services',
    };

    const attribute_schemas: Record<string, any> = {};
    for (const type of allowed_item_types) {
      if (ATTRIBUTE_SCHEMAS[type]) {
        attribute_schemas[type] = ATTRIBUTE_SCHEMAS[type];
      }
    }

    return { allowed_item_types, attribute_schemas, item_type_labels };
  }

  // ─── Chatbot / agent query ────────────────────────────────────────────────

  @Get('query')
  queryForAgent(@Query() filters: QueryCatalogDto) {
    return this.catalogService.queryForAgent(filters);
  }

  // ─── Catalog CRUD ─────────────────────────────────────────────────────────

  @Get()
  getItems(@Query() filters: QueryCatalogDto) {
    return this.catalogService.getItems(filters);
  }

  @Post()
  createItem(@Req() req: any, @Body() dto: CreateCatalogItemDto) {
    const businessId = req.user.business_id;
    const tenantId = req.user.tenant_id;
    return this.catalogService.createItem(businessId, tenantId, dto);
  }

  @Get(':itemId')
  getItemById(@Req() req: any, @Param('itemId') itemId: string) {
    return this.catalogService.getItemById(itemId, req.user.business_id);
  }

  @Patch(':itemId')
  updateItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCatalogItemDto,
  ) {
    return this.catalogService.updateItem(itemId, req.user.business_id, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.OK)
  deleteItem(@Req() req: any, @Param('itemId') itemId: string) {
    return this.catalogService.deleteItem(itemId, req.user.business_id);
  }

  @Patch(':itemId/stock')
  updateStock(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.catalogService.updateStock(itemId, req.user.business_id, quantity);
  }

  // ─── Variants ─────────────────────────────────────────────────────────────

  @Get(':itemId/variants')
  getVariants(@Req() req: any, @Param('itemId') itemId: string) {
    return this.catalogService.getVariants(itemId, req.user.business_id);
  }

  @Post(':itemId/variants')
  createVariant(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.catalogService.createVariant(itemId, req.user.business_id, dto);
  }

  @Patch('variants/:variantId')
  updateVariant(
    @Req() req: any,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.catalogService.updateVariant(variantId, req.user.business_id, dto);
  }

  @Delete('variants/:variantId')
  deleteVariant(@Req() req: any, @Param('variantId') variantId: string) {
    return this.catalogService.deleteVariant(variantId, req.user.business_id);
  }

  // ─── Availability ─────────────────────────────────────────────────────────

  @Get(':itemId/availability')
  getAvailability(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.catalogService.getAvailability(itemId, req.user.business_id, from, to);
  }

  @Post(':itemId/availability')
  setAvailability(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.catalogService.setAvailability(itemId, req.user.business_id, dto);
  }

  @Patch(':itemId/availability/block')
  blockDate(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: BlockDateDto,
  ) {
    return this.catalogService.blockDate(itemId, req.user.business_id, dto);
  }
}
