import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InactiveLeadScannerService } from './inactive-lead-scanner.service';

const QUEUE_NAME = 'workflow-inactive-scanner';

/**
 * Hourly BullMQ consumer that delegates to InactiveLeadScannerService.runScan().
 * The repeat job that fires this is registered by the service's onModuleInit.
 */
@Processor(QUEUE_NAME)
export class InactiveScannerProcessor extends WorkerHost {
  private readonly logger = new Logger(InactiveScannerProcessor.name);

  constructor(private readonly scanner: InactiveLeadScannerService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'scan-inactive') return;
    try {
      await this.scanner.runScan();
    } catch (err: any) {
      this.logger.error(`Inactive-lead scan job failed: ${err.message}`, err.stack);
      throw err;
    }
  }
}
