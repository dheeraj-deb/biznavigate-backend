import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderController } from './application/controllers/order.controller';
import { OrderService } from './application/services/order.service';
import { StockReservationService } from './application/services/stock-reservation.service';
import { ReservationCleanupScheduler } from './application/services/reservation-cleanup.scheduler';
import { OrderRepositoryPrisma } from './infrastructure/order.repository.prisma';
import { ReservationCleanupProcessor } from './application/jobs/reservation-cleanup.processor';
import { OrderNotificationProcessor } from './application/jobs/order-notification.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { CustomersModule } from '../customers/customers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

/**
 * Orders Module
 * Handles all order management functionality with production-ready stock reservation
 * Dependencies: PrismaModule, CustomersModule, BullMQ
 */
@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    NotificationsModule,
    WhatsAppModule,
    BullModule.registerQueue({ name: 'reservation-cleanup' }),
    BullModule.registerQueue({ name: 'order-notifications' }),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepositoryPrisma,
    StockReservationService,
    ReservationCleanupScheduler,
    ReservationCleanupProcessor,
    OrderNotificationProcessor,
  ],
  exports: [OrderService, OrderRepositoryPrisma, StockReservationService],
})
export class OrdersModule {}
