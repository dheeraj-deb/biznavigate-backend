import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  AGENT_QUEUE_NAME,
  AgentJobType,
  ProcessMessageJobPayload,
} from '@biznavigate/common';
import { AgentService } from './agent.service';

@Processor(AGENT_QUEUE_NAME, {
  concurrency: 5, // tune to your OpenAI rate limits
})
export class AgentProcessor extends WorkerHost {
  private readonly logger = new Logger(AgentProcessor.name);

  constructor(private readonly agentService: AgentService) {
    super();
  }

  async process(job: Job<ProcessMessageJobPayload>): Promise<string> {
    if (job.name !== AgentJobType.PROCESS_MESSAGE) {
      this.logger.warn(`Unknown job type: ${job.name} — skipping`);
      return '';
    }

    const { text, businessId, leadId, phone, conversationId, enqueuedAt } =
      job.data;

    // Drop stale jobs that sat in the queue for > 2 minutes
    const age = Date.now() - new Date(enqueuedAt).getTime();
    if (age > 2 * 60 * 1000) {
      this.logger.warn(
        `Dropping stale job ${job.id} for conversation ${conversationId} (age: ${age}ms)`,
      );
      return '';
    }

    this.logger.debug(
      `Processing message for conversation ${conversationId} (job ${job.id})`,
    );

    const reply = await this.agentService.processMessage(text, {
      businessId,
      leadId,
      phone,
      conversationId,
    });

    return reply;
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
      error.stack,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} completed`);
  }
}
