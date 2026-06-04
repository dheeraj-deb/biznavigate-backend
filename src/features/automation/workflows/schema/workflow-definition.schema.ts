import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkflowDefinitionDocument = WorkflowDefinition & Document;

@Schema({ collection: 'workflow_definitions', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class WorkflowDefinition {
    @Prop({ required: true, unique: true }) workflow_id: string;
    @Prop({ required: true }) workflow_name: string;
    @Prop({ required: true }) business_type: string;
    @Prop() description: string;
    @Prop() blueprint_key?: string;
    @Prop({ required: true, default: '1.0.0' }) version: string;
    @Prop({ type: Object, required: true }) workflow_definition: Record<string, any>;
    @Prop({ default: false }) is_active: boolean;
}

export const WorkflowDefinitionSchema = SchemaFactory.createForClass(WorkflowDefinition);
WorkflowDefinitionSchema.index({ business_type: 1 });
