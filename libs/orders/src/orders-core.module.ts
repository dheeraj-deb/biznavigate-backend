import { Module } from '@nestjs/common';
import { OrderService } from './application/services/order.service';
import { StockReservationService } from './application/services/stock-reservation.service';
import { OrderRepositoryPrisma } from './infrastructure/order.repository.prisma';
import { PrismaModule } from '@biznavigate/prisma';

/**
 * OrdersCoreModule — service layer only, no controllers, no queue processors,
 * no cross-feature dependencies. Safe to import by the agent worker process.
 */
@Module({
  imports: [PrismaModule],
  providers: [OrderService, OrderRepositoryPrisma, StockReservationService],
  exports: [OrderService, OrderRepositoryPrisma, StockReservationService],
})
export class OrdersCoreModule {}
