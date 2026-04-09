import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * MongoDB Conversation document.
 * One per chat session — WhatsApp or Website widget.
 *
 * platform_id:
 *   WhatsApp  → customer phone number "919876543210"
 *   Website   → browser session ID "ws_abc123"
 */
@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {
  @Prop({ required: true })
  conversation_id: string; // UUID — synced with PostgreSQL lead's reference

  @Prop({ required: true, index: true })
  lead_id: string; // UUID — references leads.lead_id in PostgreSQL

  @Prop({ required: true, index: true })
  business_id: string;

  @Prop({ required: true, enum: ['whatsapp', 'website'] })
  channel: string;

  @Prop({ required: true })
  platform_id: string; // unique per business+channel — see compound unique index below

  @Prop({ default: 'open', enum: ['open', 'resolved', 'handed_off'] })
  status: string;

  @Prop({ default: true })
  is_ai: boolean;

  @Prop({ default: null })
  agent_id: string | null; // user UUID when handed off to human

  @Prop({ default: 0 })
  message_count: number;

  @Prop({ default: null })
  last_message_at: Date | null;
}

export type ConversationDocument = Conversation & Document;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// O(1) webhook lookup — every incoming message searches by platform_id + business_id
ConversationSchema.index({ platform_id: 1, business_id: 1 }, { unique: true });

// Inbox: open conversations sorted by most recent
ConversationSchema.index({ business_id: 1, status: 1 });
ConversationSchema.index({ business_id: 1, last_message_at: -1 });

// Lead timeline: all conversations for a lead
ConversationSchema.index({ lead_id: 1 });
