import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum FlowStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    DEPRECATED = 'DEPRECATED',
    BLOCKED = 'BLOCKED',
    THROTTLED = 'THROTTLED',
}

export enum FlowCategory {
    SIGN_UP = 'SIGN_UP',
    SIGN_IN = 'SIGN_IN',
    APPOINTMENT_BOOKING = 'APPOINTMENT_BOOKING',
    LEAD_GENERATION = 'LEAD_GENERATION',
    CONTACT_US = 'CONTACT_US',
    CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
    SURVEY = 'SURVEY',
    OTHER = 'OTHER',
}

@Schema({ timestamps: true, collection: 'whatsapp_flows' })
export class WhatsAppFlow {
    @Prop({ type: String, required: true, index: true })
    businessId: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ type: String, enum: FlowCategory, required: true })
    category: FlowCategory;

    @Prop({ type: String, enum: FlowStatus, default: FlowStatus.DRAFT })
    status: FlowStatus;

    /** The raw Flow JSON object stored locally */
    @Prop({ type: Object })
    flowJson?: Record<string, any>;

    /** Meta's flow ID after creation */
    @Prop()
    metaFlowId?: string;

    @Prop()
    endpointUri?: string;

    /** Public key (PEM) uploaded to Meta for flow encryption */
    @Prop()
    publicKey?: string;

    /** Private key (PEM, AES-256 encrypted at rest) for decrypting flow data exchange requests */
    @Prop()
    privateKey?: string;

    @Prop({ default: false })
    isDeleted: boolean;
}

export type WhatsAppFlowDocument = WhatsAppFlow & Document;
export const WhatsAppFlowSchema = SchemaFactory.createForClass(WhatsAppFlow);

WhatsAppFlowSchema.index({ businessId: 1, name: 1 }, { unique: true });
WhatsAppFlowSchema.index({ businessId: 1, status: 1 });
