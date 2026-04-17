export const AGENT_QUEUE_NAME = 'agent';

export const AgentJobType = {
  PROCESS_MESSAGE: 'process-message',
} as const;

export type AgentJobType = (typeof AgentJobType)[keyof typeof AgentJobType];

export interface ProcessMessageJobPayload {
  text: string;
  businessId: string;
  leadId?: string;
  phone: string;
  conversationId: string;
  /** ISO timestamp — lets the agent detect stale jobs and skip them */
  enqueuedAt: string;
}

export type AgentJobPayload = {
  [AgentJobType.PROCESS_MESSAGE]: ProcessMessageJobPayload;
};

/** Typed helper so job dispatch never goes out of sync with the processor */
export interface AgentJob<T extends AgentJobType = typeof AgentJobType.PROCESS_MESSAGE> {
  type: T;
  payload: AgentJobPayload[T];
}
