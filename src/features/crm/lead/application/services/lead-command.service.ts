import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { Conversation, ConversationDocument } from '../../schemas/conversation.schema';
import { Message, MessageDocument } from '../../schemas/message.schema';
import { v4 as uuidv4 } from 'uuid';

export interface LeadContext {
  type: 'resort' | 'camp' | 'product';
  check_in?: string;
  check_out?: string;
  nights?: number;
  guests?: number;
  room_pref?: string;
  budget?: number;
  event?: string;
  date?: string;
  date_is_fixed?: boolean;
  group_size?: number;
  package?: string;
  food_pref?: string;
  items?: Array<{ id?: string; name: string; variant?: string; qty: number; price?: number }>;
  pincode?: string;
}

export interface UpsertLeadInput {
  businessId: string;
  tenantId: string;
  channel: 'whatsapp' | 'website';
  source?: string;
  platformId: string;
  phone?: string;
  name?: string;
  email?: string;
}

export interface UpsertConversationInput {
  leadId: string;
  businessId: string;
  channel: 'whatsapp' | 'website';
  platformId: string;
}

export interface InsertMessageInput {
  conversationId: string;
  leadId: string;
  businessId: string;
  role: 'user' | 'ai' | 'agent';
  body?: string;
  type?: string;
  mediaUrl?: string;
  platformId?: string;
  status?: string;
  meta?: Record<string, any>;
}

@Injectable()
export class LeadCommandService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async upsertLead(input: UpsertLeadInput) {
    const existing = await this.prisma.leads.findFirst({
      where: { platform_id: input.platformId, business_id: input.businessId, deleted_at: null },
    });

    if (existing) {
      const updateData: any = { updated_at: new Date() };
      if (input.name && !existing.name) updateData.name = input.name;
      if (input.phone && !existing.phone) updateData.phone = input.phone;
      if (input.email && !existing.email) updateData.email = input.email;

      if (Object.keys(updateData).length > 1) {
        return this.prisma.leads.update({ where: { lead_id: existing.lead_id }, data: updateData });
      }
      return existing;
    }

