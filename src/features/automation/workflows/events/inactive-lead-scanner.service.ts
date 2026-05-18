import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { PrismaService } from '../../../../prisma/prisma.service';
import { WorkflowDefinition, WorkflowDefinitionDocument } from '../schema/workflow-definition.schema';
import { BusinessWorkflow, BusinessWorkflowDocument } from '../schema/business-workflow.schema';
import {
  WorkflowInactiveFire,
  WorkflowInactiveFireDocument,
} from '../schema/workflow-inactive-fire.schema';
import { LeadInactivePayload } from './workflow-event.types';
import { LeadInactiveEventConfig } from '../triggers/trigger-schemas';

const QUEUE_NAME = 'workflow-inactive-scanner';
const SCAN_JOB_NAME = 'scan-inactive';
const SCAN_INTERVAL_MS = 60 * 60 * 1000; // hourly
const MAX_LEADS_PER_TRIGGER = 200;

/**
 * Periodic scanner that emits `workflow.event.lead.inactive` for any lead
 * whose `leads.updated_at` is older than the configured threshold on an active
 * `trigger.event.lead_inactive` workflow.
 *
 * Why a recurring scan (instead of subscribing to "no activity" — which
 * doesn't exist as an event):
 *   - Inactivity is the absence of events, so we can only learn about it by
 *     polling. The scan is hourly to bound the spend; the trade-off is up to
 *     one hour of latency between a lead crossing the threshold and the
 *     workflow firing, which is acceptable for re-engagement use cases.
 *
 * Duplicate-fire guard:
 *   - workflow_inactive_fires collection records (workflow_id, lead_id, fired_at).
 *   - On each scan, we skip leads whose updated_at <= fired_at — they haven't
 *     re-engaged since we already fired for them.
 *   - When a lead replies or otherwise mutates, leads.updated_at bumps to
 *     "now", which moves it past fired_at. The next time they go inactive, we
 *     fire again. Clean.
 */
@Injectable()
export class InactiveLeadScannerService implements OnModuleInit {
  private readonly logger = new Logger(InactiveLeadScannerService.name);

  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
    @InjectModel(WorkflowDefinition.name) private readonly defModel: Model<WorkflowDefinitionDocument>,
    @InjectModel(BusinessWorkflow.name) private readonly linkModel: Model<BusinessWorkflowDocument>,
    @InjectModel(WorkflowInactiveFire.name) private readonly fireModel: Model<WorkflowInactiveFireDocument>,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    // Register the hourly cron. Idempotent via jobId — restarting the service
    // won't pile up duplicate scan jobs.
    try {
      await this.queue.add(
        SCAN_JOB_NAME,
        {},
        {
          jobId: 'inactive-scan-cron',
          repeat: { every: SCAN_INTERVAL_MS },
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );
      this.logger.log(`Inactive-lead scan scheduled every ${SCAN_INTERVAL_MS / 60_000} minutes`);
    } catch (err: any) {
      this.logger.error(`Could not schedule inactive-lead scan: ${err.message}`);
    }
  }

  async runScan(): Promise<void> {
    this.logger.log('Inactive-lead scan starting…');
    const start = Date.now();
    const triggers = await this.collectActiveInactiveTriggers();
    let totalFired = 0;
    for (const trigger of triggers) {
      try {
        totalFired += await this.processTrigger(trigger);
      } catch (err: any) {
        this.logger.error(
          `Scan failed for workflow ${trigger.workflow_id}: ${err.message}`,
          err.stack,
        );
      }
    }
    this.logger.log(
      `Inactive-lead scan completed — ${totalFired} fire(s) across ${triggers.length} trigger(s) in ${Date.now() - start}ms`,
    );
  }

  private async collectActiveInactiveTriggers(): Promise<Array<{ workflow_id: string; business_id: string; days: number }>> {
    const links = await this.linkModel.find({ is_active: true }).lean();
    if (!links.length) return [];
    const ids = links.map((l) => l.workflow_id);
    const defs = await this.defModel.find({ workflow_id: { $in: ids }, is_active: true }).lean();
    const byId = new Map(defs.map((d) => [d.workflow_id, d]));
    const result: Array<{ workflow_id: string; business_id: string; days: number }> = [];
    for (const link of links) {
      const def = byId.get(link.workflow_id);
      if (!def) continue;
      const trigger = (def.workflow_definition?.nodes ?? []).find(
        (n: any) => n?.type === 'trigger.event.lead_inactive',
      );
      if (!trigger) continue;
      const cfg = trigger.params as LeadInactiveEventConfig;
      const days = Math.max(1, Number(cfg?.days ?? 0));
      if (!days) continue;
      result.push({ workflow_id: link.workflow_id, business_id: link.business_id, days });
    }
    return result;
  }

  private async processTrigger(trigger: { workflow_id: string; business_id: string; days: number }): Promise<number> {
    const thresholdDate = new Date(Date.now() - trigger.days * 24 * 60 * 60 * 1000);
    const candidates = await this.prisma.leads.findMany({
      where: {
        business_id: trigger.business_id,
        deleted_at: null,
        updated_at: { lte: thresholdDate },
      },
      select: { lead_id: true, tenant_id: true, updated_at: true },
      take: MAX_LEADS_PER_TRIGGER,
      orderBy: { updated_at: 'asc' },
    });

    if (!candidates.length) return 0;

    // Pull existing fire records for this workflow in a single query.
    const fires = await this.fireModel
      .find({
        workflow_id: trigger.workflow_id,
        lead_id: { $in: candidates.map((c) => c.lead_id) },
      })
      .lean();
    const firedAtById = new Map(fires.map((f) => [f.lead_id, f.fired_at]));

    let fired = 0;
    for (const lead of candidates) {
      const prevFiredAt = firedAtById.get(lead.lead_id);
      if (prevFiredAt && prevFiredAt >= lead.updated_at) {
        // Lead hasn't re-engaged since the last fire; skip.
        continue;
      }

      try {
        await this.fireModel.findOneAndUpdate(
          { workflow_id: trigger.workflow_id, lead_id: lead.lead_id },
          { $set: { fired_at: new Date() } },
          { upsert: true, returnDocument: 'after' },
        );

        const daysInactive = Math.floor(
          (Date.now() - new Date(lead.updated_at).getTime()) / (24 * 60 * 60 * 1000),
        );
        const payload: LeadInactivePayload = {
          business_id: trigger.business_id,
          tenant_id: lead.tenant_id ?? null,
          lead_id: lead.lead_id,
          days_inactive: daysInactive,
          emitted_at: new Date().toISOString(),
        };
        this.eventEmitter.emit('workflow.event.lead.inactive', payload);
        fired++;
      } catch (err: any) {
        this.logger.warn(
          `Could not record inactive fire for workflow ${trigger.workflow_id} lead ${lead.lead_id}: ${err.message}`,
        );
      }
    }

    return fired;
  }
}
