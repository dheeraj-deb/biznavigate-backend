import { IsNumber, Min, Max } from 'class-validator';

export class TopupDto {
  @IsNumber()
  @Min(10)
  @Max(100000)
  amount: number;
}
