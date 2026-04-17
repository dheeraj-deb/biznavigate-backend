import { makeCheckAvailabilityTool } from './check-availability.tool';
import { makeCancelBookingTool } from './cancel-booking.tool';
import { getBookingTool } from './get-booking.tool';
import { getPaymentTool } from './get-payment.tool';
import { faqTool } from './faq.tool';
import { handoffTool } from './handoff.tool';
import { CatalogService } from '@biznavigate/catalog';
import { PrismaService } from '@biznavigate/prisma';

export interface ToolDeps {
  catalogService: CatalogService;
  prisma: PrismaService;
}

export function buildTools(deps: ToolDeps) {
  return [
    makeCheckAvailabilityTool(deps.catalogService),               // availability
    getBookingTool,                                                // status    (stub)
    makeCancelBookingTool(deps.prisma),                           // cancellation
    getPaymentTool,                                               // payment   (stub)
    faqTool,                                                      // faq       (stub)
    handoffTool,                                                  // handoff
  ];
}
