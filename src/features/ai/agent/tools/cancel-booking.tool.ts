import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../../../prisma/prisma.service';
import { getRunContext } from '../context/agent-run-context';
import { appendSignal } from '../types/agent-signal';

export function makeCancelBookingTool(prisma: PrismaService) {
  return tool(
    async ({ bookingId }) => {
      const { businessId, lead } = getRunContext();
      let resolvedBookingId = bookingId;

      // If no bookingId provided, use the lead resolved at run start
      if (!resolvedBookingId) {
        if (!lead) {
          return 'Please share the booking ID you want to cancel.';
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
          return `No active booking found for this customer.`;
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
          return appendSignal(
            `Booking ${resolvedBookingId} has already been cancelled.`,
            { type: 'cancel_already', booking_id: resolvedBookingId },
          );
        }

        await prisma.orders.update({
          where: { order_id: resolvedBookingId },
          data: { payment_status: 'cancelled', updated_at: new Date() },
        });

        return appendSignal(
          `Booking ${resolvedBookingId} has been successfully cancelled. You will receive a confirmation shortly.`,
          { type: 'cancel_success', booking_id: resolvedBookingId },
        );
      } catch (err: any) {
        if (err?.message?.includes('not found')) {
          return `Booking ${resolvedBookingId} was not found. Please double-check the booking ID.`;
        }
        throw err;
      }
    },
    {
      name: 'cancel_booking',
      description:
        "Cancel a booking. If bookingId is omitted, cancels the customer's most recent active booking.",
      schema: z.object({
        bookingId: z.string().optional().describe('Booking ID to cancel. Optional.'),
      }),
    },
  );
}
