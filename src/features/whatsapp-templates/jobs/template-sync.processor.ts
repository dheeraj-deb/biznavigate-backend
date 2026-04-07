import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhatsAppTemplate, WhatsAppTemplateDocument } from '../schemas/template.schema';
import { WhatsAppApiClientService } from '../../whatsapp/infrastructure/whatsapp-api-client.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { TemplateStatus } from '../enums/template.enum';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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
        private readonly configService: ConfigService,
    ) {
        super();
    }

    async process(job: Job): Promise<any> {
        this.logger.log(`Processing template sync job: ${job.id}`);

        const pendingTemplates = await this.templateModel.find({
            status: {
                $in: [TemplateStatus.PENDING] //TemplateStatus.REJECTED
            },
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

                const { status, rejectedReason } = await this.metaApi.getTemplateStatus(
                    template.metaTemplateId,
                );

                const mappedStatus = this.mapMetaStatus(status);

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
                this.logger.warn(`Failed to sync template ${template._id}: ${err.message}`);
            }
        }

        return { synced: pendingTemplates.length };
    }

    private mapMetaStatus(metaStatus: string): TemplateStatus {
        const map: Record<string, TemplateStatus> = {
            APPROVED: TemplateStatus.APPROVED,
            REJECTED: TemplateStatus.REJECTED,
            PENDING: TemplateStatus.PENDING,
            PAUSED: TemplateStatus.PAUSED,
        };
        return map[metaStatus] ?? TemplateStatus.PENDING;
    }

}
