/**
 * Lightweight envelope for tools to emit structured events the agent service can
 * consume (lead events, metrics, etc.) without parsing free-form result strings.
 *
 * A tool result may end with a SIGNAL line:
 *   "Tool's normal customer-facing reply text\n@@SIGNAL@@{...json...}"
 *
 * The LLM is told (in the tool description) to ignore SIGNAL lines. Downstream
 * code strips them before showing the result to the LLM or the customer.
 */

export const SIGNAL_PREFIX = '@@SIGNAL@@';

export type AgentSignal =
  | { type: 'demand_miss'; service_id?: string; service_name?: string; check_in?: string; check_out?: string; guests?: number }
  | { type: 'browse_empty'; query: string }
  | { type: 'cancel_success'; booking_id: string }
  | { type: 'cancel_already'; booking_id: string };

export function appendSignal(message: string, signal: AgentSignal): string {
  return `${message}\n${SIGNAL_PREFIX}${JSON.stringify(signal)}`;
}

export function extractSignals(raw: string): { cleanText: string; signals: AgentSignal[] } {
  if (!raw.includes(SIGNAL_PREFIX)) return { cleanText: raw, signals: [] };
  const lines = raw.split('\n');
  const signals: AgentSignal[] = [];
  const cleanLines: string[] = [];
  for (const line of lines) {
    const idx = line.indexOf(SIGNAL_PREFIX);
    if (idx === -1) {
      cleanLines.push(line);
      continue;
    }
    const before = line.slice(0, idx);
    if (before.trim()) cleanLines.push(before);
    const payload = line.slice(idx + SIGNAL_PREFIX.length).trim();
    try {
      signals.push(JSON.parse(payload) as AgentSignal);
    } catch {
      /* ignore malformed signal */
    }
  }
  return { cleanText: cleanLines.join('\n').trimEnd(), signals };
}
