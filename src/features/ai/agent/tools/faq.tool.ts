import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getRunContext } from '../context/agent-run-context';
import { RagService } from '../../rag/rag.service';

export function makeFaqTool(ragService: RagService) {
  return tool(
    async ({ question }) => {
      const { businessId } = getRunContext();

      try {
        const results = await ragService.search(businessId, 'docs', question, 3, 0.4);

        if (!results.length) {
          return `I don't have specific information about that. You can contact us directly for more details.`;
        }

        return results
          .slice(0, 2)
          .map((r) => r.text.trim())
          .join('\n\n');
      } catch {
        return `I don't have that information handy. Let me connect you with someone who can help.`;
      }
    },
    {
      name: 'faq_search',
      description:
        'Search the business knowledge base to answer questions about facilities, policies, services, and FAQs',
      schema: z.object({
        question: z.string().describe('The user question to search for'),
      }),
    },
  );
}
