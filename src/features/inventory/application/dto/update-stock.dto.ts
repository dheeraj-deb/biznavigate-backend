import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @IsNumber() @Min(0) @Type(() => Number) quantity: number;
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) low_stock_threshold?: number;
}
