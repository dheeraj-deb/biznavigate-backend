import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@ApiTags('Billing')
@Controller('billing')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List available plans by business type' })
  getPlans(
    @Query('business_type') businessType?: string,
    @Query('interval') interval?: string,
  ) {
    return this.plansService.findAll(businessType, interval);
  }

  @Get('credit-pricing')
  @ApiOperation({ summary: 'List per-action credit costs (public)' })
  getCreditPricing() {
    return this.plansService.getCreditPricing();
  }
}
