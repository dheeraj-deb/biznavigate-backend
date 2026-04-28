import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PricingRequestDto {
  @ApiProperty({ example: '60d21b4667d0d8992e610c85', description: 'MongoDB _id of the HotelProfile' })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({ example: 'Deluxe', description: 'Room type to price' })
  @IsString()
  @IsNotEmpty()
  roomType: string;

  @ApiProperty({ example: '2026-04-15', description: 'Check-in date YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty()
  checkinDate: string;

  @ApiPropertyOptional({ example: '2026-04-16', description: 'Defaults to checkinDate + 1 day' })
  @IsOptional()
  @IsString()
  checkoutDate?: string;

  @ApiPropertyOptional({ example: 7500, description: 'Current price being charged (for comparison)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPrice?: number;
}
