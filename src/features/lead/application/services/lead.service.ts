import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Conversation, ConversationDocument } from '../../schemas/conversation.schema';
import { Message, MessageDocument } from '../../schemas/message.schema';
import { v4 as uuidv4 } from 'uuid';

export interface LeadContext {
  type: 'resort' | 'camp' | 'product';
  // Resort
  check_in?: string;
  check_out?: string;
  nights?: number;
  guests?: number;
  room_pref?: string;
  budget?: number;
  // Camp
  event?: string;
  date?: string;
  date_is_fixed?: boolean;
  group_size?: number;
  package?: string;
  food_pref?: string;
  // Product
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
export class LeadService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // Lead upsert (PostgreSQL)
  // ─────────────────────────────────────────────────────────────

  /**
   * Find or create a lead by platformId + businessId.
   * Called on every incoming message before AI processing.
   */
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

  // ─────────────────────────────────────────────────────────────
  // Conversation upsert (MongoDB)
  // ─────────────────────────────────────────────────────────────

  /**
   * Find or create a conversation by platformId + businessId.
   * MongoDB upsert — safe for concurrent webhook retries.
   */
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

  // ─────────────────────────────────────────────────────────────
  // Message insert (MongoDB)
  // ─────────────────────────────────────────────────────────────

  /**
   * Append one message. Idempotent via unique platform_id index.
   * Duplicate platform_id (webhook retry) is silently ignored.
   */
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
      if (err?.code === 11000) return null; // duplicate platform_id — webhook retry
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Create lead (PostgreSQL)
  // ─────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────
  // Status & context updates (PostgreSQL)
  // ─────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────
  // Lead queries (PostgreSQL)
  // ─────────────────────────────────────────────────────────────

  async updateTags(leadId: string, tags: string[]) {
    const lead = await this.prisma.leads.findUnique({ where: { lead_id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { tags, updated_at: new Date() },
    });
  }

  async getLeads(businessId: string, filters?: {
    status?: string;
    channel?: string;
    source?: string;
    assignedTo?: string;
    search?: string;
    intent_type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters?.limit) || 20));

