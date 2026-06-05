import {
    IsString, IsOptional, IsEmail, IsEnum, IsBoolean,
    IsNumber, IsArray, IsObject, IsDateString, MaxLength,
    Min, Max, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export enum ContactStatus {
    NEW = 'new',
    CONTACTED = 'contacted',
    QUALIFIED = 'qualified',
    CONVERTED = 'converted',
    LOST = 'lost',
    INVALID = 'invalid',
}

export enum LeadQuality {
    HOT = 'hot',
    WARM = 'warm',
    COLD = 'cold',
}

export enum IntentType {
    BUY = 'buy',
    INQUIRY = 'inquiry',
    SUPPORT = 'support',
    OTHER = 'other',
}

export enum ContactSource {
    WHATSAPP = 'whatsapp',
    INSTAGRAM = 'instagram',
    FACEBOOK = 'facebook',
    MANUAL = 'manual',
    IMPORT = 'import',
    WEBSITE = 'website',
    REFERRAL = 'referral',
}

export class CreateCustomerDto {
    @IsString()
    @IsOptional()
    @MaxLength(255)
    name?: string;

    @IsString()
    @MaxLength(20)
    phone: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    whatsapp_number?: string;

    @IsString()
    @IsOptional()
    platform_user_id?: string;
}

export class CreateContactDto {
    @IsEnum(ContactSource)
    source: ContactSource;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    first_name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    last_name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    phone?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    alternate_phone?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    city?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    state?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    country?: string;

    @IsString()
    @IsOptional()
    @MaxLength(10)
    pincode?: string;

    @IsEnum(ContactStatus)
    @IsOptional()
    status?: ContactStatus;

    @IsEnum(IntentType)
    @IsOptional()
    intent_type?: IntentType;

    @IsEnum(LeadQuality)
    @IsOptional()
    lead_quality?: LeadQuality;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    lead_score?: number;

    @IsUUID()
    @IsOptional()
    assigned_agent_id?: string;

    @IsDateString()
    @IsOptional()
    next_followup_at?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsArray()
    @IsOptional()
    interested_products?: any[];

    @IsObject()
    @IsOptional()
    custom_fields?: Record<string, any>;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    preferred_contact_method?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    preferred_contact_time?: string;

    @IsString()
    @IsOptional()
    @MaxLength(10)
    language_preference?: string;

    @IsString()
    @IsOptional()
    delivery_address?: string;

    // UTM tracking
    @IsString()
    @IsOptional()
    @MaxLength(100)
    utm_source?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    utm_medium?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    utm_campaign?: string;

    @IsString()
    @IsOptional()
    referral_source?: string;

    // Platform identifiers (auto-set for social sources)
    @IsString()
    @IsOptional()
    platform_user_id?: string;

    @IsString()
    @IsOptional()
    source_reference_id?: string;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {
    @IsEnum(ContactStatus)
    @IsOptional()
    status?: ContactStatus;

    @IsString()
    @IsOptional()
    lost_reason?: string;

    @IsBoolean()
    @IsOptional()
    is_converted?: boolean;

    @IsNumber()
    @IsOptional()
    @Min(0)
    conversion_value?: number;
}

export class QueryContactDto {
    @IsEnum(ContactStatus)
    @IsOptional()
    status?: ContactStatus;

    @IsEnum(LeadQuality)
    @IsOptional()
    lead_quality?: LeadQuality;

    @IsEnum(ContactSource)
    @IsOptional()
    source?: ContactSource;

    @IsString()
    @IsOptional()
    search?: string; // searches name, phone, email

    @IsUUID()
    @IsOptional()
    assigned_agent_id?: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    is_converted?: boolean;

    @IsDateString()
    @IsOptional()
    from_date?: string;

    @IsDateString()
    @IsOptional()
    to_date?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;

    @IsString()
    @IsOptional()
    sort_by?: string = 'created_at';

    @IsEnum(['asc', 'desc'])
    @IsOptional()
    sort_order?: 'asc' | 'desc' = 'desc';
}

export class AssignContactDto {
    @IsUUID()
    assigned_agent_id: string;
}

export class BulkAssignContactDto {
    @IsArray()
    @IsUUID('4', { each: true })
    lead_ids: string[];

    @IsUUID()
    assigned_agent_id: string;
}

export class AddNoteDto {
    @IsString()
    content: string;
}

export class UpdateFollowupDto {
    @IsDateString()
    next_followup_at: string;

    @IsString()
    @IsOptional()
    note?: string;
}

export class QueryCustomerDto {
    // Search across name, phone, email, whatsapp_number
    @IsString()
    @IsOptional()
    search?: string;

    @IsString()
    @IsOptional()
    sort_by?: 'created_at' | 'total_spent' | 'total_orders' | 'last_order_date' | 'engagement_score' = 'created_at';

    @IsEnum(['asc', 'desc'])
    @IsOptional()
    sort_order?: 'asc' | 'desc' = 'desc';

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;
}
