import { makeCheckAvailabilityTool } from './check-availability.tool';
import { makeBrowseCatalogTool } from './browse-catalog.tool';
import { makeCheckSlotsTool } from './check-slots.tool';
import { makeCancelBookingTool } from './cancel-booking.tool';
import { makeGetBookingTool } from './get-booking.tool';
import { makeGetPaymentTool } from './get-payment.tool';
import { makeFaqTool } from './faq.tool';
import { handoffTool } from './handoff.tool';
import {
  makeCreateProductOrderTool,
  makeReserveProductStockTool,
  makeSearchProductsTool,
} from './product-selling.tool';
import { CatalogService } from '../../../commerce/catalog/catalog.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RagService } from '../../rag/rag.service';
import { PendingAgentActionService } from '../services/pending-agent-action.service';

export interface ToolDeps {
  catalogService: CatalogService;
  prisma: PrismaService;
  ragService: RagService | null;
  pendingActions: PendingAgentActionService;
}

// Shared tools available to every specialist agent
function sharedTools(deps: ToolDeps) {
  return [
    makeCancelBookingTool(deps.pendingActions),
    makeGetBookingTool(deps.prisma),
    makeGetPaymentTool(deps.prisma),
    ...(deps.ragService ? [makeFaqTool(deps.ragService)] : []),
    handoffTool,
  ];
}

function knowledgeTools(deps: ToolDeps) {
  return [
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
    case 'products':
      return [
        makeSearchProductsTool(deps.prisma),
        makeReserveProductStockTool(deps.prisma),
        makeCreateProductOrderTool(deps.prisma),
        makeBrowseCatalogTool(deps.catalogService),
        ...shared,
      ];

    case 'used_cars':
    case 'real_estate':
      return [makeBrowseCatalogTool(deps.catalogService), ...knowledgeTools(deps)];

    case 'services':
    case 'healthcare':
    case 'education':
    case 'consulting':
      return [makeCheckSlotsTool(deps.catalogService), makeBrowseCatalogTool(deps.catalogService), ...shared];

    default:
      return [
        makeCheckAvailabilityTool(deps.catalogService),
        makeSearchProductsTool(deps.prisma),
        makeReserveProductStockTool(deps.prisma),
        makeCreateProductOrderTool(deps.prisma),
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
