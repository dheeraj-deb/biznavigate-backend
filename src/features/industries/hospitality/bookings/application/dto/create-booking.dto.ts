import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsUUID()
  service_id!: string;

  @IsDateString()
  check_in!: string;

  @IsDateString()
  check_out!: string;

  @IsOptional()
  @IsString()
  guest_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUUID()
  lead_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  num_guests?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  room_count?: number;

  @IsOptional()
  @IsIn(['pending', 'paid', 'partial', 'failed', 'refunded', 'cancelled', 'unpaid'])
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'no_show'])
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount_paid?: number;
}
