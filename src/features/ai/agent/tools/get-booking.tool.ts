import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from '../../../../prisma/prisma.service';
import { getRunContext } from '../context/agent-run-context';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function makeGetBookingTool(prisma: PrismaService) {
  return tool(
    async ({ phone, bookingId }) => {
      const { businessId } = getRunContext();

      // Resolve by bookingId first, fall back to phone lookup
      let order: any = null;
      let hospitalityBooking: any = null;
      let hospitalityInquiry: any = null;
      let productInquiry: any = null;

      if (bookingId) {
        const orderFilters: any[] = [{ order_number: bookingId }];
        if (isUuid(bookingId)) orderFilters.push({ order_id: bookingId });

        order = await prisma.orders.findFirst({
          where: {
            business_id: businessId,
            OR: orderFilters,
          },
          include: { order_items: true },
        });

        if (!order) {
          const bookingFilters: any[] = [{ booking_number: bookingId }];
          if (isUuid(bookingId)) bookingFilters.push({ hospitality_booking_id: bookingId });

          hospitalityBooking = await prisma.hospitality_bookings.findFirst({
            where: {
              business_id: businessId,
              OR: bookingFilters,
            },
            include: { rooms: true, guests_list: true, legacy_order: { include: { order_items: true } } },
          });
          order = hospitalityBooking?.legacy_order ?? null;
        }

        // Last resort: maybe the reference is an inquiry_id (e.g. "continue on WhatsApp" public-booking flow)
        if (!order && !hospitalityBooking && isUuid(bookingId)) {
          hospitalityInquiry = await prisma.hospitality_inquiries.findFirst({
            where: { business_id: businessId, inquiry_id: bookingId },
          });
          if (!hospitalityInquiry) {
            productInquiry = await prisma.product_inquiries.findFirst({
              where: { business_id: businessId, inquiry_id: bookingId },
            });
          }
        }
      } else if (phone) {
        const lead = await prisma.leads.findFirst({
          where: { business_id: businessId, phone },
          select: { lead_id: true },
        });
        if (lead) {
          hospitalityBooking = await prisma.hospitality_bookings.findFirst({
            where: {
              business_id: businessId,
              lead_id: lead.lead_id,
              status: { not: 'cancelled' },
            },
            orderBy: { created_at: 'desc' },
            include: { rooms: true, guests_list: true, legacy_order: { include: { order_items: true } } },
          });
          order = hospitalityBooking?.legacy_order ?? null;

          if (!order) {
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
      }

      if (!order) {
        if (hospitalityInquiry) {
          const meta = (hospitalityInquiry.metadata as any) ?? {};
          const customer = meta.customer ?? {};
          return (
            `Pending inquiry ${hospitalityInquiry.inquiry_id}` +
            ` | Status: ${hospitalityInquiry.status} (not yet confirmed)` +
            ` | Item: ${meta.item_name ?? hospitalityInquiry.preferred_item_id}` +
            ` | Check-in: ${hospitalityInquiry.check_in.toISOString().slice(0, 10)}` +
            `, Check-out: ${hospitalityInquiry.check_out.toISOString().slice(0, 10)}` +
            ` | Guests: ${hospitalityInquiry.guests}` +
            (customer.name ? ` | Guest: ${customer.name}` : '') +
            (customer.phone ? ` | Phone: ${customer.phone}` : '') +
            ` — This inquiry was created from the public booking link and needs to be confirmed.`
          );
        }
        if (productInquiry) {
          const meta = (productInquiry.metadata as any) ?? {};
          return (
            `Pending product inquiry ${productInquiry.inquiry_id}` +
            ` | Status: ${productInquiry.status} (not yet confirmed)` +
            ` | Item: ${meta.item_name ?? productInquiry.item_id}` +
            ` | Quantity: ${productInquiry.quantity}` +
            ` — This inquiry was created from the public booking link and needs to be confirmed.`
          );
        }
        return bookingId
          ? `No booking found with ID ${bookingId}.`
          : `No active booking found for phone number ${phone}.`;
      }

      const firstOrderItem = (order.order_items as any[])?.[0];
      const orderSnapshot = (firstOrderItem?.snapshot as any) ?? {};
      const firstRoom = hospitalityBooking?.rooms?.[0];
      const roomSnapshot = (firstRoom?.snapshot as any) ?? {};
      const firstGuest = hospitalityBooking?.guests_list?.[0];

      const items = ((hospitalityBooking?.rooms as any[]) ?? (order.order_items as any[]) ?? [])
        .map((i: any) => i.item_name ?? i.product_name ?? i.snapshot?.item_name ?? i.item_id)
        .filter(Boolean)
        .join(', ');

      const checkIn = hospitalityBooking?.check_in ?? roomSnapshot.check_in ?? orderSnapshot.check_in ?? null;
      const checkOut = hospitalityBooking?.check_out ?? roomSnapshot.check_out ?? orderSnapshot.check_out ?? null;
      const dateRange = checkIn && checkOut ? ` | Check-in: ${checkIn}, Check-out: ${checkOut}` : '';
      const guestName = firstGuest?.name ?? roomSnapshot.guest_name ?? orderSnapshot.guest_name ?? null;
      const guests = hospitalityBooking?.guests ?? roomSnapshot.num_guests ?? orderSnapshot.num_guests ?? null;
      const guestText = guestName ? ` | Guest: ${guestName}` : '';
      const guestsText = guests ? ` | Guests: ${guests}` : '';
      const bookingNumber = hospitalityBooking?.booking_number ?? order.order_number ?? order.order_id.slice(0, 8);
      const status = hospitalityBooking?.status ?? order.status ?? order.payment_status;
      const paymentStatus = hospitalityBooking?.payment_status ?? order.payment_status;
      const totalAmount = hospitalityBooking?.total_amount ?? order.total_amount;

      return (
        `Booking #${bookingNumber}` +
        ` | Status: ${status}` +
        ` | Payment: ${paymentStatus}` +
        ` | Total: ₹${Number(totalAmount).toLocaleString('en-IN')}` +
        `${dateRange}` +
        `${guestText}` +
        `${guestsText}` +
        `${items ? ` | Items: ${items}` : ''}`
      );
    },
    {
      name: 'get_booking',
      description:
        'Look up an existing booking, order, or pending inquiry (e.g. a public-booking-link reference the customer wants to confirm) by customer phone number or reference ID',
      schema: z.object({
        phone: z.string().optional().describe('Customer phone number'),
        bookingId: z
          .string()
          .optional()
          .describe('Booking, order, or inquiry reference ID (UUID or booking/order number)'),
      }),
    },
  );
}
