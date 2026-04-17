import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BusinessWorkflowDocument = BusinessWorkflow & Document;

@Schema({ collection: 'business_workflows', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class BusinessWorkflow {
    @Prop({ required: true }) business_id: string;
    @Prop({ required: true }) tenant_id: string;
    @Prop({ required: true }) workflow_id: string;
    @Prop({ default: true }) is_active: boolean;
}

export const BusinessWorkflowSchema = SchemaFactory.createForClass(BusinessWorkflow);
BusinessWorkflowSchema.index({ business_id: 1, workflow_id: 1 }, { unique: true });