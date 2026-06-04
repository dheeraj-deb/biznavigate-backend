import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhatsAppTemplate, WhatsAppTemplateDocument } from '../schemas/template.schema';
import { WhatsAppApiClientService } from '../../whatsapp/infrastructure/whatsapp-api-client.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TemplateStatus } from '../enums/template.enum';

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
    ) {
        super();
    }

    async process(job: Job): Promise<any> {
        this.logger.log(`Processing template sync job: ${job.id}`);

        const pendingTemplates = await this.templateModel.find({
            status: { $in: [TemplateStatus.PENDING] },
            metaTemplateId: { $exists: true, $ne: null },
            isDeleted: false,
        }).select('_id metaTemplateId providerTemplateName name language businessId').lean();

        this.logger.log(`Found ${pendingTemplates.length} PENDING templates to sync`);

        const gupshupTemplateListByBusiness = new Map<string, Promise<any[]>>();

        for (const template of pendingTemplates) {
            try {
                const account = await this.prisma.social_accounts.findFirst({
                    where: { business_id: template.businessId as string, platform: 'whatsapp', is_active: true },
                });

                if (!account) continue;

                let mappedStatus: TemplateStatus;
                let rejectedReason: string | undefined;

                if (account.gupshup_app_id) {
                    const businessId = String(template.businessId);
                    if (!gupshupTemplateListByBusiness.has(businessId)) {
                        gupshupTemplateListByBusiness.set(
                            businessId,
                            this.metaApi.getTemplates(account.instagram_business_account_id),
                        );
                    }

                    const providerTemplates = await gupshupTemplateListByBusiness.get(businessId)!;
                    const providerTemplate = this.findProviderTemplate(providerTemplates, template, account.gupshup_app_id);
                    if (!providerTemplate) {
                        this.logger.debug(`No provider template match yet for Gupshup template ${template._id}`);
                        continue;
                    }

                    mappedStatus = this.mapStatus(providerTemplate.status);
                    rejectedReason = providerTemplate.rejected_reason;

                    await this.templateModel.findByIdAndUpdate(template._id, {
                        metaTemplateId: String(providerTemplate.id),
                        providerTemplateName: String(providerTemplate.name),
                        ...(rejectedReason && { rejectionReason: rejectedReason }),
                    });
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

    private findProviderTemplate(providerTemplates: any[], template: any, gupshupAppId?: string | null): any | null {
        const localMetaId = String(template.metaTemplateId ?? '');
        const localProviderName = String(template.providerTemplateName ?? '');
        const localName = String(template.name ?? '');
        const localLanguage = String(template.language ?? '');

        return providerTemplates.find((providerTemplate) => {
            const providerId = String(providerTemplate.id ?? '');
            const providerName = String(providerTemplate.name ?? '');
            const providerLanguage = String(providerTemplate.language ?? '');
            const canonicalName = this.resolveCanonicalBlueprintName(providerName, gupshupAppId);

            const languageMatches = !localLanguage || !providerLanguage || localLanguage === providerLanguage;
            if (!languageMatches) return false;

            return (
                (localMetaId && localMetaId === providerId) ||
                (localMetaId && localMetaId === providerName) ||
                (localProviderName && localProviderName === providerName) ||
                (localName && localName === providerName) ||
                (canonicalName && localName === canonicalName)
            );
        }) ?? null;
    }

    private resolveCanonicalBlueprintName(providerName: string, gupshupAppId?: string | null): string | null {
        if (!gupshupAppId || !providerName) return null;
        const appSuffix = `_${gupshupAppId.replace(/-/g, '').slice(-8)}`;
        if (!providerName.endsWith(appSuffix)) return null;
        return providerName.slice(0, -appSuffix.length);
    }
}
