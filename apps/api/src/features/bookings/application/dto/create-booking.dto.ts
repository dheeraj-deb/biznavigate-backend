import { IsOptional, IsUUID, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() service_id?: string;
  @ApiProperty() @IsString() customer_name: string;
  @ApiProperty() @IsString() customer_phone: string;
  @ApiPropertyOptional({ example: '2026-04-10' }) @IsOptional() @IsDateString() check_in_date?: string;
  @ApiPropertyOptional({ example: '2026-04-12' }) @IsOptional() @IsDateString() check_out_date?: string;
  @ApiPropertyOptional({ minimum: 1 }) @IsOptional() @IsNumber() @Min(1) @Type(() => Number) slots_booked?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() special_requests?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() lead_id?: string;
  @ApiPropertyOptional({ description: 'Provide to convert an existing hold to a booking' })
  @IsOptional() @IsUUID() hold_id?: string;
}
