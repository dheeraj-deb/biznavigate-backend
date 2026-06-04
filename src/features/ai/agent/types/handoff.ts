export interface HandoffPayload {
  reason: string;
  phone: string;
  intent: string;
  escalateTo?: 'human' | 'specialist' | 'billing';
  context?: Record<string, unknown>;
}

export const HANDOFF_PREFIX = 'HANDOFF:';

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
