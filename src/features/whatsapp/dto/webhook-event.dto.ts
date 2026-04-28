import { IsString, IsOptional, ValidateNested, IsArray, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// Message Types
export enum WhatsAppMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACTS = 'contacts',
  INTERACTIVE = 'interactive',
  BUTTON = 'button',
  REACTION = 'reaction',
  STICKER = 'sticker',
  ORDER = 'order',
}

// Interactive Message Types
export enum InteractiveType {
  BUTTON_REPLY = 'button_reply',
  LIST_REPLY = 'list_reply',
  NFM_REPLY = 'nfm_reply',
}

// Status Types
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

// Message Context (Reply to message)
export class MessageContextDto {
    @IsString()
  from: string;

    @IsString()
  @IsOptional()
  id?: string;
}

// Text Message
export class TextMessageDto {
    @IsString()
  body: string;
}

// Image/Video/Audio/Document
export class MediaMessageDto {
    @IsString()
  @IsOptional()
  id?: string;

    @IsString()
  @IsOptional()
  link?: string;

    @IsString()
  @IsOptional()
  mime_type?: string;

    @IsString()
  @IsOptional()
  sha256?: string;

    @IsString()
  @IsOptional()
  caption?: string;

    @IsString()
  @IsOptional()
  filename?: string;
}

// Location Message
export class LocationMessageDto {
    @IsNumber()
  latitude: number;

    @IsNumber()
  longitude: number;

    @IsString()
  @IsOptional()
  name?: string;

    @IsString()
  @IsOptional()
  address?: string;
}

// Interactive Message Reply
export class ButtonReplyDto {
    @IsString()
  id: string;

    @IsString()
  title: string;
}

export class ListReplyDto {
    @IsString()
  id: string;

    @IsString()
  title: string;

    @IsString()
  @IsOptional()
  description?: string;
}

export class NfmReplyDto {
    @IsString()
  response_json: string;

    @IsString()
  @IsOptional()
  body?: string;

    @IsString()
  @IsOptional()
  name?: string;
}

export class InteractiveMessageDto {
    @IsEnum(InteractiveType)
  type: InteractiveType;

    @ValidateNested()
  @Type(() => ButtonReplyDto)
  @IsOptional()
  button_reply?: ButtonReplyDto;

    @ValidateNested()
  @Type(() => ListReplyDto)
  @IsOptional()
  list_reply?: ListReplyDto;

    @ValidateNested()
  @Type(() => NfmReplyDto)
  @IsOptional()
  nfm_reply?: NfmReplyDto;
}

// Reaction Message
export class ReactionMessageDto {
    @IsString()
  message_id: string;

    @IsString()
  @IsOptional()
  emoji?: string;
}

// Order Message (for catalog orders)
export class OrderProductItemDto {
    @IsString()
  product_retailer_id: string;

    @IsNumber()
  @IsOptional()
  quantity?: number;

    @IsNumber()
  @IsOptional()
  item_price?: number;

    @IsString()
  @IsOptional()
  currency?: string;
}

export class OrderMessageDto {
    @IsString()
  catalog_id: string;

    @IsString()
  @IsOptional()
  text?: string;

    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductItemDto)
  product_items: OrderProductItemDto[];
}

// Profile
export class ProfileDto {
    @IsString()
  name: string;
}

// Contact
export class ContactDto {
    @ValidateNested()
  @Type(() => ProfileDto)
  @IsOptional()
  profile?: ProfileDto;

    @IsString()
  wa_id: string;
}

// Message
export class WhatsAppMessageDto {
    @IsString()
  from: string;

    @IsString()
  id: string;

    @Type(() => Number)
  @IsNumber()
  timestamp: number;

    @IsString()
  type: string; // kept as string — Meta can send 'unsupported', 'system', future types

    @ValidateNested()
  @Type(() => MessageContextDto)
  @IsOptional()
  context?: MessageContextDto;

    @ValidateNested()
  @Type(() => TextMessageDto)
  @IsOptional()
  text?: TextMessageDto;

    @ValidateNested()
  @Type(() => MediaMessageDto)
  @IsOptional()
  image?: MediaMessageDto;

    @ValidateNested()
  @Type(() => MediaMessageDto)
  @IsOptional()
  video?: MediaMessageDto;

    @ValidateNested()
  @Type(() => MediaMessageDto)
  @IsOptional()
  audio?: MediaMessageDto;

    @ValidateNested()
  @Type(() => MediaMessageDto)
  @IsOptional()
  document?: MediaMessageDto;

    @ValidateNested()
  @Type(() => LocationMessageDto)
  @IsOptional()
  location?: LocationMessageDto;

    @ValidateNested()
  @Type(() => InteractiveMessageDto)
  @IsOptional()
  interactive?: InteractiveMessageDto;

    @ValidateNested()
  @Type(() => ReactionMessageDto)
  @IsOptional()
  reaction?: ReactionMessageDto;

    @ValidateNested()
  @Type(() => OrderMessageDto)
  @IsOptional()
  order?: OrderMessageDto;
}

// Status
export class StatusDto {
    @IsString()
  id: string;

    @IsString()
  status: string; // kept as string — Meta can send 'deleted' and future statuses

    @Type(() => Number)
  @IsNumber()
  timestamp: number;

    @IsString()
  recipient_id: string;

    @IsArray()
  @IsOptional()
  errors?: any[];
}

// Metadata
export class MetadataDto {
    @IsString()
  display_phone_number: string;

    @IsString()
  phone_number_id: string;
}

// Value (contains messages or statuses)
export class ValueDto {
    @IsString()
  @IsOptional()
  messaging_product?: string;

    @ValidateNested()
  @Type(() => MetadataDto)
  @IsOptional()
  metadata?: MetadataDto;

    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  @IsOptional()
  contacts?: ContactDto[];

    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppMessageDto)
  @IsOptional()
  messages?: WhatsAppMessageDto[];

    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  @IsOptional()
  statuses?: StatusDto[];
}

// Change
export class ChangeDto {
    @ValidateNested()
  @Type(() => ValueDto)
  value: ValueDto;

    @IsString()
  field: string;
}

// Entry
export class EntryDto {
    @IsString()
  id: string; // WhatsApp Business Account ID

    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeDto)
  changes: ChangeDto[];
}

// Webhook Event
export class WhatsAppWebhookDto {
    @IsString()
  object: string; // Always 'whatsapp_business_account'

    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntryDto)
  entry: EntryDto[];
}

// Webhook Verification
export class WebhookVerificationDto {
    @IsString()
  'hub.mode': string;

    @IsString()
  'hub.verify_token': string;

    @IsString()
  'hub.challenge': string;
}
