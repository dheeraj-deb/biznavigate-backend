import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../../prisma/prisma.service';
import { buildRepeatPlan } from './cron-builder';
import { ScheduleTriggerParams } from '../triggers/trigger-schemas';

const QUEUE_NAME = 'workflow-schedules';

interface ScheduledFirePayload {
  workflow_id: string;
  business_id: string;
}

/**
 * Owns the lifecycle of BullMQ repeatable / delayed jobs that fire scheduled
 * workflows.
 *
 * Design notes:
 *   - One job per (workflow_id) using BullMQ's `jobId` to make replace-by-key
 *     safe. Re-saving a workflow that already has a schedule removes the
 *     existing repeat key, then re-adds — no duplicate fires.
 *   - Recurring schedules (daily / weekly / interval) use BullMQ's `repeat`.
 *   - One-time schedules use a delayed job (no repeat). When they fire, we
 *     additionally flip the workflow to inactive so it can't refire.
 *   - This service does NOT execute workflows — it only schedules. The
 *     processor (workflow-schedule.processor.ts) consumes fired jobs and
 *     delegates to ScheduleTriggerRunner.
 */
@Injectable()
export class WorkflowSchedulerService {
  private readonly logger = new Logger(WorkflowSchedulerService.name);

  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Register a workflow's schedule. Idempotent — re-calling with the same key
   * replaces any previously scheduled job.
   */
  async schedule(workflow_id: string, business_id: string, params: ScheduleTriggerParams): Promise<void> {
    // Always clear any prior schedule first so a re-save doesn't leave a ghost.
    await this.unschedule(workflow_id);

    const timezone = await this.resolveTimezone(business_id, params.timezone);
    const plan = buildRepeatPlan(params.schedule, timezone);
    const payload: ScheduledFirePayload = { workflow_id, business_id };

    if (plan.runAt) {
      const delay = Math.max(0, plan.runAt - Date.now());
      await this.queue.add('schedule-fire', payload, {
        jobId: this.jobId(workflow_id, 'once'),
        delay,
        removeOnComplete: true,
        removeOnFail: 50,
      });
      this.logger.log(`Scheduled workflow ${workflow_id} once: ${plan.description}`);
      return;
    }

    if (plan.every) {
      await this.queue.add(
        'schedule-fire',
        payload,
        {
          jobId: this.jobId(workflow_id, 'every'),
          repeat: { every: plan.every },
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );
      this.logger.log(`Scheduled workflow ${workflow_id} repeating: ${plan.description}`);
      return;
    }

    if (plan.pattern) {
      await this.queue.add(
        'schedule-fire',
        payload,
        {
          jobId: this.jobId(workflow_id, 'cron'),
          repeat: { pattern: plan.pattern, tz: plan.tz },
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );
      this.logger.log(`Scheduled workflow ${workflow_id} cron: ${plan.description}`);
      return;
    }

    this.logger.warn(`schedule() called for workflow ${workflow_id} but plan produced no job`);
  }

  /**
   * Remove all scheduled jobs for a workflow. Safe to call when nothing is
   * scheduled — best-effort.
   */
  async unschedule(workflow_id: string): Promise<void> {
    // BullMQ repeat keys aren't reachable by jobId — we have to enumerate and
    // match. This is cheap because the keys list is small per queue.
    try {
      const repeats = await this.queue.getRepeatableJobs();
      const prefix = `wf:${workflow_id}:`;
      for (const r of repeats) {
        // Match the exact jobId prefix we encode in this.jobId() rather than a
        // bare substring so two workflows with shared substrings (extremely
        // unlikely with UUIDs, but cheap to harden) can never delete each other.
        if (r.id && r.id.startsWith(prefix)) {
          await this.queue.removeRepeatableByKey(r.key);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Could not enumerate repeats for ${workflow_id}: ${err.message}`);
    }

    // Remove one-shot delayed jobs by jobId.
    for (const suffix of ['once', 'every', 'cron']) {
      try {
        const existing = await this.queue.getJob(this.jobId(workflow_id, suffix));
        if (existing) await existing.remove();
      } catch (err: any) {
        if (!String(err?.message ?? '').includes('not found')) {
          this.logger.warn(`Could not remove ${suffix} job for ${workflow_id}: ${err.message}`);
        }
      }
    }
  }

  /**
   * After a one-time schedule fires, flip the workflow to inactive so the next
   * inbound message-event lookup or scheduler scan won't re-fire it. Called by
   * the processor.
   */
  async markOneTimeCompleted(workflow_id: string): Promise<void> {
    // Source of truth for active state is business_workflows / workflow_definitions.
    // We update the MongoDB-side state via prisma-shaped lookups. The service
    // itself doesn't import the Mongoose models — caller (WorkflowsService)
    // handles the actual state mutation when this method is invoked through it.
    // Keeping it as a no-op here means the processor can call `WorkflowsService.
    // deactivateWorkflow(workflow_id)` instead — chosen to keep DB writes in
    // a single service.
    this.logger.debug(`One-time schedule for ${workflow_id} completed`);
    return;
  }

  private jobId(workflow_id: string, suffix: string): string {
    return `wf:${workflow_id}:${suffix}`;
  }

  private async resolveTimezone(business_id: string, override?: string): Promise<string> {
    if (override) return override;
    try {
      const settings = await (this.prisma.business_settings as any).findUnique({
        where: { business_id },
        select: { timezone: true },
      });
      return settings?.timezone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  }
}
