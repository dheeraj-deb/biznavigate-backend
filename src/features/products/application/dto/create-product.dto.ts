import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsIn,
  Min,
  MaxLength,
  IsUUID,
  ValidateNested,
  IsObject,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

function toNumberValue(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/[,\s]/g, '').replace(/[^\d.-]/g, '');
    if (!normalized || normalized === '-' || normalized === '.') return undefined;
    return Number(normalized);
  }
  return Number(value);
}

function toRequiredNumber(value: unknown): number {
  const parsed = toNumberValue(value);
  return parsed === undefined ? Number.NaN : parsed;
}

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toRequiredNumber(value))
  price: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toRequiredNumber(value))
  quantity: number;

  @IsOptional()
  @IsBoolean()
  in_stock?: boolean;

  @IsOptional()
  @IsObject()
  variant_options?: Record<string, any>;
}

export class CreateProductDto {
  // business_id & tenant_id injected from JWT in controller — optional in body
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @IsOptional()
  @IsUUID()
  tenant_id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateIf((dto) => dto.price !== undefined || dto.base_price === undefined)
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toRequiredNumber(value))
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumberValue(value))
  base_price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsIn(['new', 'like_new', 'good', 'refurbished'])
  condition?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumberValue(value))
  weight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dimensions?: string;

  @IsOptional()
  @IsString()
  @IsIn(['physical', 'course', 'event', 'service'])
  product_type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumberValue(value))
  stock_quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumberValue(value))
  low_stock_threshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumberValue(value))
  compare_price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  track_inventory?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_urls?: string[];

  @IsOptional()
  @IsString()
  primary_image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  has_variants?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}
