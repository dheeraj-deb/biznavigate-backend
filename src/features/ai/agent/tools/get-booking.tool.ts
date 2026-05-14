import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../../../prisma/prisma.service';
import { getRunContext } from '../context/agent-run-context';

export function makeGetBookingTool(prisma: PrismaService) {
  return tool(
    async ({ phone, bookingId }) => {
      const { businessId } = getRunContext();

      // Resolve by bookingId first, fall back to phone lookup
      let order: any = null;

      if (bookingId) {
        order = await prisma.orders.findFirst({
          where: { order_id: bookingId, business_id: businessId },
          include: { order_items: true },
        });
      } else if (phone) {
        const lead = await prisma.leads.findFirst({
          where: { business_id: businessId, phone },
          select: { lead_id: true },
        });
        if (lead) {
          order = await prisma.orders.findFirst({
            where: {
              business_id: businessId,
              lead_id: lead.lead_id,
              payment_status: { not: 'cancelled' },
            },
            orderBy: { created_at: 'desc' },
            include: { order_items: true },
          });
        }
      }

      if (!order) {
        return bookingId
          ? `No booking found with ID ${bookingId}.`
          : `No active booking found for phone number ${phone}.`;
      }

      const items = (order.order_items as any[])
        .map((i: any) => i.item_name ?? i.item_id)
        .join(', ');

      const checkIn = order.items?.[0]?.check_in ?? null;
      const checkOut = order.items?.[0]?.check_out ?? null;
      const dateRange = checkIn && checkOut ? ` | Check-in: ${checkIn}, Check-out: ${checkOut}` : '';

      return (
        `Booking #${order.order_number ?? order.order_id.slice(0, 8)}` +
        ` | Status: ${order.payment_status}` +
        ` | Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}` +
        `${dateRange}` +
        `${items ? ` | Items: ${items}` : ''}`
      );
    },
    {
      name: 'get_booking',
      description: 'Look up an existing booking or order by customer phone number or booking ID',
      schema: z.object({
        phone: z.string().optional().describe('Customer phone number'),
        bookingId: z.string().optional().describe('Booking or order ID'),
      }),
    },
  );
}
