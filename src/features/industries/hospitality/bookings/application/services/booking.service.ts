import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { HospitalityBookingQueryDto } from '../dto/hospitality-booking-query.dto';
import { LeadCommandService } from '../../../../../crm/lead/application/services/lead-command.service';
import { HospitalityBookingCommandService } from './hospitality-booking-command.service';
import { UpdateBookingDto } from '../dto/update-booking.dto';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leadCommands: LeadCommandService,
    private readonly bookingCommands: HospitalityBookingCommandService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createBooking(businessId: string, dto: CreateBookingDto): Promise<any> {
    if (new Date(dto.check_out).getTime() <= new Date(dto.check_in).getTime()) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    const created = await this.bookingCommands.createBooking({
      business_id: businessId,
      service_id: dto.service_id,
      check_in: dto.check_in,
      check_out: dto.check_out,
      guest_name: dto.guest_name,
      phone: dto.phone,
      customer_phone: dto.phone,
      lead_id: dto.lead_id,
      num_guests: dto.num_guests,
      source: 'dashboard',
      actor: 'human',
      idempotency_key: `dashboard_booking:${randomUUID()}`,
    });

    if (dto.status || dto.payment_status || dto.notes || dto.amount_paid !== undefined) {
      return this.updateBooking(created.hospitality_booking_id ?? created.booking_id, businessId, {
        status: dto.status,
        payment_status: dto.payment_status,
        notes: dto.notes,
        amount_paid: dto.amount_paid,
      });
    }

    return this.getBookingById(created.hospitality_booking_id ?? created.booking_id, businessId);
  }

  async getBookings(businessId: string, status?: string, leadId?: string): Promise<any[]> {
    const result = await this.findAll(businessId, { status, lead_id: leadId, page: 1, limit: 100 });
    return result.data;
  }

  async findAll(businessId: string, query: HospitalityBookingQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const where: any = { business_id: businessId };
    if (query.status) where.status = query.status;
    if (query.payment_status) where.payment_status = query.payment_status;
    if (query.customer_id) where.customer_id = query.customer_id;
    if (query.lead_id) where.lead_id = query.lead_id;
    if (query.from_date || query.to_date) {
      where.check_in = {};
      if (query.from_date) where.check_in.gte = new Date(query.from_date);
      if (query.to_date) where.check_in.lte = new Date(query.to_date);
    }

    const [rows, total] = await Promise.all([
      this.prisma.hospitality_bookings.findMany({
        where,
        include: {
          rooms: true,
          guests_list: true,
          customer: { select: { customer_id: true, name: true, phone: true, email: true } },
          lead: { select: { lead_id: true, name: true, phone: true, status: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.hospitality_bookings.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toResponse(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookingById(bookingId: string, businessId: string): Promise<any> {
    const booking = await this.prisma.hospitality_bookings.findFirst({
      where: { hospitality_booking_id: bookingId, business_id: businessId },
      include: {
        rooms: true,
        guests_list: true,
        events: { orderBy: { created_at: 'desc' } },
        customer: { select: { customer_id: true, name: true, phone: true, email: true } },
        lead: { select: { lead_id: true, name: true, phone: true, status: true } },
        legacy_order: { select: { order_id: true, order_number: true, status: true, payment_status: true } },
      },
    });

    if (!booking) throw new NotFoundException('Hospitality booking not found');
    return this.toResponse(booking);
  }

  async cancelBooking(bookingId: string, businessId: string): Promise<any> {
    const existing = await this.prisma.hospitality_bookings.findFirst({
      where: { hospitality_booking_id: bookingId, business_id: businessId },
      include: {
        rooms: true,
      },
    });

    if (!existing) throw new NotFoundException('Hospitality booking not found');

    if (existing.status === 'cancelled') {
      return this.getBookingById(bookingId, businessId);
    }

    if (existing.status === 'checked_out') {
      throw new BadRequestException('Cannot cancel a checked-out booking');
    }

    const cancelledAt = new Date();
    const availabilityRollback: Array<{ item_id: string; quantity: number; affected_rows: number }> = [];

    await this.prisma.$transaction(async (tx) => {
      for (const room of existing.rooms ?? []) {
        const quantity = Math.max(Number(room.quantity) || 1, 1);
        const affectedRows = await tx.$executeRaw`
          UPDATE item_availability
          SET booked_slots = GREATEST(booked_slots - ${quantity}, 0),
              updated_at = NOW()
          WHERE item_id = ${room.item_id}::uuid
            AND date >= ${existing.check_in}::date
            AND date < ${existing.check_out}::date
        `;

        availabilityRollback.push({
          item_id: room.item_id,
          quantity,
          affected_rows: Number(affectedRows),
        });
      }

      await tx.hospitality_bookings.update({
        where: { hospitality_booking_id: bookingId },
        data: { status: 'cancelled', cancelled_at: cancelledAt, updated_at: cancelledAt },
      });

      await tx.hospitality_booking_status_events.create({
        data: {
          hospitality_booking_id: bookingId,
          business_id: existing.business_id,
          from_status: existing.status,
          to_status: 'cancelled',
          actor: 'human',
          data: {
            legacy_order_id: existing.legacy_order_id,
            availability_rollback: availabilityRollback,
          },
        },
      });

      if (existing.legacy_order_id) {
        await tx.orders.update({
          where: { order_id: existing.legacy_order_id },
          data: {
            status: 'cancelled',
            delivery_status: 'cancelled',
            service_status: 'cancelled',
            cancelled_at: cancelledAt,
            updated_at: cancelledAt,
          },
        });
      }
    });

    // Advance the linked lead to 'lost' (idempotent, forward-only).
    if (existing.lead_id) {
      await this.leadCommands.autoAdvance({
        leadId: existing.lead_id,
        toSlug: 'lost',
        reason: 'booking_cancelled',
        actor: 'system',
      });
    }

    try {
      this.eventEmitter.emit('workflow.event.booking.cancelled', {
        business_id: existing.business_id,
        tenant_id: existing.tenant_id ?? null,
        lead_id: existing.lead_id ?? undefined,
        hospitality_booking_id: bookingId,
        booking_number: existing.booking_number ?? null,
        emitted_at: new Date().toISOString(),
      });
    } catch (err: any) {
      this.logger.warn(`Could not emit booking.cancelled: ${err.message}`);
    }

    return this.getBookingById(bookingId, businessId);
  }

  async updateBooking(bookingId: string, businessId: string, dto: UpdateBookingDto): Promise<any> {
    const existing = await this.prisma.hospitality_bookings.findFirst({
      where: { hospitality_booking_id: bookingId, business_id: businessId },
      include: {
        rooms: true,
        guests_list: true,
      },
    });

    if (!existing) throw new NotFoundException('Hospitality booking not found');
    if (existing.status === 'cancelled' && dto.status && dto.status !== 'cancelled') {
      throw new BadRequestException('Cancelled bookings cannot be reopened here. Create a new booking instead.');
    }

    const metadata = {
      ...((existing.metadata as Record<string, any> | null) ?? {}),
      ...(dto.guest_name !== undefined ? { guest_name: dto.guest_name } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.guests !== undefined ? { num_guests: dto.guests } : {}),
      ...(dto.amount_paid !== undefined ? { amount_paid: dto.amount_paid } : {}),
    };

    const fromStatus = existing.status;
    const nextStatus = dto.status ?? existing.status;

    await this.prisma.$transaction(async (tx) => {
      await tx.hospitality_bookings.update({
        where: { hospitality_booking_id: bookingId },
        data: {
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.payment_status !== undefined ? { payment_status: dto.payment_status } : {}),
          ...(dto.guests !== undefined ? { guests: dto.guests } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          metadata,
          updated_at: new Date(),
        },
      });

      if (existing.guests_list?.[0] && (dto.guest_name !== undefined || dto.phone !== undefined)) {
        await tx.hospitality_booking_guests.update({
          where: { guest_id: existing.guests_list[0].guest_id },
          data: {
            ...(dto.guest_name !== undefined ? { name: dto.guest_name } : {}),
            ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          },
        });
      } else if (dto.guest_name || dto.phone) {
        await tx.hospitality_booking_guests.create({
          data: {
            hospitality_booking_id: bookingId,
            name: dto.guest_name ?? null,
            phone: dto.phone ?? null,
          },
        });
      }

      for (const room of existing.rooms ?? []) {
        const snapshot = {
          ...((room.snapshot as Record<string, any> | null) ?? {}),
          ...(dto.guest_name !== undefined ? { guest_name: dto.guest_name } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.guests !== undefined ? { num_guests: dto.guests } : {}),
        };
        await tx.hospitality_booking_items.update({
          where: { booking_item_id: room.booking_item_id },
          data: { snapshot },
        });
      }

      if (existing.legacy_order_id) {
        await tx.orders.update({
          where: { order_id: existing.legacy_order_id },
          data: {
            ...(dto.status !== undefined ? { status: dto.status, delivery_status: dto.status } : {}),
            ...(dto.payment_status !== undefined ? { payment_status: dto.payment_status } : {}),
            ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
            updated_at: new Date(),
          },
        });

        const orderItems = await tx.order_items.findMany({ where: { order_id: existing.legacy_order_id } });
        for (const item of orderItems) {
          const snapshot = {
            ...((item.snapshot as Record<string, any> | null) ?? {}),
            ...(dto.guest_name !== undefined ? { guest_name: dto.guest_name } : {}),
            ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
            ...(dto.guests !== undefined ? { num_guests: dto.guests } : {}),
          };
          await tx.order_items.update({
            where: { order_item_id: item.order_item_id },
            data: { snapshot },
          });
        }
      }

      if (dto.status !== undefined && nextStatus !== fromStatus) {
        await tx.hospitality_booking_status_events.create({
          data: {
            hospitality_booking_id: bookingId,
            business_id: existing.business_id,
            from_status: fromStatus,
            to_status: nextStatus,
            actor: 'human',
            data: {
              legacy_order_id: existing.legacy_order_id,
              payment_status: dto.payment_status,
            },
          },
        });
      }
    });

    return this.getBookingById(bookingId, businessId);
  }

  private toResponse(booking: any) {
    return {
      hospitality_booking_id: booking.hospitality_booking_id,
      business_id: booking.business_id,
      tenant_id: booking.tenant_id,
      legacy_order_id: booking.legacy_order_id,
      customer_id: booking.customer_id,
      lead_id: booking.lead_id,
      booking_number: booking.booking_number,
      status: booking.status,
      payment_status: booking.payment_status,
      check_in: booking.check_in,
      check_out: booking.check_out,
      guests: booking.guests,
      subtotal: Number(booking.subtotal ?? 0),
      tax_amount: Number(booking.tax_amount ?? 0),
      discount_amount: Number(booking.discount_amount ?? 0),
      total_amount: Number(booking.total_amount ?? 0),
      source: booking.source,
      notes: booking.notes,
      metadata: booking.metadata,
      cancelled_at: booking.cancelled_at,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      customer: booking.customer ?? null,
      lead: booking.lead ?? null,
      legacy_order: booking.legacy_order ?? null,
      rooms: (booking.rooms ?? []).map((room: any) => ({
        booking_item_id: room.booking_item_id,
        item_id: room.item_id,
        item_name: room.item_name,
        quantity: room.quantity,
        nights: room.nights,
        unit_price: Number(room.unit_price ?? 0),
        total_price: Number(room.total_price ?? 0),
        snapshot: room.snapshot,
      })),
      guests_list: booking.guests_list ?? [],
      events: booking.events ?? undefined,
    };
  }
}
