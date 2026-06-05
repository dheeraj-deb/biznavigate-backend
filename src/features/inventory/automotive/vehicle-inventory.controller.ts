import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VehicleInventoryService } from './vehicle-inventory.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from './dto/vehicle.dto';

@UseGuards(JwtAuthGuard)
@Controller('businesses/:businessId/vehicles')
export class VehicleInventoryController {
  constructor(private readonly vehicleService: VehicleInventoryService) {}

  @Post()
  create(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehicleService.create(businessId, dto);
  }

  @Get()
  findAll(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query() query: VehicleQueryDto,
  ) {
    return this.vehicleService.findAll(businessId, query);
  }

  @Get(':vehicleId')
  findOne(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.vehicleService.findOne(businessId, vehicleId);
  }

  @Get(':vehicleId/similar')
  findSimilar(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.vehicleService.findSimilar(businessId, vehicleId);
  }

  @Patch(':vehicleId')
  update(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(businessId, vehicleId, dto);
  }

  @Delete(':vehicleId')
  remove(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.vehicleService.remove(businessId, vehicleId);
  }
}
