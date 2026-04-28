import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CatalogService } from '../../../catalog/catalog.service';
import { CreateServiceDto, UpdateStockDto } from '../dto';

// Maps legacy inventory service_type values to catalog item_type
const SERVICE_TYPE_MAP: Record<string, string> = {
  room: 'accommodation', villa: 'accommodation', dormitory: 'accommodation',
  tent_site: 'accommodation', cabin: 'accommodation', glamping: 'accommodation',
  event: 'activity', workshop: 'activity', banquet: 'activity',
};

const INVENTORY_CONFIG: Record<string, { service_types: string[]; attribute_schema: Record<string, any> }> = {
  hospitality: {
    service_types: ['room', 'villa', 'dormitory', 'tent_site', 'cabin', 'glamping'],
    attribute_schema: {
      room:      { label: 'Room',      fields: [{ key: 'bed_type', label: 'Bed Type', type: 'select', options: ['Single', 'Double', 'King', 'Twin'] }, { key: 'has_ac', label: 'AC', type: 'boolean' }, { key: 'floor', label: 'Floor', type: 'number' }] },
      villa:     { label: 'Villa',     fields: [{ key: 'max_guests', label: 'Maximum Guests Allowed', type: 'select', options: ['Maximum 2','Maximum 4','Maximum 6','Maximum 8','Maximum 10','Maximum 15','Maximum 20'] }, { key: 'bedrooms', label: 'Bedrooms', type: 'number' }, { key: 'has_pool', label: 'Private Pool', type: 'boolean' }] },
      dormitory: { label: 'Dormitory', fields: [{ key: 'bunk_type', label: 'Bunk Type', type: 'select', options: ['Upper', 'Lower'] }, { key: 'mixed', label: 'Mixed Dorm', type: 'boolean' }] },
      tent_site: { label: 'Tent Site', fields: [{ key: 'max_guests', label: 'Maximum Guests Allowed', type: 'select', options: ['Maximum 2','Maximum 4','Maximum 6','Maximum 8','Maximum 10'] }, { key: 'has_power', label: 'Power Hookup', type: 'boolean' }, { key: 'shade', label: 'Shade', type: 'boolean' }] },
      cabin:     { label: 'Cabin',     fields: [{ key: 'max_guests', label: 'Maximum Guests Allowed', type: 'select', options: ['Maximum 2','Maximum 4','Maximum 6','Maximum 8','Maximum 10','Maximum 15','Maximum 20'] }, { key: 'bedrooms', label: 'Bedrooms', type: 'number' }, { key: 'has_kitchen', label: 'Kitchen', type: 'boolean' }] },
      glamping:  { label: 'Glamping',  fields: [{ key: 'max_guests', label: 'Maximum Guests Allowed', type: 'select', options: ['Maximum 2','Maximum 4','Maximum 6','Maximum 8','Maximum 10'] }, { key: 'tent_type', label: 'Tent Type', type: 'select', options: ['Safari', 'Dome', 'Bell'] }, { key: 'has_ac', label: 'AC', type: 'boolean' }] },
    },
  },
  events: {
    service_types: ['event', 'workshop', 'banquet'],
    attribute_schema: {
      event:    { label: 'Event',    fields: [{ key: 'event_type', label: 'Event Type', type: 'select', options: ['Concert', 'Conference', 'Wedding', 'Corporate'] }, { key: 'indoor', label: 'Indoor', type: 'boolean' }] },
      workshop: { label: 'Workshop', fields: [{ key: 'duration_hours', label: 'Duration (hrs)', type: 'number' }, { key: 'materials_included', label: 'Materials Included', type: 'boolean' }] },
      banquet:  { label: 'Banquet',  fields: [{ key: 'catering', label: 'Catering', type: 'boolean' }, { key: 'layout', label: 'Layout', type: 'select', options: ['Theatre', 'Classroom', 'Banquet', 'Cocktail'] }] },
    },
  },
  products: { service_types: [], attribute_schema: {} },
};

