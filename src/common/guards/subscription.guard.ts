import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FEATURE_KEY, SKIP_SUBSCRIPTION_KEY } from '../decorators/require-feature.decorator';
import { PrismaService } from '../../prisma/prisma.service';

interface PlanFeatures {
  [feature: string]: boolean;
}

/**
 * SubscriptionGuard — enforces subscription-based feature access.
 *
 * Only activates when @RequireFeature('feature_name') is present on the
 * controller or handler. All existing routes without the decorator pass through
 * unchanged, making this fully backward-compatible.
 *
 * Cache strategy: plan features are cached for 5 minutes per business (same
 * pattern as user active status in jwt.strategy.ts).
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if subscription check is explicitly skipped
    const skipCheck = this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipCheck) return true;

    // Check if a feature requirement is set
    const requiredFeature = this.reflector.getAllAndOverride<string>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No feature requirement — pass through
    if (!requiredFeature) return true;

    const request = context.switchToHttp().getRequest();
    const businessId = request.user?.business_id;

    // No authenticated user — let JwtAuthGuard handle this
    if (!businessId) return true;

    const features = await this.getBusinessFeatures(businessId);

    if (!features || features[requiredFeature] !== true) {
      throw new ForbiddenException(
        `Feature '${requiredFeature}' is not available on your current subscription plan.`,
      );
    }

    return true;
  }

  private async getBusinessFeatures(businessId: string): Promise<PlanFeatures | null> {
    const cacheKey = `plan:features:${businessId}`;

    // Cache-first lookup (5 minutes TTL — same as user active status)
    let features = await this.cacheManager.get<PlanFeatures>(cacheKey);

    if (features == null) {
      const subscription = await this.prisma.business_subscriptions.findFirst({
        where: {
          business_id: businessId,
          status: 'active',
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } },
          ],
        },
        include: { subscription_plans: true },
        orderBy: { started_at: 'desc' },
      });

      if (!subscription?.subscription_plans?.features) {
        return null;
      }

      features = subscription.subscription_plans.features as PlanFeatures;
      await this.cacheManager.set(cacheKey, features, 300000); // 5 minutes
    }

    return features;
  }
}
