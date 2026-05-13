import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { IsArray, IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { CompetitorService } from './competitor.service';
import { HotelProfileService } from '../hotel-profile/hotel-profile.service';

class ResolveCompetitorsDto {
  @IsString() @IsNotEmpty() hotelId: string;
  @IsString() @IsNotEmpty() location: string;
  @IsString() @IsNotEmpty() checkin: string;
  @IsString() @IsNotEmpty() checkout: string;
  @IsArray() @IsString({ each: true }) hotelNames: string[];
}

class ResolveByGeoDto {
  @IsString() @IsNotEmpty() hotelId: string;
  @IsNumber() latitude: number;
  @IsNumber() longitude: number;
  @IsString() @IsNotEmpty() checkin: string;
  @IsString() @IsNotEmpty() checkout: string;
  @IsOptional() @IsNumber() @Min(1) @Max(50) radiusKm?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(20) maxCompetitors?: number;
}

@UseGuards(JwtAuthGuard)
@Controller('hotel-pricing/competitor')
export class CompetitorController {
  constructor(
    private readonly competitorService: CompetitorService,
    private readonly hotelProfileService: HotelProfileService,
  ) {}

  @Post('resolve')
  async resolveAndSave(@Request() req, @Body() dto: ResolveCompetitorsDto) {
    const orgId = req.user.business_id;
    const resolved = await this.competitorService.resolveCompetitorTokens(
      dto.location,
      dto.checkin,
      dto.checkout,
      dto.hotelNames,
    );

    const keys = resolved.map(r => r.hotelKey);
    await this.hotelProfileService.addCompetitorTokens(orgId, dto.hotelId, keys);

    return { resolved, tokensAdded: keys.length };
  }

  @Post('resolve-by-geo')
  async resolveByGeo(@Request() req: { user: { business_id: string } }, @Body() dto: ResolveByGeoDto) {
    const orgId = req.user.business_id;
    return this.competitorService.resolveByCoordinates(
      orgId,
      dto.hotelId,
      dto.latitude,
      dto.longitude,
      dto.radiusKm ?? 5,
      dto.checkin,
      dto.checkout,
      dto.maxCompetitors ?? 10,
    );
  }

  @Get('nearby')
  async nearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radiusKm') radiusKm = '5',
    @Query('checkin') checkin: string,
    @Query('checkout') checkout: string,
  ) {
    return this.competitorService.findNearbyHotels(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radiusKm),
      checkin,
      checkout,
    );
  }

  @Get('rates')
  async getRates(
    @Request() req,
    @Query('hotelId') hotelId: string,
    @Query('checkin') checkin: string,
    @Query('checkout') checkout: string,
  ) {
    const orgId = req.user.business_id;
    const profile = await this.hotelProfileService.findById(orgId, hotelId);
    return this.competitorService.getCompetitorRatesForHotel(
      hotelId,
      orgId,
      profile.location,
      profile.competitorHotelTokens,
      checkin,
      checkout,
    );
  }
}
