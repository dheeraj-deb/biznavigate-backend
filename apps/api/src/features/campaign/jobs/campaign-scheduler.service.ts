import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from '../schemas/campaign.schema';
import { CampaignStatus } from '../enums/enums';
import { CAMPAIGN_DISPATCH_QUEUE, DISPATCH_JOB, DispatchCampaignPayload, RETRY_JOB } from './campaign-dispatch.processor';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CampaignSchedulerService implements OnModuleInit {
    private readonly logger = new Logger(CampaignSchedulerService.name);
    private readonly retryCron: string;

    constructor(
        @InjectQueue(CAMPAIGN_DISPATCH_QUEUE) private readonly dispatchQueue: Queue,
        @InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>,
        private readonly configService: ConfigService,
    ) {
        this.retryCron = this.configService.get<string>('campaign.retryCron', '*/5 * * * *');
    }

    async onModuleInit() {
        await this.rehydrateScheduledCampaigns();
        await this.scheduleRetryJob();
    }

    /**
     * Called from CampaignService when a campaign is scheduled.
     * Adds a delayed BullMQ job that fires exactly at sendAt.
     */
    async scheduleCampaign(campaignId: string, businessId: string, sendAt: Date): Promise<void> {
        const delay = Math.max(0, sendAt.getTime() - Date.now());

        await this.dispatchQueue.add(
            DISPATCH_JOB,
            { campaignId, businessId } satisfies DispatchCampaignPayload,
            {
                delay,
                jobId: `campaign-${campaignId}`,   // idempotent — prevents duplicate jobs
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 2,
                backoff: { type: 'fixed', delay: 30_000 },
            },
        );

        this.logger.log(
            `Campaign ${campaignId} scheduled — fires in ${Math.round(delay / 1000)}s at ${sendAt.toISOString()}`,
        );
    }

    /**
     * On startup, re-queue any SCHEDULED campaigns whose jobs may have been lost
     * (e.g. after a server restart or Redis flush).
     */
    private async rehydrateScheduledCampaigns(): Promise<void> {
        const campaigns = await this.campaignModel.find({
            status: CampaignStatus.SCHEDULED,
            'schedule.sendAt': { $gte: new Date() },
            isDeleted: false,
        }).select('_id businessId schedule').lean();

        if (!campaigns.length) return;

        this.logger.log(`Re-hydrating ${campaigns.length} scheduled campaign(s)`);

        for (const c of campaigns) {
            const existingJob = await this.dispatchQueue.getJob(`campaign-${c._id}`);
            if (existingJob) continue; // job already in queue

            await this.scheduleCampaign(
                String(c._id),
                c.businessId,
                new Date(c.schedule.sendAt),
            );
        }
    }

    private async scheduleRetryJob(): Promise<void> {
        await this.dispatchQueue.add(
            RETRY_JOB,
            {},
            {
                repeat: { pattern: this.retryCron },
                jobId: 'campaign-retry-loop',
                removeOnComplete: true,
                removeOnFail: false,
            },
        );
        this.logger.log(`Retry job scheduled (${this.retryCron})`);
    }
}
