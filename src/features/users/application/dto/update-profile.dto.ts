import { IsBoolean, IsOptional, IsString, IsUrl, IsEnum, IsObject, Matches } from 'class-validator';

export enum BusinessType {
  RETAIL = 'retail',
  ECOMMERCE = 'ecommerce',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  REAL_ESTATE = 'real_estate',
  HOSPITALITY = 'hospitality',
  CONSULTING = 'consulting',
  TECHNOLOGY = 'technology',
  MANUFACTURING = 'manufacturing',
  OTHER = 'other',
}

export class UpdateProfileDto {
    @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'WhatsApp number must be a valid phone number with country code',
  })
  whatsapp_number?: string;

    @IsOptional()
  @IsEnum(BusinessType)
  business_type?: BusinessType;

    @IsOptional()
  @IsString()
  logo_url?: string;

    @IsOptional()
  @IsObject()
  working_hours?: Record<string, { open: string; close: string; closed: boolean }>;

    @IsOptional()
  @IsBoolean()
  profile_completed?: boolean;
}
