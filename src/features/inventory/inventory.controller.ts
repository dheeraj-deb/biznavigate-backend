import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { IsString, IsNumber, IsOptional, IsArray, IsUUID, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Inventory config — static map, no DB call ───────────────────────────────

const INVENTORY_CONFIG: Record<string, { service_types: string[]; attribute_schema: Record<string, any> }> = {
  hospitality: {
    service_types: ['room', 'villa', 'dormitory', 'tent-site', 'cabin', 'glamping'],
    attribute_schema: {
      room:        { label: 'Room',      fields: [{ key: 'ac', label: 'Air Conditioning', type: 'boolean', required: false }, { key: 'view', label: 'View', type: 'select', options: ['sea', 'garden', 'pool', 'city'], required: false }, { key: 'floor', label: 'Floor Number', type: 'number', required: false }, { key: 'amenities', label: 'Amenities', type: 'multi-select', options: ['wifi', 'tv', 'minibar', 'safe', 'bathtub'], required: false }] },
      villa:       { label: 'Villa',     fields: [{ key: 'bedrooms', label: 'Bedrooms', type: 'number', required: true }, { key: 'private_pool', label: 'Private Pool', type: 'boolean', required: false }, { key: 'amenities', label: 'Amenities', type: 'multi-select', options: ['wifi', 'kitchen', 'bbq', 'jacuzzi'], required: false }] },
      dormitory:   { label: 'Dormitory', fields: [{ key: 'beds_per_room', label: 'Beds Per Room', type: 'number', required: true }, { key: 'gender', label: 'Gender Policy', type: 'select', options: ['mixed', 'male', 'female'], required: false }, { key: 'locker', label: 'Locker Available', type: 'boolean', required: false }] },
      'tent-site': { label: 'Tent Site', fields: [{ key: 'power_hookup', label: 'Power Hookup', type: 'boolean', required: false }, { key: 'shade', label: 'Shaded', type: 'boolean', required: false }, { key: 'near_water', label: 'Near Water', type: 'boolean', required: false }] },
      cabin:       { label: 'Cabin',     fields: [{ key: 'beds', label: 'Number of Beds', type: 'number', required: true }, { key: 'kitchen', label: 'Kitchen Available', type: 'boolean', required: false }, { key: 'amenities', label: 'Amenities', type: 'multi-select', options: ['wifi', 'heater', 'fireplace', 'bbq'], required: false }] },
      glamping:    { label: 'Glamping',  fields: [{ key: 'beds', label: 'Number of Beds', type: 'number', required: true }, { key: 'private_bathroom', label: 'Private Bathroom', type: 'boolean', required: false }, { key: 'amenities', label: 'Amenities', type: 'multi-select', options: ['wifi', 'ac', 'minibar', 'jacuzzi'], required: false }] },
    },
  },
  events: {
    service_types: ['event', 'workshop', 'banquet'],
    attribute_schema: {
      event:    { label: 'Event',    fields: [{ key: 'location', label: 'Venue / Location', type: 'text', required: false }, { key: 'duration_hours', label: 'Duration (hours)', type: 'number', required: false }, { key: 'includes', label: 'Includes', type: 'multi-select', options: ['catering', 'decoration', 'sound', 'photography', 'transport'], required: false }] },
      workshop: { label: 'Workshop', fields: [{ key: 'duration_hours', label: 'Duration (hours)', type: 'number', required: false }, { key: 'materials_included', label: 'Materials Included', type: 'boolean', required: false }, { key: 'instructor', label: 'Instructor Name', type: 'text', required: false }] },
      banquet:  { label: 'Banquet',  fields: [{ key: 'seating_capacity', label: 'Seating Capacity', type: 'number', required: true }, { key: 'catering', label: 'Catering Included', type: 'boolean', required: false }, { key: 'av_equipment', label: 'AV Equipment', type: 'boolean', required: false }] },
    },
  },
  products: {
    service_types: [],
    attribute_schema: {},
  },
};

// ─── DTOs ────────────────────────────────────────────────────────────────────

class CreateServiceDto {
  @IsString() name: string;
  @IsString() type: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Type(() => Number) base_price: number;
  @IsNumber() @Type(() => Number) capacity: number;
  @IsOptional() attributes?: Record<string, any>;
  @IsOptional() @IsArray() image_urls?: string[];
}

class SetAvailabilityDto {
  @IsArray() @IsDateString({}, { each: true }) dates: string[];
  @IsNumber() @Type(() => Number) total_slots: number;
  @IsOptional() @IsNumber() @Type(() => Number) effective_price?: number;
}

class CreateHoldDto {
  @IsUUID() service_id: string;
  @IsDateString() check_in_date: string;
  @IsDateString() check_out_date: string;
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) slots_held?: number;
  @IsOptional() @IsUUID() lead_id?: string;
}

class CreateBookingDto {
  @IsOptional() @IsUUID() service_id?: string;
  @IsString() customer_name: string;
  @IsString() customer_phone: string;
  @IsOptional() @IsDateString() check_in_date?: string;
  @IsOptional() @IsDateString() check_out_date?: string;
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) slots_booked?: number;
  @IsOptional() @IsString() special_requests?: string;
  @IsOptional() @IsUUID() lead_id?: string;
  @IsOptional() @IsUUID() hold_id?: string;   // convert an existing hold
}

