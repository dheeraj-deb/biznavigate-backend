import { AsyncLocalStorage } from 'node:async_hooks';
import type {
  BusinessProfileSnapshot,
  LeadSnapshot,
  RecentBookingSummary,
} from './agent-context-builder.service';

export interface AgentRunContext {
  businessId: string;
  businessType: string;
  customerLanguage: string;
  leadId?: string;
  phone: string;
  conversationId: string;
  /** Resolved once at run start so tools don't re-query by phone. */
  lead: LeadSnapshot | null;
  /** Business profile cached per businessId — name, policies, currency, etc. */
  businessProfile: BusinessProfileSnapshot;
  /** Up to 2 most recent bookings/orders for this lead. */
  recentBookings: RecentBookingSummary[];
}

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
