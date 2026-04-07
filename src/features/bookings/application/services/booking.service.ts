import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(businessId: string, dto: CreateBookingDto) {
    const slots = dto.slots_booked ?? 1;
    const checkIn = dto.check_in_date ? new Date(dto.check_in_date) : undefined;
    const checkOut = dto.check_out_date ? new Date(dto.check_out_date) : undefined;

    if (checkIn && checkOut && checkOut <= checkIn) {
      throw new BadRequestException('check_out_date must be after check_in_date');
    }

    return this.prisma.$transaction(async (tx) => {
      const business = await tx.businesses.findUnique({
        where: { business_id: businessId },
        select: { business_name: true },
      });
      const rawName = business?.business_name ?? 'BK';
      const prefix = rawName
        .split(/\s+/)
        .map((w: string) => w[0]?.toUpperCase() ?? '')
        .join('')
        .replace(/[^A-Z]/g, '')
        .slice(0, 4) || 'BK';
      const count = await tx.service_bookings.count({ where: { business_id: businessId } });
      const booking_reference = `${prefix}-${String(count + 1).padStart(4, '0')}`;

      // Path A: converting an existing hold
      if (dto.hold_id) {
        const hold = await tx.service_holds.findFirst({
          where: { hold_id: dto.hold_id, business_id: businessId, status: 'active' },
        });
        if (!hold) throw new ConflictException('Hold has expired or does not exist. Please re-select your dates.');
        if (hold.expires_at < new Date()) throw new ConflictException('Hold has expired. Please re-select your dates.');

        await tx.service_holds.update({ where: { hold_id: dto.hold_id }, data: { status: 'converted' } });

        const service = await tx.services.findFirst({
          where: { service_id: hold.service_id },
          select: { base_price: true },
        });
        const msPerDay = 1000 * 60 * 60 * 24;
        const numNights = Math.max(1, Math.round((hold.check_out_date.getTime() - hold.check_in_date.getTime()) / msPerDay));
        const totalPrice = Math.min(Number(service?.base_price ?? 0), 9999999) * numNights;

        return tx.service_bookings.create({
          data: {
            booking_reference,
            service_id: hold.service_id,
            business_id: businessId,
            lead_id: dto.lead_id ?? hold.lead_id ?? null,
            customer_name: dto.customer_name,
            customer_phone: dto.customer_phone,
            check_in_date: hold.check_in_date,
            check_out_date: hold.check_out_date,
            slots_booked: hold.slots_held,
            total_price: totalPrice,
            special_requests: dto.special_requests ?? null,
          },
        });
      }

      // Path B: direct booking
      if (!dto.service_id || !checkIn || !checkOut) {
        throw new BadRequestException('service_id, check_in_date, and check_out_date are required when hold_id is not provided');
      }

      const service = await tx.services.findFirst({
        where: { service_id: dto.service_id },
        select: { base_price: true },
      });
      const msPerDay = 1000 * 60 * 60 * 24;
      const numNights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay));
      const totalPrice = Math.min(Number(service?.base_price ?? 0), 9999999) * numNights;

      return tx.service_bookings.create({
        data: {
          booking_reference,
          service_id: dto.service_id,
          business_id: businessId,
          lead_id: dto.lead_id ?? null,
          customer_name: dto.customer_name,
          customer_phone: dto.customer_phone,
          check_in_date: checkIn,
          check_out_date: checkOut,
          slots_booked: slots,
          total_price: totalPrice,
          special_requests: dto.special_requests ?? null,
        },
      });
    });
  }

  async getBookings(businessId: string, status?: string) {
    return this.prisma.service_bookings.findMany({
      where: { business_id: businessId, ...(status && { status }) },
      include: { services: { select: { name: true, type: true, base_price: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async cancelBooking(bookingId: string, businessId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId);
    const booking = await this.prisma.service_bookings.findFirst({
      where: {
        business_id: businessId,
        OR: [{ booking_reference: bookingId }, ...(isUuid ? [{ booking_id: bookingId }] : [])],
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'cancelled') throw new BadRequestException('Booking already cancelled');

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE service_availability
        SET
          booked_slots    = GREATEST(0, booked_slots - ${booking.slots_booked}),
          available_slots = LEAST(total_slots, available_slots + ${booking.slots_booked}),
          updated_at      = NOW()
        WHERE service_id = ${booking.service_id}::uuid
          AND date >= ${booking.check_in_date}::date
          AND date <  ${booking.check_out_date}::date
      `;
      return tx.service_bookings.update({
        where: { booking_id: booking.booking_id },
        data: { status: 'cancelled', updated_at: new Date() },
      });
    });
  }
}