    const where: any = { business_id: businessId, deleted_at: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.channel) where.channel = filters.channel;
    if (filters?.source) where.source = filters.source;
    if (filters?.assignedTo) where.assigned_to = filters.assignedTo;
    if (filters?.search) {
      const s = filters.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s } },
        { email: { contains: s, mode: 'insensitive' } },
      ];
    }

    const allowedSortFields: Record<string, string> = {
      created_at: 'created_at',
      updated_at: 'updated_at',
      name: 'name',
      status: 'status',
      quoted_amount: 'quoted_amount',
    };
    const sortField = allowedSortFields[filters?.sortBy ?? ''] ?? 'created_at';
    const sortOrder = filters?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [rows, total] = await Promise.all([
      this.prisma.leads.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.leads.count({ where }),
    ]);

    // Apply intent_type filter in-memory (context is JSONB)
    const filtered = filters?.intent_type
      ? rows.filter((l) => (l.context as any)?.type === filters.intent_type)
      : rows;

    return {
      data: filtered.map((l) => this.formatLead(l)),
      meta: {
        total: filters?.intent_type ? filtered.length : total,
        totalPages: Math.ceil((filters?.intent_type ? filtered.length : total) / limit),
        page,
        limit,
      },
    };
  }

  async getStatsOverview(
    businessId: string,
    filters?: { from?: string; to?: string; intent_type?: string },
  ) {
    const where: any = { business_id: businessId, deleted_at: null };
    if (filters?.from || filters?.to) {
      where.created_at = {};
      if (filters.from) where.created_at.gte = new Date(filters.from);
      if (filters.to) where.created_at.lte = new Date(filters.to);
    }
    if (filters?.intent_type) {
      where.context = { path: ['type'], equals: filters.intent_type };
    }

    // All aggregations run as DB-side COUNT/GROUP BY — no rows transferred to Node
    const [total, converted, byStatus, bySource, hotCount, warmCount] = await Promise.all([
      this.prisma.leads.count({ where }),
      this.prisma.leads.count({ where: { ...where, status: { in: ['booked', 'won'] } } }),
      this.prisma.leads.groupBy({ by: ['status'], where, _count: { _all: true }, orderBy: { _count: { status: 'desc' } } }),
      this.prisma.leads.groupBy({ by: ['source'], where, _count: { _all: true } }),
      this.prisma.leads.count({
        where: {
          ...where,
          OR: [
            { status: { in: ['quoted', 'booked', 'won'] } },
            { quoted_amount: { gt: 0 } },
          ],
        },
      }),
      this.prisma.leads.count({
        where: {
          ...where,
          status: { in: ['active', 'contacted', 'qualified'] },
          AND: [
            { NOT: { status: { in: ['quoted', 'booked', 'won'] } } },
            { OR: [{ quoted_amount: null }, { quoted_amount: { lte: 0 } }] },
          ],
        },
      }),
    ]);

    return {
      data: {
        total_leads: total,
        converted_leads: converted,
        conversion_rate: total > 0 ? ((converted / total) * 100).toFixed(2) : '0.00',
        by_status: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
        by_source: bySource.map((s) => ({ source: s.source ?? 'direct', count: s._count._all })),
        by_quality: [
          { quality: 'hot',  count: hotCount },
          { quality: 'warm', count: warmCount },
          { quality: 'cold', count: Math.max(0, total - hotCount - warmCount) },
        ],
      },
    };
  }

  async getLeadById(leadId: string) {
    const lead = await this.prisma.leads.findUnique({ where: { lead_id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.formatLead(lead);
  }

  async getLeadEvents(leadId: string) {
    return this.prisma.lead_events.findMany({
      where: { lead_id: leadId },
      orderBy: { created_at: 'desc' },
    });
  }

  async softDeleteLead(leadId: string) {
    return this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { deleted_at: new Date() },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Dashboard queries (PostgreSQL — all single-table or events)
  // ─────────────────────────────────────────────────────────────

  async getDailyOverview(businessId: string, date?: Date) {
    const d = date ?? new Date();
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);
    const yesterday = new Date(startOfDay.getTime() - 86400000);

    const [todayRows, yesterdayRows] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT
          COUNT(*)::int                                                        AS enquiries,
          COUNT(*) FILTER (WHERE status IN ('booked','won'))::int              AS converted,
          COALESCE(SUM(converted_value) FILTER (WHERE status = 'won'), 0)      AS revenue
        FROM leads
        WHERE business_id = ${businessId}::uuid
          AND created_at >= ${startOfDay}
          AND created_at < ${endOfDay}
          AND deleted_at IS NULL
      `,
      this.prisma.$queryRaw<any[]>`
        SELECT
          COUNT(*)::int                                                        AS enquiries,
          COALESCE(SUM(converted_value) FILTER (WHERE status = 'won'), 0)      AS revenue
        FROM leads
        WHERE business_id = ${businessId}::uuid
          AND created_at >= ${yesterday}
          AND created_at < ${startOfDay}
          AND deleted_at IS NULL
      `,
    ]);

    const today = todayRows[0];
    const yest = yesterdayRows[0];

    return {
      date: startOfDay.toISOString().split('T')[0],
      enquiries: today.enquiries,
      converted: today.converted,
      revenue: Number(today.revenue),
      conversion_rate:
        today.enquiries > 0 ? Math.round((today.converted / today.enquiries) * 1000) / 10 : 0,
      vs_yesterday: {
        enquiries_delta: today.enquiries - yest.enquiries,
        revenue_delta: Number(today.revenue) - Number(yest.revenue),
      },
    };
  }

  async getNeedsAttention(businessId: string, limit = 20) {
    return this.prisma.$queryRaw<any[]>`
      SELECT
        lead_id, name, phone, quoted_amount, quoted_at,
        converted_value, context, status, channel, source,
        created_at, assigned_to,
        CASE
          WHEN status = 'quoted' AND quoted_at < NOW() - INTERVAL '12 hours'
            THEN 'quote_no_reply'
          WHEN status = 'new' AND created_at < NOW() - INTERVAL '3 hours'
            THEN 'new_uncontacted'
          WHEN quoted_amount > 5000
           AND status NOT IN ('won','lost')
           AND updated_at < NOW() - INTERVAL '24 hours'
            THEN 'high_value_stalled'
          ELSE 'other'
        END AS attention_reason
      FROM leads
      WHERE business_id = ${businessId}::uuid
        AND deleted_at IS NULL
        AND status NOT IN ('won', 'lost')
        AND (
          (status = 'quoted' AND quoted_at < NOW() - INTERVAL '12 hours')
          OR (status = 'new'  AND created_at < NOW() - INTERVAL '3 hours')
          OR (quoted_amount > 5000 AND updated_at < NOW() - INTERVAL '24 hours')
        )
      ORDER BY
        CASE WHEN status = 'quoted' THEN 1
             WHEN quoted_amount > 5000 THEN 2
             ELSE 3 END,
        COALESCE(quoted_amount, 0) DESC
      LIMIT ${limit}
    `;
  }

  async getChannelAnalytics(businessId: string, days = 30) {
    const safeDays = Math.max(1, Number(days) || 30);
    return this.prisma.$queryRaw<any[]>`
      SELECT
        channel,
        source,
        COUNT(*)::int                                                       AS leads,
        COUNT(*) FILTER (WHERE status = 'won')::int                         AS won,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'won') * 100.0 / NULLIF(COUNT(*),0),
          1
        )                                                                   AS conversion_rate,
        COALESCE(SUM(converted_value) FILTER (WHERE status = 'won'), 0)     AS revenue
      FROM leads
      WHERE business_id = ${businessId}::uuid
        AND created_at > NOW() - (${safeDays} * INTERVAL '1 day')
        AND deleted_at IS NULL
      GROUP BY channel, source
      ORDER BY leads DESC
    `;
  }

  async getDemandSignals(businessId: string, days = 7) {
    const safeDays = Math.max(1, Number(days) || 7);
    return this.prisma.$queryRaw<any[]>`
      SELECT
        data->>'service_name' AS service_name,
        data->>'service_id'   AS service_id,
        COUNT(*)::int         AS miss_count,
        MIN(created_at)       AS first_seen,
        MAX(created_at)       AS last_seen
      FROM lead_events
      WHERE business_id = ${businessId}::uuid
        AND type = 'demand_miss'
        AND created_at > NOW() - (${safeDays} * INTERVAL '1 day')
      GROUP BY data->>'service_name', data->>'service_id'
      ORDER BY miss_count DESC
    `;
  }

  async getFollowupQueue(businessId: string, assignedTo?: string, limit = 30) {
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 30));
    const where: any = { business_id: businessId, done: false };
    if (assignedTo) where.assigned_to = assignedTo;

    const followups = await this.prisma.lead_followups.findMany({
      where,
      orderBy: { scheduled_at: 'asc' },
      take: safeLimit,
    });

    if (followups.length === 0) return [];

    const leadIds = followups.map((f) => f.lead_id);
    const leads = await this.prisma.leads.findMany({
      where: { lead_id: { in: leadIds } },
      select: { lead_id: true, name: true, phone: true, context: true, quoted_amount: true },
    });
    const leadMap = new Map(leads.map((l) => [l.lead_id, l]));

    return followups.map((f) => {
      const lead = leadMap.get(f.lead_id);
      return {
        followup_id: f.followup_id,
        lead_id: f.lead_id,
        note: f.note,
        scheduled_at: f.scheduled_at,
        assigned_to: f.assigned_to,
        customer_name: lead?.name ?? null,
        phone: lead?.phone ?? null,
        context: lead?.context ?? null,
        quoted_amount: lead?.quoted_amount ? Number(lead.quoted_amount) : null,
        call_script_hint: this.buildCallScriptHint(lead),
      };
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

  // ─────────────────────────────────────────────────────────────
  // Inbox queries (MongoDB)
  // ─────────────────────────────────────────────────────────────

  async getOpenConversations(businessId: string, limit = 20) {
    return this.conversationModel
      .find({ business_id: businessId, status: 'open' })
      .sort({ last_message_at: -1 })
      .limit(limit)
      .lean();
  }

  async getMessages(conversationId: string, limit = 50) {
    return this.messageModel
      .find({ conversation_id: conversationId })
      .sort({ created_at: 1 })
      .limit(limit)
      .lean();
  }

  // ─────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────

  private formatLead(lead: any) {
    const nameParts = (lead.name ?? '').trim().split(/\s+/);
    const first_name = nameParts[0] || null;
    const last_name = nameParts.slice(1).join(' ') || null;
    const ctx = lead.context as any;

    const extracted_entities = ctx
      ? {
          check_in: ctx.check_in ?? null,
          check_out: ctx.check_out ?? null,
          guest_count: ctx.guests ?? ctx.group_size ?? null,
          room_preference: ctx.room_pref ?? null,
          budget: ctx.budget ?? null,
          product_name: ctx.items?.[0]?.name ?? null,
          quantity: ctx.items?.[0]?.qty ?? null,
          delivery_city: ctx.pincode ?? null,
        }
      : null;

    return {
      lead_id: lead.lead_id,
      first_name,
      last_name,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      channel: lead.channel,
      source: lead.source,
      status: lead.status,
      lead_quality: this.computeLeadQuality(lead),
      intent_type: ctx?.type ?? null,
      extracted_entities,
      is_converted: ['booked', 'won'].includes(lead.status),
      quoted_amount: lead.quoted_amount ? Number(lead.quoted_amount) : null,
      converted_value: lead.converted_value ? Number(lead.converted_value) : null,
      tags: lead.tags ?? [],
      assigned_to: lead.assigned_to,
      context: lead.context,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
    };
  }

  private computeLeadQuality(lead: any): 'hot' | 'warm' | 'cold' {
    if (['quoted', 'booked', 'won'].includes(lead.status)) return 'hot';
    if (lead.quoted_amount && Number(lead.quoted_amount) > 0) return 'hot';
    const ctx = lead.context as any;
    if (lead.status === 'active' || lead.status === 'contacted' || lead.status === 'qualified') return 'warm';
    if (ctx?.check_in || ctx?.items?.length > 0 || ctx?.group_size) return 'warm';
    return 'cold';
  }

  private buildCallScriptHint(lead: any): string {
    if (!lead) return '';
    const name = lead.name ?? 'there';
    const ctx = lead.context as LeadContext | null;
    if (!ctx) return `Hi ${name}, following up on your enquiry.`;

    switch (ctx.type) {
      case 'resort':
        return `Hi ${name}, following up on your ${ctx.nights ?? ''}-night stay for ${ctx.guests ?? ''} guests from ${ctx.check_in ?? ''} to ${ctx.check_out ?? ''}.`;
      case 'camp':
        return `Hi ${name}, checking on your ${ctx.event ?? 'camp'} booking for ${ctx.group_size ?? ''} people on ${ctx.date ?? ''}.`;
      case 'product': {
        const item = ctx.items?.[0]?.name ?? 'item';
        return `Hi ${name}, the ${item} you enquired about is available — shall I confirm your order?`;
      }
      default:
        return `Hi ${name}, following up on your enquiry.`;
    }
  }
}
