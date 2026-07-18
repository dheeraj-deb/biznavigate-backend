import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogService } from '../commerce/catalog/application/services/catalog.service';
import { HospitalityBookingCommandService } from '../industries/hospitality/bookings/application/services/hospitality-booking-command.service';
import { LeadPhoneResolverService } from '../crm/lead/utils/lead-phone-resolver.service';
import { LeadTypes, leadTypeForPublicItem } from '../crm/lead/application/lead-types';
import {
  BookingLinkConfig,
  inferExperienceType,
  normalizeBookingLinkConfig,
} from '../platform/business-settings/booking-link.config';
import { normalizeBookingMethodsConfig } from '../platform/business-settings/booking-methods.config';

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
  settings: { booking_link: any; booking_methods: any; currency: string; timezone: string } | null;
};

@Injectable()
export class PublicBookingService {
  private readonly logger = new Logger(PublicBookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
    private readonly hospitalityBookingCommandService: HospitalityBookingCommandService,
    private readonly phoneResolver: LeadPhoneResolverService,
    private readonly eventEmitter: EventEmitter2,
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
      include: { variants: { where: { is_active: true } }, product_detail: true },
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
        settings: { select: { booking_link: true, booking_methods: true, currency: true, timezone: true } },
      },
    });

    if (!business) throw new NotFoundException('Booking link not found');
    const config = this.resolveConfig(business);
    const bookingMethods = normalizeBookingMethodsConfig(business.settings?.booking_methods);
    const linkActive = config.enabled || bookingMethods.availability_response.mode === 'website_link';
    if (!linkActive) throw new NotFoundException('Booking link is not active');

    const whatsappAccount = await this.prisma.social_accounts.findFirst({
      where: { business_id: business.business_id, platform: 'whatsapp', is_active: true },
      select: { username: true },
      orderBy: { updated_at: 'desc' },
    });

    return {
      ...business,
      whatsapp_number: whatsappAccount?.username ?? business.whatsapp_number,
    };
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
    const linkedLeadId = this.extractLeadId(body);
    if (config.required_fields.name && !name) throw new BadRequestException('Name is required');
    if (config.required_fields.phone && !phone) throw new BadRequestException('Phone is required');
    if (config.required_fields.email && !email) throw new BadRequestException('Email is required');
    if (config.required_fields.address && !address) throw new BadRequestException('Address is required');
    if (config.required_fields.notes && !notes) throw new BadRequestException('Notes are required');

    // Normalise the phone so the same human entering "9539192684" on the form
    // and messaging via WhatsApp as "919539192684" resolves to one lead row.
    const normalizedPhone = phone
      ? (await this.phoneResolver.normalize(business.business_id, phone)) ?? phone
      : null;

    if (linkedLeadId) {
      const linkedLead = await this.prisma.leads.findFirst({
        where: {
          lead_id: linkedLeadId,
          business_id: business.business_id,
          deleted_at: null,
        },
      });

      if (linkedLead) {
        return this.prisma.leads.update({
          where: { lead_id: linkedLead.lead_id },
          data: {
            ...(name ? { name } : {}),
            ...(normalizedPhone && (!linkedLead.phone || linkedLead.phone === normalizedPhone) ? { phone: normalizedPhone } : {}),
            ...(email ? { email } : {}),
            ...(linkedLead.tags?.includes('public-booking-link') ? {} : { tags: { push: 'public-booking-link' } as any }),
            ...this.publicLeadTypeUpdate(item, linkedLead.lead_type),
            context: this.leadContext(item, body),
            status: linkedLead.status === 'new' ? 'contacted' : linkedLead.status,
            updated_at: new Date(),
          },
        });
      }
    }

    // Existing-lead lookup priority: phone first (the strongest identity match),
    // then fall back to the legacy platform_id key so older booking-link leads
    // without a phone still resolve.
    const platformId = `public:${business.public_booking_slug}:${normalizedPhone || phone || email || randomUUID()}`;
    const existing = normalizedPhone
      ? await this.prisma.leads.findFirst({
          where: { business_id: business.business_id, phone: normalizedPhone, deleted_at: null },
        })
      : await this.prisma.leads.findFirst({
          where: { business_id: business.business_id, platform_id: platformId, deleted_at: null },
        });

    if (existing) {
      return this.prisma.leads.update({
        where: { lead_id: existing.lead_id },
        data: {
          ...(name ? { name } : {}),
          ...(normalizedPhone ? { phone: normalizedPhone } : {}),
          ...(email ? { email } : {}),
          ...(existing.tags?.includes('public-booking-link') ? {} : { tags: { push: 'public-booking-link' } as any }),
          ...this.publicLeadTypeUpdate(item, existing.lead_type),
          context: this.leadContext(item, body),
          updated_at: new Date(),
        },
      });
    }

    return this.prisma.leads.create({
      data: {
        business_id: business.business_id,
        tenant_id: business.tenant_id,
        name: name || null,
        phone: normalizedPhone,
        email: email || null,
        channel: 'website',
        source: 'public_booking_link',
        platform_id: platformId,
        status: 'new',
        lead_type: leadTypeForPublicItem(item.item_type) ?? undefined,
        context: this.leadContext(item, body),
        tags: ['public-booking-link'],
      },
    });
  }

  private publicLeadTypeUpdate(item: any, currentLeadType?: string | null) {
    const nextLeadType = leadTypeForPublicItem(item.item_type);
    if (!nextLeadType) return {};
    if ([
      LeadTypes.RESORT_BOOKING_PENDING,
      LeadTypes.RESORT_BOOKED,
      LeadTypes.RESORT_CANCELLED,
      LeadTypes.PRODUCT_ORDER_PENDING,
      LeadTypes.PRODUCT_ORDERED,
    ].includes(currentLeadType as any)) {
      return {};
    }
    return { lead_type: nextLeadType };
  }

  private extractLeadId(body: any): string | null {
    const value =
      body?.lead_id ??
      body?.leadId ??
      body?.lead?.lead_id ??
      body?.lead?.leadId ??
      body?.metadata?.lead_id ??
      body?.metadata?.leadId;
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)
      ? trimmed
      : null;
  }

  private leadContext(item: any, body: any) {
    return {
      type: item.item_type === 'physical_product'
        ? 'product'
        : item.item_type === 'accommodation'
          ? 'resort'
          : 'public_booking',
      item_id: item.item_id,
      item_name: item.name,
      property_name: item.name,
      check_in: body.check_in ?? body.checkIn ?? body.date,
      check_out: body.check_out ?? body.checkOut,
      guests: Number(body.guests ?? body.quantity ?? 1),
      guest_count: Number(body.guests ?? body.quantity ?? 1),
      room_count: Number(body.room_count ?? body.roomCount ?? body.rooms ?? 1),
      quantity: Number(body.quantity ?? body.guests ?? 1),
      notes: body.notes ?? body.customer?.notes,
      special_requests: body.special_requests ?? body.customer?.notes ?? body.notes,
      address: body.address ?? body.customer?.address,
    };
  }

  private async createProductRequest(business: PublicBusiness, item: any, leadId: string, body: any) {
    const quantity = Math.max(Number(body.quantity ?? body.guests ?? 1), 1);
    const customerPayload = body.customer ?? {};
    const phone = await this.normalizeCustomerPhone(business.business_id, customerPayload.phone ?? body.phone);
    if (!phone) throw new BadRequestException('Phone is required to place an order');

    const result = await this.prisma.$transaction(async (tx) => {
      const freshItem = await tx.catalog_items.findFirst({
        where: {
          business_id: business.business_id,
          item_id: item.item_id,
          item_type: 'physical_product',
          is_active: true,
          deleted_at: null,
        },
        include: {
          variants: { where: { is_active: true } },
          product_detail: true,
        },
      });
      if (!freshItem) throw new NotFoundException('Selected product is not available');

      const variant = this.resolveRequestedVariant(freshItem, body);
      if (freshItem.variants.length > 0 && !variant && freshItem.stock_quantity == null) {
        throw new BadRequestException('Please choose a product variant');
      }

      if (variant) {
        const updated = await tx.item_variants.updateMany({
          where: {
            business_id: business.business_id,
            item_id: freshItem.item_id,
            variant_id: variant.variant_id,
            is_active: true,
            stock_quantity: { gte: quantity },
          },
          data: { stock_quantity: { decrement: quantity }, updated_at: new Date() },
        });
        if (updated.count === 0) {
          throw new BadRequestException(`${freshItem.name} (${variant.name}) has only ${variant.stock_quantity} in stock`);
        }
      } else {
        if (freshItem.stock_quantity === null || freshItem.stock_quantity === undefined) {
          throw new BadRequestException('Stock is not configured for this product yet');
        }
        const updated = await tx.catalog_items.updateMany({
          where: {
            business_id: business.business_id,
            item_id: freshItem.item_id,
            stock_quantity: { not: null, gte: quantity },
          },
          data: { stock_quantity: { decrement: quantity }, updated_at: new Date() },
        });
        if (updated.count === 0) {
          throw new BadRequestException(`${freshItem.name} has only ${freshItem.stock_quantity ?? 0} in stock`);
        }
      }

      await this.markWhatsAppCatalogAvailabilityPending(tx, freshItem.item_id);

      const customer = await this.findOrCreatePublicCustomer(tx, business, {
        name: customerPayload.name ?? body.name,
        phone,
        email: customerPayload.email ?? body.email,
      });
      const unitPrice = Number(variant?.price ?? freshItem.base_price ?? 0);
      const total = unitPrice * quantity;
      const orderNumber = this.makeOrderNumber('WEB');
      const paymentMethod = String(body.payment_method ?? body.paymentMethod ?? 'manual').toLowerCase();
      const paymentExpiresAt = await this.paymentExpiry(tx, business.business_id);
      const deliveryAddress = customerPayload.address ?? body.address ?? null;
      const deliveryPincode = customerPayload.pincode ?? body.pincode ?? null;
      const notes = customerPayload.notes ?? body.notes ?? null;

      const order = await tx.orders.create({
        data: {
          business_id: business.business_id,
          tenant_id: business.tenant_id,
          customer_id: customer.customer_id,
          lead_id: leadId,
          order_number: orderNumber,
          order_type: 'product',
          status: 'pending',
          subtotal: total,
          discount_amount: 0,
          tax_amount: 0,
          shipping_fee: 0,
          total_amount: total,
          payment_status: 'pending',
          payment_method: paymentMethod,
          payment_expires_at: paymentExpiresAt,
          shipping_address: deliveryAddress,
          shipping_phone: phone,
          shipping_pincode: deliveryPincode,
          source: 'public_booking_link',
          notes,
        },
      });

      const productOrder = await tx.product_orders.create({
        data: {
          business_id: business.business_id,
          tenant_id: business.tenant_id,
          legacy_order_id: order.order_id,
          customer_id: customer.customer_id,
          lead_id: leadId,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          subtotal: total,
          discount_amount: 0,
          tax_amount: 0,
          shipping_fee: 0,
          total_amount: total,
          source: 'public_booking_link',
          shipping_address: deliveryAddress,
          shipping_pincode: deliveryPincode,
          shipping_phone: phone,
          notes,
          metadata: {
            payment_method: paymentMethod,
            payment_expires_at: paymentExpiresAt.toISOString(),
            public_booking_slug: business.public_booking_slug,
          },
        },
      });

      const snapshot = {
        source: 'public_booking_link',
        item_name: freshItem.name,
        variant_name: variant?.name ?? null,
        price: unitPrice,
      };

      await tx.order_items.create({
        data: {
          order_id: order.order_id,
          item_id: freshItem.item_id,
          variant_id: variant?.variant_id ?? null,
          product_name: freshItem.name,
          variant_name: variant?.name ?? null,
          sku: variant?.sku ?? freshItem.product_detail?.sku ?? null,
          quantity,
          unit_price: unitPrice,
          discount: 0,
          total_price: total,
          snapshot,
        },
      });

      await tx.product_order_items.create({
        data: {
          product_order_id: productOrder.product_order_id,
          item_id: freshItem.item_id,
          variant_id: variant?.variant_id ?? null,
          product_name: freshItem.name,
          variant_name: variant?.name ?? null,
          sku: variant?.sku ?? freshItem.product_detail?.sku ?? null,
          quantity,
          unit_price: unitPrice,
          discount: 0,
          total_price: total,
          snapshot,
        },
      });

      const inquiry = await tx.product_inquiries.create({
        data: {
          business_id: business.business_id,
          tenant_id: business.tenant_id,
          lead_id: leadId,
          item_id: freshItem.item_id,
          variant_id: variant?.variant_id ?? null,
          quantity,
          delivery_pincode: deliveryPincode,
          budget: total,
          status: 'ordered',
          metadata: {
            source: 'public_booking_link',
            customer: customerPayload,
            notes,
            item_name: freshItem.name,
            order_number: orderNumber,
            product_order_id: productOrder.product_order_id,
          },
        },
      });

      await tx.product_order_status_events.create({
        data: {
          product_order_id: productOrder.product_order_id,
          business_id: business.business_id,
          from_status: null,
          to_status: 'pending',
          actor: 'customer',
          data: { legacy_order_id: order.order_id, inquiry_id: inquiry.inquiry_id },
        },
      });

      await tx.lead_events.create({
        data: {
          lead_id: leadId,
          business_id: business.business_id,
          type: 'public_product_order_created',
          actor: 'customer',
          data: {
            inquiry_id: inquiry.inquiry_id,
            item_id: freshItem.item_id,
            quantity,
            order_id: order.order_id,
            product_order_id: productOrder.product_order_id,
            order_number: orderNumber,
          },
        },
      });

      await tx.leads.updateMany({
        where: { business_id: business.business_id, lead_id: leadId },
        data: {
          status: 'contacted',
          lead_type: LeadTypes.PRODUCT_ORDER_PENDING,
          quoted_amount: total,
          context: {
            type: 'product',
            item_id: freshItem.item_id,
            item_name: freshItem.name,
            variant_id: variant?.variant_id ?? null,
            variant_name: variant?.name ?? null,
            quantity,
            product_order_id: productOrder.product_order_id,
            order_id: order.order_id,
            order_number: orderNumber,
            order_status: 'pending',
            payment_status: 'pending',
            payment_expires_at: paymentExpiresAt.toISOString(),
          },
          updated_at: new Date(),
        },
      });

      await tx.$queryRawUnsafe(
        `INSERT INTO seller_owner_approvals
           (business_id, tenant_id, title, simple_summary, action_type, risk_level, source, entity_type, entity_id, payload)
         VALUES ($1, $2, 'Confirm public order payment', $3, 'payment_followup', 'medium', 'public_link', 'product_order', $4, $5::jsonb)`,
        business.business_id,
        business.tenant_id,
        `${orderNumber} for ${freshItem.name} x${quantity} is waiting for owner confirmation.`,
        productOrder.product_order_id,
        JSON.stringify({
          order_id: order.order_id,
          legacy_order_id: order.order_id,
          product_order_id: productOrder.product_order_id,
          order_number: orderNumber,
          payment_method: paymentMethod,
          total_amount: total,
          payment_expires_at: paymentExpiresAt.toISOString(),
        }),
      ).catch(() => undefined);

      return {
        type: 'product_order',
        reference_id: productOrder.product_order_id,
        legacy_order_id: order.order_id,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'pending',
        payment_expires_at: paymentExpiresAt.toISOString(),
        message: `Your order ${orderNumber} has been received and stock is held. The business will confirm payment shortly.`,
        customer_phone: phone,
        customer_name: customer.name,
        item_name: freshItem.name,
        variant_name: variant?.name ?? null,
        quantity,
        total_amount: total,
        currency: business.settings?.currency ?? 'INR',
      };
    });

    this.emitPublicOrderPlaced(business, leadId, result);

    return result;
  }

  private emitPublicOrderPlaced(
    business: PublicBusiness,
    leadId: string,
    order: {
      reference_id: string;
      legacy_order_id: string;
      order_number: string;
      customer_phone: string;
      customer_name?: string | null;
      item_name: string;
      variant_name?: string | null;
      quantity: number;
      total_amount: number;
      currency: string;
      payment_expires_at: string;
    },
  ): void {
    const payload = {
      business_id: business.business_id,
      tenant_id: business.tenant_id,
      lead_id: leadId,
      event_name: 'order.placed',
      payload: {
        source: 'public_booking_link',
        order_id: order.legacy_order_id,
        product_order_id: order.reference_id,
        order_number: order.order_number,
        customer_phone: order.customer_phone,
        customer_name: order.customer_name,
        item_name: order.item_name,
        variant_name: order.variant_name,
        quantity: order.quantity,
        total_amount: order.total_amount,
        currency: order.currency,
        payment_status: 'pending',
        payment_expires_at: order.payment_expires_at,
      },
      emitted_at: new Date().toISOString(),
    };

    this.eventEmitter.emit('workflow.event.order.placed', payload);
    this.logger.log(`Emitted workflow.event.order.placed for ${order.order_number}`);
  }

  private async normalizeCustomerPhone(businessId: string, phone: unknown): Promise<string> {
    const raw = String(phone ?? '').trim();
    if (!raw) return '';
    return (await this.phoneResolver.normalize(businessId, raw)) ?? raw.replace(/[^\d+]/g, '');
  }

  private resolveRequestedVariant(item: any, body: any) {
    const requestedId = String(body.variant_id ?? body.variantId ?? '').trim();
    if (requestedId) {
      const variant = item.variants?.find((candidate: any) => candidate.variant_id === requestedId);
      if (!variant) throw new BadRequestException('Selected variant is not available');
      return variant;
    }

    const requestedName = String(body.variant_name ?? body.variantName ?? '').trim().toLowerCase();
    if (!requestedName) return null;
    const variant = item.variants?.find((candidate: any) =>
      String(candidate.name ?? '').toLowerCase().includes(requestedName),
    );
    if (!variant) throw new BadRequestException('Selected variant is not available');
    return variant;
  }

  private async findOrCreatePublicCustomer(
    tx: any,
    business: PublicBusiness,
    customer: { name?: string; phone: string; email?: string },
  ) {
    const name = String(customer.name ?? '').trim() || null;
    const email = String(customer.email ?? '').trim() || null;
    const existing = await tx.customers.findFirst({
      where: {
        business_id: business.business_id,
        deleted_at: null,
        OR: [
          { phone: customer.phone },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existing) {
      return tx.customers.update({
        where: { customer_id: existing.customer_id },
        data: {
          ...(name ? { name } : {}),
          phone: existing.phone || customer.phone,
          ...(email && !existing.email ? { email } : {}),
          whatsapp_number: existing.whatsapp_number || customer.phone,
          updated_at: new Date(),
        },
      });
    }

    return tx.customers.create({
      data: {
        business_id: business.business_id,
        tenant_id: business.tenant_id,
        name,
        phone: customer.phone,
        email,
        whatsapp_number: customer.phone,
        engagement_score: 10,
      },
    });
  }

  private async paymentExpiry(tx: any, businessId: string): Promise<Date> {
    const rows = await tx.$queryRawUnsafe(
      `SELECT stock_hold_minutes
       FROM seller_store_settings
       WHERE business_id = $1
       LIMIT 1`,
      businessId,
    ).catch(() => []) as any[];
    const configuredMinutes = Number(rows[0]?.stock_hold_minutes ?? 60);
    const minutes = Math.max(15, Math.min(configuredMinutes, 24 * 60));
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private makeOrderNumber(prefix: string) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${prefix}-${datePart}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  private async markWhatsAppCatalogAvailabilityPending(tx: any, itemId: string) {
    await tx.external_catalog_items.updateMany({
      where: {
        item_id: itemId,
        provider: 'whatsapp',
        sync_status: { not: 'local_only' },
      },
      data: {
        sync_status: 'pending',
        updated_at: new Date(),
      },
    }).catch(() => undefined);
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
    const holdExpiresAt = await this.paymentExpiry(this.prisma, business.business_id);

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
      room_count: body.room_count ?? body.roomCount ?? body.rooms,
      notes: customer.notes ?? body.notes,
      source: 'public_booking_link',
      actor: 'customer',
      status: 'pending',
      payment_status: 'pending',
      payment_expires_at: holdExpiresAt,
      metadata: {
        public_booking_slug: business.public_booking_slug,
        requires_owner_confirmation: true,
        hold_expires_at: holdExpiresAt.toISOString(),
      },
    });

    await this.createHospitalityOwnerApproval(
      business,
      item,
      booking,
      { ...body, check_in: checkIn, check_out: checkOut },
      holdExpiresAt,
    );

    return {
      type: 'booking',
      reference_id: booking.hospitality_booking_id ?? booking.booking_id,
      legacy_order_id: booking.legacy_order_id,
      booking_number: booking.booking_number,
      status: 'pending',
      payment_status: 'pending',
      hold_expires_at: holdExpiresAt.toISOString(),
      message: 'Your booking request has been received and rooms are held. The business will confirm shortly.',
    };
  }

  private async createHospitalityOwnerApproval(
    business: PublicBusiness,
    item: any,
    booking: any,
    body: any,
    holdExpiresAt: Date,
  ) {
    const bookingId = booking.hospitality_booking_id ?? booking.booking_id;
    if (!bookingId) return;

    const checkIn = body.check_in ?? body.checkIn ?? body.date;
    const checkOut = body.check_out ?? body.checkOut;
    const roomCount = Math.max(Number(body.room_count ?? body.roomCount ?? body.rooms ?? 1) || 1, 1);
    const guestCount = Math.max(Number(body.guests ?? body.quantity ?? 1) || 1, 1);

    await this.prisma.$queryRawUnsafe(
      `INSERT INTO seller_owner_approvals
         (business_id, tenant_id, title, simple_summary, action_type, risk_level, source, entity_type, entity_id, payload, due_at, expires_at)
       VALUES ($1, $2, 'Confirm resort booking', $3, 'booking_confirmation', 'medium', 'public_link', 'hospitality_booking', $4, $5::jsonb, $6, $6)`,
      business.business_id,
      business.tenant_id,
      `${booking.booking_number ?? 'Booking'} for ${item.name} is waiting for owner confirmation.`,
      bookingId,
      JSON.stringify({
        hospitality_booking_id: bookingId,
        booking_id: bookingId,
        legacy_order_id: booking.legacy_order_id ?? null,
        booking_number: booking.booking_number ?? null,
        item_id: item.item_id,
        item_name: item.name,
        check_in: checkIn,
        check_out: checkOut,
        guests: guestCount,
        room_count: roomCount,
        hold_expires_at: holdExpiresAt.toISOString(),
      }),
      holdExpiresAt,
    ).catch(() => undefined);
  }

  private nextDay(date: string) {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
}
