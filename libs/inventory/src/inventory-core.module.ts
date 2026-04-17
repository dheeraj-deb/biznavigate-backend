import { Module } from '@nestjs/common';
import { InventoryService } from './application/services/inventory.service';
import { PrismaModule } from '@biznavigate/prisma';

/**
 * InventoryCoreModule — service layer only, no BullMQ queue, no hold-cleanup processor.
 * Safe to import by the agent worker process.
 */
@Module({
  imports: [PrismaModule],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryCoreModule {}
