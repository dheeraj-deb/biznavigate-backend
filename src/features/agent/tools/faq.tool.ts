import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { getRunContext } from '../context/agent-run-context';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL ?? 'http://localhost:8004';

export const faqTool = tool(
  async ({ question }) => {
    const { businessId } = getRunContext();

    try {
      const response = await axios.post(
        `${RAG_SERVICE_URL}/api/v1/rag/search`,
        {
          query: question,
          business_id: businessId,
          collection: 'docs',
          limit: 3,
          threshold: 0.4,
        },
        { timeout: 5000 },
      );

      const results: Array<{ text: string; score: number }> = response.data?.results ?? [];
      if (!results.length) {
        return `I don't have specific information about that. You can contact us directly for more details.`;
      }

      // Return the top result text — the responder LLM will rephrase it conversationally
      return results
        .slice(0, 2)
        .map((r) => r.text.trim())
        .join('\n\n');
    } catch {
      // RAG service down or no knowledge base — graceful fallback
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
