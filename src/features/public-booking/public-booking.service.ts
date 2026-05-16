import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogService } from '../commerce/catalog/application/services/catalog.service';
import { HospitalityBookingCommandService } from '../industries/hospitality/bookings/application/services/hospitality-booking-command.service';
import {
  BookingLinkConfig,
  inferExperienceType,
  normalizeBookingLinkConfig,
} from '../platform/business-settings/booking-link.config';

type PublicBusiness = {
  business_id: string;
  tenant_id: string;
  business_name: string;
  business_type: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  city: string | null;
  public_booking_slug: string | null;
  settings: { booking_link: any; currency: string; timezone: string } | null;
};

@Injectable()
export class PublicBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
    private readonly hospitalityBookingCommandService: HospitalityBookingCommandService,
  ) {}

  async getPage(slug: string) {
    const business = await this.resolveBusiness(slug);
    const config = this.resolveConfig(business);

    return {
      business: this.publicBusinessProfile(business),
      config,
      labels: this.labelsFor(config.experience_type),
    };
  }

  async getItems(slug: string, query: any) {
    const business = await this.resolveBusiness(slug);
    const config = this.resolveConfig(business);
    const itemTypes = this.itemTypesFor(config.experience_type);
    const itemType = itemTypes.length === 1 ? itemTypes[0] : query.item_type;

    const items = await this.catalogService.queryForAgent({
      businessId: business.business_id,
      item_type: itemType,
      category: query.category,
      search: query.search,
      check_in: query.checkIn ?? query.check_in ?? query.date,
      check_out: query.checkOut ?? query.check_out ?? query.date,
      guests: query.guests ? Number(query.guests) : undefined,
    } as any);

    const filtered = itemTypes.length
      ? items.filter((item: any) => itemTypes.includes(item.item_type))
      : items;

    return {
      data: filtered.map((item: any) => ({
        item_id: item.item_id,
        item_type: item.item_type,
        name: item.name,
        description: item.description ?? '',
        base_price: Number(item.base_price ?? 0),
        effective_price: Number(item.effective_price ?? item.base_price ?? 0),
        currency: business.settings?.currency ?? 'INR',
        available_slots: item.available_slots ?? item.stock_quantity ?? null,
        stock_quantity: item.stock_quantity ?? null,
        image_urls: [item.primary_image_url, ...(Array.isArray(item.image_urls) ? item.image_urls : [])].filter(Boolean),
        primary_image_url: item.primary_image_url,
        details: item.details ?? item.attributes ?? {},
        attributes: item.attributes ?? {},
        variants: item.variants ?? [],
      })),
    };
  }

  async createRequest(slug: string, body: any) {
    const business = await this.resolveBusiness(slug);
    const config = this.resolveConfig(business);
    const item = await this.prisma.catalog_items.findFirst({
      where: {
        item_id: body.item_id,
        business_id: business.business_id,
        is_active: true,
        deleted_at: null,
      },
      include: { variants: { where: { is_active: true } } },
    });
    if (!item) throw new NotFoundException('Selected item is not available');

    if (config.payment_mode !== 'manual') {
      throw new BadRequestException('Online payment is not configured for this public booking link yet');
    }

    const lead = await this.upsertPublicLead(business, item, body, config);

    if (item.item_type === 'physical_product') {
      return this.createProductRequest(business, item, lead.lead_id, body);
    }

    return this.createBookableRequest(business, item, lead.lead_id, body, config);
  }

  async createPaymentIntent(slug: string) {
    const business = await this.resolveBusiness(slug);
    const config = this.resolveConfig(business);
    if (config.payment_mode === 'manual') {
      throw new BadRequestException('This booking link is configured for manual payment');
    }
    throw new BadRequestException('Online payment gateway is not configured for this booking link yet');
  }

  private async resolveBusiness(slug: string): Promise<PublicBusiness> {
    const business = await this.prisma.businesses.findFirst({
      where: {
        public_booking_slug: slug,
        deleted_at: null,
      },
      select: {
        business_id: true,
        tenant_id: true,
        business_name: true,
        business_type: true,
        phone: true,
        whatsapp_number: true,
        address: true,
        city: true,
        public_booking_slug: true,
        settings: { select: { booking_link: true, currency: true, timezone: true } },
      },
    });

    if (!business) throw new NotFoundException('Booking link not found');
    const config = this.resolveConfig(business);
    if (!config.enabled) throw new NotFoundException('Booking link is not active');
    return business;
  }

  private resolveConfig(business: PublicBusiness): BookingLinkConfig {
    const config = normalizeBookingLinkConfig(
      business.settings?.booking_link,
      business.public_booking_slug ?? '',
    );
    if (config.experience_type === 'generic') {
      config.experience_type = inferExperienceType(business.business_type);
    }
    return config;
  }

  private publicBusinessProfile(business: PublicBusiness) {
    return {
      business_name: business.business_name,
      business_type: business.business_type,
      phone: business.phone,
      whatsapp_number: business.whatsapp_number,
      address: business.address,
      city: business.city,
      slug: business.public_booking_slug,
      currency: business.settings?.currency ?? 'INR',
      timezone: business.settings?.timezone ?? 'Asia/Kolkata',
    };
  }

  private itemTypesFor(experience: BookingLinkConfig['experience_type']) {
    if (experience === 'products') return ['physical_product'];
    if (experience === 'hospitality') return ['accommodation'];
    if (experience === 'events') return ['activity'];
    if (experience === 'services' || experience === 'healthcare' || experience === 'education') return ['service', 'activity'];
    return ['accommodation', 'activity', 'service', 'physical_product'];
  }

  private labelsFor(experience: BookingLinkConfig['experience_type']) {
    const map: Record<string, any> = {
      hospitality: { item: 'Room', items: 'Rooms', customer: 'Guest', request: 'Booking' },
      events: { item: 'Event', items: 'Events', customer: 'Client', request: 'Event Booking' },
      services: { item: 'Service', items: 'Services', customer: 'Client', request: 'Request' },
      healthcare: { item: 'Service', items: 'Services', customer: 'Patient', request: 'Appointment Request' },
      education: { item: 'Course', items: 'Courses', customer: 'Student', request: 'Enrollment Request' },
      products: { item: 'Product', items: 'Products', customer: 'Customer', request: 'Order Request' },
      generic: { item: 'Item', items: 'Items', customer: 'Customer', request: 'Request' },
    };
    return map[experience] ?? map.generic;
  }

  private async upsertPublicLead(business: PublicBusiness, item: any, body: any, config: BookingLinkConfig) {
    const phone = String(body.customer?.phone ?? body.phone ?? '').trim();
    const email = String(body.customer?.email ?? body.email ?? '').trim();
    const name = String(body.customer?.name ?? body.name ?? '').trim();
    const address = String(body.customer?.address ?? body.address ?? '').trim();
    const notes = String(body.customer?.notes ?? body.notes ?? '').trim();
    if (config.required_fields.name && !name) throw new BadRequestException('Name is required');
    if (config.required_fields.phone && !phone) throw new BadRequestException('Phone is required');
    if (config.required_fields.email && !email) throw new BadRequestException('Email is required');
    if (config.required_fields.address && !address) throw new BadRequestException('Address is required');
    if (config.required_fields.notes && !notes) throw new BadRequestException('Notes are required');

    const platformId = `public:${business.public_booking_slug}:${phone || email || randomUUID()}`;
    return this.prisma.leads.upsert({
      where: {
        business_id_platform_id: {
          business_id: business.business_id,
          platform_id: platformId,
        },
      },
      create: {
        business_id: business.business_id,
        tenant_id: business.tenant_id,
        name: name || null,
        phone: phone || null,
        email: email || null,
        channel: 'website',
        source: 'public_booking_link',
        platform_id: platformId,
        status: 'new',
        context: this.leadContext(item, body),
        tags: ['public-booking-link'],
      },
      update: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        context: this.leadContext(item, body),
        updated_at: new Date(),
      },
    });
  }

  private leadContext(item: any, body: any) {
    return {
      type: item.item_type === 'physical_product' ? 'product' : 'public_booking',
      item_id: item.item_id,
      item_name: item.name,
      check_in: body.check_in ?? body.checkIn ?? body.date,
      check_out: body.check_out ?? body.checkOut,
      guests: Number(body.guests ?? body.quantity ?? 1),
      quantity: Number(body.quantity ?? 1),
      notes: body.notes ?? body.customer?.notes,
      address: body.address ?? body.customer?.address,
    };
  }

  private async createProductRequest(business: PublicBusiness, item: any, leadId: string, body: any) {
    const quantity = Math.max(Number(body.quantity ?? 1), 1);
    if (item.stock_quantity !== null && item.stock_quantity !== undefined && item.stock_quantity < quantity) {
      throw new BadRequestException('Requested quantity is not available');
    }

    const inquiry = await this.prisma.product_inquiries.create({
      data: {
        business_id: business.business_id,
        tenant_id: business.tenant_id,
        lead_id: leadId,
        item_id: item.item_id,
        variant_id: body.variant_id ?? null,
        quantity,
        delivery_pincode: body.customer?.pincode ?? body.pincode ?? null,
        budget: Number(item.base_price ?? 0) * quantity,
        status: 'open',
        metadata: {
          source: 'public_booking_link',
          customer: body.customer ?? {},
          notes: body.notes,
          item_name: item.name,
        },
      },
    });

    await this.prisma.lead_events.create({
      data: {
        lead_id: leadId,
        business_id: business.business_id,
        type: 'public_order_request',
        actor: 'customer',
        data: { inquiry_id: inquiry.inquiry_id, item_id: item.item_id, quantity },
      },
    });

    return {
      type: 'product_request',
      reference_id: inquiry.inquiry_id,
      status: 'received',
      payment_status: 'pending',
      message: 'Your request has been received. The team will contact you shortly.',
    };
  }

  private async createBookableRequest(
    business: PublicBusiness,
    item: any,
    leadId: string,
    body: any,
    config: BookingLinkConfig,
  ) {
    const checkIn = body.check_in ?? body.checkIn ?? body.date;
    const checkOut = body.check_out ?? body.checkOut ?? (checkIn ? this.nextDay(checkIn) : undefined);
    if (!checkIn || !checkOut) throw new BadRequestException('Date or check-in/check-out is required');

    const customer = body.customer ?? {};
    const name = customer.name ?? body.name;
    const phone = customer.phone ?? body.phone;

    if (item.item_type === 'accommodation') {
      const booking = await this.hospitalityBookingCommandService.createBooking({
        business_id: business.business_id,
        service_id: item.item_id,
        check_in: checkIn,
        check_out: checkOut,
        guest_name: name,
        phone,
        customer_phone: phone,
        lead_id: leadId,
        num_guests: body.guests ?? body.quantity ?? 1,
        source: 'public_booking_link',
        actor: 'customer',
        idempotency_key: `public_booking:${randomUUID()}`,
      });

      return {
        type: 'booking',
        reference_id: booking.hospitality_booking_id ?? booking.booking_id,
        legacy_order_id: booking.legacy_order_id,
        status: 'confirmed',
        payment_status: 'pending',
        message: config.payment_mode === 'manual'
          ? 'Your booking request has been confirmed. Payment can be completed with the business.'
          : 'Your booking has been created and is awaiting payment.',
      };
    }

    const inquiry = await this.prisma.hospitality_inquiries.create({
      data: {
        business_id: business.business_id,
        tenant_id: business.tenant_id,
        lead_id: leadId,
        preferred_item_id: item.item_id,
        check_in: new Date(checkIn),
        check_out: new Date(checkOut),
        guests: Number(body.guests ?? body.quantity ?? 1),
        status: 'open',
        metadata: {
          source: 'public_booking_link',
          customer,
          notes: body.notes,
          item_type: item.item_type,
          item_name: item.name,
        },
      },
    });

    await this.prisma.lead_events.create({
      data: {
        lead_id: leadId,
        business_id: business.business_id,
        type: 'public_booking_request',
        actor: 'customer',
        data: { inquiry_id: inquiry.inquiry_id, item_id: item.item_id, check_in: checkIn, check_out: checkOut },
      },
    });

    return {
      type: 'booking_request',
      reference_id: inquiry.inquiry_id,
      status: 'received',
      payment_status: 'pending',
      message: 'Your request has been received. The team will confirm availability shortly.',
    };
  }

  private nextDay(date: string) {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
}
