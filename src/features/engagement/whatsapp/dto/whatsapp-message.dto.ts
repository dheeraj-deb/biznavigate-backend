import { IsString, IsOptional, IsObject, ValidateNested, IsArray, IsEnum, IsUrl, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// Send Message Types
export enum SendMessageType {
  TEXT = 'text',
  TEMPLATE = 'template',
  INTERACTIVE = 'interactive',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
  REACTION = 'reaction',
}

// Interactive Message Types
export enum InteractiveSendType {
  BUTTON = 'button',
  LIST = 'list',
  PRODUCT = 'product',
  PRODUCT_LIST = 'product_list',
  ORDER_DETAILS = 'order_details',
}

// ==================== Text Message ====================

export class TextDto {
  @IsString()
  body: string;

  @IsBoolean()
  @IsOptional()
  preview_url?: boolean;
}

// ==================== Template Message ====================

export class ParameterDto {
  @IsString()
  type: string; // 'text', 'currency', 'date_time', 'image', 'document', 'video'

  @IsString()
  @IsOptional()
  text?: string;

  @IsObject()
  @IsOptional()
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };

  @IsObject()
  @IsOptional()
  date_time?: {
    fallback_value: string;
  };

  @IsObject()
  @IsOptional()
  image?: {
    link?: string;
    id?: string;
  };

  @IsObject()
  @IsOptional()
  document?: {
    link?: string;
    id?: string;
    filename?: string;
  };

  @IsObject()
  @IsOptional()
  video?: {
    link?: string;
    id?: string;
  };
}

export class ComponentDto {
  @IsString()
  type: string; // 'header', 'body', 'button'

  @IsString()
  @IsOptional()
  sub_type?: string; // For button: 'quick_reply', 'url'

  @IsNumber()
  @IsOptional()
  index?: number; // For button

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDto)
  @IsOptional()
  parameters?: ParameterDto[];
}

export class LanguageDto {
  @IsString()
  code: string; // 'en_US', 'pt_BR', etc.
}

export class TemplateDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => LanguageDto)
  language: LanguageDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentDto)
  @IsOptional()
  components?: ComponentDto[];
}

// ==================== Interactive Message ====================

export class HeaderDto {
  @IsString()
  type: string; // 'text', 'image', 'video', 'document'

  @IsString()
  @IsOptional()
  text?: string;

  @IsObject()
  @IsOptional()
  image?: {
    link?: string;
    id?: string;
  };

  @IsObject()
  @IsOptional()
  video?: {
    link?: string;
    id?: string;
  };

  @IsObject()
  @IsOptional()
  document?: {
    link?: string;
    id?: string;
    filename?: string;
  };
}

export class BodyDto {
  @IsString()
  text: string;
}

export class FooterDto {
  @IsString()
  text: string;
}

export class ButtonReplyDto {
  @IsString()
  id: string;

  @IsString()
  title: string;
}

export class ActionButtonDto {
  @IsString()
  type: string; // 'reply'

  @ValidateNested()
  @Type(() => ButtonReplyDto)
  reply: ButtonReplyDto;
}

export class RowDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ProductItemDto {
  @IsString()
  product_retailer_id: string;
}

export class SectionDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RowDto)
  @IsOptional()
  rows?: RowDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  @IsOptional()
  product_items?: ProductItemDto[];
}

export class ActionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionButtonDto)
  @IsOptional()
  buttons?: ActionButtonDto[];

  @IsString()
  @IsOptional()
  button?: string; // For list

  @IsString()
  @IsOptional()
  catalog_id?: string; // For product_list

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  @IsOptional()
  sections?: SectionDto[];
}

export class InteractiveDto {
  @IsEnum(InteractiveSendType)
  type: InteractiveSendType;

  @ValidateNested()
  @Type(() => HeaderDto)
  @IsOptional()
  header?: HeaderDto;

  @ValidateNested()
  @Type(() => BodyDto)
  body: BodyDto;

  @ValidateNested()
  @Type(() => FooterDto)
  @IsOptional()
  footer?: FooterDto;

  @ValidateNested()
  @Type(() => ActionDto)
  action: ActionDto;
}

// ==================== Media Message ====================

export class MediaDto {
  @IsString()
  @IsOptional()
  id?: string; // Media ID from upload

  @IsUrl()
  @IsOptional()
  link?: string; // External URL

  @IsString()
  @IsOptional()
  caption?: string;

  @IsString()
  @IsOptional()
  filename?: string; // For documents
}

// ==================== Location Message ====================

export class LocationDto {
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

// ==================== Reaction Message ====================

export class ReactionDto {
  @IsString()
  message_id: string;

  @IsString()
  @IsOptional()
  emoji?: string; // Empty string to remove reaction
}

// ==================== Context (Reply) ====================

export class ContextDto {
  @IsString()
  message_id: string;
}

// ==================== Send Message DTO ====================

export class SendWhatsAppMessageDto {
  @IsString()
  messaging_product: string = 'whatsapp';

  @IsString()
  @IsOptional()
  recipient_type?: string = 'individual';

  @IsString()
  to: string; // Phone number with country code (e.g., "1234567890")

  @IsEnum(SendMessageType)
  type: SendMessageType;

  @ValidateNested()
  @Type(() => ContextDto)
  @IsOptional()
  context?: ContextDto;

  @ValidateNested()
  @Type(() => TextDto)
  @IsOptional()
  text?: TextDto;

  @ValidateNested()
  @Type(() => TemplateDto)
  @IsOptional()
  template?: TemplateDto;

  @ValidateNested()
  @Type(() => InteractiveDto)
  @IsOptional()
  interactive?: InteractiveDto;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  image?: MediaDto;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  video?: MediaDto;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  audio?: MediaDto;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  document?: MediaDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;

  @ValidateNested()
  @Type(() => ReactionDto)
  @IsOptional()
  reaction?: ReactionDto;
}

// ==================== Mark as Read DTO ====================

class TypingIndicatorDto {
  @IsString()
  type: string;
}

export class MarkAsReadDto {
  @IsString()
  messaging_product: string = 'whatsapp';

  @IsString()
  status: string = 'read';

  @IsString()
  message_id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TypingIndicatorDto)
  typing_indicator?: TypingIndicatorDto;
}
