import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum TemplateCategory {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION',
}

export enum TemplateStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  DISABLED = 'DISABLED',
}

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @IsString()
  language: string; // 'en_US', 'pt_BR', etc.

  @IsString()
  @IsOptional()
  header?: string;

  @IsString()
  body: string;

  @IsString()
  @IsOptional()
  footer?: string;

  @IsArray()
  @IsOptional()
  buttons?: string[];
}

export class GetTemplatesDto {
  @IsString()
  businessId: string;

  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;
}
