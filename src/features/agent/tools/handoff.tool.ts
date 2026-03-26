import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const handoffTool = tool(
  async ({ reason, phone }) => {
    // TODO: trigger human handoff — e.g. notify agent via inbox, create ticket, etc.
    return `[stub] Handoff triggered for ${phone}: ${reason} — implement me`;
  },
  {
    name: 'handoff_to_human',
    description: 'Escalate the conversation to a human agent when the user requests it or the bot cannot help',
    schema: z.object({
      reason: z.string().describe('Why the handoff is needed'),
      phone: z.string().describe('Customer phone number'),
    }),
  },
);
