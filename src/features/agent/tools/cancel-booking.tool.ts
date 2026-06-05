import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../../prisma/prisma.service';
import { getRunContext } from '../context/agent-run-context';

export function makeCancelBookingTool(prisma: PrismaService) {
  return tool(
    async ({ bookingId, phone }) => {
      const { businessId } = getRunContext();
      let resolvedBookingId = bookingId;

      // If no bookingId provided, look up the most recent pending/confirmed order for this phone
      if (!resolvedBookingId) {
        if (!phone) return 'Please provide either a booking ID or your phone number so I can find your booking.';

        const lead = await prisma.leads.findFirst({
          where: { business_id: businessId, phone },
          select: { lead_id: true },
        });

        if (!lead) {
          return `No booking found for phone number ${phone}.`;
        }

        const order = await prisma.orders.findFirst({
          where: {
            business_id: businessId,
            lead_id: lead.lead_id,
            payment_status: { in: ['pending', 'paid'] },
          },
          orderBy: { created_at: 'desc' },
          select: { order_id: true },
        });

        if (!order) {
          return `No active booking found for phone number ${phone}.`;
        }

        resolvedBookingId = order.order_id;
      }

      try {
        const order = await prisma.orders.findFirst({
          where: { order_id: resolvedBookingId, business_id: businessId },
        });

        if (!order) {
          return `Booking ${resolvedBookingId} was not found. Please double-check the booking ID.`;
        }

        if (order.payment_status === 'cancelled') {
          return `Booking ${resolvedBookingId} has already been cancelled.`;
        }

        await prisma.orders.update({
          where: { order_id: resolvedBookingId },
          data: { payment_status: 'cancelled', updated_at: new Date() },
        });

        return `Booking ${resolvedBookingId} has been successfully cancelled. You will receive a confirmation shortly.`;
      } catch (err: any) {
        if (err?.message?.includes('not found')) {
          return `Booking ${resolvedBookingId} was not found. Please double-check the booking ID.`;
        }
        throw err;
      }
    },
    {
      name: 'cancel_booking',
      description: 'Cancel an existing booking by booking ID or customer phone number',
      schema: z.object({
        bookingId: z.string().optional().describe('Booking ID to cancel'),
        phone: z.string().optional().describe('Customer phone number — used to look up the booking if no ID given'),
      }),
    },
  );
}
