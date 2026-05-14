import { IsString, IsOptional, IsObject, IsUUID, IsUrl } from 'class-validator';

export class SendWidgetMessageDto {
  @IsString()
  businessId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  visitorId?: string; // Anonymous visitor ID (generated client-side)

  @IsOptional()
  @IsString()
  visitorName?: string;

  @IsOptional()
  @IsString()
  visitorEmail?: string;

  @IsOptional()
  @IsString()
  visitorPhone?: string;

  @IsOptional()
  @IsUrl()
  pageUrl?: string; // URL where widget is embedded

  @IsOptional()
  @IsString()
  pageTitle?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class InitWidgetDto {
  @IsString()
  businessId: string;

  @IsOptional()
  @IsString()
  visitorId?: string;

  @IsOptional()
  @IsUrl()
  pageUrl?: string;
}

export class WidgetConfigDto {
  @IsString()
  businessId: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @IsOptional()
  @IsString()
  botName?: string;

  @IsOptional()
  @IsString()
  position?: 'bottom-right' | 'bottom-left';
}

export class UpdateVisitorInfoDto {
  @IsString()
  businessId: string;

  @IsString()
  visitorId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
