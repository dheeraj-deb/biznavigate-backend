import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentRepositoryPrisma } from '../../infrastructure/payment.repository.prisma';
import { PaymentService } from '../services/payment.service';
import { PaymentStatus } from '../../domain/entities/payment.entity';

@Injectable()
export class PaymentCapturedListener {
  private readonly logger = new Logger(PaymentCapturedListener.name);

  constructor(
    private readonly paymentRepository: PaymentRepositoryPrisma,
    private readonly paymentService: PaymentService,
  ) {}

  @OnEvent('razorpay.payment.captured')
  async handle(paymentEntity: any) {
    const razorpayPaymentId: string = paymentEntity?.id;
    const razorpayOrderId: string = paymentEntity?.order_id;
    if (!razorpayOrderId) return;

    this.logger.log(`Order payment captured: ${razorpayPaymentId} order=${razorpayOrderId}`);

    const payment =
      await this.paymentRepository.findByRazorpayOrderId(razorpayOrderId) ??
      await this.paymentRepository.findByRazorpayPaymentId(razorpayPaymentId);

    if (!payment) {
      this.logger.warn(`No payment record found for razorpay_order_id=${razorpayOrderId}`);
      return;
    }

    if (payment.status === PaymentStatus.CAPTURED) {
      this.logger.log(`Payment ${payment.payment_id} already captured, skipping`);
      return;
    }

    await this.paymentRepository.updateStatus(payment.payment_id, PaymentStatus.CAPTURED, {
      razorpay_payment_id: razorpayPaymentId,
      method: paymentEntity.method,
      captured_at: new Date(),
      webhook_processed_at: new Date(),
    });

    try {
      await this.paymentService.capturePayment(payment.payment_id);
    } catch (err) {
      this.logger.error(`Order confirmation failed for payment ${payment.payment_id}: ${err.message}`);
    }
  }
}
