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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { HotelProfileService } from './hotel-profile.service';
import { CreateHotelProfileDto } from './dto/create-hotel-profile.dto';
import { UpdateHotelProfileDto } from './dto/update-hotel-profile.dto';@UseGuards(JwtAuthGuard)
@Controller('hotel-pricing/profiles')
export class HotelProfileController {
  constructor(private readonly hotelProfileService: HotelProfileService) {}

  @Post()  create(@Request() req, @Body() dto: CreateHotelProfileDto) {
    return this.hotelProfileService.create(req.user.business_id, dto);
  }

  @Get()  findAll(@Request() req) {
    return this.hotelProfileService.findAll(req.user.business_id);
  }

  @Get(':id')  findOne(@Request() req, @Param('id') id: string) {
    return this.hotelProfileService.findById(req.user.business_id, id);
  }

  @Patch(':id')  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateHotelProfileDto) {
    return this.hotelProfileService.update(req.user.business_id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  remove(@Request() req, @Param('id') id: string) {
    return this.hotelProfileService.delete(req.user.business_id, id);
  }
}
