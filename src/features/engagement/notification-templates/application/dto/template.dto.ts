import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsObject,
  MaxLength,
  MinLength,
  Matches,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

/**
 * Notification Channels
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}

/**
 * Template Variable Types
 */
export enum VariableType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
}

/**
 * Template Variable Definition
 */
export class TemplateVariableDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Variable key must start with letter or underscore and contain only letters, numbers, and underscores',
  })
  key: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(VariableType)
  type: VariableType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  defaultValue?: any;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsOptional()
  exampleValue?: any;
}

/**
 * Create Notification Template DTO
 */
export class CreateTemplateDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Template key must be lowercase letters, numbers, and underscores only',
  })
  templateKey: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  templateName: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Email Channel
  @IsString()
  @IsOptional()
  @MaxLength(500)
  emailSubject?: string;

  @IsString()
  @IsOptional()
  emailBody?: string;

  @IsString()
  @IsOptional()
  emailHtml?: string;

  // SMS Channel
  @IsString()
  @IsOptional()
  @MaxLength(1600)
  smsBody?: string;

  // WhatsApp Channel
  @IsString()
  @IsOptional()
  whatsappBody?: string;

  // Push Notification
  @IsString()
  @IsOptional()
  @MaxLength(255)
  pushTitle?: string;

  @IsString()
  @IsOptional()
  pushBody?: string;

  // Variables
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables: TemplateVariableDto[];

  // Enabled Channels
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one channel must be enabled' })
  @IsEnum(NotificationChannel, { each: true })
  enabledChannels: NotificationChannel[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @IsUUID()
  @IsNotEmpty()
  createdBy: string;
}

/**
 * Update Template DTO
 */
export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  templateName?: string;

  description?: string;
}

/**
 * Template Filter DTO
 */
export class TemplateFilterDto {
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  templateKey?: string;

  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

/**
 * Template Preview/Test DTO
 */
export class TemplatePreviewDto {
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsObject()
  variables: Record<string, any>;
}

/**
 * Send Test Notification DTO
 */
export class SendTestNotificationDto extends TemplatePreviewDto {
  @IsString()
  @IsOptional()
  testEmail?: string;

  @IsString()
  @IsOptional()
  testPhone?: string;

  @IsString()
  @IsOptional()
  testDeviceToken?: string;
}

/**
 * Clone Template DTO
 */
export class CloneTemplateDto {
  @IsUUID()
  @IsNotEmpty()
  sourceTemplateId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_]+$/)
  newTemplateKey: string;

  @IsString()
  @IsNotEmpty()
  newTemplateName: string;

  @IsBoolean()
  @IsOptional()
  copyAsActive?: boolean;
}

/**
 * Bulk Template Action DTO
 */
export class BulkTemplateActionDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  templateIds: string[];

  @IsEnum(['activate', 'deactivate', 'delete'])
  action: 'activate' | 'deactivate' | 'delete';
}

/**
 * Template Validation Result
 */
export class TemplateValidationResultDto {
  isValid: boolean;

  errors: string[];

  warnings: string[];

  detectedVariables: string[];

  missingDefinitions: string[];
}
