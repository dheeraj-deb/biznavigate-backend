import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { encodeHandoff } from '../types/handoff';
import { getRunContext } from '../context/agent-run-context';

export const handoffTool = tool(
  async ({ reason, escalateTo }) => {
    const { phone } = getRunContext();
    return encodeHandoff({ reason, phone, intent: 'handoff', escalateTo });
  },
  {
    name: 'handoff_to_human',
    description:
      'Escalate the conversation to a human agent when the user requests it, expresses frustration, needs support, or the bot cannot help',
    schema: z.object({
      reason: z.string().describe('Why the handoff is needed'),
      escalateTo: z
        .enum(['human', 'specialist', 'billing'])
        .optional()
        .describe('Target queue — defaults to human'),
    }),
  },
);
