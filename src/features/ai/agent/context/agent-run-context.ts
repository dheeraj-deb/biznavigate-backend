import { AsyncLocalStorage } from 'node:async_hooks';

export interface AgentRunContext {
  businessId: string;
  businessType: string; // e.g. 'hospitality', 'retail', 'ecommerce', 'services'
  customerLanguage: string;
  leadId?: string;
  phone: string;
  conversationId: string;
}

// Mirrors agents-js agentActivityStorage — ambient context available inside graph.invoke()
// Tools read from this instead of receiving businessId as an LLM-supplied parameter
export const agentRunContextStorage = new AsyncLocalStorage<AgentRunContext>();

export function getRunContext(): AgentRunContext {
  const ctx = agentRunContextStorage.getStore();
  if (!ctx) {
    throw new Error(
      'No AgentRunContext in AsyncLocalStorage — must be called within agentRunContextStorage.run()',
    );
  }
  return ctx;
}
