import { Controller, Get, Post, Body, Param } from "@nestjs/common";

import { AssignSubscriptionDto } from "../application/dto/assign-subscription.dto";
import { CancelSubscriptionDto } from "../application/dto/cancel-subscription.dto";
import { SubscriptionsService } from "../application/subscription.service";


@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Post("assign")
  assignPlan(@Body() dto: AssignSubscriptionDto) {
    return this.service.assignPlan(dto);
  }

  @Post("cancel")
  cancelPlan(@Body() dto: CancelSubscriptionDto) {
    return this.service.cancelPlan(dto);
  }

  @Get("business/:id")
  getBusinessSubscription(@Param("id") id: string) {
    return this.service.getBusinessSubscription(id);
  }

  @Get("plans")
  listPlans() {
    return this.service.listPlans();
  }
}
