import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InventoryService } from './inventory.service';

export const HOLD_CLEANUP_QUEUE = 'hold-cleanup';

@Processor(HOLD_CLEANUP_QUEUE, { concurrency: 1 })
export class HoldCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(HoldCleanupProcessor.name);

  constructor(private readonly inventoryService: InventoryService) {
    super();
  }

  async process(job: Job): Promise<any> {
    const released = await this.inventoryService.releaseExpiredHolds();
    if (released > 0) {
      this.logger.log(`Released ${released} expired service holds`);
    }
    return { released };
  }
}
