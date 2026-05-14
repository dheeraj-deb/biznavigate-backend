import { Controller, Post, Get, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { PricingService } from './pricing.service';
import { PricingRequestDto } from './dto/pricing-request.dto';

class RecordOutcomeDto {
  @IsString() @IsNotEmpty() recommendationId: string;
  @IsString() @IsNotEmpty() hotelId: string;
  @IsNumber() @Min(0) actualPriceUsed: number;
  @IsNumber() @Min(0) roomsBooked: number;
  @IsNumber() @Min(1) totalRooms: number;
  @IsString() @IsNotEmpty() checkinDate: string;
}

@UseGuards(JwtAuthGuard)
@Controller('hotel-pricing/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('recommend')
  recommend(@Request() req, @Body() dto: PricingRequestDto) {
    return this.pricingService.getPricingRecommendation(req.user.business_id, dto);
  }

  @Get('history')
  history(@Request() req, @Query('hotelId') hotelId: string, @Query('limit') limit = 20) {
    return this.pricingService.getHistory(req.user.business_id, hotelId, +limit);
  }

  @Post('outcome')
  recordOutcome(@Request() req, @Body() dto: RecordOutcomeDto) {
    return this.pricingService.recordBookingOutcome(req.user.business_id, dto);
  }
}
