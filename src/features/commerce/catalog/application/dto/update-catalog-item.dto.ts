import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsObject, Min } from 'class-validator';

export class UpdateCatalogItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  base_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compare_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_quantity?: number;

  @IsOptional()
  @IsString()
  primary_image_url?: string;

  @IsOptional()
  image_urls?: any;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ai_tags?: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
