import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({ minimum: 0 }) @IsNumber() @Min(0) @Type(() => Number) quantity: number;
  @ApiPropertyOptional({ minimum: 1 }) @IsOptional() @IsNumber() @Min(1) @Type(() => Number) low_stock_threshold?: number;
}
