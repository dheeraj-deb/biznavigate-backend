import { IsUUID, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHoldDto {
  @IsUUID() service_id: string;
  @IsDateString() check_in_date: string;
  @IsDateString() check_out_date: string;
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) slots_held?: number;
  @IsOptional() @IsUUID() lead_id?: string;
}
