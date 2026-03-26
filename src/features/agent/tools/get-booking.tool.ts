import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getBookingTool = tool(
  async ({ phone, bookingId }) => {
    // TODO: inject PrismaService and query service_bookings
    // const booking = await prisma.service_bookings.findFirst({ where: { customer_phone: phone } });
    return `[stub] Booking lookup for phone=${phone} bookingId=${bookingId} — implement me`;
  },
  {
    name: 'get_booking',
    description: 'Look up an existing booking by customer phone number or booking ID',
    schema: z.object({
      phone: z.string().optional().describe('Customer phone number'),
      bookingId: z.string().optional().describe('Booking ID'),
    }),
  },
);
