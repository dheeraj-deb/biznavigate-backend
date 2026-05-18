import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Duplicate-fire guard for `trigger.event.lead_inactive`. Once we fire the
 * trigger for a (workflow_id, lead_id) pair, we record it here. The scanner
 * won't fire again until the lead's updated_at moves past fired_at (i.e. the
 * lead became active again, then went inactive again).
 */
@Schema({ collection: 'workflow_inactive_fires', timestamps: true })
export class WorkflowInactiveFire {
  @Prop({ required: true, index: true }) workflow_id!: string;
  @Prop({ required: true, index: true }) lead_id!: string;
  @Prop({ required: true }) fired_at!: Date;
}

export type WorkflowInactiveFireDocument = WorkflowInactiveFire & Document;
export const WorkflowInactiveFireSchema = SchemaFactory.createForClass(WorkflowInactiveFire);
WorkflowInactiveFireSchema.index({ workflow_id: 1, lead_id: 1 }, { unique: true });
