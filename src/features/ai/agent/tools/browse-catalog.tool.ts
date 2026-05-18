import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { CatalogService } from '../../../commerce/catalog/catalog.service';
import { getRunContext } from '../context/agent-run-context';
import { appendSignal } from '../types/agent-signal';

// Used by retail, ecommerce, education verticals — generic catalog browse/search
export function makeBrowseCatalogTool(catalogService: CatalogService) {
  return tool(
    async ({ search, itemType }) => {
      const { businessId } = getRunContext();

      const results = await catalogService.queryForAgent({
        businessId,
        item_type: itemType as any,
        search,
      });

      if (!results || results.length === 0) {
        const message = search
          ? `No items found matching "${search}".`
          : 'No items available in the catalog right now.';
        return search ? appendSignal(message, { type: 'browse_empty', query: search }) : message;
      }

      const lines = results.slice(0, 5).map((item: any) => {
        const price = item.base_price ? `₹${item.base_price}` : '';
        const stock =
          item.stock_quantity != null
            ? item.stock_quantity > 0
              ? `${item.stock_quantity} in stock`
              : 'Out of stock'
            : '';
        const parts = [item.name, price, stock].filter(Boolean);
        return parts.join(' — ');
      });

      return `Available items:\n${lines.join('\n')}${results.length > 5 ? `\n…and ${results.length - 5} more` : ''}`;
    },
    {
      name: 'browse_catalog',
      description: 'Browse or search the business catalog for products, services, or courses',
      schema: z.object({
        search: z.string().optional().describe('Search term (product name, keyword, category)'),
        itemType: z
          .enum(['physical_product', 'service', 'activity', 'accommodation'])
          .optional()
          .describe('Filter by item type'),
      }),
    },
  );
}
