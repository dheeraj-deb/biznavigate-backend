/**
 * Internal events that event-triggered workflows can subscribe to. These are
 * emitted by the rest of the app via @nestjs/event-emitter at mutation sites
 * (lead status changed, booking created/cancelled, payment captured, lead
 * inactive). WorkflowEventBus listens on the `workflow.event.*` namespace and
 * fires any active workflow with a matching trigger.event.* node.
 */

export const WORKFLOW_EVENT_PREFIX = 'workflow.event';

export type WorkflowEventName =
  | 'workflow.event.lead.status_changed'
  | 'workflow.event.booking.created'
  | 'workflow.event.booking.cancelled'
  | 'workflow.event.payment.captured'
  | 'workflow.event.lead.inactive';

export interface BaseEventPayload {
  business_id: string;
  tenant_id: string | null;
  lead_id?: string;
  /** Provenance — included on every payload so listeners can log/trace. */
  emitted_at: string;
}

export interface LeadStatusChangedPayload extends BaseEventPayload {
  lead_id: string;
  from_status: string | null;
  to_status: string;
}

export interface BookingCreatedPayload extends BaseEventPayload {
  lead_id: string;
  hospitality_booking_id: string;
  booking_number?: string | null;
}

export interface BookingCancelledPayload extends BaseEventPayload {
  lead_id?: string;
  hospitality_booking_id: string;
  booking_number?: string | null;
}

export interface PaymentCapturedPayload extends BaseEventPayload {
  lead_id?: string;
  payment_id: string;
  order_id?: string | null;
  amount: number;
}

export interface LeadInactivePayload extends BaseEventPayload {
  lead_id: string;
  days_inactive: number;
}

export type WorkflowEventPayload =
  | LeadStatusChangedPayload
  | BookingCreatedPayload
  | BookingCancelledPayload
  | PaymentCapturedPayload
  | LeadInactivePayload;
