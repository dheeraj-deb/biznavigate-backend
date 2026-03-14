import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SubscriptionsRepository } from "./subscription.repository.interface";
import { AssignSubscriptionDto } from "../application/dto/assign-subscription.dto";
import { CancelSubscriptionDto } from "../application/dto/cancel-subscription.dto";


@Injectable()
export class SubscriptionsRepositoryPrisma implements SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assignPlan(dto: AssignSubscriptionDto) {
    try {
      return await this.prisma.subscription_plans.findUnique({
        where: { subscription_plan_id: dto.subscription_plan_id },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async cancelPlan(dto: CancelSubscriptionDto) {
    try {
      return await this.prisma.businesses.findUnique({
        where: { business_id: dto.business_id },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getBusinessSubscription(business_id: string) {
    try {
      return await this.prisma.businesses.findUnique({
        where: { business_id },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listPlans() {
    try {
      return await this.prisma.subscription_plans.findMany();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
