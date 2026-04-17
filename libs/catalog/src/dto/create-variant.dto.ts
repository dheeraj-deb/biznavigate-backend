import { IsString, IsNumber, IsOptional, IsObject, Min } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  name: string; // "Red - M", "Blue - XL"

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_quantity?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, string>; // { color: "Red", size: "M" }
}

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_quantity?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, string>;
}