    return this.prisma.leads.create({
      data: {
        lead_id: uuidv4(),
        business_id: input.businessId,
        tenant_id: input.tenantId,
        channel: input.channel,
        source: input.source ?? 'direct',
        platform_id: input.platformId,
        phone: input.phone,
        name: input.name,
        email: input.email,
        status: 'new',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async upsertConversation(input: UpsertConversationInput): Promise<ConversationDocument> {
    return this.conversationModel.findOneAndUpdate(
      { platform_id: input.platformId, business_id: input.businessId },
      {
        $setOnInsert: {
          conversation_id: uuidv4(),
          lead_id: input.leadId,
          channel: input.channel,
          status: 'open',
          is_ai: true,
          agent_id: null,
          message_count: 0,
        },
        $set: { last_message_at: new Date() },
        $inc: { message_count: 1 },
      },
      { upsert: true, new: true },
    );
  }

  async updateConversation(conversationId: string, data: { status?: string; is_ai?: boolean; agent_id?: string }) {
    return this.conversationModel.findOneAndUpdate(
      { conversation_id: conversationId },
      { $set: data },
      { new: true },
    );
  }

  async insertMessage(input: InsertMessageInput): Promise<MessageDocument | null> {
    try {
      return await this.messageModel.create({
        conversation_id: input.conversationId,
        lead_id: input.leadId,
        business_id: input.businessId,
        role: input.role,
        body: input.body ?? null,
        type: input.type ?? 'text',
        media_url: input.mediaUrl ?? null,
        platform_id: input.platformId ?? null,
        status: input.status ?? 'sent',
        meta: input.meta ?? null,
        created_at: new Date(),
      });
    } catch (err: any) {
      if (err?.code === 11000) return null;
      throw err;
    }
  }

  async createLead(dto: {
    businessId: string;
    tenantId: string;
    name?: string;
    phone?: string;
    email?: string;
    channel?: string;
    source?: string;
    status?: string;
    context?: any;
    tags?: string[];
    quotedAmount?: number;
  }) {
    return this.prisma.leads.create({
      data: {
        lead_id: uuidv4(),
        business_id: dto.businessId,
        tenant_id: dto.tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        channel: (dto.channel ?? 'whatsapp') as any,
        source: dto.source ?? 'direct',
        status: dto.status ?? 'new',
        context: dto.context ?? undefined,
        tags: dto.tags ?? [],
        quoted_amount: dto.quotedAmount ?? undefined,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async updateStatus(
    leadId: string,
    status: string,
    opts?: { lostReason?: string; quotedAmount?: number; convertedValue?: number; actorId?: string; actor?: string },
  ) {
    const lead = await this.prisma.leads.findUnique({ where: { lead_id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const data: any = { status, updated_at: new Date() };
    if (opts?.lostReason) data.lost_reason = opts.lostReason;
    if (opts?.quotedAmount != null) {
      data.quoted_amount = opts.quotedAmount;
      data.quoted_at = new Date();
    }
    if (opts?.convertedValue != null) {
      data.converted_value = opts.convertedValue;
      data.converted_at = new Date();
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.leads.update({ where: { lead_id: leadId }, data }),
      this.prisma.lead_events.create({
        data: {
          event_id: uuidv4(),
          lead_id: leadId,
          business_id: lead.business_id,
          type: 'status_changed',
          actor: opts?.actor ?? 'system',
          actor_id: opts?.actorId ?? null,
          data: { from: lead.status, to: status } as any,
          created_at: new Date(),
        },
      }),
    ]);
    return updated;
  }

  async updateContext(leadId: string, context: LeadContext) {
    return this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { context: context as any, status: 'active', updated_at: new Date() },
    });
  }

  async addNote(leadId: string, text: string, actorId: string) {
    const lead = await this.prisma.leads.findUnique({ where: { lead_id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.lead_events.create({
      data: {
        event_id: uuidv4(),
        lead_id: leadId,
        business_id: lead.business_id,
        type: 'note',
        actor: 'human',
        actor_id: actorId,
        data: { text } as any,
        created_at: new Date(),
      },
    });
  }

  async logDemandMiss(params: {
    leadId: string;
    businessId: string;
    serviceId?: string;
    serviceName?: string;
    date?: string;
    guests?: number;
  }) {
    return this.prisma.lead_events.create({
      data: {
        event_id: uuidv4(),
        lead_id: params.leadId,
        business_id: params.businessId,
        type: 'demand_miss',
        actor: 'ai',
        data: {
          service_id: params.serviceId,
          service_name: params.serviceName,
          date: params.date,
          guests: params.guests,
        } as any,
        created_at: new Date(),
      },
    });
  }

  async assignLead(leadId: string, assignedTo: string, actorId: string) {
    const lead = await this.prisma.leads.findUnique({ where: { lead_id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const [updated] = await this.prisma.$transaction([
      this.prisma.leads.update({
        where: { lead_id: leadId },
        data: { assigned_to: assignedTo, updated_at: new Date() },
      }),
      this.prisma.lead_events.create({
        data: {
          event_id: uuidv4(),
          lead_id: leadId,
          business_id: lead.business_id,
          type: 'assigned',
          actor: 'human',
          actor_id: actorId,
          data: { to_user_id: assignedTo } as any,
          created_at: new Date(),
        },
      }),
    ]);
    return updated;
  }

  async updateTags(leadId: string, tags: string[]) {
    const lead = await this.prisma.leads.findUnique({ where: { lead_id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { tags, updated_at: new Date() },
    });
  }

  async softDeleteLead(leadId: string) {
    return this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { deleted_at: new Date() },
    });
  }

  async scheduleFollowup(params: {
    leadId: string;
    businessId: string;
    note: string;
    scheduledAt: Date;
    assignedTo: string;
    createdBy?: string;
  }) {
    const lead = await this.prisma.leads.findUnique({ where: { lead_id: params.leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const [followup] = await this.prisma.$transaction([
      this.prisma.lead_followups.create({
        data: {
          followup_id: uuidv4(),
          lead_id: params.leadId,
          business_id: params.businessId,
          note: params.note,
          scheduled_at: params.scheduledAt,
          assigned_to: params.assignedTo,
          created_by: params.createdBy,
          created_at: new Date(),
        },
      }),
      this.prisma.leads.update({
        where: { lead_id: params.leadId },
        data: { followup_at: params.scheduledAt },
      }),
      this.prisma.lead_events.create({
        data: {
          event_id: uuidv4(),
          lead_id: params.leadId,
          business_id: params.businessId,
          type: 'followup_set',
          actor: 'human',
          actor_id: params.createdBy,
          data: { scheduled_at: params.scheduledAt, assigned_to: params.assignedTo } as any,
          created_at: new Date(),
        },
      }),
    ]);
    return followup;
  }

  async completeFollowup(followupId: string, doneNote?: string) {
    return this.prisma.lead_followups.update({
      where: { followup_id: followupId },
      data: { done: true, done_at: new Date(), done_note: doneNote },
    });
  }
}
