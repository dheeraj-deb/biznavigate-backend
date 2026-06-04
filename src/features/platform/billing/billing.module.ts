import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { RazorpayProvider } from './razorpay.provider';

import { PlansService } from './plans/plans.service';
import { PlansController } from './plans/plans.controller';

import { WalletService } from './wallet/wallet.service';
import { WalletController } from './wallet/wallet.controller';
import { WalletScheduler } from './wallet/wallet.scheduler';

import { SubscriptionService } from './subscription/subscription.service';
import { SubscriptionController } from './subscription/subscription.controller';
import { SubscriptionGuard } from './subscription/subscription.guard';
import { SubscriptionScheduler } from './subscription/subscription.scheduler';

import { InvoiceService } from './invoice/invoice.service';
import { InvoiceController } from './invoice/invoice.controller';

import { RazorpayWebhookService } from './webhook/razorpay-webhook.service';
import { RazorpayWebhookController } from './webhook/razorpay-webhook.controller';
import { RazorpayWebhookProcessor } from './webhook/razorpay-webhook.processor';
import { CheckpointCleanupScheduler } from './webhook/checkpoint-cleanup.scheduler';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: 'billing-webhooks' }),
  ],
  controllers: [
    PlansController,
    SubscriptionController,
    WalletController,
    InvoiceController,
    RazorpayWebhookController,
  ],
  providers: [
    RazorpayProvider,
    PlansService,
    WalletService,
    WalletScheduler,
    SubscriptionService,
    SubscriptionGuard,
    SubscriptionScheduler,
    InvoiceService,
    RazorpayWebhookService,
    RazorpayWebhookProcessor,
    CheckpointCleanupScheduler,
  ],
  exports: [WalletService, SubscriptionService, SubscriptionGuard],
})
export class BillingModule {}
