import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../../platform/billing/subscription/subscription.guard';
import { LeadQueryService } from '../application/services/lead-query.service';

@Controller('ai-manager')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard)
export class AiManagerController {
  constructor(private readonly leadQueries: LeadQueryService) {}

  @Get('today')
  getToday(@Req() req: any) {
    return this.leadQueries.getAiManagerToday(req.user.business_id);
  }

  @Get('employees')
  getEmployees(@Req() req: any) {
    return this.leadQueries.getAiManagerToday(req.user.business_id);
  }
}
