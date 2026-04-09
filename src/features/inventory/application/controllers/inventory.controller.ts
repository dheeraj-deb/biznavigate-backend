import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { InventoryService } from '../services/inventory.service';
import { CreateServiceDto, SetAvailabilityDto, CreateHoldDto, UpdateStockDto } from '../dto';

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
  constructor(private readonly inventoryService: InventoryService) {}

  // ── CONFIG ──────────────────────────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Get service types and attribute schema for this business type' })
  getConfig(@Request() req) {
    const businessType: string = req.user.business_type ?? 'hospitality';
    const config = INVENTORY_CONFIG[businessType] ?? INVENTORY_CONFIG['hospitality'];
    return { business_type: businessType, ...config };
  }

  // ── SERVICES ────────────────────────────────────────────────────────────────

  @Post('services')
  @ApiOperation({ summary: 'Add a new bookable service (room, villa, event, camping spot)' })
  createService(@Request() req, @Body() dto: CreateServiceDto) {
    return this.inventoryService.createService(req.user.business_id, req.user.tenant_id, dto);
  }

  @Get('services')
  @ApiOperation({ summary: 'List all services for the business' })
  @ApiQuery({ name: 'type', required: false })
  getServices(@Request() req, @Query('type') type?: string) {
    return this.inventoryService.getServices(req.user.business_id, type);
  }

  @Get('services/:serviceId')
  @ApiOperation({ summary: 'Get a single service by ID' })
  getService(@Request() req, @Param('serviceId') serviceId: string) {
    return this.inventoryService.getServiceById(serviceId, req.user.business_id);
  }

  @Patch('services/:serviceId')
  @ApiOperation({ summary: 'Update service details' })
  updateService(@Request() req, @Param('serviceId') serviceId: string, @Body() dto: Partial<CreateServiceDto>) {
    return this.inventoryService.updateService(serviceId, req.user.business_id, dto);
  }

  @Delete('services/:serviceId')
  @ApiOperation({ summary: 'Deactivate a service' })
  deleteService(@Request() req, @Param('serviceId') serviceId: string) {
    return this.inventoryService.deleteService(serviceId, req.user.business_id);
  }

  // ── AVAILABILITY ────────────────────────────────────────────────────────────

  @Post('services/:serviceId/availability')
  @ApiOperation({ summary: 'Set available dates and slot counts for a service' })
  setAvailability(@Request() req, @Param('serviceId') serviceId: string, @Body() dto: SetAvailabilityDto) {
    return this.inventoryService.setAvailability(serviceId, req.user.business_id, dto);
  }

  @Get('services/:serviceId/availability')
  @ApiOperation({ summary: 'Get availability for a service between two dates' })
  @ApiQuery({ name: 'from', required: true, example: '2026-04-10' })
  @ApiQuery({ name: 'to', required: true, example: '2026-04-15' })
  getAvailability(@Param('serviceId') serviceId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.inventoryService.getAvailability(serviceId, from, to);
  }

  @Patch('services/:serviceId/availability/block')
  @ApiOperation({ summary: 'Block a specific date' })
  blockDate(@Request() req, @Param('serviceId') serviceId: string, @Body('date') date: string) {
    return this.inventoryService.blockDate(serviceId, req.user.business_id, date);
  }

  // ── HOLDS ───────────────────────────────────────────────────────────────────

  @Post('holds')
  @ApiOperation({ summary: 'Hold slots for 15 min during checkout' })
  createHold(@Request() req, @Body() dto: CreateHoldDto) {
    return this.inventoryService.createHold(req.user.business_id, dto);
  }

  @Delete('holds/:holdId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release a hold (customer abandoned checkout)' })
  releaseHold(@Request() req, @Param('holdId') holdId: string) {
    return this.inventoryService.releaseHold(holdId, req.user.business_id);
  }

  // ── PRODUCT STOCK ───────────────────────────────────────────────────────────

  @Patch('products/:productId/stock')
  @ApiOperation({ summary: 'Update product stock' })
  updateProductStock(@Request() req, @Param('productId') productId: string, @Body() dto: UpdateStockDto) {
    return this.inventoryService.updateProductStock(productId, req.user.business_id, dto);
  }

  @Patch('products/variants/:variantId/stock')
  @ApiOperation({ summary: 'Update variant stock' })
  updateVariantStock(@Request() req, @Param('variantId') variantId: string, @Body() dto: UpdateStockDto) {
    return this.inventoryService.updateVariantStock(variantId, req.user.business_id, dto);
  }

  // ── STOCK ALERTS ─────────────────────────────────────────────────────────────

  @Get('alerts')
  @ApiOperation({ summary: 'Get low-stock alerts' })
  @ApiQuery({ name: 'status', required: false, description: 'active | acknowledged | resolved' })
  getAlerts(@Request() req, @Query('status') status?: string) {
    return this.inventoryService.getStockAlerts(req.user.business_id, status);
  }

  @Patch('alerts/:alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a low-stock alert' })
  acknowledgeAlert(@Request() req, @Param('alertId') alertId: string) {
    return this.inventoryService.acknowledgeAlert(alertId, req.user.business_id);
  }
}
