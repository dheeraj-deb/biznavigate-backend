import { WorkflowProcessingContext } from '../interfaces';

/**
 * Builds a WorkflowProcessingContext for a workflow run that wasn't initiated by
 * an inbound customer message — i.e. scheduled cron fires, internal events
 * (booking created, payment captured, lead status changed, lead inactive).
 *
 * The shape matches what handleIncomingMessage / startWorkflow consumes, with
 * sentinel values for the message-shaped fields (user_input, intent, etc.).
 * Downstream nodes that reference `${user_input}` will see an empty string.
 *
 * `source` is recorded under context.metadata so debug logs can tell synthetic
 * runs apart from real inbound runs.
 */
export function buildSyntheticContext(params: {
  business_id: string;
  tenant_id: string | null;
  lead_id?: string;
  source: 'schedule' | 'event' | 'inactive_scanner';
  /** The event topic that fired this run (only set for source === 'event'). */
  event_type?: string;
  /** Free-form bag for handlers that want to surface event payload data. */
  metadata?: Record<string, any>;
}): WorkflowProcessingContext {
  const processing_id = `synthetic_${params.source}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    lead_id: params.lead_id ?? '',
    business_id: params.business_id,
    tenant_id: params.tenant_id,
    processing_id,
    user_input: '',
    intent: {
      intent: '',
      confidence: 1,
      reasoning: `Synthetic run from ${params.source}`,
    } as any,
    entities: {} as any,
    structured_data: {} as any,
    suggested_actions: [],
    suggested_response: null,
    processing_time_ms: 0,
    context: {
      message_id: processing_id,
      conversation_id: '',
      // Mark the source for log triage. workflows.service stamps this through
      // to the execution row's context blob.
      metadata: {
        synthetic: true,
        source: params.source,
        event_type: params.event_type ?? null,
        ...(params.metadata ?? {}),
      },
    } as any,
  };
}
