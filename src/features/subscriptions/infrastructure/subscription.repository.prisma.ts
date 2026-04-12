import { Injectable, BadRequestException, NotFoundException, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "src/prisma/prisma.service";
import { SubscriptionsRepository } from "./subscription.repository.interface";
import { AssignSubscriptionDto } from "../application/dto/assign-subscription.dto";
import { CancelSubscriptionDto } from "../application/dto/cancel-subscription.dto";

@Injectable()
export class SubscriptionsRepositoryPrisma implements SubscriptionsRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async assignPlan(dto: AssignSubscriptionDto) {
    try {
      const [plan, business] = await Promise.all([
        this.prisma.subscription_plans.findUnique({
          where: { subscription_plan_id: dto.subscription_plan_id },
        }),
        this.prisma.businesses.findUnique({
          where: { business_id: dto.business_id },
        }),
      ]);

      if (!plan) throw new NotFoundException("Subscription plan not found");
      if (!business) throw new NotFoundException("Business not found");

      // Cancel any existing active subscription first
      await this.prisma.business_subscriptions.updateMany({
        where: { business_id: dto.business_id, status: 'active' },
        data: { status: 'cancelled', cancelled_at: new Date() },
      });

      const expiresAt = plan.duration_in_days
        ? new Date(Date.now() + plan.duration_in_days * 24 * 60 * 60 * 1000)
        : null;

      const subscription = await this.prisma.business_subscriptions.create({
        data: {
          business_id: dto.business_id,
          subscription_plan_id: dto.subscription_plan_id,
          status: 'active',
          started_at: new Date(),
          ...(expiresAt ? { expires_at: expiresAt } : {}),
        },
        include: { subscription_plans: true },
      });

      // Invalidate cached plan features for this business
      await this.cacheManager.del(`plan:features:${dto.business_id}`);

      return subscription;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async cancelPlan(dto: CancelSubscriptionDto) {
    try {
      const result = await this.prisma.business_subscriptions.updateMany({
        where: { business_id: dto.business_id, status: 'active' },
        data: { status: 'cancelled', cancelled_at: new Date() },
      });

      if (result.count === 0) {
        throw new NotFoundException("No active subscription found for this business");
      }

      await this.cacheManager.del(`plan:features:${dto.business_id}`);

      return { business_id: dto.business_id, status: 'cancelled' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async getBusinessSubscription(business_id: string) {
    try {
      return await this.prisma.business_subscriptions.findFirst({
        where: {
          business_id,
          status: 'active',
          OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
        },
        include: { subscription_plans: true },
        orderBy: { started_at: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listPlans() {
    try {
      return await this.prisma.subscription_plans.findMany({
        where: { is_active: true },
        orderBy: { price: 'asc' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
