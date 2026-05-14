export interface HandoffPayload {
  reason: string;
  phone: string;
  intent: string;
  escalateTo?: 'human' | 'specialist' | 'billing';
  context?: Record<string, unknown>;
}

export interface FlowPayload {
  businessId: string;
  flowType: 'availability' | 'order' | 'appointment';
  [key: string]: unknown; // flow-specific data (checkIn/checkOut, itemId, slotId…)
}

export const HANDOFF_PREFIX = 'HANDOFF:';
export const FLOW_PREFIX = 'FLOW:';

export function encodeHandoff(payload: HandoffPayload): string {
  return `${HANDOFF_PREFIX}${JSON.stringify(payload)}`;
}

export function decodeHandoff(raw: string): HandoffPayload | null {
  if (!raw.startsWith(HANDOFF_PREFIX)) return null;
  try {
    return JSON.parse(raw.slice(HANDOFF_PREFIX.length)) as HandoffPayload;
  } catch {
    return null;
  }
}

export function encodeFlow(payload: FlowPayload): string {
  return `${FLOW_PREFIX}${JSON.stringify(payload)}`;
}

export function decodeFlow(raw: string): FlowPayload | null {
  if (!raw.startsWith(FLOW_PREFIX)) return null;
  try {
    return JSON.parse(raw.slice(FLOW_PREFIX.length)) as FlowPayload;
  } catch {
    return null;
  }
}
