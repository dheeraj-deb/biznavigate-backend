import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionService } from '../subscription/subscription.service';
import { WalletService } from '../wallet/wallet.service';
import { PrismaService } from '../../../prisma/prisma.service';

interface WebhookJobData {
  eventId: string;
  idempotencyKey: string;
  eventType: string;
  payload: any;
}

@Processor('billing-webhooks')
export class RazorpayWebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(RazorpayWebhookProcessor.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<void> {
    const { eventId, eventType, payload } = job.data;
    this.logger.log(`Processing webhook: ${eventType} (attempt ${job.attemptsMade + 1})`);

    try {
      await this.route(eventType, payload);

      await this.prisma.billing_webhook_events.update({
        where: { event_id: eventId },
        data: { status: 'processed', processed_at: new Date() },
      });
    } catch (err) {
      await this.prisma.billing_webhook_events.update({
        where: { event_id: eventId },
        data: {
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
          attempts: { increment: 1 },
        },
      });
      throw err; // re-throw so BullMQ retries
    }
  }

  private async route(eventType: string, payload: any) {
    const sub = payload.subscription?.entity;
    const payment = payload.payment?.entity;

    switch (eventType) {
      case 'subscription.activated':
        if (sub?.id) await this.subscriptionService.handleActivated(sub.id, sub);
        break;

      case 'subscription.charged':
        if (sub?.id && payment?.id) {
          await this.subscriptionService.handleCharged(sub.id, payment.id, payment.amount ?? 0, sub);
        }
        break;

      case 'subscription.pending':
        if (sub?.id) await this.subscriptionService.handlePaymentFailed(sub.id);
        break;

      case 'subscription.halted':
        if (sub?.id) await this.subscriptionService.handlePaymentFailed(sub.id);
        break;

      case 'subscription.cancelled':
        if (sub?.id) await this.subscriptionService.handleCancelled(sub.id);
        break;

      case 'subscription.paused':
        if (sub?.id) await this.subscriptionService.handlePaused(sub.id, sub);
        break;

      case 'subscription.resumed':
        if (sub?.id) await this.subscriptionService.handleResumed(sub.id);
        break;

      case 'payment.captured':
        if (payment?.notes?.type === 'wallet_topup' && payment?.notes?.business_id) {
          await this.walletService.handleTopupCapture(
            payment.notes.business_id,
            payment.id,
            payment.amount,
          );
        } else if (payment?.order_id) {
          // Order payment — emit event for PaymentsModule to process
          this.eventEmitter.emit('razorpay.payment.captured', payment);
        }
        break;

      default:
        this.logger.log(`Unhandled event type: ${eventType}`);
    }
  }
}
