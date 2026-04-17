import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() type: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() @Type(() => Number) base_price: number;
  @ApiProperty() @IsNumber() @Type(() => Number) capacity: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) total_units?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() check_in_time?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() check_out_time?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cancellation_policy?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) tax_percentage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) extra_guest_charge?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) max_adults?: number;
  @ApiPropertyOptional() @IsOptional() attributes?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsArray() image_urls?: string[];
}
