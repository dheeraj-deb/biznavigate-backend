import { IsOptional, IsUUID, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsOptional() @IsUUID() hold_id?: string;
}
