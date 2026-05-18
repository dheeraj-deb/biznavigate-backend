import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { Conversation, ConversationDocument } from '../../schemas/conversation.schema';
import { Message, MessageDocument } from '../../schemas/message.schema';
import { v4 as uuidv4 } from 'uuid';
import { assertValidLeadStatus } from '../lead-status';

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
  private readonly logger = new Logger(LeadCommandService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Fired whenever a lead's status changes. Consumed by WorkflowEventBus to
   * fire workflows with `trigger.event.lead_status_changed`. Other listeners
   * (analytics, etc.) may subscribe too.
   */
  private emitStatusChanged(params: {
    business_id: string;
    tenant_id: string | null;
    lead_id: string;
    from_status: string | null;
    to_status: string;
  }) {
    try {
      this.eventEmitter.emit('workflow.event.lead.status_changed', {
        business_id: params.business_id,
        tenant_id: params.tenant_id,
        lead_id: params.lead_id,
        from_status: params.from_status,
        to_status: params.to_status,
        emitted_at: new Date().toISOString(),
      });
    } catch (err: any) {
      this.logger.warn(`Could not emit lead.status_changed for ${params.lead_id}: ${err.message}`);
    }
  }

  /**
   * Auto-advance a lead to a target stage slug. Idempotent and forward-only:
   *
   *   - If lead has no pipeline yet, no-op (nothing to advance to).
   *   - If target stage doesn't exist in pipeline, no-op.
   *   - If lead is already at or past target stage, no-op.
   *   - Otherwise: move + emit `lead_events.auto_progressed`.
   *
   * Designed to be called from AI handlers, webhooks, and side-effect listeners
   * where the caller doesn't want to think about "is this a forward move?".
   * Safe to call repeatedly on retries.
   */
  async autoAdvance(params: {
    leadId: string;
    toSlug: string;
    reason: string;
    actor?: 'ai' | 'system';
  }): Promise<{ moved: boolean; reason?: string }> {
    try {
      const lead = await this.prisma.leads.findUnique({
        where: { lead_id: params.leadId },
        select: { lead_id: true, business_id: true, tenant_id: true, pipeline_id: true, stage_id: true, status: true },
      });
      if (!lead) return { moved: false, reason: 'lead_not_found' };
      if (!lead.pipeline_id) return { moved: false, reason: 'no_pipeline' };

      const [currentStage, targetStage] = await Promise.all([
        lead.stage_id
          ? this.prisma.pipeline_stages.findUnique({ where: { stage_id: lead.stage_id }, select: { position: true } })
          : Promise.resolve(null),
        this.prisma.pipeline_stages.findFirst({
          where: { pipeline_id: lead.pipeline_id, slug: params.toSlug },
          select: { stage_id: true, pipeline_id: true, slug: true, position: true, is_won: true, is_lost: true },
        }),
      ]);

      if (!targetStage) return { moved: false, reason: 'stage_slug_not_in_pipeline' };
      if (currentStage && currentStage.position >= targetStage.position) {
        return { moved: false, reason: 'already_at_or_past' };
      }

      const now = new Date();
      const updateData: any = {
        stage_id: targetStage.stage_id,
        pipeline_id: targetStage.pipeline_id,
        status: targetStage.slug,
        updated_at: now,
      };
      if (targetStage.is_won) updateData.converted_at = now;

      await this.prisma.$transaction([
        this.prisma.leads.update({ where: { lead_id: lead.lead_id }, data: updateData }),
        this.prisma.lead_events.create({
          data: {
            event_id: uuidv4(),
            lead_id: lead.lead_id,
            business_id: lead.business_id,
            type: 'auto_progressed',
            actor: params.actor ?? 'ai',
            data: {
              from_status: lead.status,
              to_status: targetStage.slug,
              from_stage_id: lead.stage_id,
              to_stage_id: targetStage.stage_id,
              reason: params.reason,
            } as any,
            created_at: now,
          },
        }),
      ]);

      this.emitStatusChanged({
        business_id: lead.business_id,
        tenant_id: lead.tenant_id,
        lead_id: lead.lead_id,
        from_status: lead.status,
        to_status: targetStage.slug,
      });

      return { moved: true };
    } catch (err: any) {
      // Auto-advance must never break the calling flow. Log and swallow.
      this.logger.warn(`autoAdvance failed for lead ${params.leadId}: ${err.message}`);
      return { moved: false, reason: 'error' };
    }
  }

  async upsertLead(input: UpsertLeadInput) {
    const defaultStage = await this.getDefaultStageForBusiness(input.businessId);
    return this.prisma.leads.upsert({
      where: {
        business_id_platform_id: {
          business_id: input.businessId,
          platform_id: input.platformId,
        },
      },
      create: {
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
        pipeline_id: defaultStage?.pipeline_id ?? null,
        stage_id: defaultStage?.stage_id ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      update: {
        // Only fill missing identity fields; never overwrite human-entered data.
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.email ? { email: input.email } : {}),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Returns the default pipeline's first stage for a business.
   * Falls back to null if no pipeline is configured (caller will leave stage unset).
   */
  private async getDefaultStageForBusiness(businessId: string) {
    const pipeline = await this.prisma.pipelines.findFirst({
      where: { business_id: businessId, is_default: true, is_archived: false },
      select: { pipeline_id: true },
    });
    if (!pipeline) return null;
    const stage = await this.prisma.pipeline_stages.findFirst({
      where: { pipeline_id: pipeline.pipeline_id },
      orderBy: { position: 'asc' },
      select: { pipeline_id: true, stage_id: true },
    });
    return stage;
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
    if (dto.status) assertValidLeadStatus(dto.status);
    const defaultStage = await this.getDefaultStageForBusiness(dto.businessId);
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
        pipeline_id: defaultStage?.pipeline_id ?? null,
        stage_id: defaultStage?.stage_id ?? null,
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
    opts?: {
      lostReason?: string;
      quotedAmount?: number;
      convertedValue?: number;
      actorId?: string;
      actor?: string;
      lead?: { lead_id: string; business_id: string; status: string; pipeline_id: string | null };
    },
  ) {
    assertValidLeadStatus(status);
    const lead = opts?.lead ?? (await this.prisma.leads.findUnique({ where: { lead_id: leadId } }));
    if (!lead) throw new NotFoundException('Lead not found');

    // If a pipeline is attached, try to find a stage whose slug == status so
    // stage_id stays in sync. If no matching stage, just update the status
    // column (the pipeline doesn't model this state).
    let stageId: string | undefined;
    if (lead.pipeline_id) {
      const stage = await this.prisma.pipeline_stages.findFirst({
        where: { pipeline_id: lead.pipeline_id, slug: status },
        select: { stage_id: true },
      });
      if (stage) stageId = stage.stage_id;
    }

    const data: any = { status, updated_at: new Date() };
    if (stageId) data.stage_id = stageId;
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

    if (lead.status !== status) {
      this.emitStatusChanged({
        business_id: lead.business_id,
        tenant_id: (lead as any).tenant_id ?? null,
        lead_id: leadId,
        from_status: lead.status,
        to_status: status,
      });
    }

    return updated;
  }

  /**
   * Move a lead to a specific pipeline stage. Source of truth for the new
   * pipeline-aware flow. Mirrors stage.slug into leads.status so legacy
   * reporting queries keep working unchanged.
   *
   * Caller MUST have already verified ownership via LeadAccessService.
   */
  async moveToStage(params: {
    leadId: string;
    stageId: string;
    businessId: string;
    actorId?: string;
    actor?: 'human' | 'ai' | 'system';
  }) {
    const stage = await this.prisma.pipeline_stages.findUnique({
      where: { stage_id: params.stageId },
      select: { stage_id: true, pipeline_id: true, slug: true, business_id: true, is_won: true, is_lost: true },
    });
    if (!stage) throw new NotFoundException('Stage not found');
    if (stage.business_id !== params.businessId) {
      throw new NotFoundException('Stage not found');
    }

    const lead = await this.prisma.leads.findUnique({
      where: { lead_id: params.leadId },
      select: { lead_id: true, business_id: true, tenant_id: true, status: true, stage_id: true, pipeline_id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.business_id !== params.businessId) throw new NotFoundException('Lead not found');

    const now = new Date();
    const data: any = {
      stage_id: stage.stage_id,
      pipeline_id: stage.pipeline_id,
      status: stage.slug,
      updated_at: now,
    };
    if (stage.is_won) data.converted_at = now;

    const [updated] = await this.prisma.$transaction([
      this.prisma.leads.update({ where: { lead_id: params.leadId }, data }),
      this.prisma.lead_events.create({
        data: {
          event_id: uuidv4(),
          lead_id: params.leadId,
          business_id: lead.business_id,
          type: 'stage_changed',
          actor: params.actor ?? 'human',
          actor_id: params.actorId ?? null,
          data: {
            from_stage_id: lead.stage_id,
            to_stage_id: stage.stage_id,
            from_status: lead.status,
            to_status: stage.slug,
          } as any,
          created_at: now,
        },
      }),
    ]);

    if (lead.status !== stage.slug) {
      this.emitStatusChanged({
        business_id: lead.business_id,
        tenant_id: lead.tenant_id,
        lead_id: params.leadId,
        from_status: lead.status,
        to_status: stage.slug,
      });
    }

    return updated;
  }

  async updateContext(leadId: string, context: LeadContext) {
    // Don't force status='active' — that overrides legitimate states like
    // 'quoted' or 'won' just because the AI re-extracted context. Status
    // changes go through updateStatus / moveToStage.
    return this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { context: context as any, updated_at: new Date() },
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

  async softDeleteLead(leadId: string, opts?: { businessId?: string; actorId?: string }) {
    const lead = await this.prisma.leads.findUnique({
      where: { lead_id: leadId },
      select: { lead_id: true, business_id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    const now = new Date();
    const [updated] = await this.prisma.$transaction([
      this.prisma.leads.update({ where: { lead_id: leadId }, data: { deleted_at: now, updated_at: now } }),
      this.prisma.lead_followups.updateMany({
        where: { lead_id: leadId, done: false },
        data: { done: true, done_at: now, done_note: 'lead_deleted' },
      }),
      this.prisma.lead_events.create({
        data: {
          event_id: uuidv4(),
          lead_id: leadId,
          business_id: lead.business_id,
          type: 'deleted',
          actor: 'human',
          actor_id: opts?.actorId ?? null,
          data: {} as any,
          created_at: now,
        },
      }),
    ]);
    return updated;
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
    const followup = await this.prisma.lead_followups.update({
      where: { followup_id: followupId },
      data: { done: true, done_at: new Date(), done_note: doneNote },
    });

    // Roll lead.followup_at forward to the next pending followup, or null.
    const next = await this.prisma.lead_followups.findFirst({
      where: { lead_id: followup.lead_id, done: false },
      orderBy: { scheduled_at: 'asc' },
      select: { scheduled_at: true },
    });
    await this.prisma.leads.update({
      where: { lead_id: followup.lead_id },
      data: { followup_at: next?.scheduled_at ?? null, updated_at: new Date() },
    });

    return followup;
  }
}
