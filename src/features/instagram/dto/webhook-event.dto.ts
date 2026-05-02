import { IsString, IsOptional, IsObject, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class WebhookChangeValueDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsObject()
  @IsOptional()
  from?: { id: string; username?: string };

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  media_id?: string;

  @IsString()
  @IsOptional()
  media_type?: string;

  @IsString()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsOptional()
  post_id?: string;

  @IsString()
  @IsOptional()
  comment_id?: string;

  @IsObject()
  @IsOptional()
  sender?: {
    id: string;
    username?: string;
    name?: string;
  };

  @IsObject()
  @IsOptional()
  recipient?: {
    id: string;
  };
}

export class WebhookChangeDto {
  @IsString()
  field: string; // 'comments', 'messages', 'mentions'

  @ValidateNested()
  @Type(() => WebhookChangeValueDto)
  value: WebhookChangeValueDto;
}

export class MessagingItemDto {
  @IsObject()
  @IsOptional()
  sender?: { id: string };

  @IsObject()
  @IsOptional()
  recipient?: { id: string };

  @IsNumber()
  @IsOptional()
  timestamp?: number;

  @IsObject()
  @IsOptional()
  message?: {
    mid?: string;
    text?: string;
    attachments?: any[];
  };
}

export class WebhookEntryDto {
  @IsString()
  id: string; // Instagram Business Account ID or Page ID

  @IsNumber()
  time: number; // Unix timestamp

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebhookChangeDto)
  @IsOptional()
  changes?: WebhookChangeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessagingItemDto)
  @IsOptional()
  messaging?: MessagingItemDto[];
}

export class InstagramWebhookDto {
  @IsString()
  object: string; // 'instagram' or 'page'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebhookEntryDto)
  entry: WebhookEntryDto[];
}

export class WebhookVerificationDto {
  @IsString()
  'hub.mode': string;

  @IsString()
  'hub.verify_token': string;

  @IsString()
  'hub.challenge': string;
}
