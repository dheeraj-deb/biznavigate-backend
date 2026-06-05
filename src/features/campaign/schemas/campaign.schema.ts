import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AudienceFilterOperator, CampaignStatus, CampaignType } from "../enums/enums";
import { Types } from "mongoose";

@Schema({ _id: false })
class AudienceCondition {
    @Prop({ required: true })
    field: string

    @Prop({ required: true })
    operator: string

    @Prop({ type: Object, required: true })
    value: any;
}

@Schema({ _id: false })
class AudienceFilter {
    @Prop({ type: String, enum: AudienceFilterOperator, default: AudienceFilterOperator.AND })
    operator: AudienceFilterOperator;

    @Prop({ type: [Object], default: [] })
    conditions: AudienceCondition[];
}

@Schema({ _id: false })
class TemplateVariableMapping {
    @Prop({ required: true })
    variableIndex: number;

    @Prop({ required: true })
    source: string;
}

@Schema({ _id: false })
class CampaignSchedule {
    @Prop({ required: true })
    sendAt: Date;

    @Prop()
    timezone: string;

    @Prop()
    cronExpression?: string;

    @Prop()
    endsAt?: Date;
}

@Schema({ _id: false })
class CampaignRateLimit {
    @Prop({ default: 50 })
    messagesPerSecond: number;

    @Prop({ default: 1000 })
    batchSize: number;
}

@Schema({ timestamps: true, collection: 'campaigns' })
export class Campaign {
    @Prop({ type: String, required: true, index: true })
    businessId: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ type: String, enum: CampaignType, default: CampaignType.ONE_TIME })
    type: CampaignType;

    @Prop({ type: Types.ObjectId, ref: 'WhatsAppTemplate', required: true })
    templateId: Types.ObjectId;

    @Prop({ required: true })
    templateLanguage: string;

    @Prop({ type: [Object], default: [] })
    variableMappings: TemplateVariableMapping[];

    @Prop({ type: Object })
    audienceFilter: AudienceFilter;

    @Prop({ type: [String], default: [] })
    explicitPhoneNumbers: string[];

    @Prop({ type: Object, required: true })
    schedule: CampaignSchedule;

    @Prop({ type: Object, default: {} })
    rateLimit: CampaignRateLimit;

    @Prop({ type: String, enum: CampaignStatus, default: CampaignStatus.DRAFT })
    status: CampaignStatus;

    @Prop()
    startedAt?: Date;

    @Prop()
    completedAt?: Date;

    @Prop({ default: 0 })
    totalRecipients: number;

    @Prop()
    failureReason?: string;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;
}

export type CampaignDocument = Campaign & Document;
export const CampaignSchema = SchemaFactory.createForClass(Campaign);

CampaignSchema.index({ businessId: 1, status: 1 });
CampaignSchema.index({ businessId: 1, createdAt: -1 });
CampaignSchema.index({ 'schedule.sendAt': 1, status: 1 });