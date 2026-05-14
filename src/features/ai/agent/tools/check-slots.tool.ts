import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { CatalogService } from '../../../commerce/catalog/catalog.service';
import { resolveDate, isValidDate } from '../utils/date-resolver';
import { getRunContext } from '../context/agent-run-context';
import { encodeFlow } from '../types/handoff';

// Used by services, education, activity verticals — slot-based availability check
export function makeCheckSlotsTool(catalogService: CatalogService) {
  return tool(
    async ({ serviceName, date }) => {
      const { businessId } = getRunContext();

      const resolvedDate = resolveDate(date);
      if (!isValidDate(resolvedDate)) {
        return `I couldn't understand the date "${date}". Please say something like "tomorrow" or "April 25".`;
      }

      const results = await catalogService.queryForAgent({
        businessId,
        item_type: 'service',
        check_in: resolvedDate,
        check_out: resolvedDate,
        search: serviceName,
      });

      if (!results || results.length === 0) {
        return serviceName
          ? `No available slots for "${serviceName}" on ${resolvedDate}.`
          : `No available slots on ${resolvedDate}.`;
      }

      const lines = results.slice(0, 5).map((item: any) => {
        const price = item.base_price ? `₹${item.base_price}` : '';
        const attrs = item.attributes as any;
        const duration = attrs?.duration_minutes ? `${attrs.duration_minutes} min` : '';
        return [item.name, price, duration].filter(Boolean).join(' — ');
      });

      return encodeFlow({
        businessId,
        flowType: 'appointment',
        date: resolvedDate,
        serviceName,
        slots: lines,
      });
    },
    {
      name: 'check_slots',
      description: 'Check available appointment slots for a service on a given date',
      schema: z.object({
        serviceName: z.string().optional().describe('Name of the service or appointment type'),
        date: z.string().describe('Preferred date (e.g. "tomorrow", "April 25", "2026-04-25")'),
      }),
    },
  );
}
