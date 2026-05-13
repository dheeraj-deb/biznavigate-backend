import { BadRequestException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { HospitalityBookingQueryDto } from '../dto/hospitality-booking-query.dto';

/**
 * Hospitality booking read service.
 * Creation still flows through WhatsApp Flow/catalog orchestration in V1.
 */
@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(_businessId: string, _dto: CreateBookingDto): Promise<any> {
    throw new NotImplementedException('Bookings are managed through the catalog orders system');
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
