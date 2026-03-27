import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaModule } from '../../prisma/prisma.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { HoldCleanupProcessor, HOLD_CLEANUP_QUEUE } from './hold-cleanup.job';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: HOLD_CLEANUP_QUEUE }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, HoldCleanupProcessor],
  exports: [InventoryService],
})
export class InventoryModule implements OnModuleInit {
  constructor(
    @InjectQueue(HOLD_CLEANUP_QUEUE) private readonly holdCleanupQueue: Queue,
  ) {}

  async onModuleInit() {
    // Run every 5 minutes to release expired holds
    await this.holdCleanupQueue.add(
      'cleanup',
      {},
      { repeat: { every: 5 * 60 * 1000 }, removeOnComplete: true },
    );
  }
}
