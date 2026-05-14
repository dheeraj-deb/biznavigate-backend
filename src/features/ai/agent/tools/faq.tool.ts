import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getRunContext } from '../context/agent-run-context';
import { RagService } from '../../rag/rag.service';

export function makeFaqTool(ragService: RagService) {
  return tool(
    async ({ question }) => {
      const { businessId } = getRunContext();

      try {
        const results = await ragService.search(businessId, 'docs', question, 5, 0.2);

        if (!results.length) {
          return `No business knowledge has been uploaded for this question yet. Ask one short follow-up question or offer to connect the customer with a human.`;
        }

        const context = results
          .map((r, index) => {
            const source = r.metadata?.question
              ?? r.metadata?.title
              ?? r.metadata?.file_name
              ?? r.metadata?.type
              ?? `source_${index + 1}`;
            return `Source ${index + 1}: ${source}\n${r.text.trim()}`;
          })
          .join('\n\n');

        return `Use the business knowledge below to answer the customer. If the exact answer is not explicit, give the closest helpful answer from this context and say what detail is not specified.\n\n${context}`;
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
