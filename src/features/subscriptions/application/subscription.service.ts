import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { SubscriptionsRepository } from "../infrastructure/subscription.repository.interface";
import { AssignSubscriptionDto } from "./dto/assign-subscription.dto";
import { CancelSubscriptionDto } from "./dto/cancel-subscription.dto";

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject("SubscriptionsRepository")
    private readonly subscriptionsRepo: SubscriptionsRepository,
  ) {}

  async assignPlan(dto: AssignSubscriptionDto) {
    return this.subscriptionsRepo.assignPlan(dto);
  }

  async cancelPlan(dto: CancelSubscriptionDto) {
    return this.subscriptionsRepo.cancelPlan(dto);
  }

  async getBusinessSubscription(business_id: string) {
    const subscription = await this.subscriptionsRepo.getBusinessSubscription(business_id);
    if (!subscription) throw new NotFoundException("No active subscription found");
    return subscription;
  }

  async listPlans() {
    return this.subscriptionsRepo.listPlans();
  }
}
