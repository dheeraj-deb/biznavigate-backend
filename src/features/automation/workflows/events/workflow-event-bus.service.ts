import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkflowDefinition, WorkflowDefinitionDocument } from '../schema/workflow-definition.schema';
import { BusinessWorkflow, BusinessWorkflowDocument } from '../schema/business-workflow.schema';
import { buildSyntheticContext } from '../triggers/synthetic-context';
import { WorkflowsService } from '../workflows.service';
import {
  BookingCancelledPayload,
  BookingCreatedPayload,
  ExternalWorkflowEventPayload,
  LeadInactivePayload,
  LeadStatusChangedPayload,
  PaymentCapturedPayload,
} from './workflow-event.types';
import { eventTopicForType, EventTriggerParams, LeadStatusEventConfig, LeadInactiveEventConfig } from '../triggers/trigger-schemas';

/**
 * Listens for app-wide events and fires every active workflow whose trigger
 * subscribes to that event. One subscriber per event type — each maps the
 * payload to the right workflow_id/business_id pair and calls
 * WorkflowsService.startWorkflow with a synthetic context.
 *
 * Why centralize this instead of having each feature own its own listener:
 *   - The trigger filter logic (e.g. lead.status_changed `to_status` allowlist,
 *     lead.inactive `days` threshold) belongs to the workflow definition, not
 *     the emitter. Putting it here keeps mutation sites unaware of automations.
 *   - Lifecycle is simple: a workflow toggling from inactive → active needs no
 *     subscription bookkeeping. We just re-scan business_workflows on every
 *     event.
 */
@Injectable()
export class WorkflowEventBusService {
  private readonly logger = new Logger(WorkflowEventBusService.name);

  constructor(
    @InjectModel(WorkflowDefinition.name) private readonly workflowDefinitionModel: Model<WorkflowDefinitionDocument>,
    @InjectModel(BusinessWorkflow.name) private readonly businessWorkflowModel: Model<BusinessWorkflowDocument>,
    @Inject(forwardRef(() => WorkflowsService))
    private readonly workflowsService: WorkflowsService,
  ) {}

  @OnEvent('workflow.event.lead.status_changed')
  async onLeadStatusChanged(payload: LeadStatusChangedPayload) {
    await this.dispatch('trigger.event.lead_status_changed', payload, (params: EventTriggerParams) => {
      if (params.event !== 'lead.status_changed') return false;
      const cfg = params as LeadStatusEventConfig;
      if (cfg.to_status?.length && !cfg.to_status.includes(payload.to_status)) return false;
      if (cfg.from_status?.length && payload.from_status && !cfg.from_status.includes(payload.from_status)) return false;
      return true;
    });
  }

  @OnEvent('workflow.event.booking.created')
  async onBookingCreated(payload: BookingCreatedPayload) {
    await this.dispatch('trigger.event.booking_created', payload);
  }

  @OnEvent('workflow.event.booking.cancelled')
  async onBookingCancelled(payload: BookingCancelledPayload) {
    await this.dispatch('trigger.event.booking_cancelled', payload);
  }

  @OnEvent('workflow.event.booking.link_sent')
  async onBookingLinkSent(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.booking_link_sent', payload);
  }

  @OnEvent('workflow.event.booking.followup_due')
  async onBookingFollowupDue(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.booking_followup_due', payload);
  }

  @OnEvent('workflow.event.booking.checkin_reminder_due')
  async onBookingCheckinReminderDue(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.booking_checkin_reminder_due', payload);
  }

  @OnEvent('workflow.event.booking.review_request_due')
  async onBookingReviewRequestDue(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.booking_review_request_due', payload);
  }

  @OnEvent('workflow.event.room.available')
  async onRoomAvailable(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.room_available', payload);
  }

  @OnEvent('workflow.event.payment.captured')
  async onPaymentCaptured(payload: PaymentCapturedPayload) {
    await this.dispatch('trigger.event.payment_captured', payload);
  }

  @OnEvent('workflow.event.payment.received')
  async onPaymentReceived(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.payment_received', payload);
  }

  @OnEvent('workflow.event.payment.waiting')
  async onPaymentWaiting(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.payment_waiting', payload);
  }

  @OnEvent('workflow.event.order.placed')
  async onOrderPlaced(payload: ExternalWorkflowEventPayload) {
    this.logger.log(
      `Received workflow.event.order.placed business=${payload.business_id} lead=${payload.lead_id ?? 'none'} order=${payload.payload?.order_number ?? payload.payload?.order_id ?? 'unknown'}`,
    );
    await this.dispatch('trigger.event.order_placed', payload);
  }

