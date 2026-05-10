import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(businessType?: string, interval?: string) {
    return this.prisma.billing_plans.findMany({
      where: {
        ...(businessType && { business_type: businessType }),
        ...(interval && { interval }),
        is_active: true,
      },
      orderBy: [{ business_type: 'asc' }, { amount: 'asc' }],
    });
  }

  async findOne(planId: string) {
    const plan = await this.prisma.billing_plans.findUnique({ where: { plan_id: planId } });
    if (!plan) throw new NotFoundException(`Plan ${planId} not found`);
    return plan;
  }

  getCreditPricing() {
    return this.prisma.credit_pricing.findMany({
      where: { is_active: true },
      orderBy: { action_type: 'asc' },
    });
  }
}
