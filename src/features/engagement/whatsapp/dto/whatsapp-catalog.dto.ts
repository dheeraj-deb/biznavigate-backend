import { IsBoolean, IsArray, IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

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
}

export class ImportWhatsAppCatalogDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