  @OnEvent('workflow.event.order.status_changed')
  async onOrderStatusChanged(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.order_status_changed', payload);
  }

  @OnEvent('workflow.event.inventory.price_changed')
  async onInventoryPriceChanged(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.inventory_price_changed', payload);
  }

  @OnEvent('workflow.event.inventory.item_added')
  async onInventoryItemAdded(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.inventory_item_added', payload);
  }

  @OnEvent('workflow.event.inventory.restocked')
  async onInventoryRestocked(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.inventory_restocked', payload);
  }

  @OnEvent('workflow.event.stock.held')
  async onStockHeld(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.stock_held', payload);
  }

  @OnEvent('workflow.event.slot.opened')
  async onSlotOpened(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.slot_opened', payload);
  }

  @OnEvent('workflow.event.credit.due')
  async onCreditDue(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.credit_due', payload);
  }

  @OnEvent('workflow.event.dead_stock.offer')
  async onDeadStockOffer(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.dead_stock_offer', payload);
  }

  @OnEvent('workflow.event.vehicle.details_shared')
  async onVehicleDetailsShared(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.vehicle_details_shared', payload);
  }

  @OnEvent('workflow.event.vehicle.visit_slots_available')
  async onVehicleVisitSlotsAvailable(payload: ExternalWorkflowEventPayload) {
    await this.dispatch('trigger.event.vehicle_visit_slots_available', payload);
  }

  @OnEvent('workflow.event.lead.inactive')
  async onLeadInactive(payload: LeadInactivePayload) {
    await this.dispatch('trigger.event.lead_inactive', payload, (params: EventTriggerParams) => {
      if (params.event !== 'lead.inactive') return false;
      // The scanner emits with the lead's actual days-inactive value; the workflow
      // configures the threshold it wants. Fire when actual >= threshold.
      const cfg = params as LeadInactiveEventConfig;
      const threshold = Number(cfg.days ?? 0);
      return payload.days_inactive >= threshold;
    });
  }

  /**
   * Generic dispatch: find every active workflow in the payload's business
   * with a trigger node of the given type whose extra filter accepts the
   * payload. Then ask WorkflowsService to start each one.
   */
  private async dispatch(
    triggerType: string,
    payload: { business_id: string; tenant_id: string | null; lead_id?: string },
    extraFilter?: (params: EventTriggerParams) => boolean,
  ): Promise<void> {
    const topic = eventTopicForType(triggerType);
    if (!topic) {
      this.logger.warn(`dispatch called with non-event trigger type: ${triggerType}`);
      return;
    }

    const links = await this.businessWorkflowModel
      .find({ business_id: payload.business_id, is_active: true })
      .lean();
    if (!links.length) {
      this.logger.warn(`Event ${topic} ignored: no active business workflows for business ${payload.business_id}`);
      return;
    }

    const workflow_ids = links.map((l) => l.workflow_id);
    const defs = await this.workflowDefinitionModel
      .find({ workflow_id: { $in: workflow_ids }, is_active: true })
      .lean();
    if (!defs.length) {
      this.logger.warn(`Event ${topic} ignored: ${links.length} active business workflow link(s), but no active definitions`);
      return;
    }

    let matched = 0;
    for (const def of defs) {
      const trigger = (def.workflow_definition?.nodes ?? []).find(
        (n: any) => n?.type === triggerType,
      );
      if (!trigger) continue;
      if (extraFilter && !extraFilter(trigger.params as EventTriggerParams)) continue;
      matched += 1;

      const synthetic = buildSyntheticContext({
        business_id: payload.business_id,
        tenant_id: payload.tenant_id,
        lead_id: payload.lead_id,
        source: 'event',
        event_type: topic,
        metadata: { payload },
      });

      try {
        const state = await this.workflowsService.startWorkflow(
          payload.lead_id ?? '',
          '',
          'whatsapp',
          synthetic,
          def.workflow_id,
        );
        if (state) {
          this.logger.log(`Event ${topic} fired workflow ${def.workflow_id}`);
        } else {
          this.logger.warn(`Event ${topic} matched workflow ${def.workflow_id}, but workflow start returned no state`);
        }
      } catch (err: any) {
        this.logger.error(
          `Event ${topic} dispatch failed for workflow ${def.workflow_id}: ${err.message}`,
          err.stack,
        );
      }
    }

    if (!matched) {
      this.logger.warn(
        `Event ${topic} ignored: no active workflow definition contains trigger ${triggerType} for business ${payload.business_id}`,
      );
    }
  }
}
