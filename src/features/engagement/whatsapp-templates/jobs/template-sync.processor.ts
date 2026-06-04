import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhatsAppTemplate, WhatsAppTemplateDocument } from '../schemas/template.schema';
import { WhatsAppApiClientService } from '../../whatsapp/infrastructure/whatsapp-api-client.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TemplateStatus } from '../enums/template.enum';
import { GupshupOnboardingService } from '../../gupshup/gupshup-onboarding.service';
import axios from 'axios';

@Processor('whatsapp-template-sync', {
    lockDuration: 120000,
    lockRenewTime: 30000,
})
export class TemplateSyncProcessor extends WorkerHost {
    private readonly logger = new Logger(TemplateSyncProcessor.name);

    constructor(
        @InjectModel(WhatsAppTemplate.name)
        private readonly templateModel: Model<WhatsAppTemplateDocument>,
        private readonly metaApi: WhatsAppApiClientService,
        private readonly prisma: PrismaService,
        private readonly gupshupOnboarding: GupshupOnboardingService,
    ) {
        super();
    }

    async process(job: Job): Promise<any> {
        this.logger.log(`Processing template sync job: ${job.id}`);

        const pendingTemplates = await this.templateModel.find({
            status: { $in: [TemplateStatus.PENDING] },
            metaTemplateId: { $exists: true, $ne: null },
            isDeleted: false,
        }).select('_id metaTemplateId businessId').lean();

        this.logger.log(`Found ${pendingTemplates.length} PENDING templates to sync`);

        for (const template of pendingTemplates) {
            try {
                const account = await this.prisma.social_accounts.findFirst({
                    where: { business_id: template.businessId as string, platform: 'whatsapp', is_active: true },
                });

                if (!account) continue;

                let mappedStatus: TemplateStatus;
                let rejectedReason: string | undefined;

                if (account.gupshup_app_id) {
                    const result = await this.getGupshupTemplateStatus(
                        account.gupshup_app_id,
                        template.metaTemplateId,
                    );
                    mappedStatus = result.status;
                    rejectedReason = result.rejectedReason;
                } else {
                    const result = await this.metaApi.getTemplateStatus(template.metaTemplateId);
                    mappedStatus = this.mapStatus(result.status);
                    rejectedReason = result.rejectedReason;
                }

                if (mappedStatus !== TemplateStatus.PENDING) {
                    await this.templateModel.findByIdAndUpdate(template._id, {
                        status: mappedStatus,
                        ...(rejectedReason && { rejectionReason: rejectedReason }),
                        $push: {
                            submissionHistory: { submittedAt: new Date(), status: mappedStatus, reason: rejectedReason },
                        },
                    });
                    this.logger.log(`Template ${template._id} status updated: ${mappedStatus}`);
                }
            } catch (err) {
                const errDetail = JSON.stringify(err?.response?.data ?? err?.message);
                this.logger.warn(`Failed to sync template ${template._id}: ${errDetail}`);

                const httpStatus = err?.response?.status;
                if (httpStatus === 404 || httpStatus === 400) {
                    await this.templateModel.findByIdAndUpdate(template._id, {
                        rejectionReason: `Provider status lookup failed (${httpStatus}): ${errDetail}`,
                    }).catch(() => {});
                    this.logger.warn(`Template ${template._id} left PENDING after provider status lookup failure (${httpStatus})`);
                }
            }
        }

        return { synced: pendingTemplates.length };
    }

    private async getGupshupTemplateStatus(
        appId: string,
        templateId: string,
    ): Promise<{ status: TemplateStatus; rejectedReason?: string }> {
        const token = await this.gupshupOnboarding.getPartnerAppToken(appId);
        const { data } = await axios.get(
            `https://partner.gupshup.io/partner/app/${appId}/templates/${templateId}`,
            { headers: { Authorization: token } },
        );
        const t = data?.template ?? data;
        return {
            status: this.mapStatus(t?.status ?? 'PENDING'),
            rejectedReason: t?.rejectedReason ?? t?.reason ?? undefined,
        };
    }

    private mapStatus(raw: string): TemplateStatus {
        const map: Record<string, TemplateStatus> = {
            APPROVED: TemplateStatus.APPROVED,
            REJECTED: TemplateStatus.REJECTED,
            PENDING: TemplateStatus.PENDING,
            PAUSED: TemplateStatus.PAUSED,
            ACTIVE: TemplateStatus.PENDING, // Gupshup uses ACTIVE for in-review
        };
        return map[raw] ?? TemplateStatus.PENDING;
    }
}
