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
    stage_id?: string;
    pipeline_id?: string;
    lead_type?: string;
    qualification_score_min?: number;
    exit_reason?: string;
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
    if (filters?.stage_id) where.stage_id = filters.stage_id;
    if (filters?.pipeline_id) where.pipeline_id = filters.pipeline_id;
    if (filters?.lead_type) where.lead_type = filters.lead_type;
    if (filters?.exit_reason) where.exit_reason = filters.exit_reason;
    if (filters?.qualification_score_min !== undefined) {
      where.qualification_score = { gte: filters.qualification_score_min };
    }
    if (filters?.intent_type) {
      // Filter in DB via JSON path — keeps pagination + counts correct.
      where.context = { path: ['type'], equals: filters.intent_type };
    }
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

    const leadIds = rows.map((l) => l.lead_id);
    const [conversations, followups] = await Promise.all([
      leadIds.length
        ? this.conversationModel
            .find({ business_id: businessId, lead_id: { $in: leadIds }, status: { $in: ['open', 'handed_off', 'active'] } })
            .sort({ updated_at: -1 })
            .lean()
        : [],
      leadIds.length
        ? this.prisma.lead_followups.findMany({
            where: { business_id: businessId, lead_id: { in: leadIds }, done: false },
            orderBy: { scheduled_at: 'asc' },
            select: { lead_id: true, scheduled_at: true },
          })
        : [],
    ]);
    const conversationByLead = new Map<string, any>();
    for (const conversation of conversations) {
      if (!conversationByLead.has(conversation.lead_id)) conversationByLead.set(conversation.lead_id, conversation);
    }
    const followupByLead = new Map<string, any>();
    for (const followup of followups) {
      if (!followupByLead.has(followup.lead_id)) followupByLead.set(followup.lead_id, followup);
    }

    return {
      data: rows.map((l) => this.formatLead(l, {
        conversation: conversationByLead.get(l.lead_id),
        followup: followupByLead.get(l.lead_id),
      })),
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
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
      this.prisma.leads.count({ where: { ...where, status: { in: ['booked', 'won', 'converted'] } } }),
      this.prisma.leads.groupBy({ by: ['status'], where, _count: { _all: true }, orderBy: { _count: { status: 'desc' } } }),
      this.prisma.leads.groupBy({ by: ['source'], where, _count: { _all: true } }),
      this.prisma.leads.count({
        where: {
          ...where,
          OR: [
            { status: { in: ['quoted', 'booked', 'won', 'converted'] } },
            { quoted_amount: { gt: 0 } },
          ],
        },
      }),
      this.prisma.leads.count({
        where: {
          ...where,
          status: { in: ['active', 'contacted', 'qualified'] },
          AND: [
            { NOT: { status: { in: ['quoted', 'booked', 'won', 'converted'] } } },
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
    const [conversation, followup] = await Promise.all([
      this.getConversationByLead(leadId, lead.business_id),
      this.prisma.lead_followups.findFirst({
        where: { lead_id: leadId, business_id: lead.business_id, done: false },
        orderBy: { scheduled_at: 'asc' },
        select: { scheduled_at: true },
      }),
    ]);
    return this.formatLead(lead, { conversation, followup });
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
          COUNT(*) FILTER (WHERE status IN ('booked','won','converted'))::int  AS converted,
          COALESCE(SUM(converted_value) FILTER (WHERE status IN ('won','converted','booked')), 0) AS revenue
        FROM leads
        WHERE business_id = ${businessId}::uuid
          AND created_at >= ${startOfDay}
          AND created_at < ${endOfDay}
          AND deleted_at IS NULL
      `,
      this.prisma.$queryRaw<any[]>`
        SELECT
          COUNT(*)::int                                                        AS enquiries,
          COALESCE(SUM(converted_value) FILTER (WHERE status IN ('won','converted','booked')), 0) AS revenue
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
        AND status NOT IN ('won', 'booked', 'converted', 'lost', 'cancelled')
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
        COUNT(*) FILTER (WHERE status IN ('won','booked','converted'))::int  AS won,
        ROUND(
          COUNT(*) FILTER (WHERE status IN ('won','booked','converted')) * 100.0 / NULLIF(COUNT(*),0),
          1
        )                                                                   AS conversion_rate,
        COALESCE(SUM(converted_value) FILTER (WHERE status IN ('won','booked','converted')), 0) AS revenue
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

  async getResortWorklist(businessId: string, days = 14) {
    const safeDays = Math.max(1, Math.min(90, Number(days) || 14));
    const demandCutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);
    const bookingWindowEnd = new Date();
    bookingWindowEnd.setDate(bookingWindowEnd.getDate() + safeDays);

    const [bookingLinkSent, demandMissed, upcomingBookings, propertyOptions] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT
          l.lead_id,
          l.name,
          l.phone,
          l.channel,
          l.source,
          l.status,
          l.context,
          l.updated_at,
          l.context->>'property_name' AS property_name,
          l.context->>'item_name' AS item_name,
          l.context->>'check_in' AS check_in,
          l.context->>'check_out' AS check_out
        FROM leads l
        LEFT JOIN hospitality_bookings hb
          ON hb.lead_id = l.lead_id
          AND hb.status NOT IN ('cancelled', 'canceled')
        WHERE l.business_id = ${businessId}::uuid
          AND l.deleted_at IS NULL
          AND hb.hospitality_booking_id IS NULL
          AND l.status NOT IN ('booked', 'won', 'converted', 'lost', 'cancelled', 'canceled')
          AND l.context->>'check_in' IS NOT NULL
          AND l.context->>'check_out' IS NOT NULL
          AND (
            l.context->>'item_id' IS NOT NULL
            OR l.context->>'item_name' IS NOT NULL
            OR l.context->>'property_name' IS NOT NULL
          )
        ORDER BY l.updated_at DESC
        LIMIT 20
      `,
      this.prisma.$queryRaw<any[]>`
        SELECT
          le.event_id,
          le.lead_id,
          l.name,
          l.phone,
          le.data,
          le.created_at,
          COALESCE(le.data->>'service_name', le.data->>'property_name', le.data->>'item_name') AS property_name,
          le.data->>'check_in' AS check_in,
          le.data->>'check_out' AS check_out
        FROM lead_events le
        LEFT JOIN leads l ON l.lead_id = le.lead_id
        WHERE le.business_id = ${businessId}::uuid
          AND le.type = 'demand_miss'
          AND le.created_at > ${demandCutoff}
        ORDER BY le.created_at DESC
        LIMIT 20
      `,
      this.prisma.$queryRaw<any[]>`
        SELECT
          hb.hospitality_booking_id,
          hb.booking_number,
          hb.status,
          hb.payment_status,
          hb.check_in,
          hb.check_out,
          hb.guests,
          hb.total_amount,
          hb.created_at,
          l.name AS guest_name,
          l.phone,
          hbi.item_id,
          hbi.item_name
        FROM hospitality_bookings hb
        LEFT JOIN leads l ON l.lead_id = hb.lead_id
        LEFT JOIN hospitality_booking_items hbi ON hbi.hospitality_booking_id = hb.hospitality_booking_id
        WHERE hb.business_id = ${businessId}::uuid
          AND hb.status NOT IN ('cancelled', 'canceled')
          AND hb.check_in >= CURRENT_DATE
          AND hb.check_in < ${bookingWindowEnd}
        ORDER BY hb.check_in ASC, hb.created_at DESC
        LIMIT 20
      `,
      this.prisma.catalog_items.findMany({
        where: {
          business_id: businessId,
          item_type: 'accommodation',
          is_active: true,
          deleted_at: null,
        },
        select: { item_id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data: {
        booking_link_sent: bookingLinkSent,
        demand_missed: demandMissed,
        upcoming_bookings: upcomingBookings,
        property_options: propertyOptions,
        counts: {
          booking_link_sent: bookingLinkSent.length,
          demand_missed: demandMissed.length,
          upcoming_bookings: upcomingBookings.length,
        },
      },
    };
  }

  async getResortReminderReadiness(businessId: string, days = 14) {
    const safeDays = Math.max(1, Math.min(30, Number(days) || 14));
    const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    const leads = await this.prisma.leads.findMany({
      where: {
        business_id: businessId,
        deleted_at: null,
        updated_at: { gte: since },
        status: { notIn: ['booked', 'won', 'converted', 'lost', 'cancelled', 'canceled'] },
      },
      select: {
        lead_id: true,
        name: true,
        phone: true,
        status: true,
        context: true,
        updated_at: true,
      },
      orderBy: { updated_at: 'desc' },
      take: 50,
    });

    const candidates = leads.filter((lead) => {
      const ctx = (lead.context ?? {}) as any;
      return Boolean(
        this.contextDate(ctx, 'check_in') &&
          this.contextDate(ctx, 'check_out') &&
          (ctx.item_id || ctx.service_id || ctx.property_id || ctx.item_name || ctx.property_name || ctx.service_name),
      );
    });

    const rows = await Promise.all(
      candidates.map(async (lead) => {
        const ctx = (lead.context ?? {}) as any;
        const checkIn = this.contextDate(ctx, 'check_in');
        const checkOut = this.contextDate(ctx, 'check_out');
        const item = await this.resolveReminderItem(businessId, ctx);

        if (!checkIn || !checkOut || !item) {
          return this.reminderRow(lead, ctx, 'missing_details', 'Missing property or date details', null);
        }

        const availability = await this.checkAccommodationAvailability(item, checkIn, checkOut);
        if (!availability.available) {
          return this.reminderRow(lead, ctx, 'stopped', availability.reason, {
            item_id: item.item_id,
            item_name: item.name,
            check_in: checkIn,
            check_out: checkOut,
            available_slots: availability.availableSlots,
            checked_at: new Date().toISOString(),
          });
        }

        return this.reminderRow(lead, ctx, 'ready', 'Available now. Safe to remind customer.', {
          item_id: item.item_id,
          item_name: item.name,
          check_in: checkIn,
          check_out: checkOut,
          available_slots: availability.availableSlots,
          checked_at: new Date().toISOString(),
        });
      }),
    );

    const ready = rows.filter((row) => row.readiness === 'ready');
    const stopped = rows.filter((row) => row.readiness === 'stopped');
    const missing = rows.filter((row) => row.readiness === 'missing_details');

    return {
      data: {
        ready,
        stopped,
        missing_details: missing,
        counts: {
          ready: ready.length,
          stopped: stopped.length,
          missing_details: missing.length,
          total: rows.length,
        },
        rule: 'Booking reminders are shown only after live occupancy is checked.',
        checked_at: new Date().toISOString(),
      },
    };
  }

  async getAiManagerToday(businessId: string) {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: { business_type: true },
    });

    if (business?.business_type === 'products' || business?.business_type === 'retail') {
      return this.getProductAiManagerToday(businessId);
    }

    const [reminders, worklist, needsAttention, conversations] = await Promise.all([
      this.getResortReminderReadiness(businessId, 14),
      this.getResortWorklist(businessId, 14),
      this.getNeedsAttention(businessId, 10),
      this.getOpenConversations(businessId, 20),
    ]);

    const reminderData = reminders.data;
    const worklistData = worklist.data;
    const waitingConversations = conversations.filter((conversation: any) =>
      conversation.needs_attention ||
      (conversation.unreadCount ?? 0) > 0 ||
      conversation.status === 'waiting',
    );

    const suggestions: any[] = [];

    if ((reminderData.counts.ready ?? 0) > 0) {
      suggestions.push({
        type: 'booking_reminder',
        priority: 'high',
        title: `Send ${reminderData.counts.ready} booking reminder${reminderData.counts.ready === 1 ? '' : 's'}`,
        reason: 'These customers received booking links and rooms are still available for their selected dates.',
        safety: 'Live occupancy checked',
        status: 'needs_approval',
        action_label: 'Review & send',
        action_href: '/crm/leads',
        count: reminderData.counts.ready,
        data: reminderData.ready.slice(0, 5),
      });
    }

    if ((reminderData.counts.stopped ?? 0) > 0) {
      suggestions.push({
        type: 'stop_reminder',
        priority: 'high',
        title: `${reminderData.counts.stopped} reminder${reminderData.counts.stopped === 1 ? '' : 's'} stopped`,
        reason: 'Rooms are no longer available for those selected dates. Do not send a booking reminder.',
        safety: 'Prevents wrong offers',
        status: 'blocked',
        action_label: 'Offer other dates',
        action_href: '/crm/leads',
        count: reminderData.counts.stopped,
        data: reminderData.stopped.slice(0, 5),
      });
    }

    if (waitingConversations.length > 0) {
      suggestions.push({
        type: 'reply_waiting',
        priority: 'high',
        title: `Reply to ${waitingConversations.length} waiting customer${waitingConversations.length === 1 ? '' : 's'}`,
        reason: 'Fast replies improve booking conversion, especially for WhatsApp enquiries.',
        safety: 'Owner can review conversation before replying',
        status: 'needs_action',
        action_label: 'Open inbox',
        action_href: '/crm/inbox',
        count: waitingConversations.length,
        data: waitingConversations.slice(0, 5),
      });
    }

    if (needsAttention.length > 0) {
      suggestions.push({
        type: 'follow_up',
        priority: 'medium',
        title: `Follow up ${needsAttention.length} warm lead${needsAttention.length === 1 ? '' : 's'}`,
        reason: 'These enquiries are not booked yet and may need a call or WhatsApp reply.',
        safety: 'No campaign is sent automatically',
        status: 'needs_action',
        action_label: 'Open follow-ups',
        action_href: '/crm/leads',
        count: needsAttention.length,
        data: needsAttention.slice(0, 5),
      });
    }

    if ((worklistData.counts.demand_missed ?? 0) > 0) {
      suggestions.push({
        type: 'alternate_dates',
        priority: 'medium',
        title: `Offer alternatives for ${worklistData.counts.demand_missed} unavailable date request${worklistData.counts.demand_missed === 1 ? '' : 's'}`,
        reason: 'Customers asked for dates that were full. Offer another date or property instead of sending a normal campaign.',
        safety: 'Avoids promoting unavailable rooms',
        status: 'needs_approval',
        action_label: 'Review dates',
        action_href: '/crm/leads',
        count: worklistData.counts.demand_missed,
        data: worklistData.demand_missed.slice(0, 5),
      });
    }

    if ((worklistData.counts.demand_missed ?? 0) >= 2) {
      suggestions.push({
        type: 'open_inventory',
        priority: 'medium',
        title: `Check if you can open rooms for ${worklistData.counts.demand_missed} missed request${worklistData.counts.demand_missed === 1 ? '' : 's'}`,
        reason: 'Multiple customers asked for dates that were not available. The owner should decide whether to add another property, open blocked rooms or offer nearby dates.',
        safety: 'No inventory is changed automatically',
        status: 'recommended',
        action_label: 'Manage inventory',
        action_href: '/inventory/rooms',
        count: worklistData.counts.demand_missed,
        data: worklistData.demand_missed.slice(0, 5),
      });
    }

    if ((worklistData.counts.booking_link_sent ?? 0) >= 3 && (reminderData.counts.ready ?? 0) > 0) {
      suggestions.push({
        type: 'price_review',
        priority: 'low',
        title: 'Review price before sending more links',
        reason: 'Several customers are still interested and rooms are available. Check pricing once before sending more reminders.',
        safety: 'AI only suggests. Owner must approve any price change.',
        status: 'recommended',
        action_label: 'Check inventory',
        action_href: '/inventory/rooms',
        count: worklistData.counts.booking_link_sent,
        data: worklistData.booking_link_sent.slice(0, 5),
      });
    }

    if ((worklistData.counts.upcoming_bookings ?? 0) > 0) {
      suggestions.push({
        type: 'prepare_checkins',
        priority: 'low',
        title: `Prepare ${worklistData.counts.upcoming_bookings} upcoming stay${worklistData.counts.upcoming_bookings === 1 ? '' : 's'}`,
        reason: 'Guests with upcoming check-ins should be reviewed for payment, contact and room readiness.',
        safety: 'Operational check only',
        status: 'recommended',
        action_label: 'View bookings',
        action_href: '/inventory/bookings',
        count: worklistData.counts.upcoming_bookings,
        data: worklistData.upcoming_bookings.slice(0, 5),
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'all_clear',
        priority: 'low',
        title: 'No urgent action right now',
        reason: 'No unsafe reminders, waiting conversations or urgent booking tasks were found.',
        safety: 'Checked today',
        status: 'ok',
        action_label: 'Open dashboard',
        action_href: '/dashboard',
        count: 0,
        data: [],
      });
    }

    const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };

    return {
      data: {
        title: 'AI Resort Manager',
        subtitle: 'What to do today to get bookings and avoid mistakes.',
        checked_at: new Date().toISOString(),
        suggestions: suggestions.sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)),
        counts: {
          total: suggestions.length,
          high: suggestions.filter((s) => s.priority === 'high').length,
          needs_approval: suggestions.filter((s) => s.status === 'needs_approval').length,
          blocked: suggestions.filter((s) => s.status === 'blocked').length,
        },
      },
    };
  }

  private async getProductAiManagerToday(businessId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lowStockWhere = {
      business_id: businessId,
      item_type: 'physical_product',
      is_active: true,
      deleted_at: null,
      stock_quantity: { lte: 5 },
    };

    const weekSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      productInquiries,
      pendingOrders,
      paymentPendingOrders,
      lowStockProducts,
      activeCarts,
      needsAttention,
      conversations,
      todaysOrders,
      todaysRevenue,
      completedOrdersToday,
      totalProducts,
      whatsappCatalogItems,
      recentCampaigns,
      campaignRecipientsSent,
      campaignRecipientsFailed,
    ] = await Promise.all([
      this.prisma.product_inquiries.findMany({
        where: { business_id: businessId, status: { in: ['open', 'cart_added'] } },
        include: { item: { select: { name: true, stock_quantity: true } }, lead: true },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
      this.prisma.product_orders.findMany({
        where: { business_id: businessId, status: { in: ['pending', 'confirmed', 'processing'] } },
        include: { items: true, customer: true, lead: true },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
      this.prisma.product_orders.findMany({
        where: { business_id: businessId, payment_status: { in: ['pending', 'failed'] } },
        include: { items: true, customer: true, lead: true },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
      this.prisma.catalog_items.findMany({
        where: lowStockWhere,
        orderBy: [{ stock_quantity: 'asc' }, { updated_at: 'desc' }],
        take: 10,
      }),
      this.prisma.carts.findMany({
        where: { business_id: businessId, status: { in: ['active', 'pending'] } },
        include: { cart_items: true, leads: true, customers: true },
        orderBy: { updated_at: 'desc' },
        take: 10,
      }),
      this.getNeedsAttention(businessId, 10),
      this.getOpenConversations(businessId, 20),
      this.prisma.product_orders.count({
        where: { business_id: businessId, created_at: { gte: since } },
      }),
      this.prisma.product_orders.aggregate({
        where: {
          business_id: businessId,
          created_at: { gte: since },
          payment_status: { in: ['paid', 'captured', 'success', 'completed', 'PAID', 'CAPTURED', 'SUCCESS', 'COMPLETED'] },
        },
        _sum: { total_amount: true },
      }),
      this.prisma.product_orders.count({
        where: {
          business_id: businessId,
          created_at: { gte: since },
          status: { in: ['completed', 'delivered', 'shipped', 'COMPLETED', 'DELIVERED', 'SHIPPED'] },
        },
      }),
      this.prisma.catalog_items.count({
        where: { business_id: businessId, item_type: 'physical_product', is_active: true, deleted_at: null },
      }),
      this.prisma.external_catalog_items.count({
        where: { business_id: businessId, provider: 'whatsapp', sync_status: { in: ['synced', 'imported', 'matched'] } },
      }),
      this.prisma.campaigns.findMany({
        where: { business_id: businessId, created_at: { gte: weekSince } },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      this.prisma.campaign_recipients.count({
        where: { business_id: businessId, status: { in: ['SENT', 'DELIVERED', 'READ'] } },
      }),
      this.prisma.campaign_recipients.count({
        where: { business_id: businessId, status: 'FAILED' },
      }),
    ]);

    const waitingConversations = conversations.filter((conversation: any) =>
      conversation.needs_attention ||
      (conversation.unreadCount ?? 0) > 0 ||
      conversation.status === 'waiting',
    );

    const outOfStockProducts = lowStockProducts.filter((item) => Number(item.stock_quantity ?? 0) <= 0);
    const suggestions: any[] = [];

    if (waitingConversations.length > 0) {
      suggestions.push({
        type: 'reply_waiting',
        priority: 'high',
        title: `Reply to ${waitingConversations.length} waiting customer${waitingConversations.length === 1 ? '' : 's'}`,
        reason: 'Product buyers often decide quickly. Reply first to protect sales from WhatsApp enquiries.',
        safety: 'Owner can review before replying',
        status: 'needs_action',
        action_label: 'Open inbox',
        action_href: '/crm/inbox',
        count: waitingConversations.length,
        data: waitingConversations.slice(0, 5),
      });
    }

    if (productInquiries.length > 0) {
      suggestions.push({
        type: 'product_inquiry',
        priority: 'high',
        title: `Handle ${productInquiries.length} product enquiry${productInquiries.length === 1 ? '' : 'ies'}`,
        reason: 'These customers asked about products or added items to cart but have not completed the order.',
        safety: 'No automatic offer is sent',
        status: 'needs_action',
        action_label: 'Open product leads',
        action_href: '/crm/leads',
        count: productInquiries.length,
        data: productInquiries.slice(0, 5),
      });
    }

    if (paymentPendingOrders.length > 0) {
      suggestions.push({
        type: 'payment_pending',
        priority: 'high',
        title: `Collect payment for ${paymentPendingOrders.length} order${paymentPendingOrders.length === 1 ? '' : 's'}`,
        reason: 'These orders are not paid yet. Send payment help or confirm whether the customer still wants the items.',
        safety: 'Payment status checked',
        status: 'needs_action',
        action_label: 'Open orders',
        action_href: '/orders',
        count: paymentPendingOrders.length,
        data: paymentPendingOrders.slice(0, 5),
      });
    }

    if (pendingOrders.length > 0) {
      suggestions.push({
        type: 'pack_orders',
        priority: 'medium',
        title: `Prepare ${pendingOrders.length} order${pendingOrders.length === 1 ? '' : 's'}`,
        reason: 'These orders need packing, delivery update, or customer confirmation.',
        safety: 'Operational check only',
        status: 'recommended',
        action_label: 'View orders',
        action_href: '/orders',
        count: pendingOrders.length,
        data: pendingOrders.slice(0, 5),
      });
    }

    if (outOfStockProducts.length > 0) {
      suggestions.push({
        type: 'out_of_stock',
        priority: 'medium',
        title: `${outOfStockProducts.length} product${outOfStockProducts.length === 1 ? '' : 's'} out of stock`,
        reason: 'Hide, restock, or offer an alternative before AI suggests these products again.',
        safety: 'Prevents wrong product promises',
        status: 'blocked',
        action_label: 'Update inventory',
        action_href: '/inventory/products',
        count: outOfStockProducts.length,
        data: outOfStockProducts.slice(0, 5),
      });
    } else if (lowStockProducts.length > 0) {
      suggestions.push({
        type: 'low_stock',
        priority: 'low',
        title: `Restock ${lowStockProducts.length} low-stock product${lowStockProducts.length === 1 ? '' : 's'}`,
        reason: 'These products are close to selling out. Review stock before promoting them.',
        safety: 'AI does not change stock',
        status: 'recommended',
        action_label: 'Update stock',
        action_href: '/inventory/products',
        count: lowStockProducts.length,
        data: lowStockProducts.slice(0, 5),
      });
    }

    if (activeCarts.length > 0) {
      suggestions.push({
        type: 'abandoned_cart',
        priority: 'medium',
        title: `Follow up ${activeCarts.length} active cart${activeCarts.length === 1 ? '' : 's'}`,
        reason: 'Customers selected products but may need payment, delivery, or stock confirmation.',
        safety: 'Owner-approved follow-up',
        status: 'needs_approval',
        action_label: 'Open follow-ups',
        action_href: '/crm/leads',
        count: activeCarts.length,
        data: activeCarts.slice(0, 5),
      });
    }

    if (needsAttention.length > 0) {
      suggestions.push({
        type: 'follow_up',
        priority: 'medium',
        title: `Follow up ${needsAttention.length} warm lead${needsAttention.length === 1 ? '' : 's'}`,
        reason: 'These customers may still buy if the owner replies or confirms product details.',
        safety: 'No campaign is sent automatically',
        status: 'needs_action',
        action_label: 'Open leads',
        action_href: '/crm/leads',
        count: needsAttention.length,
        data: needsAttention.slice(0, 5),
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'all_clear',
        priority: 'low',
        title: 'No urgent store action right now',
        reason: 'No waiting customers, unpaid orders, active carts, or stock problems were found.',
        safety: 'Checked today',
        status: 'ok',
        action_label: 'Open dashboard',
        action_href: '/dashboard',
        count: 0,
        data: [],
      });
    }

    const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
    const sortedSuggestions = suggestions.sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
    const paidRevenueToday = Number(todaysRevenue._sum.total_amount ?? 0);
    const activeCampaigns = recentCampaigns.filter((campaign) =>
      ['scheduled', 'running', 'sent', 'completed'].includes(String(campaign.status ?? '').toLowerCase()),
    );
    const employeeStatus = (hasBlocker: boolean, hasWork: boolean) => {
      if (hasBlocker) return 'needs_attention';
      if (hasWork) return 'working';
      return 'watching';
    };
    const employees = [
      {
        key: 'sales',
        name: 'AI Sales Employee',
        role: 'WhatsApp product enquiries and lead conversion',
        status: employeeStatus(waitingConversations.length > 0 || productInquiries.length > 0, needsAttention.length > 0),
        summary: waitingConversations.length > 0
          ? `${waitingConversations.length} buyer chat${waitingConversations.length === 1 ? '' : 's'} need fast reply.`
          : productInquiries.length > 0
            ? `${productInquiries.length} product enquiry${productInquiries.length === 1 ? '' : 'ies'} ready for follow-up.`
            : 'Watching WhatsApp for product questions and buyer intent.',
        safety: 'Does not promise stock or discounts without owner approval.',
        metrics: [
          { label: 'Waiting buyers', value: waitingConversations.length, tone: waitingConversations.length > 0 ? 'danger' : 'good' },
          { label: 'Open enquiries', value: productInquiries.length, tone: productInquiries.length > 0 ? 'warning' : 'neutral' },
          { label: 'Warm leads', value: needsAttention.length, tone: needsAttention.length > 0 ? 'warning' : 'neutral' },
        ],
        completed_work: [
          { title: 'Checked WhatsApp inbox', detail: `${conversations.length} open conversation${conversations.length === 1 ? '' : 's'} scanned.`, href: '/crm/inbox' },
          { title: 'Matched enquiries to catalog', detail: `${productInquiries.length} enquiry record${productInquiries.length === 1 ? '' : 's'} found.`, href: '/crm/leads' },
        ],
        next_actions: sortedSuggestions
          .filter((item) => ['reply_waiting', 'product_inquiry', 'follow_up'].includes(item.type))
          .slice(0, 3),
      },
      {
        key: 'orders',
        name: 'AI Order Desk',
        role: 'Payment, packing, and delivery follow-up',
        status: employeeStatus(paymentPendingOrders.length > 0, pendingOrders.length > 0),
        summary: paymentPendingOrders.length > 0
          ? `${paymentPendingOrders.length} order${paymentPendingOrders.length === 1 ? '' : 's'} still need payment.`
          : pendingOrders.length > 0
            ? `${pendingOrders.length} order${pendingOrders.length === 1 ? '' : 's'} need packing or delivery update.`
            : 'No urgent unpaid or pending order work right now.',
        safety: 'Uses product_orders as the operational source for seller orders.',
        metrics: [
          { label: 'Orders today', value: todaysOrders, tone: todaysOrders > 0 ? 'good' : 'neutral' },
          { label: 'Unpaid', value: paymentPendingOrders.length, tone: paymentPendingOrders.length > 0 ? 'danger' : 'good' },
          { label: 'In process', value: pendingOrders.length, tone: pendingOrders.length > 0 ? 'warning' : 'neutral' },
        ],
        completed_work: [
          { title: 'Checked payment queue', detail: `${paymentPendingOrders.length} unpaid order${paymentPendingOrders.length === 1 ? '' : 's'} found.`, href: '/orders' },
          { title: 'Reviewed dispatch queue', detail: `${pendingOrders.length} active order${pendingOrders.length === 1 ? '' : 's'} found.`, href: '/orders' },
        ],
        next_actions: sortedSuggestions
          .filter((item) => ['payment_pending', 'pack_orders'].includes(item.type))
          .slice(0, 3),
      },
      {
        key: 'inventory',
        name: 'AI Inventory Employee',
        role: 'Stock health, catalog accuracy, and oversell prevention',
        status: employeeStatus(outOfStockProducts.length > 0, lowStockProducts.length > 0),
        summary: outOfStockProducts.length > 0
          ? `${outOfStockProducts.length} product${outOfStockProducts.length === 1 ? '' : 's'} are out of stock and should not be promoted.`
          : lowStockProducts.length > 0
            ? `${lowStockProducts.length} product${lowStockProducts.length === 1 ? '' : 's'} are close to stockout.`
            : 'Stock looks stable for active products.',
        safety: 'Flags stock risk before the chatbot recommends or campaigns promote products.',
        metrics: [
          { label: 'Active products', value: totalProducts, tone: totalProducts > 0 ? 'good' : 'warning' },
          { label: 'WhatsApp catalog', value: whatsappCatalogItems, tone: whatsappCatalogItems > 0 ? 'good' : 'neutral' },
          { label: 'Stock issues', value: lowStockProducts.length, tone: lowStockProducts.length > 0 ? 'danger' : 'good' },
        ],
        completed_work: [
          { title: 'Scanned product stock', detail: `${totalProducts} active product${totalProducts === 1 ? '' : 's'} checked.`, href: '/inventory/products' },
          { title: 'Checked WhatsApp catalog sync', detail: `${whatsappCatalogItems} catalog item${whatsappCatalogItems === 1 ? '' : 's'} connected.`, href: '/settings/integrations' },
        ],
        next_actions: sortedSuggestions
          .filter((item) => ['out_of_stock', 'low_stock'].includes(item.type))
          .slice(0, 3),
      },
      {
        key: 'marketing',
        name: 'AI Marketing Employee',
        role: 'Campaign readiness, remarketing, and buyer follow-up',
        status: employeeStatus(campaignRecipientsFailed > 0, activeCarts.length > 0 || activeCampaigns.length > 0),
        summary: activeCarts.length > 0
          ? `${activeCarts.length} active cart${activeCarts.length === 1 ? '' : 's'} can become owner-approved follow-ups.`
          : activeCampaigns.length > 0
            ? `${activeCampaigns.length} recent campaign${activeCampaigns.length === 1 ? '' : 's'} found this week.`
            : 'Ready to suggest campaigns once products and buyer segments are active.',
        safety: 'Campaigns require approved templates and owner control.',
        metrics: [
          { label: 'Active carts', value: activeCarts.length, tone: activeCarts.length > 0 ? 'warning' : 'neutral' },
          { label: 'Campaigns 7d', value: recentCampaigns.length, tone: recentCampaigns.length > 0 ? 'good' : 'neutral' },
          { label: 'Recipient failures', value: campaignRecipientsFailed, tone: campaignRecipientsFailed > 0 ? 'danger' : 'good' },
        ],
        completed_work: [
          { title: 'Checked campaign history', detail: `${recentCampaigns.length} campaign${recentCampaigns.length === 1 ? '' : 's'} found in the last 7 days.`, href: '/crm/campaigns' },
          { title: 'Checked delivery health', detail: `${campaignRecipientsSent} recipient send event${campaignRecipientsSent === 1 ? '' : 's'} recorded.`, href: '/campaigns/live' },
        ],
        next_actions: sortedSuggestions
          .filter((item) => ['abandoned_cart'].includes(item.type))
          .slice(0, 3),
      },
      {
        key: 'growth',
        name: 'AI Growth Analyst',
        role: 'Daily sales summary and next-best business action',
        status: employeeStatus(false, todaysOrders > 0 || paidRevenueToday > 0),
        summary: todaysOrders > 0
          ? `${todaysOrders} order${todaysOrders === 1 ? '' : 's'} today with Rs ${paidRevenueToday.toLocaleString('en-IN')} paid revenue tracked.`
          : 'Waiting for the first order signal today.',
        safety: 'Summaries are based on seller order and payment records.',
        metrics: [
          { label: 'Paid today', value: paidRevenueToday, tone: paidRevenueToday > 0 ? 'good' : 'neutral', format: 'money' },
          { label: 'Orders today', value: todaysOrders, tone: todaysOrders > 0 ? 'good' : 'neutral' },
          { label: 'Completed queue', value: completedOrdersToday, tone: completedOrdersToday > 0 ? 'good' : 'neutral' },
        ],
        completed_work: [
          { title: 'Prepared today summary', detail: `${todaysOrders} order${todaysOrders === 1 ? '' : 's'} and Rs ${paidRevenueToday.toLocaleString('en-IN')} paid revenue.`, href: '/orders' },
          { title: 'Checked growth blockers', detail: `${sortedSuggestions.filter((item) => item.priority === 'high').length} high-priority issue${sortedSuggestions.filter((item) => item.priority === 'high').length === 1 ? '' : 's'} found.`, href: '/dashboard' },
        ],
        next_actions: sortedSuggestions.slice(0, 2),
      },
    ];

    return {
      data: {
        title: 'AI Store Manager',
        subtitle: 'What to do today to convert product enquiries into orders.',
        checked_at: new Date().toISOString(),
        suggestions: sortedSuggestions,
        employees,
        work_feed: employees
          .flatMap((employee) => employee.next_actions.map((action) => ({ ...action, employee_key: employee.key, employee_name: employee.name })))
          .slice(0, 8),
        counts: {
          total: suggestions.length,
          high: suggestions.filter((s) => s.priority === 'high').length,
          needs_approval: suggestions.filter((s) => s.status === 'needs_approval').length,
          blocked: suggestions.filter((s) => s.status === 'blocked').length,
          waiting_customers: waitingConversations.length,
          product_inquiries: productInquiries.length,
          payment_pending: paymentPendingOrders.length,
          orders_today: todaysOrders,
          low_stock: lowStockProducts.length,
          active_carts: activeCarts.length,
        },
      },
    };
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

  private contextDate(ctx: any, key: 'check_in' | 'check_out'): string | null {
    const raw = ctx?.[key] ?? ctx?.[key.replace('_', '')];
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
  }

  private async resolveReminderItem(businessId: string, ctx: any) {
    const itemId = ctx?.item_id ?? ctx?.service_id ?? ctx?.property_id;
    if (itemId) {
      const item = await this.prisma.catalog_items.findFirst({
        where: {
          business_id: businessId,
          item_id: itemId,
          item_type: 'accommodation',
          is_active: true,
          deleted_at: null,
        },
        select: { item_id: true, name: true, base_price: true, attributes: true },
      });
      if (item) return item;
    }

    const name = String(ctx?.item_name ?? ctx?.property_name ?? ctx?.service_name ?? '').trim();
    if (!name) return null;

    return this.prisma.catalog_items.findFirst({
      where: {
        business_id: businessId,
        item_type: 'accommodation',
        is_active: true,
        deleted_at: null,
        name: { equals: name, mode: 'insensitive' },
      },
      select: { item_id: true, name: true, base_price: true, attributes: true },
    });
  }

  private async checkAccommodationAvailability(
    item: { item_id: string; attributes: any },
    checkIn: string,
    checkOut: string,
  ) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return { available: false, reason: 'Invalid stay dates', availableSlots: 0 };
    }

    const totalUnits = this.resolveItemTotalUnits(item.attributes);
    if (totalUnits <= 0) return { available: false, reason: 'No inventory count set for this property', availableSlots: 0 };

    const rows = await this.prisma.item_availability.findMany({
      where: {
        item_id: item.item_id,
        date: { gte: start, lt: end },
      },
      select: { date: true, total_slots: true, booked_slots: true, is_blocked: true },
    });

    if (rows.some((row) => row.is_blocked)) {
      return { available: false, reason: 'Stopped because at least one selected date is blocked', availableSlots: 0 };
    }

    const bookedByDate = new Map(rows.map((row) => [row.date.toISOString().slice(0, 10), row]));
    let minAvailable = totalUnits;
    for (const date of this.eachNight(start, end)) {
      const row = bookedByDate.get(date);
      const availableForNight = row ? row.total_slots - row.booked_slots : totalUnits;
      minAvailable = Math.min(minAvailable, availableForNight);
    }

    if (minAvailable <= 0) {
      return { available: false, reason: 'Stopped because rooms are no longer available for these dates', availableSlots: 0 };
    }

    return { available: true, reason: 'Available now', availableSlots: minAvailable };
  }

  private resolveItemTotalUnits(attributes: any): number {
    const attrs = attributes ?? {};
    const totalUnits = Number(attrs.total_units ?? attrs.totalUnits ?? attrs.qty ?? attrs.rooms ?? attrs.capacity ?? 0);
    return Number.isFinite(totalUnits) ? Math.max(0, Math.floor(totalUnits)) : 0;
  }

  private eachNight(start: Date, end: Date) {
    const dates: string[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const limit = new Date(end);
    limit.setHours(0, 0, 0, 0);
    while (cursor < limit) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  private reminderRow(lead: any, ctx: any, readiness: 'ready' | 'stopped' | 'missing_details', reason: string, availability: any) {
    return {
      lead_id: lead.lead_id,
      name: lead.name,
      phone: lead.phone,
      status: lead.status,
      updated_at: lead.updated_at,
      readiness,
      reason,
      property_name: availability?.item_name ?? ctx?.item_name ?? ctx?.property_name ?? ctx?.service_name ?? null,
      check_in: availability?.check_in ?? this.contextDate(ctx, 'check_in'),
      check_out: availability?.check_out ?? this.contextDate(ctx, 'check_out'),
      available_slots: availability?.available_slots ?? 0,
      checked_at: availability?.checked_at ?? new Date().toISOString(),
      suggested_action:
        readiness === 'ready'
          ? 'Send booking reminder'
          : readiness === 'stopped'
            ? 'Do not send reminder. Offer other dates or another property.'
            : 'Check lead details before sending anything.',
    };
  }

  private formatLead(lead: any, related?: { conversation?: any; followup?: { scheduled_at: Date } | null }) {
    const nameParts = (lead.name ?? '').trim().split(/\s+/);
    const first_name = nameParts[0] || null;
    const last_name = nameParts.slice(1).join(' ') || null;
    const ctx = lead.context as any;

    const normalizedContext = ctx ? this.normalizeLeadContext(ctx) : null;

    const extracted_entities = normalizedContext
      ? {
          check_in: normalizedContext.check_in ?? null,
          check_out: normalizedContext.check_out ?? null,
          guest_count: normalizedContext.guest_count ?? null,
          room_preference: normalizedContext.room_preference ?? null,
          budget: normalizedContext.budget ?? null,
          product_name: normalizedContext.items?.[0]?.name ?? normalizedContext.item_name ?? null,
          quantity: normalizedContext.items?.[0]?.qty ?? normalizedContext.quantity ?? null,
          delivery_city: normalizedContext.pincode ?? null,
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
      lead_type: lead.lead_type ?? null,
      qualification_score: lead.qualification_score ?? 0,
      lead_quality: this.computeLeadQuality(lead),
      intent_type: ctx?.type ?? null,
      extracted_entities,
      is_converted: ['booked', 'won', 'converted'].includes(lead.status),
      quoted_amount: lead.quoted_amount ? Number(lead.quoted_amount) : null,
      converted_value: lead.converted_value ? Number(lead.converted_value) : null,
      tags: lead.tags ?? [],
      assigned_to: lead.assigned_to,
      context: normalizedContext,
      conversation_id: related?.conversation?.conversation_id ?? null,
      followup_at: related?.followup?.scheduled_at ?? lead.followup_at ?? null,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
    };
  }

  private normalizeLeadContext(ctx: any) {
    const itemName = ctx.item_name ?? ctx.property_name ?? ctx.service_name ?? ctx.items?.[0]?.name ?? null;
    return {
      ...ctx,
      guest_count: ctx.guest_count ?? ctx.guests ?? ctx.group_size ?? null,
      property_name: ctx.property_name ?? itemName,
      item_name: ctx.item_name ?? itemName,
      room_preference: ctx.room_preference ?? ctx.room_pref ?? null,
      special_requests: ctx.special_requests ?? ctx.notes ?? null,
    };
  }

  private computeLeadQuality(lead: any): 'hot' | 'warm' | 'cold' {
    if (['quoted', 'booked', 'won', 'converted'].includes(lead.status)) return 'hot';
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
