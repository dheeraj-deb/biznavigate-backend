import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getPaymentTool = tool(
  async ({ bookingId, phone }) => {
    // TODO: query payment/booking records from Prisma
    return `[stub] Payment info for booking ${bookingId ?? ''} phone ${phone} — implement me`;
  },
  {
    name: 'get_payment_info',
    description: 'Retrieve payment details, invoice, or refund status for a booking',
    schema: z.object({
      bookingId: z.string().optional().describe('Booking ID'),
      phone: z.string().describe('Customer phone number'),
    }),
  },
);
