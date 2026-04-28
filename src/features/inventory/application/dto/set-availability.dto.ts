import { IsArray, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SetAvailabilityDto {
    @IsArray()
  @IsDateString({}, { each: true })
  dates: string[];

  @IsNumber() @Type(() => Number) total_slots: number;
  @IsOptional() @IsNumber() @Type(() => Number) effective_price?: number;
}
