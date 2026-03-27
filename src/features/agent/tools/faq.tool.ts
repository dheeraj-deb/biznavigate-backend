import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const faqTool = tool(
  async ({ question, businessId }) => {
    // TODO: wire up existing RAG search node (src/features/workflows/nodes/actions/rag-search-node.ts)
    return `[stub] FAQ answer for "${question}" (business: ${businessId}) — implement me`;
  },
  {
    name: 'faq_search',
    description: 'Search the business knowledge base to answer questions about facilities, policies, and services',
    schema: z.object({
      question: z.string().describe('The user question to search for'),
      businessId: z.string().describe('The business ID'),
    }),
  },
);
