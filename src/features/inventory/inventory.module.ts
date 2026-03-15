import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
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
export class InventoryModule {}
