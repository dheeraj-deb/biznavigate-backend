import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Type(() => Number)
  base_price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  total_units?: number;

  @IsOptional()
  @IsArray()
  image_urls?: string[];

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsString()
  check_in_time?: string;

  @IsOptional()
  @IsString()
  check_out_time?: string;

  @IsOptional()
  @IsString()
  cancellation_policy?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tax_percentage?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  extra_guest_charge?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max_adults?: number;

  @IsOptional()
  attributes?: Record<string, any>;
}
