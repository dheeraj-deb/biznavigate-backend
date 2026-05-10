import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SubscriptionScheduler {
  private readonly logger = new Logger(SubscriptionScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs every day at 09:00 UTC
  @Cron('0 9 * * *', { name: 'dunning-check' })
  async runDunningCheck() {
    this.logger.log('Running dunning check...');

    const now = new Date();
    const day3 = new Date(now.getTime() - 3 * 86400000);
    const day7 = new Date(now.getTime() - 7 * 86400000);
    const day14 = new Date(now.getTime() - 14 * 86400000);

    // Day 14+: cancel subscriptions that have been past_due for 14+ days
    const toLapse = await this.prisma.billing_subscriptions.findMany({
      where: { status: 'past_due', updated_at: { lte: day14 } },
      include: { businesses: { select: { business_id: true, business_name: true } } },
    });

    for (const sub of toLapse) {
      await this.prisma.billing_subscriptions.update({
        where: { subscription_id: sub.subscription_id },
        data: { status: 'cancelled', cancelled_at: now, updated_at: now },
      });
      this.logger.warn(
        `Dunning D14: subscription ${sub.subscription_id} cancelled (business ${(sub.businesses as any)?.business_name ?? sub.business_id})`,
      );
    }

    // Day 7–13: service suspended — log for ops team; enforcement is via SubscriptionGuard (past_due + >3 days)
    const toSuspend = await this.prisma.billing_subscriptions.findMany({
      where: { status: 'past_due', updated_at: { lte: day7, gt: day14 } },
    });
    if (toSuspend.length > 0) {
      this.logger.warn(
        `Dunning D7: ${toSuspend.length} business(es) suspended (SubscriptionGuard blocking access)`,
      );
    }

    // Day 3–6: second alert — log for ops/notification team
    const toAlert = await this.prisma.billing_subscriptions.findMany({
      where: { status: 'past_due', updated_at: { lte: day3, gt: day7 } },
    });
    if (toAlert.length > 0) {
      this.logger.warn(
        `Dunning D3: ${toAlert.length} business(es) need payment reminder`,
      );
    }

    this.logger.log(
      `Dunning check complete — cancelled: ${toLapse.length}, suspended: ${toSuspend.length}, alerts: ${toAlert.length}`,
    );
  }
}
