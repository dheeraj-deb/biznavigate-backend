import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { LeadCommandService } from '../../../../../crm/lead/application/services/lead-command.service';
import { LeadTypes } from '../../../../../crm/lead/application/lead-types';
import { HospitalityAvailabilityService } from './hospitality-availability.service';

export interface CreateHospitalityBookingCommand {
  business_id: string;
  service_id: string;
  check_in: string;
  check_out: string;
  guest_name?: string;
  phone?: string;
  customer_phone?: string;
  lead_id?: string;
  num_guests?: number | string;
  room_count?: number | string;
  rooms?: number | string;
  units?: number | string;
  age?: number | string;
  address?: string;
  notes?: string;
  pin_code?: string;
  flow_token?: string;
  source?: string;
  actor?: string;
  idempotency_key?: string;
  status?: string;
  payment_status?: string;
  payment_expires_at?: Date | string | null;
  metadata?: Record<string, any>;
  _flowContext?: {
    leadId?: string;
    customerPhone?: string;
  };
}

@Injectable()
export class HospitalityBookingCommandService {
  private readonly logger = new Logger(HospitalityBookingCommandService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leadCommands: LeadCommandService,
    private readonly eventEmitter: EventEmitter2,
    private readonly availabilityService: HospitalityAvailabilityService,
  ) {}

