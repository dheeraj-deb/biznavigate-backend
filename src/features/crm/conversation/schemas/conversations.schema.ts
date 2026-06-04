import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ConversationDocument = Conversation & Document;

@Schema({ collection: 'conversations', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Conversation {
    @Prop({ required: true }) conversation_id!: string;
    @Prop({ required: true }) business_id!: string;
    @Prop() customer_id?: string;
    @Prop({ required: true }) lead_id!: string;
    @Prop() tenant_id?: string;
    @Prop({ required: true, enum: ['whatsapp', 'instagram', 'chatbot', 'website'] }) channel!: string;
    @Prop() platform_id?: string;
    @Prop() sender_id?: string;
    @Prop() sender_name?: string;
    @Prop() assigned_to?: string;
    @Prop({ required: true, enum: ['active', 'waiting', 'ended', 'failed', 'dropped', 'handed_off', 'open', 'resolved'] }) status!: string;
    @Prop() current_node_id?: string;
    @Prop() message_text?: string;
    @Prop() intent?: string;
    @Prop() workflowId?: string;
    @Prop() agent_id?: string;
    @Prop() failed_reason?: string;
    @Prop() is_ai_handled?: boolean;
    @Prop() is_ai?: boolean;
    @Prop() human_takeover_at?: Date;
    @Prop() human_takeover_reason?: string;
    @Prop() is_resolved?: boolean;
    @Prop({ default: 0 }) message_count?: number;
    @Prop({ default: null }) last_message_at?: Date | null;
    /**
     * Last time we received an inbound message from the customer on this
     * conversation. Drives the WhatsApp 24-hour-window gate — automations can
     * only send free-form text within 24h of this timestamp. Indexed below for
     * fast per-conversation lookup.
     */
    @Prop({ default: null }) last_inbound_at?: Date | null;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ conversation_id: 1 }, { unique: true });
ConversationSchema.index({ business_id: 1, tenant_id: 1, updated_at: -1 });
ConversationSchema.index({ business_id: 1, status: 1, updated_at: -1 });
ConversationSchema.index({ business_id: 1, channel: 1, updated_at: -1 });
ConversationSchema.index({ business_id: 1, last_message_at: -1 });
ConversationSchema.index({ business_id: 1, platform_id: 1, last_inbound_at: -1 });
