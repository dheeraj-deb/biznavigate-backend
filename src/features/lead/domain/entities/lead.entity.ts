import { ApiProperty } from '@nestjs/swagger';

/**
 * Lead Entity
 * Represents a lead in the system
 */
export class LeadEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  lead_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  business_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  tenant_id: string;

  @ApiProperty({ example: 'whatsapp' })
  source: string;

  @ApiProperty({ required: false })
  source_reference_id?: string;

  @ApiProperty({ required: false })
  platform_user_id?: string;

  @ApiProperty({ required: false })
  post_id?: string;

  @ApiProperty({ required: false })
  page_id?: string;

  @ApiProperty({ required: false })
  first_name?: string;

  @ApiProperty({ required: false })
  last_name?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  alternate_phone?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  state?: string;

  @ApiProperty({ required: false, default: 'India' })
  country?: string;

  @ApiProperty({ required: false })
  pincode?: string;

  @ApiProperty({ default: 'new' })
  status: string;

  @ApiProperty({ required: false })
  intent_type?: string;

  @ApiProperty({ required: false })
  lead_quality?: string;

  @ApiProperty({ default: 0 })
  lead_score?: number;

  @ApiProperty({ required: false })
  assigned_agent_id?: string;

  @ApiProperty({ required: false })
  assigned_at?: Date;

  @ApiProperty({ required: false })
  assigned_by?: string;

  @ApiProperty({ required: false })
  first_contact_at?: Date;

  @ApiProperty({ required: false })
  last_contact_at?: Date;

  @ApiProperty({ required: false })
  last_activity_at?: Date;

  @ApiProperty({ required: false })
  next_followup_at?: Date;

  @ApiProperty({ default: 0 })
  followup_count?: number;

  @ApiProperty({ default: false })
  is_converted: boolean;

  @ApiProperty({ required: false })
  converted_at?: Date;

  @ApiProperty({ required: false })
  conversion_value?: number;

  @ApiProperty({ required: false })
  interested_products?: any;

  @ApiProperty({ required: false })
  interested_courses?: any;

  @ApiProperty({ required: false })
  tags?: any;

  @ApiProperty({ required: false })
  custom_fields?: any;

  @ApiProperty({ required: false })
  extracted_entities?: any;

  @ApiProperty({ required: false })
  sentiment_score?: number;

  @ApiProperty({ required: false })
  preferred_contact_method?: string;

  @ApiProperty({ required: false })
  preferred_contact_time?: string;

  @ApiProperty({ default: 'en' })
  language_preference?: string;

  @ApiProperty({ required: false })
  utm_source?: string;

  @ApiProperty({ required: false })
  utm_medium?: string;

  @ApiProperty({ required: false })
  utm_campaign?: string;

  @ApiProperty({ required: false })
  referral_source?: string;

  @ApiProperty({ required: false })
  lost_reason?: string;

  @ApiProperty({ required: false })
  lost_at?: Date;

  @ApiProperty({ required: false })
  invalid_reason?: string;

  @ApiProperty({ default: true })
  is_active: boolean;

  @ApiProperty({ default: false })
  is_duplicate: boolean;

  @ApiProperty({ required: false })
  duplicate_of_lead_id?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ required: false })
  created_by?: string;

  @ApiProperty({ required: false })
  updated_by?: string;

  @ApiProperty({ required: false })
  deleted_at?: Date;

  @ApiProperty({ required: false })
  deleted_by?: string;
}
