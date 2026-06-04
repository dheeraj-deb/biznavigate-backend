import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ButtonType, HeaderType, TemplateCategory, TemplateStatus } from "../enums/template.enum";
import { Types } from "mongoose";

@Schema({ id: false })
class TemplateButton {
    @Prop({ type: String, required: true, enum: ButtonType })
    type: ButtonType

    @Prop({ required: true })
    text: string

    @Prop()
    payload?: string;

    @Prop()
    phoneNumber?: string;

    @Prop()
    url?: string;

    @Prop()
    urlExample?: string;
}

@Schema({ id: false })
class TemplateHeader {
    @Prop({ type: String, required: true, enum: HeaderType })
    type: HeaderType

    @Prop()
    text?: string;

    @Prop()
    mediaUrl?: string;

    @Prop()
    example?: string;
}

@Schema({ _id: false })
class TemplateComponents {
    @Prop({ type: TemplateHeader })
    header?: TemplateHeader;

    @Prop({ required: true })
    body: string;

    @Prop()
    footer?: string;

    @Prop({ type: [String], default: [] })
    bodyExamples: string[];

    // Human-readable description for each {{N}} variable in order.
    // variableDescriptions[0] describes {{1}}, [1] describes {{2}}, etc.
    // Used by the AI analyzer to accurately map variables to context paths.
    @Prop({ type: [String], default: [] })
    variableDescriptions: string[];

    @Prop({ type: [TemplateButton], default: [] })
    buttons: TemplateButton[];
}


@Schema({ _id: false })
class TemplateAnalytics {
    @Prop({ default: 0 }) sent: number;
    @Prop({ default: 0 }) delivered: number;
    @Prop({ default: 0 }) read: number;
    @Prop({ default: 0 }) clicked: number;
    @Prop({ default: 0 }) failed: number;
}


@Schema({ timestamps: true, collection: 'whatsapp_templates' })
export class WhatsAppTemplate {
    @Prop({ type: String, ref: 'Business', required: true, index: true })
    businessId: string;

    @Prop({ required: true, lowercase: true, trim: true })
    name: string;

    @Prop({ type: String, enum: TemplateCategory, required: true })
    category: TemplateCategory;

    @Prop({ required: true, default: 'en' }) // BCP-47 language code
    language: string;

    @Prop({ type: TemplateComponents, required: true })
    components: TemplateComponents;

    @Prop({ type: String, enum: TemplateStatus, default: TemplateStatus.DRAFT })
    status: TemplateStatus;

    @Prop()
    metaTemplateId?: string;

    @Prop()
    providerTemplateName?: string;

    @Prop()
    rejectionReason?: string;

    @Prop({ type: [{ submittedAt: Date, status: String, reason: String }], default: [] })
    submissionHistory: Array<{ submittedAt: Date; status: string; reason?: string }>;

    @Prop({ type: TemplateAnalytics, default: {} })
    analytics: TemplateAnalytics;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    checksum?: string;

    @Prop()
    source?: string;

    @Prop()
    systemTemplateKey?: string;

    @Prop()
    policyUse?: string;
}

export type WhatsAppTemplateDocument = WhatsAppTemplate & Document;
export const WhatsAppTemplateSchema = SchemaFactory.createForClass(WhatsAppTemplate);

WhatsAppTemplateSchema.index({ businessId: 1, name: 1, language: 1 }, { unique: true });
WhatsAppTemplateSchema.index({ businessId: 1, status: 1 });
WhatsAppTemplateSchema.index({ businessId: 1, category: 1 });
