import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsIn,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search in name, description, SKU, brand

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['physical', 'course', 'event', 'service'])
  product_type?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  in_stock?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  low_stock?: boolean; // true = stock_quantity <= low_stock_threshold

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  min_price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  max_price?: number;

  // Pagination
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(500)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  include_count?: boolean = true;

  // Sorting
  @IsOptional()
  @IsIn(['name', 'price', 'created_at', 'stock_quantity'])
  sort_by?: string = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
