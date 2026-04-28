import { IsOptional, IsUUID, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsOptional() @IsUUID() service_id?: string;
  @IsString() customer_name: string;
  @IsString() customer_phone: string;
  @IsOptional() @IsDateString() check_in_date?: string;
  @IsOptional() @IsDateString() check_out_date?: string;
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) slots_booked?: number;
  @IsOptional() @IsString() special_requests?: string;
  @IsOptional() @IsUUID() lead_id?: string;
    @IsOptional() @IsUUID() hold_id?: string;
}
