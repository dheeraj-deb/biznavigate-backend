import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MessagesDocument = Messages & Document;

@Schema({ collection: 'messages', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Messages {
    @Prop({ required: true }) conversation_id: string;
    @Prop({ required: true }) business_id: string;
    @Prop({ required: true }) tenant_id: string;
    @Prop({ required: true }) lead_id: string;
    @Prop() sender_id: string; //phone number id
    @Prop() sender_name: string;
    @Prop({ required: true }) sender_type: string;       // 'customer' | 'business'
    @Prop({ required: true, enum: ['text', 'location', 'interactive', 'button', 'image', 'video', 'audio', 'document', 'order', 'template'] }) message_type: string;
    @Prop() message_response_based_on_type: string;
    @Prop() message_text: string;
    @Prop({ index: true, unique: true, sparse: true }) platform_message_id: string; // WhatsApp message ID for deduplication
    @Prop() assigned_to: string; // workflow / bot / agent
    @Prop() workflow_node_id: string; // node ID that sent this message or was waiting when message was received
    @Prop({ default: 'sent' }) delivery_status: string;
    @Prop() delivered_at: Date;
    @Prop() read_at: Date;
    @Prop() failed_reason: string;
    @Prop() intent_detected: string;
    @Prop({ type: Object }) entities_extracted: Record<string, any>;
    @Prop({ type: Object }) metadata: Record<string, any>;
    @Prop({ default: Date.now }) timestamp: Date;
    created_at?: Date;
    updated_at?: Date;
}

export const MessagesSchema = SchemaFactory.createForClass(Messages);
MessagesSchema.index({ business_id: 1, conversation_id: 1, timestamp: 1 });
MessagesSchema.index({ conversation_id: 1, timestamp: 1 });
