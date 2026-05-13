import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingService } from './booking.service';

describe('BookingService cancellation', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const bookingId = '00000000-0000-0000-0000-000000000002';
  const legacyOrderId = '00000000-0000-0000-0000-000000000003';
  const itemId = '00000000-0000-0000-0000-000000000004';
  const checkIn = new Date('2026-06-01T00:00:00.000Z');
  const checkOut = new Date('2026-06-03T00:00:00.000Z');

  function booking(status = 'confirmed') {
    return {
      hospitality_booking_id: bookingId,
      business_id: businessId,
      tenant_id: '00000000-0000-0000-0000-000000000005',
      legacy_order_id: legacyOrderId,
      status,
      payment_status: 'pending',
      check_in: checkIn,
      check_out: checkOut,
      guests: 2,
      subtotal: 1000,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 1000,
      rooms: [
        {
          booking_item_id: '00000000-0000-0000-0000-000000000006',
          item_id: itemId,
          item_name: 'Deluxe Room',
          quantity: 1,
          nights: 2,
          unit_price: 500,
          total_price: 1000,
          snapshot: null,
        },
      ],
      guests_list: [],
      events: [],
    };
  }

  function buildPrismaMock(existing = booking()) {
    const cancelled = { ...existing, status: 'cancelled', cancelled_at: new Date() };
    const tx = {
      $executeRaw: jest.fn().mockResolvedValue(2),
      hospitality_bookings: {
        update: jest.fn().mockResolvedValue(cancelled),
      },
      hospitality_booking_status_events: {
        create: jest.fn(),
      },
      orders: {
        update: jest.fn(),
      },
    };

    return {
      hospitality_bookings: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(cancelled),
      },
      $transaction: jest.fn(async (callback: any) => callback(tx)),
      __tx: tx,
    };
  }

  it('cancels a booking, rolls back availability, records event, and syncs legacy order', async () => {
    const prisma = buildPrismaMock();
    const service = new BookingService(prisma as any);

    const result = await service.cancelBooking(bookingId, businessId);

    expect(prisma.__tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.hospitality_bookings.update).toHaveBeenCalledWith({
      where: { hospitality_booking_id: bookingId },
      data: {
        status: 'cancelled',
        cancelled_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
    });
    expect(prisma.__tx.hospitality_booking_status_events.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        hospitality_booking_id: bookingId,
        business_id: businessId,
        from_status: 'confirmed',
        to_status: 'cancelled',
        actor: 'human',
        data: expect.objectContaining({
          legacy_order_id: legacyOrderId,
          availability_rollback: [
            {
              item_id: itemId,
              quantity: 1,
              affected_rows: 2,
            },
          ],
        }),
      }),
    });
    expect(prisma.__tx.orders.update).toHaveBeenCalledWith({
      where: { order_id: legacyOrderId },
      data: expect.objectContaining({
        status: 'cancelled',
        delivery_status: 'cancelled',
        service_status: 'cancelled',
        cancelled_at: expect.any(Date),
        updated_at: expect.any(Date),
      }),
    });
    expect(result.status).toBe('cancelled');
  });

  it('does not roll back availability again when booking is already cancelled', async () => {
    const prisma = buildPrismaMock(booking('cancelled'));
    const service = new BookingService(prisma as any);

    const result = await service.cancelBooking(bookingId, businessId);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(result.status).toBe('cancelled');
  });

  it('rejects cancellation after checkout', async () => {
    const prisma = buildPrismaMock(booking('checked_out'));
    const service = new BookingService(prisma as any);

    await expect(service.cancelBooking(bookingId, businessId)).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('does not read a hospitality booking outside the current business scope', async () => {
    const prisma = {
      hospitality_bookings: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new BookingService(prisma as any);

    await expect(service.getBookingById(bookingId, businessId)).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.hospitality_bookings.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { hospitality_booking_id: bookingId, business_id: businessId },
      }),
    );
  });

  it('does not cancel a hospitality booking outside the current business scope', async () => {
    const prisma = {
      hospitality_bookings: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn(),
    };
    const service = new BookingService(prisma as any);

    await expect(service.cancelBooking(bookingId, businessId)).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.hospitality_bookings.findFirst).toHaveBeenCalledWith({
      where: { hospitality_booking_id: bookingId, business_id: businessId },
      include: { rooms: true },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
