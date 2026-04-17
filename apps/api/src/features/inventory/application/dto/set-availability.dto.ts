import { IsArray, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetAvailabilityDto {
  @ApiProperty({ type: [String], example: ['2026-04-10', '2026-04-11'] })
  @IsArray()
  @IsDateString({}, { each: true })
  dates: string[];

  @ApiProperty() @IsNumber() @Type(() => Number) total_slots: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) effective_price?: number;
}
