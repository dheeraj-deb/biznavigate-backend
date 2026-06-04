import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getRunContext } from '../context/agent-run-context';
import { PendingAgentActionService } from '../services/pending-agent-action.service';

export function makeCancelBookingTool(pendingActions: PendingAgentActionService) {
  return tool(
    async ({ bookingId }) => {
      const { businessId, leadId, phone, conversationId } = getRunContext();
      const drafted = await pendingActions.draftCancelBooking({
        businessId,
        leadId,
        phone,
        conversationId,
        bookingId,
      });

      if (drafted.status !== 'completed') return drafted.message;

      return [
        drafted.message,
        'Reply "confirm" to proceed, or "keep" to leave it unchanged.',
      ].join('\n');
    },
    {
      name: 'cancel_booking',
      description:
        "Draft a booking cancellation request. This never cancels immediately; it requires the customer's explicit confirmation.",
      schema: z.object({
        bookingId: z.string().optional().describe('Booking ID to cancel. Optional.'),
      }),
    },
  );
}
