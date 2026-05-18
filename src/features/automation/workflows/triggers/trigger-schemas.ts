/**
 * Wire-format schemas for the schedule + event trigger families. These live
 * separately from trigger-evaluator.ts (which only covers gating params on
 * inbound triggers) because schedule/event triggers carry execution-shaping
 * params that are evaluated by their own runners, not the inbound gate.
 */

// ─── Schedule triggers ──────────────────────────────────────────────────────

export type ScheduleMode = 'daily' | 'weekly' | 'interval' | 'one_time';

export interface DailyScheduleParams {
  mode: 'daily';
  /** "HH:MM" 24h in the business's timezone */
  time: string;
}

export interface WeeklyScheduleParams {
  mode: 'weekly';
  /** 0 (Sun) .. 6 (Sat) — at least one entry */
  days: number[];
  /** "HH:MM" 24h in the business's timezone */
  time: string;
}

export interface IntervalScheduleParams {
  mode: 'interval';
  /** Minutes between fires. Min 5 to prevent runaway cost. */
  every_minutes: number;
}

export interface OneTimeScheduleParams {
  mode: 'one_time';
  /** ISO 8601 instant in the business's timezone */
  run_at: string;
}

export type ScheduleParams =
  | DailyScheduleParams
  | WeeklyScheduleParams
  | IntervalScheduleParams
  | OneTimeScheduleParams;

export type ScheduleTarget = 'each_lead' | 'business_only';

export interface LeadAudienceFilter {
  /** Match by current lead status. Empty/missing = no filter. */
  status?: string[];
  /** All listed tags must be present on the lead. Empty/missing = no filter. */
  has_tags?: string[];
  /** Match by lead.source. Empty/missing = no filter. */
  source?: string[];
  /** Hard cap on the number of leads fanned out per fire (default 500). */
  max_leads?: number;
}

export interface ScheduleTriggerParams {
  schedule: ScheduleParams;
  target: ScheduleTarget;
  /** Only honoured when target === 'each_lead'. */
  audience?: LeadAudienceFilter;
  /** Optional timezone override; defaults to business_settings.timezone */
  timezone?: string;
  /** Optional constant variables (same shape as inbound trigger vars) */
  vars?: Array<{ name: string; value: string }>;
}

// ─── Event triggers ──────────────────────────────────────────────────────────

export type WorkflowEventType =
  | 'lead.status_changed'
  | 'booking.created'
  | 'booking.cancelled'
  | 'payment.captured'
  | 'lead.inactive';

export interface LeadStatusEventConfig {
  event: 'lead.status_changed';
  /** Only fire if the new status matches one of these. Empty = match all. */
  to_status?: string[];
  /** Only fire if the previous status matches one of these. Empty = match all. */
  from_status?: string[];
}

export interface BookingEventConfig {
  event: 'booking.created' | 'booking.cancelled';
}

export interface PaymentCapturedEventConfig {
  event: 'payment.captured';
}

export interface LeadInactiveEventConfig {
  event: 'lead.inactive';
  /** Number of days since lead.updated_at after which the trigger fires. */
  days: number;
}

export type EventTriggerParams =
  | LeadStatusEventConfig
  | BookingEventConfig
  | PaymentCapturedEventConfig
  | LeadInactiveEventConfig;

// ─── Discriminators ─────────────────────────────────────────────────────────

export function isScheduleTriggerType(type: string): boolean {
  return type === 'trigger.schedule';
}

export function isEventTriggerType(type: string): boolean {
  return type.startsWith('trigger.event.');
}

/**
 * Map a node type to its event topic. Returns null for non-event triggers.
 *   trigger.event.lead_status_changed  → lead.status_changed
 */
export function eventTopicForType(type: string): WorkflowEventType | null {
  if (!isEventTriggerType(type)) return null;
  const tail = type.slice('trigger.event.'.length);
  switch (tail) {
    case 'lead_status_changed': return 'lead.status_changed';
    case 'booking_created': return 'booking.created';
    case 'booking_cancelled': return 'booking.cancelled';
    case 'payment_captured': return 'payment.captured';
    case 'lead_inactive': return 'lead.inactive';
    default: return null;
  }
}
