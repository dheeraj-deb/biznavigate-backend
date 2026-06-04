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
  | 'booking.link_sent'
  | 'booking.followup_due'
  | 'booking.checkin_reminder_due'
  | 'booking.review_request_due'
  | 'room.available'
  | 'order.placed'
  | 'order.status_changed'
  | 'payment.captured'
  | 'payment.received'
  | 'payment.waiting'
  | 'inventory.price_changed'
  | 'inventory.item_added'
  | 'inventory.restocked'
  | 'stock.held'
  | 'slot.opened'
  | 'credit.due'
  | 'dead_stock.offer'
  | 'vehicle.details_shared'
  | 'vehicle.visit_slots_available'
  | 'lead.inactive';

export interface LeadStatusEventConfig {
  event: 'lead.status_changed';
  /** Only fire if the new status matches one of these. Empty = match all. */
  to_status?: string[];
  /** Only fire if the previous status matches one of these. Empty = match all. */
  from_status?: string[];
}

export interface BookingEventConfig {
  event:
    | 'booking.created'
    | 'booking.cancelled'
    | 'booking.link_sent'
    | 'booking.followup_due'
    | 'booking.checkin_reminder_due'
    | 'booking.review_request_due'
    | 'room.available';
}

export interface PaymentCapturedEventConfig {
  event: 'payment.captured' | 'payment.received' | 'payment.waiting';
}

export interface OrderEventConfig {
  event: 'order.placed' | 'order.status_changed';
}

export interface InventoryEventConfig {
  event: 'inventory.price_changed' | 'inventory.item_added' | 'inventory.restocked' | 'stock.held';
}

export interface SlotOpenedEventConfig {
  event: 'slot.opened';
}

export interface CreditEventConfig {
  event: 'credit.due';
}

export interface DeadStockEventConfig {
  event: 'dead_stock.offer';
}

export interface VehicleEventConfig {
  event: 'vehicle.details_shared' | 'vehicle.visit_slots_available';
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
  | OrderEventConfig
  | InventoryEventConfig
  | SlotOpenedEventConfig
  | CreditEventConfig
  | DeadStockEventConfig
  | VehicleEventConfig
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
    case 'booking_link_sent': return 'booking.link_sent';
    case 'booking_followup_due': return 'booking.followup_due';
    case 'booking_checkin_reminder_due': return 'booking.checkin_reminder_due';
    case 'booking_review_request_due': return 'booking.review_request_due';
    case 'room_available': return 'room.available';
    case 'order_placed': return 'order.placed';
    case 'order_status_changed': return 'order.status_changed';
    case 'payment_captured': return 'payment.captured';
    case 'payment_received': return 'payment.received';
    case 'payment_waiting': return 'payment.waiting';
    case 'inventory_price_changed': return 'inventory.price_changed';
    case 'inventory_item_added': return 'inventory.item_added';
    case 'inventory_restocked': return 'inventory.restocked';
    case 'stock_held': return 'stock.held';
    case 'slot_opened': return 'slot.opened';
    case 'credit_due': return 'credit.due';
    case 'dead_stock_offer': return 'dead_stock.offer';
    case 'vehicle_details_shared': return 'vehicle.details_shared';
    case 'vehicle_visit_slots_available': return 'vehicle.visit_slots_available';
    case 'lead_inactive': return 'lead.inactive';
    default: return null;
  }
}
