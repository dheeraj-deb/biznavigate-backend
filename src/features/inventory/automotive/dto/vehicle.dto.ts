import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @IsString()
  @MaxLength(80)
  make: string;

  @IsString()
  @MaxLength(80)
  model_name: string;

  @IsNumber()
  @Min(1900)
  @Type(() => Number)
  year: number;

  @IsOptional()
  @IsString()
  fuel_type?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  asking_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  km_driven?: number;

  @IsOptional()
  @IsIn(['new', 'used', 'certified_pre_owned'])
  condition?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  asking_price?: number;

  @IsOptional()
  @IsIn(['available', 'reserved', 'sold'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class VehicleQueryDto {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model_name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget_max?: number;

  @IsOptional()
  @IsString()
  fuel_type?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Type(() => Number)
  year_min?: number;

  @IsOptional()
  @IsIn(['available', 'reserved', 'sold'])
  status?: string;
}
