import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RagDocumentDoc = RagDocument & Document;

@Schema({ collection: 'rag_documents', timestamps: true })
export class RagDocument {
  @Prop({ required: true, index: true })
  businessId: string;

  @Prop({ required: true })
  collection: string; // 'docs', 'products', etc.

  @Prop({ required: true })
  text: string;

  @Prop({ type: [Number], required: true })
  embedding: number[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const RagDocumentSchema = SchemaFactory.createForClass(RagDocument);

// Compound index for fast per-business filtering
RagDocumentSchema.index({ businessId: 1, collection: 1 });
