import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class PricingRequestDto {
    @IsString()
  @IsNotEmpty()
  hotelId: string;

    @IsString()
  @IsNotEmpty()
  roomType: string;

    @IsString()
  @IsNotEmpty()
  checkinDate: string;

    @IsOptional()
  @IsString()
  checkoutDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPrice?: number;
}
