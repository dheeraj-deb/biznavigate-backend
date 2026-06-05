import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { SubscriptionsRepository } from "../infrastructure/subscription.repository.interface";
import { AssignSubscriptionDto } from "./dto/assign-subscription.dto";
import { CancelSubscriptionDto } from "./dto/cancel-subscription.dto";


@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject("SubscriptionsRepository")
    private readonly subscriptionsRepo: SubscriptionsRepository
  ) {}

  async assignPlan(dto: AssignSubscriptionDto) {
    const business = await this.subscriptionsRepo.assignPlan(dto);
    if (!business) throw new NotFoundException("Business not found");
    return business;
  }

  async cancelPlan(dto: CancelSubscriptionDto) {
    const business = await this.subscriptionsRepo.cancelPlan(dto);
    if (!business) throw new NotFoundException("Business not found");
    return business;
  }

  async getBusinessSubscription(business_id: string) {
    const subscription = await this.subscriptionsRepo.getBusinessSubscription(business_id);
    if (!subscription) throw new NotFoundException("Business not found");
    return subscription;
  }

  async listPlans() {
    return this.subscriptionsRepo.listPlans();
  }
}
