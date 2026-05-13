import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { Conversation, ConversationDocument } from '../../schemas/conversation.schema';
import { Message, MessageDocument } from '../../schemas/message.schema';
import type { LeadContext } from './lead-command.service';

@Injectable()
export class LeadQueryService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

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

  async getConversationById(conversationId: string) {
    return this.conversationModel.findOne({ conversation_id: conversationId }).lean();
  }

  async getConversationByLead(leadId: string, businessId: string) {
    return this.conversationModel.findOne({ lead_id: leadId, business_id: businessId }).lean();
  }

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
