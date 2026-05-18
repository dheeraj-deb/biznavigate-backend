import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { CatalogService } from '../../../commerce/catalog/catalog.service';
import { resolveDate, isValidDate } from '../utils/date-resolver';
import { getRunContext } from '../context/agent-run-context';
import { encodeFlow } from '../types/handoff';
import { appendSignal } from '../types/agent-signal';

export function makeCheckAvailabilityTool(catalogService: CatalogService) {
  return tool(
    async ({ checkIn, checkOut }) => {
      const { businessId } = getRunContext();
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
      });

      if (!results || results.length === 0) {
        return appendSignal(
          `No rooms available from ${resolvedCheckIn} to ${resolvedCheckOut}.`,
          { type: 'demand_miss', check_in: resolvedCheckIn, check_out: resolvedCheckOut },
        );
      }

      // Signal the debounce processor to trigger the hospitality flow
      return encodeFlow({ businessId, flowType: 'availability', checkIn: resolvedCheckIn, checkOut: resolvedCheckOut });
    },
    {
      name: 'check_availability',
      description: 'Check available rooms/services for given check-in and check-out dates',
      schema: z.object({
        checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
        checkOut: z.string().describe('Check-out date in YYYY-MM-DD format'),
      }),
    },
  );
}
