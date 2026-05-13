import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const businessId = req.user?.business_id;
    if (!businessId) throw new ForbiddenException('No business context');

    const sub = await this.subscriptionService.getSubscription(businessId);
    if (!sub) throw new ForbiddenException('No active subscription. Please subscribe to continue.');

    if (['cancelled', 'expired'].includes(sub.status)) {
      throw new ForbiddenException('Subscription has expired. Please renew to continue.');
    }

    if (sub.status === 'past_due') {
      // CRITICAL-7: Use past_due_since (set once on first failure) not updated_at
      // (which changes on any field write and would give an inaccurate grace window).
      const since = sub.past_due_since ?? sub.updated_at;
      const daysSinceFailed = (Date.now() - since.getTime()) / 86400000;
      if (daysSinceFailed > 3) {
        throw new ForbiddenException('Payment failed. Please update your payment method.');
      }
    }

    return true;
  }
}
