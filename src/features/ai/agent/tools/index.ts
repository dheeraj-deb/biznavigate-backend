import { makeCheckAvailabilityTool } from './check-availability.tool';
import { makeBrowseCatalogTool } from './browse-catalog.tool';
import { makeCheckSlotsTool } from './check-slots.tool';
import { makeCancelBookingTool } from './cancel-booking.tool';
import { makeGetBookingTool } from './get-booking.tool';
import { makeGetPaymentTool } from './get-payment.tool';
import { makeFaqTool } from './faq.tool';
import { handoffTool } from './handoff.tool';
import { CatalogService } from '../../../commerce/catalog/catalog.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RagService } from '../../rag/rag.service';

export interface ToolDeps {
  catalogService: CatalogService;
  prisma: PrismaService;
  ragService: RagService | null;
}

// Shared tools available to every specialist agent
function sharedTools(deps: ToolDeps) {
  return [
    makeCancelBookingTool(deps.prisma),
    makeGetBookingTool(deps.prisma),
    makeGetPaymentTool(deps.prisma),
    ...(deps.ragService ? [makeFaqTool(deps.ragService)] : []),
    handoffTool,
  ];
}

// Tool set per business vertical — only expose what's relevant so the LLM isn't confused
export function buildToolsForVertical(vertical: string, deps: ToolDeps) {
  const shared = sharedTools(deps);

  switch (vertical.toLowerCase()) {
    case 'hospitality':
      return [makeCheckAvailabilityTool(deps.catalogService), ...shared];

    case 'retail':
    case 'ecommerce':
      return [makeBrowseCatalogTool(deps.catalogService), ...shared];

    case 'services':
    case 'healthcare':
    case 'education':
    case 'consulting':
      return [makeCheckSlotsTool(deps.catalogService), makeBrowseCatalogTool(deps.catalogService), ...shared];

    default:
      return [
        makeCheckAvailabilityTool(deps.catalogService),
        makeBrowseCatalogTool(deps.catalogService),
        makeCheckSlotsTool(deps.catalogService),
        ...shared,
      ];
  }
}

// Legacy alias used by existing agent-graph.ts — builds tools for hospitality (default)
export function buildTools(deps: ToolDeps) {
  return buildToolsForVertical('hospitality', deps);
}
