import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ConversationDocument = Conversation & Document;

@Schema({ collection: 'conversations', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Conversation {
    @Prop({ required: true }) conversation_id: string;
    @Prop({ required: true }) business_id: string;
    @Prop({ required: true }) customer_id: string;
    @Prop({ required: true }) lead_id: string;
    @Prop({ required: true }) tenant_id: string;
    @Prop({ required: true, enum: ['whatsapp', 'instagram', 'chatbot', 'website'] }) channel: string;
    @Prop({ required: true }) sender_id: string; // phoneNumberId
    @Prop() sender_name: string;
    @Prop() assigned_to: string;
    @Prop({ required: true, enum: ['active', 'waiting', 'ended', 'failed', 'dropped', 'handed_off', 'open', 'resolved'] }) status: string;
    @Prop() current_node_id: string; // workflow node the conversation is currently at
    @Prop() message_text: string;
    @Prop() intent: string;
    @Prop() workflowId: string;
    @Prop() agent_id: string;
    @Prop() failed_reason: string;
    @Prop() is_ai_handled: boolean;
    @Prop() is_ai: boolean;
    @Prop() human_takeover_at: Date;
    @Prop() human_takeover_reason: string;
    @Prop() is_resolved: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);