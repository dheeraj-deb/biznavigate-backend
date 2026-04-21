import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SetAvailabilityDto {
  @IsArray()
  @IsString({ each: true })
  dates: string[]; // ["2026-05-01", "2026-05-02", ...]

  @IsNumber()
  @Min(1)
  total_slots: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_override?: number;
}

export class BlockDateDto {
  @IsString()
  date: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  reason?: string;
}
