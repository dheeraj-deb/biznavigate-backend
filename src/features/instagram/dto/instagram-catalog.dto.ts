import { IsBoolean, IsArray, IsUUID, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class ToggleProductInCatalogDto {
  @IsUUID()
  productId: string;

  @IsBoolean()
  inCatalog: boolean;
}

export class BulkToggleCatalogDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  productIds: string[];

  @IsBoolean()
  inCatalog: boolean;
}

export class SyncCatalogDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  productIds?: string[];

  @IsOptional()
  @IsBoolean()
  fullSync?: boolean;
}

export class CheckBatchStatusDto {
  @IsString()
  handle: string;
}

export enum BatchRequestMethod {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export class BatchProductDto {
  @IsString()
  retailer_id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(['in stock', 'out of stock'])
  availability?: 'in stock' | 'out of stock';

  @IsOptional()
  @IsNumber()
  inventory?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  sale_price?: number;
}

export class CreateBatchRequestDto {
  @IsEnum(BatchRequestMethod)
  method: BatchRequestMethod;

  @IsArray()
  products: BatchProductDto[];

  @IsOptional()
  @IsBoolean()
  allow_upsert?: boolean;
}
