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

export class CreateHotelProfileDto {
  @IsString()
  @IsNotEmpty()
  hotelName: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  locationCityId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  starRating: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  roomTypes: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competitorHotelTokens?: string[];

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  searchRadiusKm?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
