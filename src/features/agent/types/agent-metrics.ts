// Adapted from agents-js agents/src/metrics/base.ts
export interface AgentTurnMetrics {
  conversationId: string;
  businessId: string;
  turnId: string;
  intent: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  durationMs: number;       // wall-clock time for full graph.invoke()
  toolsExecuted: string[];  // names of tools called this turn
  ttfrMs?: number;          // time-to-first-response (for future streaming support)
  cancelled: boolean;
  timestamp: Date;
}
