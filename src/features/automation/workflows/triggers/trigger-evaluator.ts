import { Logger } from '@nestjs/common';

/**
 * Trigger gating evaluator — decides whether a workflow with extended trigger
 * config (conditions / business_hours / vars) should fire for a given inbound
 * message context.
 *
 * Why this lives outside the trigger nodes themselves:
 *   The runtime never calls TriggerNode.matches() — workflows are looked up
 *   directly by (business_id, intent). So conditions/business-hours have to be
 *   evaluated at the workflow-start gate instead, with access to the same
 *   system_context the rest of the workflow sees.
 */

export type ConditionField =
  | 'lead.status'
  | 'lead.tags'
  | 'lead.source'
  | 'message.text';

export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in';

export interface TriggerCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string | string[];
}

export interface BusinessHoursRange {
  /** 0 (Sun) .. 6 (Sat) */
  day: number;
  /** "HH:MM" 24h */
  start: string;
  /** "HH:MM" 24h */
  end: string;
}

export interface BusinessHoursConfig {
  enabled: boolean;
  /** IANA timezone, e.g. "Asia/Kolkata". Falls back to UTC if absent. */
  timezone?: string;
  ranges: BusinessHoursRange[];
}

export interface TriggerEvaluationContext {
  lead?: {
    status?: string | null;
    tags?: string[] | null;
    source?: string | null;
  } | null;
  message?: {
    text?: string | null;
  };
  now?: Date;
}

export interface TriggerEvaluationResult {
  matched: boolean;
  /** When matched is false, which check rejected. Useful for logging. */
  reason?: string;
}

const logger = new Logger('TriggerEvaluator');

export function evaluateTrigger(params: {
  conditions?: TriggerCondition[];
  businessHours?: BusinessHoursConfig;
  context: TriggerEvaluationContext;
}): TriggerEvaluationResult {
  const { conditions = [], businessHours, context } = params;

  if (businessHours?.enabled) {
    const ok = isWithinBusinessHours(businessHours, context.now ?? new Date());
    if (!ok) {
      return { matched: false, reason: 'outside_business_hours' };
    }
  }

  for (const condition of conditions) {
    if (!evaluateCondition(condition, context)) {
      return { matched: false, reason: `condition_failed:${condition.field}` };
    }
  }

  return { matched: true };
}

function evaluateCondition(condition: TriggerCondition, context: TriggerEvaluationContext): boolean {
  const actual = readField(condition.field, context);
  const expected = condition.value;

  // Normalise — lead.tags is an array, everything else is a string.
  if (condition.field === 'lead.tags') {
    const tags = Array.isArray(actual) ? actual.map((t) => String(t)) : [];
    const expectedList = Array.isArray(expected)
      ? expected.map((v) => String(v))
      : [String(expected)];
    switch (condition.operator) {
      case 'contains':
      case 'in':
        return expectedList.some((v) => tags.includes(v));
      case 'not_contains':
      case 'not_in':
        return expectedList.every((v) => !tags.includes(v));
      default:
        logger.warn(`Operator ${condition.operator} not supported for lead.tags`);
        return false;
    }
  }

  const actualStr = String(actual ?? '').toLowerCase();
  const expectedStr = String(Array.isArray(expected) ? expected.join(',') : expected ?? '').toLowerCase();
  const expectedList = (Array.isArray(expected) ? expected : [expected])
    .filter((v) => v !== undefined && v !== null)
    .map((v) => String(v).toLowerCase());

  switch (condition.operator) {
    case 'equals':
      return actualStr === expectedStr;
    case 'not_equals':
      return actualStr !== expectedStr;
    case 'contains':
      return actualStr.includes(expectedStr);
    case 'not_contains':
      return !actualStr.includes(expectedStr);
    case 'in':
      return expectedList.includes(actualStr);
    case 'not_in':
      return !expectedList.includes(actualStr);
    default:
      logger.warn(`Unknown operator ${condition.operator}`);
      return false;
  }
}

function readField(field: ConditionField, context: TriggerEvaluationContext): unknown {
  switch (field) {
    case 'lead.status': return context.lead?.status;
    case 'lead.tags': return context.lead?.tags;
    case 'lead.source': return context.lead?.source;
    case 'message.text': return context.message?.text;
    default: return undefined;
  }
}

function isWithinBusinessHours(config: BusinessHoursConfig, now: Date): boolean {
  if (!config.ranges?.length) return true;
  const tz = config.timezone || 'UTC';
  const parts = formatInTimezone(now, tz);
  const day = parts.day;
  const minutes = parts.hours * 60 + parts.minutes;

  return config.ranges.some((range) => {
    if (range.day !== day) return false;
    const start = parseHHMM(range.start);
    const end = parseHHMM(range.end);
    if (start == null || end == null) return false;
    return minutes >= start && minutes < end;
  });
}

function parseHHMM(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Extracts {day, hours, minutes} from `now` projected into a target IANA timezone
 * using Intl.DateTimeFormat — no extra deps. `day` is JS-style (Sun=0..Sat=6).
 */
function formatInTimezone(now: Date, timezone: string): { day: number; hours: number; minutes: number } {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    const parts = fmt.formatToParts(now);
    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
    const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '0';
    const minutePart = parts.find((p) => p.type === 'minute')?.value ?? '0';
    const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: weekdayMap[weekday] ?? 0,
      hours: Number(hourPart) % 24,
      minutes: Number(minutePart),
    };
  } catch {
    return { day: now.getUTCDay(), hours: now.getUTCHours(), minutes: now.getUTCMinutes() };
  }
}
