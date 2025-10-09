import { Injectable, Logger } from '@nestjs/common';
import { Campaign, CampaignType, CampaignStatus, TargetAudience } from '../../domain/campaign.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Campaign service for managing broadcast campaigns
 */
@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('campaigns') private campaignQueue: Queue
  ) {}

  /**
   * Create campaign
   */
  async createCampaign(params: {
    organizationId: string;
    name: string;
    message: string;
    type: CampaignType;
    targetAudience: TargetAudience;
    scheduledFor?: Date;
  }): Promise<Campaign> {
    this.logger.log(`Creating campaign: ${params.name}`);

    const campaign = new Campaign({
      organizationId: params.organizationId,
      name: params.name,
      message: params.message,
      type: params.type,
      targetAudience: params.targetAudience,
      scheduledFor: params.scheduledFor,
    });

    if (params.scheduledFor) {
      campaign.schedule(params.scheduledFor);
    }

    await this.saveCampaign(campaign);

    this.logger.log(`Campaign created: ${campaign.id}`);

    return campaign;
  }

  /**
   * Start campaign
   */
  async startCampaign(campaignId: string): Promise<void> {
    this.logger.log(`Starting campaign: ${campaignId}`);

    const campaign = await this.getCampaign(campaignId);

    // Get target recipients
    const recipients = await this.getTargetRecipients(
      campaign.organizationId,
      campaign.targetAudience
    );

    campaign.start(recipients.length);
    await this.saveCampaign(campaign);

    // Queue campaign messages
    for (const recipient of recipients) {
      await this.campaignQueue.add(
        'send-campaign-message',
        {
          campaignId: campaign.id,
          recipientPhone: recipient.phone,
          recipientName: recipient.name,
          message: this.personalize(campaign.message, recipient),
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );
    }

    this.logger.log(`Campaign started: ${campaignId}, Recipients: ${recipients.length}`);
  }

  /**
   * Track campaign message sent
   */
  async trackSent(campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(campaignId);
    campaign.incrementSent();
    await this.saveCampaign(campaign);

    // Auto-complete if all sent
    if (campaign.sentCount >= campaign.totalRecipients) {
      campaign.complete();
      await this.saveCampaign(campaign);
      this.logger.log(`Campaign completed: ${campaignId}`);
    }
  }

  /**
   * Track campaign message delivered
   */
  async trackDelivered(campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(campaignId);
    campaign.incrementDelivered();
    await this.saveCampaign(campaign);
  }

  /**
   * Track campaign response
   */
  async trackResponse(campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(campaignId);
    campaign.incrementResponse();
    await this.saveCampaign(campaign);
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId: string): Promise<void> {
    this.logger.log(`Pausing campaign: ${campaignId}`);

    const campaign = await this.getCampaign(campaignId);
    campaign.pause();
    await this.saveCampaign(campaign);

    // Pause jobs in queue
    await this.campaignQueue.pause();

    this.logger.log(`Campaign paused: ${campaignId}`);
  }

  /**
   * Resume campaign
   */
  async resumeCampaign(campaignId: string): Promise<void> {
    this.logger.log(`Resuming campaign: ${campaignId}`);

    const campaign = await this.getCampaign(campaignId);
    campaign.resume();
    await this.saveCampaign(campaign);

    // Resume jobs in queue
    await this.campaignQueue.resume();

    this.logger.log(`Campaign resumed: ${campaignId}`);
  }

  /**
   * Cancel campaign
   */
  async cancelCampaign(campaignId: string): Promise<void> {
    this.logger.log(`Cancelling campaign: ${campaignId}`);

    const campaign = await this.getCampaign(campaignId);
    campaign.cancel();
    await this.saveCampaign(campaign);

    // Remove pending jobs
    const jobs = await this.campaignQueue.getJobs(['waiting', 'delayed']);
    for (const job of jobs) {
      if (job.data.campaignId === campaignId) {
        await job.remove();
      }
    }

    this.logger.log(`Campaign cancelled: ${campaignId}`);
  }

  /**
   * Get campaign metrics
   */
  async getCampaignMetrics(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      totalRecipients: campaign.totalRecipients,
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      failedCount: campaign.failedCount,
      responseCount: campaign.responseCount,
      deliveryRate: campaign.deliveryRate,
      responseRate: campaign.responseRate,
      startedAt: campaign.startedAt,
      completedAt: campaign.completedAt,
    };
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string): Promise<Campaign> {
    const data = await this.findCampaignData(campaignId);
    if (!data) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    return this.hydrateCampaign(data);
  }

  /**
   * Get target recipients based on audience criteria
   */
  private async getTargetRecipients(
    organizationId: string,
    audience: TargetAudience
  ): Promise<Array<{ phone: string; name?: string; [key: string]: any }>> {
    this.logger.log(`Getting target recipients for audience type: ${audience.type}`);

    // Get customers from shops table
    const customers = await this.prisma.shops.findMany({
      where: {
        mobile_num: { not: null },
      },
      select: {
        mobile_num: true,
        shop_name: true,
      },
    });

    const recipients = customers.map((c) => ({
      phone: c.mobile_num!,
      name: c.shop_name,
    }));

    this.logger.log(`Found ${recipients.length} potential recipients`);

    // Apply filters based on audience type
    if (audience.type === 'custom' && audience.customerIds) {
      return recipients.filter((r) => audience.customerIds!.includes(r.phone));
    }

    return recipients;
  }

  /**
   * Personalize message with recipient data
   */
  private personalize(
    message: string,
    recipient: { name?: string; [key: string]: any }
  ): string {
    let personalized = message;

    // Replace {{name}} with recipient name
    if (recipient.name) {
      personalized = personalized.replace(/\{\{name\}\}/g, recipient.name);
    }

    // Add more personalization tokens as needed
    return personalized;
  }

  private async saveCampaign(campaign: Campaign): Promise<void> {
    const campaignData = {
      id: campaign.id,
      organizationId: campaign.organizationId,
      name: campaign.name,
      message: campaign.message,
      type: campaign.type,
      status: campaign.status,
      targetAudience: campaign.targetAudience,
      scheduledFor: campaign.scheduledFor?.toISOString(),
      startedAt: campaign.startedAt?.toISOString(),
      completedAt: campaign.completedAt?.toISOString(),
      totalRecipients: campaign.totalRecipients,
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      failedCount: campaign.failedCount,
      responseCount: campaign.responseCount,
      metadata: campaign.metadata,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    };

    await this.prisma.whatsappMessage.upsert({
      where: {
        messageSid: `campaign:${campaign.id}`,
      },
      create: {
        messageSid: `campaign:${campaign.id}`,
        to: 'broadcast',
        from: 'system',
        body: campaign.name,
        direction: 'outbound',
        providerResponse: campaignData as any,
      },
      update: {
        providerResponse: campaignData as any,
      },
    });
  }

  private async findCampaignData(campaignId: string): Promise<any> {
    const record = await this.prisma.whatsappMessage.findUnique({
      where: { messageSid: `campaign:${campaignId}` },
    });

    return record?.providerResponse;
  }

  private hydrateCampaign(data: any): Campaign {
    const campaign = new Campaign({
      id: data.id,
      organizationId: data.organizationId,
      name: data.name,
      message: data.message,
      type: data.type,
      targetAudience: data.targetAudience,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      status: data.status,
      createdAt: new Date(data.createdAt),
    });

    return campaign;
  }
}
