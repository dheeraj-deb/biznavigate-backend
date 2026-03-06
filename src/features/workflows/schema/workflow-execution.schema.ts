import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkflowExecutionDocument = WorkflowExecution & Document;

@Schema({ collection: 'workflow_executions', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class WorkflowExecution {
    @Prop({ required: true, unique: true }) execution_id: string;
    @Prop({ required: true }) workflow_id: string;
    @Prop({ required: true }) business_id: string;
    @Prop({ required: true }) lead_id: string;
    @Prop({ required: true, enum: ['whatsapp', 'instagram', 'chatbot'] }) channel: string;
    @Prop({ required: true }) chat_id: string;
    @Prop({ required: true, enum: ['running', 'paused', 'completed', 'failed', 'dropped'], default: 'running' }) status: string;
    @Prop() current_node_id: string;
    @Prop({ default: false }) waiting_for_input: boolean;
    @Prop({ type: Object }) context: Record<string, any>;
}

export const WorkflowExecutionSchema = SchemaFactory.createForClass(WorkflowExecution);
WorkflowExecutionSchema.index({ business_id: 1, lead_id: 1, status: 1 });
WorkflowExecutionSchema.index({ chat_id: 1, waiting_for_input: 1 });