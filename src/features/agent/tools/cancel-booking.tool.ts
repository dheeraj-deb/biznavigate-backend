import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { InventoryService } from '../../inventory/inventory.service';
import { PrismaService } from '../../../prisma/prisma.service';

export function makeCancelBookingTool(inventoryService: InventoryService, prisma: PrismaService) {
  return tool(
    async ({ bookingId, phone, businessId }) => {
      let resolvedBookingId = bookingId;

      // If no bookingId provided, look up the most recent active booking for this phone
      if (!resolvedBookingId) {
        if (!phone) return 'Please provide either a booking ID or your phone number so I can find your booking.';

        const booking = await prisma.service_bookings.findFirst({
          where: {
            business_id: businessId,
            customer_phone: phone,
            status: { in: ['pending', 'confirmed'] },
          },
          orderBy: { created_at: 'desc' },
          select: { booking_id: true, check_in_date: true, check_out_date: true },
        });

        if (!booking) {
          return `No active booking found for phone number ${phone}.`;
        }

        resolvedBookingId = booking.booking_id; // UUID — cancelBooking also accepts booking_id directly
      }

      try {
        await inventoryService.cancelBooking(resolvedBookingId, businessId);
        return `Booking ${resolvedBookingId} has been successfully cancelled. You will receive a confirmation shortly.`;
      } catch (err: any) {
        if (err?.status === 404 || err?.message?.includes('not found')) {
          return `Booking ${resolvedBookingId} was not found. Please double-check the booking ID.`;
        }
        if (err?.message?.includes('already cancelled')) {
          return `Booking ${resolvedBookingId} has already been cancelled.`;
        }
        throw err;
      }
    },
    {
      name: 'cancel_booking',
      description: 'Cancel an existing booking by booking ID or customer phone number',
      schema: z.object({
        businessId: z.string().describe('The business ID'),
        bookingId: z.string().optional().describe('Booking ID to cancel'),
        phone: z.string().optional().describe('Customer phone number — used to look up the booking if no ID given'),
      }),
    },
  );
}
