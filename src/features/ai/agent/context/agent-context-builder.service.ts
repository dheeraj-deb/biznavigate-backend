import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../../prisma/prisma.service';

export interface BusinessProfileSnapshot {
  business_id: string;
  business_name: string;
  business_type: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  website: string | null;
  currency: string;
  timezone: string;
  payment_mode: 'manual' | 'advance' | 'full' | null;
  business_hours: any;
  policies: { cancellation: string; refund: string; terms: string };
  contact: { phone: string; whatsapp: string; address: string };
}

export interface LeadSnapshot {
  lead_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  tags: string[];
  context: Record<string, any> | null;
  created_at: Date;
}

export interface RecentBookingSummary {
  reference_id: string;
  type: 'hospitality_booking' | 'order';
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: Date;
  check_in?: string;
  check_out?: string;
  item_name?: string;
}

export interface BuiltAgentContext {
  businessProfile: BusinessProfileSnapshot;
  lead: LeadSnapshot | null;
  recentBookings: RecentBookingSummary[];
}

const BUSINESS_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AgentContextBuilder {
  private readonly logger = new Logger(AgentContextBuilder.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async build(params: {
    businessId: string;
    leadId?: string;
    phone?: string;
  }): Promise<BuiltAgentContext> {
    const [businessProfile, lead] = await Promise.all([
      this.loadBusinessProfile(params.businessId),
      this.loadLead(params.businessId, params.leadId, params.phone),
    ]);

    const recentBookings = lead
      ? await this.loadRecentBookings(params.businessId, lead.lead_id)
      : [];

    return { businessProfile, lead, recentBookings };
  }

  invalidateBusiness(businessId: string) {
    return this.cache.del(this.businessKey(businessId));
  }

  private businessKey(businessId: string) {
    return `agent:business_profile:${businessId}`;
  }

  private async loadBusinessProfile(businessId: string): Promise<BusinessProfileSnapshot> {
    const cached = await this.cache.get<BusinessProfileSnapshot>(this.businessKey(businessId));
    if (cached) return cached;

    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: {
        business_id: true,
        business_name: true,
        business_type: true,
        city: true,
        address: true,
        phone: true,
        whatsapp_number: true,
        email: true,
        website: true,
      },
    });

    const settings = await (this.prisma.business_settings as any)
      .findUnique({
        where: { business_id: businessId },
        select: { currency: true, timezone: true, business_hours: true, booking_link: true },
      })
      .catch(() => null);

    const bookingLink = (settings?.booking_link as any) ?? {};
    const profile: BusinessProfileSnapshot = {
      business_id: businessId,
      business_name: business?.business_name ?? 'this business',
      business_type: (business?.business_type ?? 'default').toLowerCase(),
      city: business?.city ?? null,
      address: business?.address ?? null,
      phone: business?.phone ?? null,
      whatsapp_number: business?.whatsapp_number ?? null,
      email: business?.email ?? null,
      website: business?.website ?? null,
      currency: settings?.currency ?? 'INR',
      timezone: settings?.timezone ?? 'Asia/Kolkata',
      payment_mode: bookingLink.payment_mode ?? null,
      business_hours: settings?.business_hours ?? null,
      policies: {
        cancellation: bookingLink.policies?.cancellation ?? '',
        refund: bookingLink.policies?.refund ?? '',
        terms: bookingLink.policies?.terms ?? '',
      },
      contact: {
        phone: bookingLink.contact?.phone ?? '',
        whatsapp: bookingLink.contact?.whatsapp ?? '',
        address: bookingLink.contact?.address ?? '',
      },
    };

    await this.cache.set(this.businessKey(businessId), profile, BUSINESS_CACHE_TTL_MS);
    return profile;
  }

  private async loadLead(
    businessId: string,
    leadId?: string,
    phone?: string,
  ): Promise<LeadSnapshot | null> {
    if (leadId) {
      const lead = await this.prisma.leads.findFirst({
        where: { lead_id: leadId, business_id: businessId },
        select: {
          lead_id: true,
          name: true,
          phone: true,
          email: true,
          status: true,
          tags: true,
          context: true,
          created_at: true,
        },
      });
      if (lead) return lead as LeadSnapshot;
    }

    if (phone) {
      const lead = await this.prisma.leads.findFirst({
        where: { business_id: businessId, phone },
        orderBy: { created_at: 'desc' },
        select: {
          lead_id: true,
          name: true,
          phone: true,
          email: true,
          status: true,
          tags: true,
          context: true,
          created_at: true,
        },
      });
      if (lead) return lead as LeadSnapshot;
    }

    return null;
  }

  private async loadRecentBookings(
    businessId: string,
    leadId: string,
  ): Promise<RecentBookingSummary[]> {
    try {
      const [bookings, orders] = await Promise.all([
        this.prisma.hospitality_bookings.findMany({
          where: { business_id: businessId, lead_id: leadId },
          orderBy: { created_at: 'desc' },
          take: 2,
          select: {
            hospitality_booking_id: true,
            booking_number: true,
            status: true,
            payment_status: true,
            total_amount: true,
            check_in: true,
            check_out: true,
            created_at: true,
            rooms: { take: 1, select: { item_name: true } },
          },
        }),
        this.prisma.orders.findMany({
          where: { business_id: businessId, lead_id: leadId },
          orderBy: { created_at: 'desc' },
          take: 2,
          select: {
            order_id: true,
            order_number: true,
            status: true,
            payment_status: true,
            total_amount: true,
            created_at: true,
            order_items: { take: 1, select: { product_name: true } },
          },
        }),
      ]);

      const all: RecentBookingSummary[] = [
        ...bookings.map((b: any) => ({
          reference_id: b.booking_number ?? b.hospitality_booking_id,
          type: 'hospitality_booking' as const,
          status: b.status,
          payment_status: b.payment_status,
          total_amount: Number(b.total_amount ?? 0),
          created_at: b.created_at,
          check_in: b.check_in?.toISOString().slice(0, 10),
          check_out: b.check_out?.toISOString().slice(0, 10),
          item_name: b.rooms?.[0]?.item_name,
        })),
        ...orders.map((o: any) => ({
          reference_id: o.order_number ?? o.order_id,
          type: 'order' as const,
          status: o.status ?? o.payment_status,
          payment_status: o.payment_status,
          total_amount: Number(o.total_amount ?? 0),
          created_at: o.created_at,
          item_name: o.order_items?.[0]?.product_name,
        })),
      ];

      return all
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, 2);
    } catch (err: any) {
      this.logger.warn(`loadRecentBookings failed for lead ${leadId}: ${err.message}`);
      return [];
    }
  }
}