  async createBooking(command: CreateHospitalityBookingCommand) {
    const {
      business_id: businessId,
      service_id: serviceId,
      check_in: checkIn,
      check_out: checkOut,
      guest_name: guestName,
      phone,
      num_guests: numGuests,
      room_count: roomCountInput,
      age,
      address,
      pin_code: pinCode,
      _flowContext,
    } = command;

    if (!businessId || !serviceId || !checkIn || !checkOut) {
      throw new BadRequestException('business_id, service_id, check_in, and check_out are required');
    }

    const customerPhone = command.customer_phone ?? _flowContext?.customerPhone ?? phone;
    const leadId = command.lead_id ?? _flowContext?.leadId;
    const bookingStatus = this.normalizeBookingStatus(command.status);
    const paymentStatus = this.normalizePaymentStatus(command.payment_status);
    const paymentExpiresAt = this.normalizeOptionalDate(command.payment_expires_at, 'payment_expires_at');
    const roomCount = this.availabilityService.positiveInt(
      roomCountInput ?? command.rooms ?? command.units,
      1,
      'room_count',
    );
    const idempotencyKey = command.idempotency_key ?? this.buildBookingIdempotencyKey({
      businessId,
      leadId,
      customerPhone,
      serviceId,
      checkIn,
      checkOut,
      roomCount,
    });
    const availability = await this.availabilityService.checkAvailability({
      businessId,
      itemId: serviceId,
      checkIn,
      checkOut,
      requestedUnits: roomCount,
    });
    const catalogItem = availability.item;
    const nights = availability.dateRange.nights;
    const guests = Number(numGuests) || 1;
    const totalAmount = availability.totalAmount;
    const existingKey = await this.prisma.workflow_idempotency_keys.findUnique({
      where: { idempotency_key: idempotencyKey },
    });

    if (existingKey?.status === 'completed' && existingKey.response) {
      this.logger.warn(`Duplicate hospitality booking request returned existing result: ${idempotencyKey}`);
      return existingKey.response as Record<string, any>;
    }

    if (existingKey?.status === 'started' && (!existingKey.locked_until || existingKey.locked_until > new Date())) {
      throw new ConflictException('Booking request is already being processed');
    }

    const shouldReclaimKey = existingKey?.status === 'failed' ||
      (existingKey?.status === 'started' && existingKey.locked_until && existingKey.locked_until <= new Date());

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        if (shouldReclaimKey) {
          await tx.workflow_idempotency_keys.update({
            where: { idempotency_key: idempotencyKey },
            data: {
              status: 'started',
              response: null,
              locked_until: new Date(Date.now() + 5 * 60 * 1000),
              updated_at: new Date(),
            },
          });
        } else {
          await tx.workflow_idempotency_keys.create({
            data: {
              idempotency_key: idempotencyKey,
              business_id: businessId,
              tenant_id: catalogItem.tenant_id,
              lead_id: leadId ?? null,
              purpose: 'create_hospitality_booking',
              status: 'started',
              locked_until: new Date(Date.now() + 5 * 60 * 1000),
            },
          });
        }

        const customer = customerPhone
          ? await tx.customers.findFirst({
              where: {
                business_id: businessId,
                OR: [
                  { platform_user_id: customerPhone },
                  { phone: customerPhone },
                  { whatsapp_number: customerPhone },
                ],
              },
              select: { customer_id: true },
            })
          : null;

        await this.availabilityService.reserveAvailability(tx, {
          businessId,
          itemId: serviceId,
          dateRange: availability.dateRange,
          totalUnits: availability.totalUnits,
          requestedUnits: roomCount,
        });

        const bookingNumber = this.makeBookingNumber();
        const legacyOrder = await tx.orders.create({
          data: {
            business_id: businessId,
            tenant_id: catalogItem.tenant_id,
            lead_id: leadId ?? null,
            customer_id: customer?.customer_id ?? null,
            order_number: bookingNumber,
            order_type: 'accommodation',
            total_amount: totalAmount,
            payment_status: paymentStatus,
            delivery_status: bookingStatus,
            service_status: bookingStatus,
            status: bookingStatus,
            payment_expires_at: paymentExpiresAt,
            source: command.source ?? 'whatsapp',
            notes: command.notes ?? null,
          },
        });

        const snapshot = {
          check_in: checkIn,
          check_out: checkOut,
          nights,
          room_count: roomCount,
          guest_name: guestName,
          phone: customerPhone,
          num_guests: guests,
          age: age ? Number(age) : null,
          address: address ?? null,
          pin_code: pinCode ?? null,
          notes: command.notes ?? null,
          payment_expires_at: paymentExpiresAt?.toISOString() ?? null,
        };
        const metadata = {
          ...snapshot,
          ...(command.metadata ?? {}),
          idempotency_key: idempotencyKey,
        };

        await tx.order_items.create({
          data: {
            order_id: legacyOrder.order_id,
            item_id: serviceId,
            product_name: catalogItem.name ?? '',
            quantity: nights * roomCount,
            unit_price: availability.pricePerNight,
            total_price: totalAmount,
            discount: 0,
            snapshot,
          },
        });

        const domainBooking = await tx.hospitality_bookings.create({
          data: {
            business_id: businessId,
            tenant_id: catalogItem.tenant_id,
            legacy_order_id: legacyOrder.order_id,
            customer_id: customer?.customer_id ?? null,
            lead_id: leadId ?? null,
            booking_number: bookingNumber,
            status: bookingStatus,
            payment_status: paymentStatus,
            check_in: new Date(checkIn),
            check_out: new Date(checkOut),
            guests,
            subtotal: totalAmount,
            total_amount: totalAmount,
            source: command.source ?? 'whatsapp',
            notes: command.notes ?? null,
            metadata,
          },
        });

        await tx.hospitality_booking_items.create({
          data: {
            hospitality_booking_id: domainBooking.hospitality_booking_id,
            item_id: serviceId,
            item_name: catalogItem.name ?? '',
            quantity: roomCount,
            nights,
            unit_price: availability.pricePerNight,
            total_price: totalAmount,
            snapshot,
          },
        });

        await tx.hospitality_booking_guests.create({
          data: {
            hospitality_booking_id: domainBooking.hospitality_booking_id,
            name: guestName ?? null,
            phone: customerPhone ?? null,
            age: age ? Number(age) : null,
            address: address ?? null,
            pin_code: pinCode ?? null,
          },
        });

        await tx.hospitality_booking_status_events.create({
          data: {
            hospitality_booking_id: domainBooking.hospitality_booking_id,
            business_id: businessId,
            from_status: null,
            to_status: bookingStatus,
            actor: command.actor ?? 'ai',
            data: {
              legacy_order_id: legacyOrder.order_id,
              payment_status: paymentStatus,
              payment_expires_at: paymentExpiresAt?.toISOString() ?? null,
            },
          },
        });

        if (leadId) {
          const isConfirmed = bookingStatus === 'confirmed';
          const existingLead = await tx.leads.findUnique({
            where: { lead_id: leadId },
            select: { context: true },
          });
          const existingContext = existingLead?.context && typeof existingLead.context === 'object'
            ? existingLead.context as Record<string, any>
            : {};

          await tx.hospitality_inquiries.create({
            data: {
              business_id: businessId,
              tenant_id: catalogItem.tenant_id,
              lead_id: leadId,
              preferred_item_id: serviceId,
              check_in: new Date(checkIn),
              check_out: new Date(checkOut),
              guests,
              status: isConfirmed ? 'booked' : 'pending',
              metadata,
            },
          });

          await tx.leads.update({
            where: { lead_id: leadId },
            data: {
              status: isConfirmed ? 'booked' : 'contacted',
              lead_type: isConfirmed ? LeadTypes.RESORT_BOOKED : LeadTypes.RESORT_BOOKING_PENDING,
              ...(isConfirmed ? { converted_value: totalAmount, converted_at: new Date() } : {}),
              context: {
                ...existingContext,
                type: existingContext.type === 'public_booking' ? 'resort' : (existingContext.type ?? 'resort'),
                item_id: serviceId,
                item_name: catalogItem.name ?? null,
                property_name: existingContext.property_name ?? catalogItem.name ?? null,
                check_in: checkIn,
                check_out: checkOut,
                guests,
                guest_count: guests,
                room_count: roomCount,
                nights,
                special_requests: existingContext.special_requests ?? command.notes ?? null,
                booking_status: bookingStatus,
                payment_expires_at: paymentExpiresAt?.toISOString() ?? null,
              },
              updated_at: new Date(),
            },
          });
          await tx.lead_events.create({
            data: {
              lead_id: leadId,
              business_id: businessId,
              type: isConfirmed ? 'booked' : 'booking_pending',
              actor: command.actor ?? 'ai',
              data: {
                hospitality_booking_id: domainBooking.hospitality_booking_id,
                legacy_order_id: legacyOrder.order_id,
                check_in: checkIn,
                check_out: checkOut,
                status: bookingStatus,
              } as any,
            },
          });
        }

        const response = {
          flow_token: command.flow_token ?? '',
          booking_id: domainBooking.hospitality_booking_id,
          hospitality_booking_id: domainBooking.hospitality_booking_id,
          booking_number: bookingNumber,
          legacy_order_id: legacyOrder.order_id,
          idempotency_key: idempotencyKey,
          status: bookingStatus,
          payment_status: paymentStatus,
          payment_expires_at: paymentExpiresAt?.toISOString() ?? null,
        };

        await tx.workflow_idempotency_keys.update({
          where: { idempotency_key: idempotencyKey },
          data: {
            status: 'completed',
            response,
            execution_id: null,
            workflow_id: null,
            node_id: 'hospitality_booking_create',
            locked_until: null,
            updated_at: new Date(),
          },
        });

        return response;
      });

      this.logger.log(`Hospitality booking created: ${booking.hospitality_booking_id}`);

      try {
        // Resolve tenant from the business; the booking row doesn't carry it directly
        // but business_id → tenant_id is 1:1. Synthetic context downstream uses this
        // for the audit-trail lead_events row, even though event-bus dispatch only
        // scopes by business_id.
        const biz = await this.prisma.businesses.findUnique({
          where: { business_id: command.business_id },
          select: { tenant_id: true },
        }).catch(() => null);
        this.eventEmitter.emit('workflow.event.booking.created', {
          business_id: command.business_id,
          tenant_id: biz?.tenant_id ?? null,
          lead_id: leadId ?? undefined,
          hospitality_booking_id: booking.hospitality_booking_id,
          booking_number: (booking as any).booking_number ?? null,
          status: (booking as any).status ?? bookingStatus,
          emitted_at: new Date().toISOString(),
        });
      } catch (err: any) {
        this.logger.warn(`Could not emit booking.created: ${err.message}`);
      }

      // Auto-advance lead pipeline to 'booked' stage. Idempotent — safe on retries.
      if (leadId) {
        await this.leadCommands.recalculateQualification(leadId);
      }

      if (leadId && bookingStatus === 'confirmed') {
        await this.leadCommands.syncStageBySlug({
          leadId,
          toSlug: 'booked',
          reason: 'hospitality_booking_created',
          actor: command.actor === 'human' ? 'system' : 'ai',
        });
      }

      return booking;
    } catch (error) {
      if (error?.code === 'P2002') {
        const key = await this.prisma.workflow_idempotency_keys.findUnique({
          where: { idempotency_key: idempotencyKey },
        });
        if (key?.status === 'completed' && key.response) {
          return key.response as Record<string, any>;
        }
        throw new ConflictException('Booking request is already being processed');
      }

      await this.prisma.workflow_idempotency_keys.update({
        where: { idempotency_key: idempotencyKey },
        data: { status: 'failed', locked_until: null, updated_at: new Date() },
      }).catch(() => undefined);
      throw error;
    }
  }

  private buildBookingIdempotencyKey(params: {
    businessId?: string;
    leadId?: string | null;
    customerPhone?: string | null;
    serviceId: string;
    checkIn: string;
    checkOut: string;
    roomCount?: number;
  }) {
    const raw = [
      params.businessId ?? 'unknown_business',
      params.leadId ?? params.customerPhone ?? 'unknown_customer',
      params.serviceId,
      params.checkIn,
      params.checkOut,
      params.roomCount ?? 1,
    ].join(':');

    return `hospitality_booking:${createHash('sha256').update(raw).digest('hex')}`;
  }

  private makeBookingNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `BK-${datePart}-${randomUUID().slice(0, 10).toUpperCase()}`;
  }

  private normalizeBookingStatus(value?: string): string {
    const normalized = String(value ?? 'confirmed').toLowerCase().trim();
    const allowed = new Set(['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'no_show']);
    if (!allowed.has(normalized)) {
      throw new BadRequestException('Invalid booking status');
    }
    return normalized;
  }

  private normalizePaymentStatus(value?: string): string {
    const normalized = String(value ?? 'pending').toLowerCase().trim();
    const allowed = new Set(['pending', 'paid', 'partial', 'failed', 'refunded', 'cancelled', 'unpaid']);
    if (!allowed.has(normalized)) {
      throw new BadRequestException('Invalid payment status');
    }
    return normalized;
  }

  private normalizeOptionalDate(value: Date | string | null | undefined, fieldName: string): Date | null {
    if (value === undefined || value === null || value === '') return null;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date`);
    }
    return parsed;
  }
}
