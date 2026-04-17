import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsObject, IsIn, Min } from 'class-validator';

export class CreateCatalogItemDto {
  @IsString()
  item_type: string; // "physical_product" | "accommodation" | "activity" | "service"

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Min(0)
  base_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compare_price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

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
  @IsArray()
  @IsString({ each: true })
  ai_tags?: string[];
}
