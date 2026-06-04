import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayWebhookService {
  private readonly logger = new Logger(RazorpayWebhookService.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue('billing-webhooks') private readonly queue: Queue,
  ) {
    this.webhookSecret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET', '');
    if (!this.webhookSecret) {
      this.logger.warn('RAZORPAY_WEBHOOK_SECRET not set — webhook signature verification disabled');
    }
  }

  verifySignature(rawBody: Buffer, signature: string): boolean {
    if (!this.webhookSecret) return true; // dev mode — skip verification
    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  async processWebhook(rawBody: Buffer, signature: string) {
    if (!this.verifySignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString());
    const eventType: string = event.event;
    const payload = event.payload ?? {};

    // Build idempotency key from event type + primary entity ID
    const entityId =
      payload.payment?.entity?.id ||
      payload.subscription?.entity?.id ||
      payload.order?.entity?.id ||
      'unknown';
    const idempotencyKey = `${eventType}:${entityId}`;

    // Idempotency check — skip duplicate webhooks
    const existing = await this.prisma.billing_webhook_events.findUnique({
      where: { razorpay_event_id: idempotencyKey },
    });
    if (existing && existing.status === 'processed') {
      this.logger.log(`Duplicate webhook skipped: ${idempotencyKey}`);
      return { received: true, duplicate: true };
    }

    // Store event record
    const record = await this.prisma.billing_webhook_events.upsert({
      where: { razorpay_event_id: idempotencyKey },
      create: {
        provider: 'razorpay',
        event_type: eventType,
        razorpay_event_id: idempotencyKey,
        payload: event,
        status: 'pending',
      },
      update: { attempts: { increment: 1 } },
    });

    // Queue for async processing — return 200 immediately
    await this.queue.add(
      'process-webhook',
      { eventId: record.event_id, idempotencyKey, eventType, payload },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );

    this.logger.log(`Webhook queued: ${eventType} (${entityId})`);
    return { received: true };
  }
}
