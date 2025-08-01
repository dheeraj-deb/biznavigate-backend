import { IsEmail, IsString, IsOptional, Length, Matches, IsUUID, IsNumber, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IntegrationConfigDto {
  @ApiProperty({ description: 'Client ID for integration' })
  @IsString()
  clientId: string;

  @ApiProperty({ description: 'Client secret for integration' })
  @IsString()
  clientSecret: string;

  @ApiProperty({ description: 'Organization ID for integration' })
  @IsString()
  organizationId: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Platform/Integration ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  platformId: string;

  @ApiProperty({
    description: 'Integration configuration',
    type: IntegrationConfigDto,
  })
  @ValidateNested()
  @Type(() => IntegrationConfigDto)
  integrationConfig: IntegrationConfigDto;

  @ApiProperty({
    description: 'Customer unique identifier',
    example: 'CUST001',
  })
  @IsString()
  @Length(1, 50)
  @Transform(({ value }) => value?.trim())
  customerId: string;

  @ApiProperty({
    description: 'Business name',
    example: 'ABC Technologies Pvt Ltd',
  })
  @IsString()
  @Length(2, 200)
  @Transform(({ value }) => value?.trim())
  businessName: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+91-9876543210',
  })
  @IsString()
  @Matches(/^\+?[\d\s\-\(\)]+$/, { message: 'Please provide a valid phone number' })
  @Transform(({ value }) => value?.trim())
  contactPhone: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'contact@abc-tech.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  contactEmail: string;

  @ApiPropertyOptional({
    description: 'GST Identification Number',
    example: '29ABCDE1234F1Z5',
  })
  @IsOptional()
  @IsString()
  @Length(15, 15, { message: 'GSTIN must be exactly 15 characters' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  gstin?: string;

  @ApiPropertyOptional({
    description: 'Business address',
    example: '123 Tech Park, Bangalore, Karnataka, 560001',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({
    description: 'Notification preference',
    example: 'email',
    enum: ['email', 'sms', 'both', 'none'],
  })
  @IsOptional()
  @IsString()
  notificationPreference?: string;
}
