import {
  Controller, Get, Post, Patch, Delete,
  Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { PauseSubscriptionDto } from '../dto/pause-subscription.dto';

@ApiTags('Billing')
@Controller('billing/subscription')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get current subscription with plan details. Returns null if no subscription yet.' })
  async getSubscription(@Req() req: any) {
    const sub = await this.subscriptionService.getSubscription(req.user.business_id);
    return sub ?? null;
  }

  @Post()
  @ApiOperation({ summary: 'Create subscription. Returns Razorpay checkout URL for payment authorization.' })
  createSubscription(@Req() req: any, @Body() body: CreateSubscriptionDto) {
    return this.subscriptionService.create(req.user.business_id, body.plan_id);
  }

  @Patch('pause')
  @ApiOperation({ summary: 'Pause subscription for off-season (monsoon pause)' })
  pauseSubscription(
    @Req() req: any,
    @Body() body: PauseSubscriptionDto,
  ) {
    return this.subscriptionService.pause(req.user.business_id, body.pause_start, body.pause_end);
  }

  @Patch('resume')
  @ApiOperation({ summary: 'Resume paused subscription early' })
  resumeSubscription(@Req() req: any) {
    return this.subscriptionService.resume(req.user.business_id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription at end of current period' })
  cancelSubscription(@Req() req: any) {
    return this.subscriptionService.cancel(req.user.business_id);
  }
}
