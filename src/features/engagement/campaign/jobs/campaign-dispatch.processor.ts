import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Campaign, CampaignDocument } from '../schemas/campaign.schema';
import { WhatsAppTemplate, WhatsAppTemplateDocument } from '../../whatsapp-templates/schemas/template.schema';
import { CampaignStatus } from '../enums/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';

export const CAMPAIGN_DISPATCH_QUEUE = 'campaign-dispatch';
export const DISPATCH_JOB = 'dispatch-campaign';
export const RETRY_JOB = 'retry-failed-recipients';

export interface DispatchCampaignPayload {
    campaignId: string;
    businessId: string;
}

@Processor(CAMPAIGN_DISPATCH_QUEUE, {
    lockDuration: 300_000, // 5 min — long enough for large batches
    lockRenewTime: 60_000,
})
export class CampaignDispatchProcessor extends WorkerHost {
    private readonly logger = new Logger(CampaignDispatchProcessor.name);
    private readonly maxRetries: number;
    private readonly retryDelayMs: number;

    constructor(
        @InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>,
        @InjectModel(WhatsAppTemplate.name) private readonly templateModel: Model<WhatsAppTemplateDocument>,
        private readonly prisma: PrismaService,
        private readonly whatsappService: WhatsAppService,
        private readonly configService: ConfigService,
    ) {
        super();
        this.maxRetries = this.configService.get<number>('campaign.maxRetries', 3);
        this.retryDelayMs = this.configService.get<number>('campaign.retryDelayMs', 60_000);
    }

    async process(job: Job<any>): Promise<void> {
        switch (job.name) {
            case DISPATCH_JOB:
                return this.processDispatch(job as Job<DispatchCampaignPayload>);
            case RETRY_JOB:
                return this.processRetryFailures();
            default:
                this.logger.warn(`Unknown job type: ${job.name}`);
        }
    }

    async processDispatch(job: Job<DispatchCampaignPayload>): Promise<void> {
        const { campaignId, businessId } = job.data;
        this.logger.log(`[Campaign ${campaignId}] Dispatch started`);

        const campaign = await this.campaignModel.findById(campaignId) as CampaignDocument;

        if (!campaign) {
            this.logger.warn(`[Campaign ${campaignId}] Not found, skipping`);
            return;
        }

        const dispatchable = [CampaignStatus.SCHEDULED, CampaignStatus.RUNNING];
        if (!dispatchable.includes(campaign.status)) {
            this.logger.warn(
                `[Campaign ${campaignId}] Status is "${campaign.status}", expected SCHEDULED/RUNNING — skipping`,
            );
            return;
        }

        const template = await this.templateModel.findById(campaign.templateId);
        if (!template) {
            await this.failCampaign(campaignId, 'Template not found');
            return;
        }

        const account = await this.prisma.social_accounts.findFirst({
            where: { business_id: businessId, platform: 'whatsapp', is_active: true },
        });

        if (!account?.page_id) {
            await this.failCampaign(campaignId, 'No active WhatsApp account for business');
            return;
        }

        const phoneNumberId = account.page_id;

        await this.campaignModel.findByIdAndUpdate(campaignId, {
            status: CampaignStatus.RUNNING,
            startedAt: new Date(),
        });

        const batchSize = campaign.rateLimit?.batchSize ?? 1000;
        const messagesPerSecond = campaign.rateLimit?.messagesPerSecond ?? 50;
        const delayMs = Math.floor(1000 / messagesPerSecond); // inter-message delay

        let totalSent = 0;
        let totalFailed = 0;

        try {
            while (true) {
                const batch = await this.prisma.campaign_recipients.findMany({
                    where: { campaign_id: campaignId, business_id: businessId, status: 'PENDING' },
                    take: batchSize,
                    select: { id: true, phone_number: true, contact_id: true },
                });

                if (!batch.length) break;

                const contactIds = batch
                    .filter(r => r.contact_id)
                    .map(r => r.contact_id as string);

                const contactMap = await this.fetchContacts(businessId, contactIds);

                for (const recipient of batch) {
                    const contact = recipient.contact_id ? contactMap.get(recipient.contact_id) : null;
                    const resolvedVars = this.resolveVariables(campaign.variableMappings, contact, recipient.phone_number);

                    try {
                        const providerTemplate = this.resolveProviderTemplate(template, account.gupshup_app_id);
                        const payload = this.buildTemplatePayload(
                            recipient.phone_number,
                            providerTemplate.name,
                            providerTemplate.language,
                            resolvedVars,
                        );

                        const result = await this.whatsappService.sendViaAccount(
                            {
                                page_id: phoneNumberId,
                                gupshup_app_id: account.gupshup_app_id,
                                username: account.username,
                            },
                            recipient.phone_number,
                            payload,
                        );
                        const waMessageId: string | null = result?.messages?.[0]?.id ?? null;

                        await this.prisma.campaign_recipients.update({
                            where: { id: recipient.id },
                            data: {
                                status: 'SENT',
                                whatsapp_message_id: waMessageId,
                                sent_at: new Date(),
                                resolved_variables: resolvedVars,
                            },
                        });

                        totalSent++;
                    } catch (err: any) {
                        const metaErr = err?.response?.data?.error ?? {};
                        this.logger.warn(
                            `[Campaign ${campaignId}] Failed to send to ${recipient.phone_number}: ${metaErr.message ?? err.message}`,
                        );

                        await this.prisma.campaign_recipients.update({
                            where: { id: recipient.id },
                            data: {
                                status: 'FAILED',
                                failed_at: new Date(),
                                error_code: String(metaErr.code ?? 'UNKNOWN'),
                                error_message: metaErr?.error_data?.details || metaErr.message || err.message,
                            },
                        });

                        totalFailed++;
                    }

                    // Throttle to respect messagesPerSecond
                    await this.sleep(delayMs);
                }
            }

            await this.upsertAnalytics(campaignId, businessId);
            await this.updateCampaignStatusAfterDispatch(campaignId);

            this.logger.log(
                `[Campaign ${campaignId}] Dispatch finished — sent: ${totalSent}, immediate failed: ${totalFailed}`,
            );
        } catch (err: any) {
            this.logger.error(`[Campaign ${campaignId}] Dispatch crashed: ${err.message}`, err.stack);
            await this.failCampaign(campaignId, err.message ?? 'Unexpected dispatch error');
            throw err; // re-throw so BullMQ can retry the job
        }
    }


