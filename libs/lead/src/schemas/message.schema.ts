import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * MongoDB Message document.
 * Append-only — never updated except delivery status (status field).
 *
 * platform_id (WhatsApp wamid): unique sparse index prevents duplicate inserts
 * on webhook retries. Website messages have no platform_id (null).
 */
@Schema({ collection: 'messages' })
export class Message {
  @Prop({ required: true, index: true })
  conversation_id: string;

  @Prop({ required: true, index: true })
  lead_id: string;

  @Prop({ required: true })
  business_id: string;

  @Prop({ required: true, enum: ['user', 'ai', 'agent'] })
  role: string;

  @Prop({ default: null })
  body: string | null;

  @Prop({ default: 'text', enum: ['text', 'image', 'document', 'flow', 'template'] })
  type: string;

  @Prop({ default: null })
  media_url: string | null;

  // WhatsApp message ID — null for website messages
  @Prop({ default: null })
  platform_id: string | null;

  @Prop({ default: 'sent', enum: ['sent', 'delivered', 'read', 'failed'] })
  status: string;

  /**
   * AI analysis — flexible object, no separate columns.
   * {
   *   intent:        string    // "booking" | "inquiry" | "cancel" | null
   *   entities:      object    // { check_in, guests, item_name, ... }
   *   confidence:    number    // 0.0–1.0
   *   template_used: string    // WhatsApp template name or null
   *   is_automated:  boolean   // true = AI sent, false = human typed
   * }
   */
  @Prop({ type: Object, default: null })
  meta: Record<string, any> | null;

  @Prop({ required: true, default: () => new Date() })
  created_at: Date;
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);

// Primary read pattern: load message thread in chronological order
MessageSchema.index({ conversation_id: 1, created_at: 1 });

// Lead timeline view
MessageSchema.index({ lead_id: 1, created_at: -1 });

// Dedup on webhook retry — sparse so null platform_id is not indexed
MessageSchema.index({ platform_id: 1 }, { unique: true, sparse: true });

// Business-level message feed (ops/debug)
MessageSchema.index({ business_id: 1, created_at: -1 });
