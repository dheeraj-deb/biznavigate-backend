import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { LeadCommandService } from '../../../../../crm/lead/application/services/lead-command.service';

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
  age?: number | string;
  address?: string;
  pin_code?: string;
  flow_token?: string;
  source?: string;
  actor?: string;
  idempotency_key?: string;
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
    const idempotencyKey = command.idempotency_key ?? this.buildBookingIdempotencyKey({
      businessId,
      leadId,
      customerPhone,
      serviceId,
      checkIn,
      checkOut,
    });

    const catalogItem = await this.prisma.catalog_items.findFirst({
      where: {
        item_id: serviceId,
        business_id: businessId,
        deleted_at: null,
        item_type: { in: ['accommodation', 'activity', 'service'] },
      },
      select: {
        base_price: true,
        name: true,
        tenant_id: true,
        attributes: true,
        hospitality_detail: { select: { total_units: true } },
      },
    });

    if (!catalogItem) {
      throw new BadRequestException('Cannot create booking without a valid business and catalog item');
    }

    const nights = Math.max(
      Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000),
      1,
    );
    const guests = Number(numGuests) || 1;
    const totalAmount = Number(catalogItem.base_price ?? 0) * nights;
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

        const totalUnits = Math.max(
          Number(catalogItem.hospitality_detail?.total_units ?? (catalogItem.attributes as any)?.total_slots ?? 1),
          1,
        );

        // Sparse calendar: insert row with booked_slots=1 if missing, otherwise
        // increment. ON CONFLICT WHERE guard ensures we don't overbook a row
        // that's blocked or already at capacity — those rows are excluded from
        // the update and won't be counted in the returned set.
        const bookedRows = await tx.$queryRaw<Array<{ date: Date }>>`
          INSERT INTO item_availability (item_id, business_id, date, total_slots, booked_slots)
          SELECT ${serviceId}::uuid, ${businessId}::uuid, d::date, ${totalUnits}::int, 1
          FROM generate_series(${checkIn}::date, (${checkOut}::date - INTERVAL '1 day'), INTERVAL '1 day') AS d
          ON CONFLICT (item_id, date) DO UPDATE
          SET booked_slots = item_availability.booked_slots + 1, updated_at = NOW()
          WHERE item_availability.is_blocked = false
            AND item_availability.booked_slots < item_availability.total_slots
          RETURNING date
        `;

        if (bookedRows.length !== nights) {
          throw new ConflictException('Room is no longer available for the selected dates');
        }

        const legacyOrder = await tx.orders.create({
          data: {
            business_id: businessId,
            tenant_id: catalogItem.tenant_id,
            lead_id: leadId ?? null,
            customer_id: customer?.customer_id ?? null,
            order_type: 'accommodation',
            total_amount: totalAmount,
            payment_status: 'pending',
            delivery_status: 'confirmed',
            status: 'confirmed',
            source: command.source ?? 'whatsapp',
          },
        });

        const snapshot = {
          check_in: checkIn,
          check_out: checkOut,
          nights,
          guest_name: guestName,
          phone: customerPhone,
          num_guests: guests,
          age: age ? Number(age) : null,
          address: address ?? null,
          pin_code: pinCode ?? null,
        };

        await tx.order_items.create({
          data: {
            order_id: legacyOrder.order_id,
            item_id: serviceId,
            product_name: catalogItem.name ?? '',
            quantity: nights,
            unit_price: catalogItem.base_price ?? 0,
            total_price: totalAmount,
            discount: 0,
            snapshot,
          },
        });

        const bookingNumber = `BK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${legacyOrder.order_id.slice(0, 6).toUpperCase()}`;
        const domainBooking = await tx.hospitality_bookings.create({
          data: {
            business_id: businessId,
            tenant_id: catalogItem.tenant_id,
            legacy_order_id: legacyOrder.order_id,
            customer_id: customer?.customer_id ?? null,
            lead_id: leadId ?? null,
            booking_number: bookingNumber,
            status: 'confirmed',
            payment_status: 'pending',
            check_in: new Date(checkIn),
            check_out: new Date(checkOut),
            guests,
            subtotal: totalAmount,
            total_amount: totalAmount,
            source: command.source ?? 'whatsapp',
            metadata: { ...snapshot, idempotency_key: idempotencyKey },
          },
        });

        await tx.hospitality_booking_items.create({
          data: {
            hospitality_booking_id: domainBooking.hospitality_booking_id,
            item_id: serviceId,
            item_name: catalogItem.name ?? '',
            quantity: 1,
            nights,
            unit_price: catalogItem.base_price ?? 0,
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
            to_status: 'confirmed',
            actor: command.actor ?? 'ai',
            data: { legacy_order_id: legacyOrder.order_id },
          },
        });

        if (leadId) {
          await tx.hospitality_inquiries.create({
            data: {
              business_id: businessId,
              tenant_id: catalogItem.tenant_id,
              lead_id: leadId,
              preferred_item_id: serviceId,
              check_in: new Date(checkIn),
              check_out: new Date(checkOut),
              guests,
              status: 'booked',
              metadata: snapshot,
            },
          });

          await tx.leads.update({
            where: { lead_id: leadId },
            data: { status: 'booked', updated_at: new Date() },
          });
          await tx.lead_events.create({
            data: {
              lead_id: leadId,
              business_id: businessId,
              type: 'booked',
              actor: command.actor ?? 'ai',
              data: {
                hospitality_booking_id: domainBooking.hospitality_booking_id,
                legacy_order_id: legacyOrder.order_id,
                check_in: checkIn,
                check_out: checkOut,
              } as any,
            },
          });
        }

        const response = {
          flow_token: command.flow_token ?? '',
          booking_id: domainBooking.hospitality_booking_id,
          hospitality_booking_id: domainBooking.hospitality_booking_id,
          legacy_order_id: legacyOrder.order_id,
          idempotency_key: idempotencyKey,
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

      // Auto-advance lead pipeline to 'booked' stage. Idempotent — safe on retries.
      if (leadId) {
        await this.leadCommands.autoAdvance({
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
  }) {
    const raw = [
      params.businessId ?? 'unknown_business',
      params.leadId ?? params.customerPhone ?? 'unknown_customer',
      params.serviceId,
      params.checkIn,
      params.checkOut,
    ].join(':');

    return `hospitality_booking:${createHash('sha256').update(raw).digest('hex')}`;
  }
}
