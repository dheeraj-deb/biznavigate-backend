import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, Logger, Inject, InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RAZORPAY_CLIENT } from '../razorpay.provider';
import { RazorpayClient } from '../razorpay.types';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject(RAZORPAY_CLIENT) private readonly razorpay: RazorpayClient,
  ) {}

  async getSubscription(businessId: string) {
    return this.prisma.billing_subscriptions.findUnique({
      where: { business_id: businessId },
      include: { plan: true },
    });
  }

  async ensureTrialSubscription(businessId: string) {
    const existing = await this.getSubscription(businessId);
    if (existing) return existing;

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    const subscription = await this.prisma.$transaction(async (tx) => {
      await tx.billing_plans.createMany({
        data: [
          {
            plan_id: 'trial_default',
            name: 'Trial',
            business_type: 'all',
            tier: 'trial',
            amount: 0,
            interval: 'monthly',
            interval_count: 1,
            initial_credits: 0,
            features: {
              crm: true,
              whatsapp: true,
              campaigns: true,
              automations: true,
            },
            is_active: true,
          },
        ],
        skipDuplicates: true,
      });

      await tx.billing_subscriptions.createMany({
        data: [
          {
            business_id: businessId,
            plan_id: 'trial_default',
            status: 'active',
            current_period_start: now,
            current_period_end: trialEnd,
            trial_end: trialEnd,
            metadata: {
              source: 'auto_trial',
              created_by: 'subscription_guard',
            },
          },
        ],
        skipDuplicates: true,
      });

      const trial = await tx.billing_subscriptions.findUnique({
        where: { business_id: businessId },
        include: { plan: true },
      });

      if (!trial) {
        throw new InternalServerErrorException('Failed to provision trial subscription');
      }

      return trial;
    });

    await this.walletService.ensureWallet(businessId);
    this.logger.log(`Trial subscription provisioned: business=${businessId}`);

    return subscription;
  }

  async create(businessId: string, planId: string) {
    const plan = await this.prisma.billing_plans.findUnique({ where: { plan_id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (!plan.razorpay_plan_id) {
      throw new BadRequestException('This plan is not yet active. Contact support.');
    }

    const existing = await this.prisma.billing_subscriptions.findUnique({
      where: { business_id: businessId },
    });
    if (existing && ['active', 'authenticated', 'created'].includes(existing.status)) {
      throw new ConflictException(`Business already has a ${existing.status} subscription`);
    }

    const totalCount = plan.interval === 'yearly' ? 1 : 120; // 10 years monthly = effectively perpetual
    const rzpSub = await this.razorpay.subscriptions.create({
      plan_id: plan.razorpay_plan_id,
      customer_notify: 1,
      quantity: 1,
      total_count: totalCount,
      notes: { business_id: businessId, plan_id: planId },
    });

    const sub = await this.prisma.billing_subscriptions.upsert({
      where: { business_id: businessId },
      create: {
        business_id: businessId,
        plan_id: planId,
        razorpay_subscription_id: rzpSub.id,
        status: rzpSub.status,
        metadata: rzpSub as object,
      },
      update: {
        plan_id: planId,
        razorpay_subscription_id: rzpSub.id,
        status: rzpSub.status,
        cancelled_at: null,
        cancel_at_period_end: false,
        updated_at: new Date(),
      },
    });

    this.logger.log(`Subscription created: business=${businessId} plan=${planId} rzp=${rzpSub.id}`);
    return { subscription_id: sub.subscription_id, checkout_url: rzpSub.short_url, status: rzpSub.status };
  }

  async cancel(businessId: string) {
    const sub = await this.prisma.billing_subscriptions.findUnique({ where: { business_id: businessId } });
    if (!sub) throw new NotFoundException('No active subscription');
    if (['cancelled', 'expired'].includes(sub.status)) {
      throw new ConflictException('Subscription is already cancelled');
    }

    if (sub.razorpay_subscription_id) {
      await this.razorpay.subscriptions.cancel(sub.razorpay_subscription_id, { cancel_at_cycle_end: 1 });
    }

    return this.prisma.billing_subscriptions.update({
      where: { business_id: businessId },
      data: { cancel_at_period_end: true, updated_at: new Date() },
    });
  }

  async pause(businessId: string, pauseStart: string, pauseEnd: string) {
    const sub = await this.prisma.billing_subscriptions.findUnique({ where: { business_id: businessId } });
    if (!sub || sub.status !== 'active') throw new BadRequestException('Only active subscriptions can be paused');

    if (sub.razorpay_subscription_id) {
      await this.razorpay.subscriptions.pause(sub.razorpay_subscription_id, { pause_at: 'now' });
    }

    return this.prisma.billing_subscriptions.update({
      where: { business_id: businessId },
      data: {
        status: 'paused',
        pause_start: new Date(pauseStart),
        pause_end: new Date(pauseEnd),
        updated_at: new Date(),
      },
    });
  }

  async resume(businessId: string) {
    const sub = await this.prisma.billing_subscriptions.findUnique({ where: { business_id: businessId } });
    if (!sub || sub.status !== 'paused') throw new BadRequestException('Subscription is not paused');

    if (sub.razorpay_subscription_id) {
      await this.razorpay.subscriptions.resume(sub.razorpay_subscription_id, { resume_at: 'now' });
    }

    return this.prisma.billing_subscriptions.update({
      where: { business_id: businessId },
      data: { status: 'active', pause_start: null, pause_end: null, updated_at: new Date() },
    });
  }

  // ── Webhook handlers ──────────────────────────────────────────────────────

  async handleActivated(rzpSubId: string, entity: any) {
    const sub = await this.prisma.billing_subscriptions.findUnique({
      where: { razorpay_subscription_id: rzpSubId },
      include: { plan: true },
    });
    if (!sub) return this.logger.warn(`handleActivated: subscription ${rzpSubId} not found`);

    await this.prisma.billing_subscriptions.update({
      where: { subscription_id: sub.subscription_id },
      data: {
        status: 'active',
        past_due_since: null,
        current_period_start: entity.current_start ? new Date(entity.current_start * 1000) : undefined,
        current_period_end: entity.current_end ? new Date(entity.current_end * 1000) : undefined,
        updated_at: new Date(),
      },
    });

    // Auto-credit wallet with plan's included credits
    await this.walletService.creditWallet(
      sub.business_id,
      parseFloat(sub.plan.initial_credits.toString()),
      rzpSubId,
      'subscription',
      `${sub.plan.name} — activation credits`,
    );

    this.logger.log(`Subscription activated: ${rzpSubId} → credited ₹${sub.plan.initial_credits}`);
  }

  async handleCharged(rzpSubId: string, paymentId: string, amountPaise: number, entity: any) {
    const sub = await this.prisma.billing_subscriptions.findUnique({
      where: { razorpay_subscription_id: rzpSubId },
      include: { plan: true },
    });
    if (!sub) return this.logger.warn(`handleCharged: subscription ${rzpSubId} not found`);

    await this.prisma.billing_subscriptions.update({
      where: { subscription_id: sub.subscription_id },
      data: {
        status: 'active',
        past_due_since: null,
        current_period_start: entity.current_start ? new Date(entity.current_start * 1000) : undefined,
        current_period_end: entity.current_end ? new Date(entity.current_end * 1000) : undefined,
        updated_at: new Date(),
      },
    });

    // Record payment (idempotent)
    await this.prisma.billing_payments.upsert({
      where: { razorpay_payment_id: paymentId },
      create: {
        business_id: sub.business_id,
        razorpay_payment_id: paymentId,
        amount: amountPaise,
        type: 'subscription',
        status: 'captured',
        idempotency_key: paymentId,
      },
      update: { status: 'captured' },
    });

    // Generate invoice with 18% GST
    const subtotal = Math.round(amountPaise / 1.18);
    const taxAmount = amountPaise - subtotal;
    await this.prisma.billing_invoices.create({
      data: {
        business_id: sub.business_id,
        subscription_id: sub.subscription_id,
        razorpay_invoice_id: paymentId,
        subtotal,
        tax_amount: taxAmount,
        total_amount: amountPaise,
        status: 'paid',
        paid_at: new Date(),
      },
    });

    // Re-credit wallet with plan's monthly allocation
    await this.walletService.creditWallet(
      sub.business_id,
      parseFloat(sub.plan.initial_credits.toString()),
      paymentId,
      'subscription',
      `${sub.plan.name} — renewal credits`,
    );

    this.logger.log(`Subscription charged: ${rzpSubId} ₹${amountPaise / 100} → credited ₹${sub.plan.initial_credits}`);
  }

  async handlePaymentFailed(rzpSubId: string) {
    // CRITICAL-7: Set past_due_since only on first transition so the guard's
    // grace window is anchored to when the payment actually failed, not the
    // last updated_at which changes on every field write.
    await this.prisma.billing_subscriptions.updateMany({
      where: { razorpay_subscription_id: rzpSubId, past_due_since: null },
      data: { status: 'past_due', past_due_since: new Date(), updated_at: new Date() },
    });
    // Ensure status is set even if past_due_since was already set (re-attempt)
    await this.prisma.billing_subscriptions.updateMany({
      where: { razorpay_subscription_id: rzpSubId },
      data: { status: 'past_due', updated_at: new Date() },
    });
    this.logger.warn(`Subscription past_due: ${rzpSubId}`);
  }

  async handleCancelled(rzpSubId: string) {
    await this.prisma.billing_subscriptions.updateMany({
      where: { razorpay_subscription_id: rzpSubId },
      data: { status: 'cancelled', cancelled_at: new Date(), updated_at: new Date() },
    });
    this.logger.log(`Subscription cancelled: ${rzpSubId}`);
  }

  async handlePaused(rzpSubId: string, entity: any) {
    await this.prisma.billing_subscriptions.updateMany({
      where: { razorpay_subscription_id: rzpSubId },
      data: { status: 'paused', updated_at: new Date() },
    });
  }

  async handleResumed(rzpSubId: string) {
    await this.prisma.billing_subscriptions.updateMany({
      where: { razorpay_subscription_id: rzpSubId },
      data: { status: 'active', pause_start: null, pause_end: null, updated_at: new Date() },
    });
  }
}
