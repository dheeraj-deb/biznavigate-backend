import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Convert Lead DTO
 * Used to mark a lead as converted with conversion details
 */
export class ConvertLeadDto {
  @ApiProperty({
    description: 'Conversion value (revenue/deal size)',
    minimum: 0,
    example: 25000,
  })
  @IsNumber()
  @Min(0)
  conversion_value: number;

  @ApiPropertyOptional({
    description: 'Conversion notes/details',
    maxLength: 1000,
    example: 'Customer purchased premium package with annual subscription',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  conversion_notes?: string;
}
