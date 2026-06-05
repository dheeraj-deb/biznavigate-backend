import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ConversationContextDocument = ConversationContext & Document;

@Schema({ collection: 'conversation_context', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class ConversationContext {
    @Prop({ required: true }) conversation_id: string;
    @Prop({ type: Object }) memory: Record<string, any>;
}

export const ConversationContextSchema = SchemaFactory.createForClass(ConversationContext);
