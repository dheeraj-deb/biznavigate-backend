import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const handoffTool = tool(
  async ({ reason, phone }) => {
    return `HANDOFF:${JSON.stringify({ reason, phone })}`;
  },
  {
    name: 'handoff_to_human',
    description: 'Escalate the conversation to a human agent when the user requests it, expresses frustration, needs support, or the bot cannot help',
    schema: z.object({
      reason: z.string().describe('Why the handoff is needed'),
      phone: z.string().describe('Customer phone number'),
    }),
  },
);