@SkipThrottle()
@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly catalogService: CatalogService) {}

  // ── CONFIG ──────────────────────────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Get service types and attribute schema for this business type' })
  getConfig(@Request() req) {
    const businessType: string = req.user.business_type ?? 'hospitality';
    const config = INVENTORY_CONFIG[businessType] ?? INVENTORY_CONFIG['hospitality'];
    return { business_type: businessType, ...config };
  }

  // ── SERVICES (delegated to CatalogService) ──────────────────────────────────

  @Post('services')
  @ApiOperation({ summary: 'Add a new bookable service — delegates to catalog' })
  createService(@Request() req, @Body() dto: CreateServiceDto) {
    const item_type = SERVICE_TYPE_MAP[dto.type] ?? 'service';
    return this.catalogService.createItem(req.user.business_id, req.user.tenant_id, {
      item_type,
      name: dto.name,
      description: dto.description,
      base_price: dto.base_price,
      stock_quantity: dto.total_units,
      image_urls: dto.image_urls,
      attributes: {
        service_type: dto.type,
        capacity: dto.capacity,
        total_units: dto.total_units,
        check_in_time: dto.check_in_time,
        check_out_time: dto.check_out_time,
        cancellation_policy: dto.cancellation_policy,
        tax_percentage: dto.tax_percentage,
        extra_guest_charge: dto.extra_guest_charge,
        max_adults: dto.max_adults,
        ...((dto.attributes as object) ?? {}),
      },
    });
  }

  @Get('services')
  @ApiOperation({ summary: 'List all services for the business' })
  @ApiQuery({ name: 'type', required: false })
  getServices(@Request() req, @Query('type') type?: string) {
    const item_type = type ? (SERVICE_TYPE_MAP[type] ?? type) : undefined;
    return this.catalogService.getItems({
      businessId: req.user.business_id,
      item_type,
    });
  }

  @Get('services/:serviceId')
  @ApiOperation({ summary: 'Get a single service by ID' })
  getService(@Request() req, @Param('serviceId') serviceId: string) {
    return this.catalogService.getItemById(serviceId, req.user.business_id);
  }

  @Patch('services/:serviceId')
  @ApiOperation({ summary: 'Update service details' })
  updateService(@Request() req, @Param('serviceId') serviceId: string, @Body() dto: Partial<CreateServiceDto>) {
    const attrs: any = {};
    if (dto.capacity !== undefined) attrs.capacity = dto.capacity;
    if (dto.total_units !== undefined) attrs.total_units = dto.total_units;
    if (dto.check_in_time) attrs.check_in_time = dto.check_in_time;
    if (dto.check_out_time) attrs.check_out_time = dto.check_out_time;
    if (dto.cancellation_policy) attrs.cancellation_policy = dto.cancellation_policy;
    if (dto.tax_percentage !== undefined) attrs.tax_percentage = dto.tax_percentage;
    if (dto.extra_guest_charge !== undefined) attrs.extra_guest_charge = dto.extra_guest_charge;
    if (dto.max_adults !== undefined) attrs.max_adults = dto.max_adults;
    if (dto.attributes) Object.assign(attrs, dto.attributes);

    return this.catalogService.updateItem(serviceId, req.user.business_id, {
      name: dto.name,
      description: dto.description,
      base_price: dto.base_price,
      stock_quantity: dto.total_units,
      image_urls: dto.image_urls,
      ...(Object.keys(attrs).length ? { attributes: attrs } : {}),
    });
  }

  @Delete('services/:serviceId')
  @ApiOperation({ summary: 'Deactivate a service' })
  deleteService(@Request() req, @Param('serviceId') serviceId: string) {
    return this.catalogService.deleteItem(serviceId, req.user.business_id);
  }

  // ── AVAILABILITY ────────────────────────────────────────────────────────────

  @Post('services/:serviceId/availability')
  @ApiOperation({ summary: 'Set available dates and slot counts for a service' })
  setAvailability(@Request() req, @Param('serviceId') serviceId: string, @Body() dto: any) {
    return this.catalogService.setAvailability(serviceId, req.user.business_id, dto);
  }

  @Get('services/:serviceId/availability')
  @ApiOperation({ summary: 'Get availability for a service between two dates' })
  @ApiQuery({ name: 'from', required: true, example: '2026-04-10' })
  @ApiQuery({ name: 'to', required: true, example: '2026-04-15' })
  getAvailability(@Param('serviceId') serviceId: string, @Request() req, @Query('from') from: string, @Query('to') to: string) {
    return this.catalogService.getAvailability(serviceId, req.user.business_id, from, to);
  }

  @Patch('services/:serviceId/availability/block')
  @ApiOperation({ summary: 'Block a specific date' })
  blockDate(@Request() req, @Param('serviceId') serviceId: string, @Body('date') date: string) {
    return this.catalogService.blockDate(serviceId, req.user.business_id, { date });
  }

  // ── PRODUCT STOCK ───────────────────────────────────────────────────────────

  @Patch('products/:productId/stock')
  @ApiOperation({ summary: 'Update product stock' })
  updateProductStock(@Request() req, @Param('productId') productId: string, @Body() dto: UpdateStockDto) {
    return this.catalogService.updateStock(productId, req.user.business_id, dto.quantity);
  }

  @Patch('products/variants/:variantId/stock')
  @ApiOperation({ summary: 'Update variant stock' })
  updateVariantStock(@Request() req, @Param('variantId') variantId: string, @Body() dto: UpdateStockDto) {
    return this.catalogService.updateStock(variantId, req.user.business_id, dto.quantity);
  }

  // ── HOLDS (not supported in catalog) ────────────────────────────────────────

  @Post('holds')
  @ApiOperation({ summary: 'Hold slots — not implemented (use booking flow)' })
  createHold() {
    return { message: 'Hold management is handled by the booking flow' };
  }

  @Delete('holds/:holdId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release a hold — not implemented' })
  releaseHold() {
    return { message: 'Hold management is handled by the booking flow' };
  }

  // ── STOCK ALERTS (not yet in catalog) ───────────────────────────────────────

  @Get('alerts')
  @ApiOperation({ summary: 'Get low-stock alerts' })
  @ApiQuery({ name: 'status', required: false })
  getAlerts() {
    return [];
  }

  @Patch('alerts/:alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a low-stock alert' })
  acknowledgeAlert() {
    return { message: 'Alert acknowledged' };
  }
}
