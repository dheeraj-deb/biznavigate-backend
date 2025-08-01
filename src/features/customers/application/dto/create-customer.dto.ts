import { IsString, IsOptional, Length, ValidateNested, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerAddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  state: string;

  @ApiProperty({ description: 'ZIP/Postal code' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  zipCode: string;

  @ApiPropertyOptional({ description: 'Country', default: 'India' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  country?: string = 'India';
}

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Contact person name',
    example: 'John Doe',
  })
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  contact_name: string;

  @ApiProperty({
    description: 'Company/Shop name',
    example: 'ABC Electronics Store',
  })
  @IsString()
  @Length(2, 200)
  @Transform(({ value }) => value?.trim())
  company_name: string;

  @ApiProperty({
    description: 'Billing address',
    type: CustomerAddressDto,
  })
  @ValidateNested()
  @Type(() => CustomerAddressDto)
  billing_address: CustomerAddressDto;

  @ApiPropertyOptional({
    description: 'Shipping address',
    type: CustomerAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerAddressDto)
  shipping_address?: CustomerAddressDto;

  @ApiPropertyOptional({
    description: 'VAT Registration Number',
    example: 'VAT123456789',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  vat_reg_number?: string;

  @ApiPropertyOptional({
    description: 'Tax Registration Number',
    example: 'TAX123456789',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  tax_reg_number?: string;

  @ApiPropertyOptional({
    description: 'GST Number',
    example: '29ABCDE1234F1Z5',
  })
  @IsOptional()
  @IsString()
  @Length(15, 15, { message: 'GST number must be exactly 15 characters' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  gst_number?: string;
}
