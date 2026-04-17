import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards';
import { CampaignService } from './campaign.service';

/**
 * Alias controller so the frontend path POST /crm/campaigns/bulk works.
 * The same sendBulkQuickMessage is also reachable at POST /campaigns/bulk.
 */
@Controller('crm/campaigns')
@UseGuards(JwtAuthGuard)
export class CrmCampaignController {
  constructor(private readonly service: CampaignService) {}

  @Post('bulk')
  bulkQuickSend(
    @Req() req: any,
    @Body() body: { lead_ids: string[]; message: string },
  ) {
    return this.service.sendBulkQuickMessage(req.user.business_id, body.lead_ids, body.message);
  }
}
