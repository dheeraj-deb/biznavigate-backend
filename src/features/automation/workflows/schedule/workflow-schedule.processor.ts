import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScheduleTriggerRunner } from './schedule-trigger-runner';

const QUEUE_NAME = 'workflow-schedules';

interface ScheduledFirePayload {
  workflow_id: string;
  business_id: string;
}

/**
 * BullMQ consumer for the workflow-schedules queue. Each fire delegates to
 * ScheduleTriggerRunner which expands the audience and starts workflows.
 * Errors here only fail the BullMQ attempt — they do not block other jobs.
 */
@Processor(QUEUE_NAME)
export class WorkflowScheduleProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowScheduleProcessor.name);

  constructor(private readonly runner: ScheduleTriggerRunner) {
    super();
  }

  async process(job: Job<ScheduledFirePayload>) {
    if (job.name !== 'schedule-fire') return;
    const { workflow_id, business_id } = job.data;
    if (!workflow_id || !business_id) {
      this.logger.warn(`Skipping schedule-fire job ${job.id} — missing identifiers`);
      return;
    }
    this.logger.log(`Schedule fire ${workflow_id} (business ${business_id})`);
    try {
      await this.runner.run(workflow_id, business_id);
    } catch (err: any) {
      this.logger.error(`Schedule fire ${workflow_id} failed: ${err.message}`, err.stack);
      throw err; // surface to BullMQ for retry/backoff
    }
  }
}