    private async processRetryFailures(): Promise<void> {
        this.logger.log('Retry job started');

        while (true) {
            const batch = await this.prisma.campaign_recipients.findMany({
                where: {
                    status: CampaignStatus.FAILED,
                    retry_count: { lt: this.maxRetries },
                    next_retry_at: { lte: new Date() }
                },
                take: 500,
                select: {
                    id: true,
                    campaign_id: true,
                    business_id: true,
                    phone_number: true,
                    contact_id: true,
                    retry_count: true,
                }
            });

            if (!batch.length) break;

            for (const recipient of batch) {

                const campaign = await this.campaignModel.findById(recipient.campaign_id) as CampaignDocument;
                if (!campaign) continue;

                const template = await this.templateModel.findById(campaign.templateId);
                if (!template) continue;

                const account = await this.prisma.social_accounts.findFirst({
                    where: { business_id: recipient.business_id, platform: 'whatsapp', is_active: true },
                });
                if (!account?.page_id) continue;

                const contact = recipient.contact_id
                    ? (await this.fetchContacts(recipient.business_id, [recipient.contact_id])).get(recipient.contact_id)
                    : null;

                const resolvedVars = this.resolveVariables(campaign.variableMappings, contact, recipient.phone_number);

                try {
                    const providerTemplate = this.resolveProviderTemplate(template, account.gupshup_app_id);
                    const payload = this.buildTemplatePayload(
                        recipient.phone_number,
                        providerTemplate.name,
                        providerTemplate.language,
                        resolvedVars,
                    );
                    const result = await this.whatsappService.sendViaAccount(
                        {
                            page_id: account.page_id,
                            gupshup_app_id: account.gupshup_app_id,
                            username: account.username,
                        },
                        recipient.phone_number,
                        payload,
                    );
                    const waMessageId: string | null = result?.messages?.[0]?.id ?? null;

                    await this.prisma.campaign_recipients.update({
                        where: { id: recipient.id },
                        data: {
                            status: 'SENT',
                            whatsapp_message_id: waMessageId,
                            sent_at: new Date(),
                            resolved_variables: resolvedVars,
                        },
                    });
                } catch (err: any) {
                    const metaErr = err?.response?.data?.error ?? {};
                    this.logger.warn(
                        `Retry failed for ${recipient.phone_number}: ${metaErr.message ?? err.message}`,
                    );

                    await this.prisma.campaign_recipients.update({
                        where: { id: recipient.id },
                        data: {
                            retry_count: { increment: 1 },
                            next_retry_at: new Date(Date.now() + this.retryDelayMs * (recipient.retry_count + 1)),
                        },
                    });
                }

                await this.sleep(100);

            }
        }

        this.logger.log('Retry job finished');
    }


    private async fetchContacts(
        businessId: string,
        contactIds: string[],
    ): Promise<Map<string, { customer_id: string; name: string | null; phone: string }>> {
        if (!contactIds.length) return new Map();
        const contacts = await this.prisma.customers.findMany({
            where: { business_id: businessId, customer_id: { in: contactIds } },
            select: { customer_id: true, name: true, phone: true },
        });
        return new Map(contacts.map(c => [c.customer_id, c]));
    }

