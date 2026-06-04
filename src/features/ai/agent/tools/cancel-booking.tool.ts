import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../../../prisma/prisma.service';
import { getRunContext } from '../context/agent-run-context';
import { appendSignal } from '../types/agent-signal';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
}

export function makeCancelBookingTool(prisma: PrismaService) {
  return tool(
    async ({ bookingId }) => {
      const { businessId, lead } = getRunContext();
      let resolvedBookingId = bookingId;
      let order: any = null;
      let hospitalityBooking: any = null;

      // If no bookingId provided, use the lead resolved at run start
      if (!resolvedBookingId) {
        if (!lead) {
          return 'Please share the booking ID you want to cancel.';
        }

        hospitalityBooking = await prisma.hospitality_bookings.findFirst({
          where: {
            business_id: businessId,
            lead_id: lead.lead_id,
            status: { not: 'cancelled' },
          },
          orderBy: { created_at: 'desc' },
          include: { legacy_order: true },
        });
        order = hospitalityBooking?.legacy_order ?? null;

        if (!hospitalityBooking) {
          order = await prisma.orders.findFirst({
            where: {
              business_id: businessId,
              lead_id: lead.lead_id,
              payment_status: { in: ['pending', 'paid'] },
              status: { not: 'cancelled' },
            },
            orderBy: { created_at: 'desc' },
          });
        }

        if (!hospitalityBooking && !order) {
          return `No active booking found for this customer.`;
        }

        resolvedBookingId = hospitalityBooking?.hospitality_booking_id ?? order.order_id;
      }

      try {
        if (!hospitalityBooking && resolvedBookingId) {
          const orderFilters: any[] = [{ order_number: resolvedBookingId }];
          if (isUuid(resolvedBookingId)) orderFilters.push({ order_id: resolvedBookingId });

          order = await prisma.orders.findFirst({
            where: {
              business_id: businessId,
              OR: orderFilters,
            },
          });

          if (!order) {
            const bookingFilters: any[] = [{ booking_number: resolvedBookingId }];
            if (isUuid(resolvedBookingId)) bookingFilters.push({ hospitality_booking_id: resolvedBookingId });

            hospitalityBooking = await prisma.hospitality_bookings.findFirst({
              where: {
                business_id: businessId,
                OR: bookingFilters,
              },
              include: { legacy_order: true },
            });
            order = hospitalityBooking?.legacy_order ?? null;
          }
        }

        const displayId = hospitalityBooking?.booking_number ?? order?.order_number ?? resolvedBookingId;

        if (!hospitalityBooking && !order) {
          return `Booking ${resolvedBookingId} was not found. Please double-check the booking ID.`;
        }

        if (hospitalityBooking?.status === 'cancelled' || order?.payment_status === 'cancelled' || order?.status === 'cancelled') {
          return appendSignal(
            `Booking ${displayId} has already been cancelled.`,
            { type: 'cancel_already', booking_id: displayId },
          );
        }

        await prisma.$transaction(async (tx) => {
          if (hospitalityBooking) {
            await tx.hospitality_bookings.update({
              where: { hospitality_booking_id: hospitalityBooking.hospitality_booking_id },
              data: {
                status: 'cancelled',
                payment_status: 'cancelled',
                cancelled_at: new Date(),
                updated_at: new Date(),
              },
            });
          }

          if (order) {
            await tx.orders.update({
              where: { order_id: order.order_id },
              data: {
                status: 'cancelled',
                payment_status: 'cancelled',
                cancelled_at: new Date(),
                updated_at: new Date(),
              },
            });
          }
        });

        return appendSignal(
          `Booking ${displayId} has been successfully cancelled. You will receive a confirmation shortly.`,
          { type: 'cancel_success', booking_id: displayId },
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
