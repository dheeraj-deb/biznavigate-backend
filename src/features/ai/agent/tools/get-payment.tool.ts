import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../../../prisma/prisma.service';
import { getRunContext } from '../context/agent-run-context';

export function makeGetPaymentTool(prisma: PrismaService) {
  return tool(
    async ({ bookingId, phone }) => {
      const { businessId } = getRunContext();

      let orderId = bookingId;

      // Resolve orderId via phone if no bookingId given
      if (!orderId && phone) {
        const lead = await prisma.leads.findFirst({
          where: { business_id: businessId, phone },
          select: { lead_id: true },
        });
        if (lead) {
          const order = await prisma.orders.findFirst({
            where: { business_id: businessId, lead_id: lead.lead_id },
            orderBy: { created_at: 'desc' },
            select: { order_id: true, order_number: true },
          });
          orderId = order?.order_id;
        }
      }

      if (!orderId) {
        return 'Please provide a booking ID or your phone number so I can look up the payment.';
      }

      const payment = await prisma.payments.findFirst({
        where: { business_id: businessId, order_id: orderId },
        orderBy: { created_at: 'desc' },
      });

      if (!payment) {
        return `No payment record found for booking ${bookingId ?? orderId}.`;
      }

      const statusMap: Record<string, string> = {
        created: 'pending',
        authorized: 'authorized',
        captured: 'paid ✅',
        failed: 'failed ❌',
        refunded: 'refunded 🔄',
      };
      const statusLabel = statusMap[payment.status] ?? payment.status;
      const amount = `₹${Number(payment.amount).toLocaleString('en-IN')}`;
      const method = payment.method ? ` via ${payment.method}` : '';
      const refund =
        Number(payment.refund_amount) > 0
          ? ` | Refund: ₹${Number(payment.refund_amount).toLocaleString('en-IN')}`
          : '';

      return `Payment status: ${statusLabel} | Amount: ${amount}${method}${refund}`;
    },
    {
      name: 'get_payment_info',
      description: 'Retrieve payment details, invoice, or refund status for a booking or order',
      schema: z.object({
        bookingId: z.string().optional().describe('Booking or order ID'),
        phone: z.string().optional().describe('Customer phone number'),
      }),
    },
  );
}
