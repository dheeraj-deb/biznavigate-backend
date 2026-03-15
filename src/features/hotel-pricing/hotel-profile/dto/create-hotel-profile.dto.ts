import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHotelProfileDto {
  @ApiProperty({ example: 'The Grand Hyatt' })
  @IsString()
  @IsNotEmpty()
  hotelName: string;

  @ApiProperty({ example: 'Mumbai', description: 'Xotelo location string used in list searches' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: 'Mumbai', description: 'Defaults to location if not set' })
  @IsOptional()
  @IsString()
  locationCityId?: string;

  @ApiProperty({ example: 5, description: '1–5 star rating' })
  @IsNumber()
  @Min(1)
  @Max(5)
  starRating: number;

  @ApiProperty({ example: ['Deluxe', 'Suite', 'Standard'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  roomTypes: string[];

  @ApiPropertyOptional({ example: ['pool', 'gym', 'spa'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ example: 7500, description: 'Base room price in INR' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({
    example: ['abc123token', 'def456token'],
    description: 'Xotelo hotel_token values of competitor hotels (added via /competitor/resolve)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competitorHotelTokens?: string[];

  @ApiPropertyOptional({ example: 19.0760, description: 'Hotel latitude (enables geo-based competitor discovery)' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 72.8777, description: 'Hotel longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 5, description: 'Radius in km for auto competitor search (default 5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  searchRadiusKm?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
