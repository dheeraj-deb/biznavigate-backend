import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookingDto {
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'no_show'])
  @IsString()
  status?: string;

  @IsOptional()
  @IsIn(['pending', 'paid', 'partial', 'failed', 'refunded', 'cancelled', 'unpaid'])
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsString()
  guest_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount_paid?: number;
}
