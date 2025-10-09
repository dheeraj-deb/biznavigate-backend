import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CampaignService } from '../features/campaigns/application/services/campaign.service';
import { WhatsAppService } from '../services/whatsapp.service';

/**
 * Worker for sending campaign messages
 */
@Processor('campaigns')
export class CampaignWorker extends WorkerHost {
  private readonly logger = new Logger(CampaignWorker.name);

  constructor(
    private readonly campaignService: CampaignService,
    private readonly whatsappService: WhatsAppService
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { campaignId, recipientPhone, recipientName, message } = job.data;

    this.logger.log(`Sending campaign ${campaignId} to ${recipientPhone}`);

    try {
      // Send message
      await this.whatsappService.sendMessage(
        recipientPhone,
        campaignId, // Using campaignId as organizationId placeholder
        { message }
      );

      // Track sent
      await this.campaignService.trackSent(campaignId);

      // Track delivered (simplified - in production, use webhooks)
      await this.campaignService.trackDelivered(campaignId);

      this.logger.log(`Campaign message sent to ${recipientPhone}`);

      return {
        campaignId,
        recipientPhone,
        status: 'sent',
      };
    } catch (error) {
      this.logger.error(`Failed to send campaign to ${recipientPhone}:`, error);

      // Track failure
      const campaign = await this.campaignService.getCampaign(campaignId);
      campaign['incrementFailed']();
      await this.campaignService['saveCampaign'](campaign);

      throw error;
    }
  }
}
