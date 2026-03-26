import { makeCheckAvailabilityTool } from './check-availability.tool';
import { makeCancelBookingTool } from './cancel-booking.tool';
import { getBookingTool } from './get-booking.tool';
import { getPaymentTool } from './get-payment.tool';
import { faqTool } from './faq.tool';
import { handoffTool } from './handoff.tool';
import { InventoryService } from '../../inventory/inventory.service';
import { PrismaService } from '../../../prisma/prisma.service';

export interface ToolDeps {
  inventoryService: InventoryService;
  prisma: PrismaService;
}

export function buildTools(deps: ToolDeps) {
  return [
    makeCheckAvailabilityTool(deps.inventoryService),           // booking
    getBookingTool,                                              // status    (stub)
    makeCancelBookingTool(deps.inventoryService, deps.prisma),  // cancellation
    getPaymentTool,                                             // payment   (stub)
    faqTool,                                                    // faq       (stub)
    handoffTool,                                                // handoff
  ];
}