class UpdateStockDto {
  @IsNumber() @Min(0) @Type(() => Number) quantity: number;
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) low_stock_threshold?: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ── CONFIG (dynamic UI schema based on business_type) ─────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Get allowed service types and attribute field schema for this business type' })
  getConfig(@Request() req) {
    const businessType: string = req.user.business_type ?? 'hospitality';
    const config = INVENTORY_CONFIG[businessType] ?? INVENTORY_CONFIG['hospitality'];
    return { business_type: businessType, ...config };
  }

  // ── SERVICES ───────────────────────────────────────────────────────────────

  @Post('services')
  @ApiOperation({ summary: 'Add a new bookable service (room, villa, event, camping spot)' })
  createService(@Request() req, @Body() dto: CreateServiceDto) {
    return this.inventoryService.createService(
      req.user.business_id,
      req.user.tenant_id,
      dto,
    );
  }

  @Get('services')
  @ApiOperation({ summary: 'List all services for the business' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type: room | villa | dormitory | event | camping' })
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
  updateService(
    @Request() req,
    @Param('serviceId') serviceId: string,
    @Body() dto: Partial<CreateServiceDto>,
  ) {
    return this.inventoryService.updateService(serviceId, req.user.business_id, dto);
  }

  @Delete('services/:serviceId')
  @ApiOperation({ summary: 'Deactivate a service' })
  deleteService(@Request() req, @Param('serviceId') serviceId: string) {
    return this.inventoryService.deleteService(serviceId, req.user.business_id);
  }

  // ── AVAILABILITY ───────────────────────────────────────────────────────────

  @Post('services/:serviceId/availability')
  @ApiOperation({ summary: 'Set available dates and slot counts for a service' })
  setAvailability(
    @Request() req,
    @Param('serviceId') serviceId: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.inventoryService.setAvailability(serviceId, req.user.business_id, dto);
  }

  @Get('services/:serviceId/availability')
  @ApiOperation({ summary: 'Get availability for a service between two dates' })
  @ApiQuery({ name: 'from', required: true, example: '2026-03-15' })
  @ApiQuery({ name: 'to', required: true, example: '2026-03-31' })
  getAvailability(
    @Param('serviceId') serviceId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.inventoryService.getAvailability(serviceId, from, to);
  }

  @Patch('services/:serviceId/availability/block')
  @ApiOperation({ summary: 'Block a specific date (maintenance / hold)' })
  blockDate(
    @Request() req,
    @Param('serviceId') serviceId: string,
    @Body('date') date: string,
  ) {
    return this.inventoryService.blockDate(serviceId, req.user.business_id, date);
  }

  // ── HOLDS ──────────────────────────────────────────────────────────────────

  @Post('holds')
  @ApiOperation({
    summary: 'Hold slots for 15 min during checkout — prevents others from booking the same dates',
  })
  createHold(@Request() req, @Body() dto: CreateHoldDto) {
    return this.inventoryService.createHold(req.user.business_id, dto);
  }

  @Delete('holds/:holdId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release a hold (customer abandoned checkout)' })
  releaseHold(@Request() req, @Param('holdId') holdId: string) {
    return this.inventoryService.releaseHold(holdId, req.user.business_id);
  }

  // ── BOOKINGS ───────────────────────────────────────────────────────────────

  @Post('bookings')
  @ApiOperation({ summary: 'Create a booking — atomic, prevents double-booking' })
  createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    return this.inventoryService.createBooking(req.user.business_id, dto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List bookings for the business' })
  @ApiQuery({ name: 'status', required: false, description: 'pending | confirmed | cancelled | completed' })
  getBookings(@Request() req, @Query('status') status?: string) {
    return this.inventoryService.getBookings(req.user.business_id, status);
  }

  @Patch('bookings/:bookingId/cancel')
  @ApiOperation({ summary: 'Cancel a booking and release the slots' })
  cancelBooking(@Request() req, @Param('bookingId') bookingId: string) {
    return this.inventoryService.cancelBooking(bookingId, req.user.business_id);
  }

  // ── PRODUCT STOCK ──────────────────────────────────────────────────────────

  @Patch('products/:productId/stock')
  @ApiOperation({ summary: 'Update product stock — triggers low-stock alert if below threshold' })
  updateProductStock(
    @Request() req,
    @Param('productId') productId: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.inventoryService.updateProductStock(productId, req.user.business_id, dto);
  }

  @Patch('products/variants/:variantId/stock')
  @ApiOperation({ summary: 'Update variant stock — triggers low-stock alert if below threshold' })
  updateVariantStock(
    @Request() req,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.inventoryService.updateVariantStock(variantId, req.user.business_id, dto);
  }

  // ── STOCK ALERTS ───────────────────────────────────────────────────────────

  @Get('alerts')
  @ApiOperation({ summary: 'Get low-stock alerts for the business' })
  @ApiQuery({ name: 'status', required: false, description: 'active | acknowledged | resolved (default: active)' })
  getAlerts(@Request() req, @Query('status') status?: string) {
    return this.inventoryService.getStockAlerts(req.user.business_id, status);
  }

  @Patch('alerts/:alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a low-stock alert' })
  acknowledgeAlert(@Request() req, @Param('alertId') alertId: string) {
    return this.inventoryService.acknowledgeAlert(alertId, req.user.business_id);
  }
}