    private resolveVariables(
        mappings: Array<{ variableIndex: number; source: string }> = [],
        contact: { name?: string | null; phone?: string } | null | undefined,
        recipientPhone: string = '',
    ): Record<string, string> {
        const now = new Date();
        const resolved: Record<string, string> = {};

        for (const m of mappings) {
            let value = '';
            switch (m.source) {
                case 'contact.name': value = contact?.name?.trim() || 'Customer'; break;
                case 'contact.phone': value = contact?.phone || recipientPhone; break;
                case 'system.current_date': value = now.toLocaleDateString('en-IN'); break;
                case 'system.current_time': value = now.toLocaleTimeString('en-IN'); break;
                default: value = m.source; // use source key as last-resort fallback
            }
            resolved[String(m.variableIndex)] = value;
        }

        return resolved;
    }

    private buildTemplatePayload(
        to: string,
        templateName: string,
        language: string,
        variables: Record<string, string>,
    ): any {
        // Build body parameters ordered by variable index (1, 2, 3 …)
        const parameters = Object.keys(variables)
            .sort((a, b) => Number(a) - Number(b))
            .map(idx => ({ type: 'text', text: variables[idx] ?? '' }));

        const components: any[] = [];
        if (parameters.length) {
            components.push({ type: 'body', parameters });
        }

        return {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: language },
                ...(components.length ? { components } : {}),
            },
        };
    }

    private resolveProviderTemplate(
        template: WhatsAppTemplateDocument,
        gupshupAppId?: string | null,
    ): { name: string; language: string } {
        if (!gupshupAppId) {
            return { name: template.name, language: template.language };
        }

        const fallbackName = `${template.name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '')}_${gupshupAppId.replace(/-/g, '').slice(-8)}`;
        const storedProviderName = template.metaTemplateId && template.metaTemplateId.includes(fallbackName)
            ? template.metaTemplateId
            : null;

        return {
            name: storedProviderName || fallbackName,
            language: template.language === 'en' ? 'en_US' : template.language,
        };
    }

    private async upsertAnalytics(campaignId: string, businessId: string): Promise<void> {
        const [total, sent, delivered, read, failed, pending] = await Promise.all([
            this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId } }),
            this.prisma.campaign_recipients.count({
                where: {
                    campaign_id: campaignId,
                    OR: [
                        { sent_at: { not: null } },
                        { status: { in: ['SENT', 'DELIVERED', 'READ'] } },
                    ],
                },
            }),
            this.prisma.campaign_recipients.count({
                where: {
                    campaign_id: campaignId,
                    OR: [
                        { delivered_at: { not: null } },
                        { status: { in: ['DELIVERED', 'READ'] } },
                    ],
                },
            }),
            this.prisma.campaign_recipients.count({
                where: {
                    campaign_id: campaignId,
                    OR: [
                        { read_at: { not: null } },
                        { status: 'READ' },
                    ],
                },
            }),
            this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId, status: 'FAILED' } }),
            this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId, status: 'PENDING' } }),
        ]);

        const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
        const readRate = delivered > 0 ? (read / delivered) * 100 : 0;

        await this.prisma.campaign_analytics.upsert({
            where: { campaign_id: campaignId },
            create: {
                campaign_id: campaignId,
                business_id: businessId,
                total, sent, delivered, read, failed, pending,
                delivery_rate: deliveryRate,
                read_rate: readRate,
                last_synced_at: new Date(),
                updated_at: new Date(),
            },
            update: {
                total, sent, delivered, read, failed, pending,
                delivery_rate: deliveryRate,
                read_rate: readRate,
                last_synced_at: new Date(),
                updated_at: new Date(),
            },
        });
    }

    private async updateCampaignStatusAfterDispatch(campaignId: string): Promise<void> {
        const [total, awaitingDelivery, failed] = await Promise.all([
            this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId } }),
            this.prisma.campaign_recipients.count({
                where: { campaign_id: campaignId, status: { in: ['PENDING', 'SENT'] } },
            }),
            this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId, status: 'FAILED' } }),
        ]);

        if (total > 0 && failed === total) {
            await this.campaignModel.findByIdAndUpdate(campaignId, {
                $set: {
                    status: CampaignStatus.FAILED,
                    completedAt: new Date(),
                    failureReason: 'All campaign send attempts failed',
                },
            });
            return;
        }

        if (awaitingDelivery > 0) {
            await this.campaignModel.findByIdAndUpdate(campaignId, {
                $set: { status: CampaignStatus.RUNNING },
                $unset: { completedAt: 1, failureReason: 1 },
            });
            return;
        }

        await this.campaignModel.findByIdAndUpdate(campaignId, {
            $set: { status: CampaignStatus.COMPLETED, completedAt: new Date() },
            $unset: { failureReason: 1 },
        });
    }

    private async failCampaign(campaignId: string, reason: string): Promise<void> {
        await this.campaignModel.findByIdAndUpdate(campaignId, {
            status: CampaignStatus.FAILED,
            failureReason: reason,
        });
        this.logger.error(`[Campaign ${campaignId}] Failed: ${reason}`);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
