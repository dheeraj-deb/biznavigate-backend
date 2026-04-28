import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { IsArray, IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
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

@ApiTags('Hotel Pricing — Competitors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hotel-pricing/competitor')
export class CompetitorController {
  constructor(
    private readonly competitorService: CompetitorService,
    private readonly hotelProfileService: HotelProfileService,
  ) {}

  @Post('resolve')
  @ApiOperation({
    summary: 'Resolve competitor hotel names → Xotelo tokens and save to hotel profile',
    description: 'One-time setup per hotel. Pass competitor hotel names and they are matched against Xotelo results.',
  })
  @ApiBody({ type: ResolveCompetitorsDto })
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
  @ApiOperation({
    summary: 'Auto-discover competitor hotels by GPS coordinates',
    description:
      'Reverse-geocodes the hotel\'s lat/lng → city → fetches Xotelo hotel list → ' +
      'filters by haversine radius → saves tokens to the hotel profile.',
  })
  @ApiBody({ type: ResolveByGeoDto })
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
  @ApiOperation({
    summary: 'Preview hotels within radius of coordinates (does NOT save tokens)',
    description: 'Useful to preview results before committing. Use resolve-by-geo to save.',
  })
  @ApiQuery({ name: 'lat', required: true, example: 19.076 })
  @ApiQuery({ name: 'lng', required: true, example: 72.8777 })
  @ApiQuery({ name: 'radiusKm', required: false, example: 5 })
  @ApiQuery({ name: 'checkin', required: true, example: '2026-04-01' })
  @ApiQuery({ name: 'checkout', required: true, example: '2026-04-02' })
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
  @ApiOperation({ summary: 'Get live competitor rates for a hotel (respects Redis cache)' })
  @ApiQuery({ name: 'hotelId', required: true })
  @ApiQuery({ name: 'checkin', required: true, example: '2026-04-01' })
  @ApiQuery({ name: 'checkout', required: true, example: '2026-04-02' })
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
