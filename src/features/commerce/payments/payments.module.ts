import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './application/controllers/payment.controller';
import { PaymentService } from './application/services/payment.service';
import { PaymentWebhookService } from './application/services/payment-webhook.service';
import { PaymentCapturedListener } from './application/listeners/payment-captured.listener';
import { PaymentRepositoryPrisma } from './infrastructure/payment.repository.prisma';
import { RazorpayService } from './infrastructure/razorpay.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';

/**
 * Payments Module
 * Handles all payment processing with Razorpay integration
 * Production-ready with webhook handling, signature verification, and refunds
 * Dependencies: PrismaModule, OrdersModule, ConfigModule
 */
@Module({
  imports: [
    PrismaModule,
    OrdersModule, // Import orders module for order confirmation
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentWebhookService,
    PaymentCapturedListener,
    PaymentRepositoryPrisma,
    RazorpayService,
  ],
  exports: [PaymentService, PaymentRepositoryPrisma, RazorpayService],
})
export class PaymentsModule {}
