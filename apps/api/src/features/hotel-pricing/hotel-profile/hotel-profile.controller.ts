import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { HotelProfileService } from './hotel-profile.service';
import { CreateHotelProfileDto } from './dto/create-hotel-profile.dto';
import { UpdateHotelProfileDto } from './dto/update-hotel-profile.dto';

@ApiTags('Hotel Pricing — Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hotel-pricing/profiles')
export class HotelProfileController {
  constructor(private readonly hotelProfileService: HotelProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Create a hotel profile for pricing engine' })
  create(@Request() req, @Body() dto: CreateHotelProfileDto) {
    return this.hotelProfileService.create(req.user.business_id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all hotel profiles for this organisation' })
  findAll(@Request() req) {
    return this.hotelProfileService.findAll(req.user.business_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single hotel profile' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.hotelProfileService.findById(req.user.business_id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hotel profile' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateHotelProfileDto) {
    return this.hotelProfileService.update(req.user.business_id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hotel profile' })
  remove(@Request() req, @Param('id') id: string) {
    return this.hotelProfileService.delete(req.user.business_id, id);
  }
}
