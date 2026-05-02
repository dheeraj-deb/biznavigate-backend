import { IsArray, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SetAvailabilityDto {
  @IsArray()
  @IsDateString({}, { each: true })
  dates: string[];

}
