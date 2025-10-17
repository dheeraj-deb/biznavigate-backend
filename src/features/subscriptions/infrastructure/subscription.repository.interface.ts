
import { AssignSubscriptionDto } from "../application/dto/assign-subscription.dto";
import { CancelSubscriptionDto } from "../application/dto/cancel-subscription.dto";
import { SubscriptionResponseDto } from "../application/dto/subscription-response.dto";

export interface SubscriptionsRepository {
  assignPlan(dto: AssignSubscriptionDto): Promise<SubscriptionResponseDto>;
  cancelPlan(dto: CancelSubscriptionDto): Promise<SubscriptionResponseDto>;
  getBusinessSubscription(
    business_id: string
  ): Promise<SubscriptionResponseDto>;
  listPlans(): Promise<any[]>;
}
