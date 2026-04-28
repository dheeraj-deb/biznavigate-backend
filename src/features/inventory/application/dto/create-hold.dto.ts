import { IsUUID, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHoldDto {
  @ApiProperty() @IsUUID() service_id: string;
  @ApiProperty({ example: '2026-04-10' }) @IsDateString() check_in_date: string;
  @ApiProperty({ example: '2026-04-12' }) @IsDateString() check_out_date: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Type(() => Number) slots_held?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() lead_id?: string;
}
