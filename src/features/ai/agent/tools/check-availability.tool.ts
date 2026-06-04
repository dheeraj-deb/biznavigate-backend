import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { CatalogService } from '../../../commerce/catalog/catalog.service';
import { resolveDate, isValidDate } from '../utils/date-resolver';
import { getRunContext } from '../context/agent-run-context';
import { appendSignal } from '../types/agent-signal';
import { encodeHandoff } from '../types/handoff';

export function makeCheckAvailabilityTool(catalogService: CatalogService) {
  return tool(
    async ({ checkIn, checkOut, propertyName, guests }) => {
      const { businessId, businessProfile, lead, phone } = getRunContext();
      const resolvedCheckIn = resolveDate(checkIn);
      const resolvedCheckOut = resolveDate(checkOut);

      if (!isValidDate(resolvedCheckIn)) {
        return `I couldn't understand the check-in date "${checkIn}". Please say something like "March 25" or "tomorrow".`;
      }
      if (!isValidDate(resolvedCheckOut)) {
        return `I couldn't understand the check-out date "${checkOut}". Please say something like "March 28" or "next monday".`;
      }
      if (resolvedCheckOut <= resolvedCheckIn) {
        return 'Check-out date must be after check-in date. Could you clarify your dates?';
      }

      // Query available items via catalog
      const results = await catalogService.queryForAgent({
        businessId,
        item_type: 'accommodation',
        check_in: resolvedCheckIn,
        check_out: resolvedCheckOut,
        search: propertyName,
      });

      if (!results || results.length === 0) {
        return appendSignal(
          `No rooms available from ${resolvedCheckIn} to ${resolvedCheckOut}.`,
          { type: 'demand_miss', check_in: resolvedCheckIn, check_out: resolvedCheckOut, service_name: propertyName },
        );
      }

      const lines = results.slice(0, 5).map((item: any, index: number) => {
        const price = item.effective_price ?? item.base_price;
        const priceText = price ? ` - ₹${Number(price).toLocaleString('en-IN')}` : '';
        return `${index + 1}. ${item.name}${priceText}`;
      });

      const link = businessProfile.booking_link.enabled && businessProfile.booking_link.url
        ? thisBookingUrl(businessProfile.booking_link.url, {
            checkIn: resolvedCheckIn,
            checkOut: resolvedCheckOut,
            guests: guests ? String(guests) : '1',
            leadId: lead?.lead_id,
          })
        : '';

      if (!link) {
        return encodeHandoff({
          phone,
          intent: 'booking_link_not_configured',
          reason: 'Availability found but public booking link is unavailable',
          escalateTo: 'human',
          context: {
            check_in: resolvedCheckIn,
            check_out: resolvedCheckOut,
            available_rooms: lines,
          },
        });
      }

      return [
        `Available rooms from ${resolvedCheckIn} to ${resolvedCheckOut}:`,
        lines.join('\n'),
        `Please complete your booking here: ${link}`,
      ].join('\n');
    },
    {
      name: 'check_availability',
      description: 'Check available rooms/properties for given check-in and check-out dates. Include propertyName when the user names a specific resort/property/room.',
      schema: z.object({
        checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
        checkOut: z.string().describe('Check-out date in YYYY-MM-DD format'),
        propertyName: z.string().optional().describe('Specific resort/property/room name mentioned by the customer, if any'),
        guests: z.coerce.number().int().positive().optional().describe('Number of guests mentioned by the customer, if any'),
      }),
    },
  );
}

function thisBookingUrl(baseUrl: string, params: Record<string, string | undefined>): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
