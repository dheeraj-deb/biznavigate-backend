import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Campaign, CampaignDocument } from "./schemas/campaign.schema";
import { Model } from "mongoose";
import { CreateCampaignDto, QueryCampaignDto } from "./dto/campaign.dto";
import { WhatsAppTemplate, WhatsAppTemplateDocument } from "../whatsapp-templates/schemas/template.schema";
import { AudienceFilterOperator, CampaignStatus } from "./enums/enums";
import { PrismaService } from "src/prisma/prisma.service";
import { CampaignSchedulerService } from "./jobs/campaign-scheduler.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";
import { ConfigService } from "@nestjs/config";
import {
    getDefaultCampaignTimezone,
    resolveCampaignSendAt,
    resolveOptionalCampaignDate,
} from "./utils/campaign-time.util";

type ResolvedRecipient = {
    phone_number: string;
    contact_id: string | null;
    name: string | null;
};

const ALLOWED_AUDIENCE_FIELDS = new Set([
    'engagement_score',
    'total_orders',
    'total_spent',
    'last_order_date',
    'name',
    'phone',
]);

@Injectable()
export class CampaignService {
    constructor(
        @InjectModel(Campaign.name) private readonly campaignModel: Model<Campaign>,
        @InjectModel(WhatsAppTemplate.name) private readonly templateModel: Model<WhatsAppTemplateDocument>,
        private readonly prisma: PrismaService,
        private readonly campaignScheduler: CampaignSchedulerService,
        private readonly whatsappService: WhatsAppService,
        private readonly configService: ConfigService,
    ) { }

    async create(businessId: string, dto: CreateCampaignDto) {
        try {
            const { name, templateLanguage } = dto;

            const exist = await this.campaignModel.findOne({
                businessId,
                name,
                templateLanguage,
                isDeleted: false,
            });

            if (exist) {
                throw new ConflictException(
                    `Campaign "${name}" for language "${templateLanguage}" already exists`,
                );
            }

            const template = await this.templateModel.findById(dto.templateId);
            if (!template) {
                throw new BadRequestException(`Template selected with id ${dto.templateId} is invalid!`);
            }

            const schedule = this.normalizeSchedule(dto.schedule);

            const campaign = await this.campaignModel.create({
                ...dto,
                schedule,
                businessId,
                templateLanguage: template.language,
                status: CampaignStatus.DRAFT,
            });

            return campaign;
        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadRequestException) throw error;
            if (error.name === 'ValidationError') throw new BadRequestException(error.message);
            if (error.code === 11000) throw new ConflictException('Duplicate campaign detected');
            throw new InternalServerErrorException('Failed to create campaign');
        }
    }

    async launchCampaign(businessId: string, campaignId: string) {
        const campaign = await this.campaignModel.findById(campaignId) as CampaignDocument;

        if (!campaign) {
            throw new NotFoundException(`Campaign not found with id: ${campaignId}`);
        }

        if (![CampaignStatus.DRAFT, CampaignStatus.SCHEDULED].includes(campaign.status)) {
            throw new BadRequestException(
                `Cannot launch a campaign with status "${campaign.status}"`,
            );
        }

        const recipients = await this.resolveAudience(businessId, campaign);

        if (recipients.length) {
            await this.prisma.campaign_recipients.createMany({
                data: recipients.map(r => ({
                    campaign_id: campaignId,
                    business_id: businessId,
                    phone_number: r.phone_number,
                    contact_id: r.contact_id ?? null,
                    status: 'PENDING',
                })),
                skipDuplicates: true,
            });
        }

        await this.campaignModel.findByIdAndUpdate(campaignId, {
            status: CampaignStatus.SCHEDULED,
            totalRecipients: recipients.length,
        });

        const schedule = this.normalizeSchedule(campaign.schedule);

        await this.campaignScheduler.scheduleCampaign(
            campaignId,
            businessId,
            schedule.sendAt,
            schedule.timezone,
        );

        return {
            message: 'Campaign scheduled',
            totalRecipients: recipients.length,
            sendAt: schedule.sendAt,
            timezone: schedule.timezone,
        };
    }

    private normalizeSchedule(schedule: CreateCampaignDto['schedule']) {
        const defaultTimezone = getDefaultCampaignTimezone(
            this.configService.get<string>('CAMPAIGN_DEFAULT_TIMEZONE'),
        );
        const { sendAt, timezone } = resolveCampaignSendAt(
            schedule.sendAt as unknown as string | Date,
            schedule.timezone,
            defaultTimezone,
        );

        return {
            ...schedule,
            timezone,
            sendAt,
            endsAt: resolveOptionalCampaignDate(
                schedule.endsAt as unknown as string | Date | undefined,
                timezone,
            ),
        };
    }

    async findAll(businessId: string, query: QueryCampaignDto) {
        const filter: any = { businessId, isDeleted: false };
        if (query.status) filter.status = query.status;
        if (query.search) filter.name = { $regex: query.search, $options: 'i' };

        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.campaignModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.campaignModel.countDocuments(filter),
        ]);

        const campaignIds = data.map(c => String((c as any)._id));

        const analyticsRows = await this.prisma.campaign_analytics.findMany({
            where: { campaign_id: { in: campaignIds } },
            select: {
                campaign_id: true,
                total: true,
                sent: true,
                delivery_rate: true,
                read_rate: true,
            },
        });

        const analyticsMap = new Map(analyticsRows.map(a => [a.campaign_id, a]));

        const enriched = data.map(c => {
            const a = analyticsMap.get(String((c as any)._id));
            return {
                ...c,
                analytics: {
                    total: a?.total ?? (c as any).totalRecipients ?? 0,
                    sent: a?.sent ?? 0,
                    delivery_rate: a ? Number(a.delivery_rate) : 0,
                    read_rate: a ? Number(a.read_rate) : 0,
                },
            };
        });

        return {
            data: enriched,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(businessId: string, campaignId: string) {
        const campaign = await this.campaignModel.findOne({ _id: campaignId, businessId, isDeleted: false }).lean();
        if (!campaign) throw new NotFoundException(`Campaign not found`);

        const [analytics, recipientStats] = await Promise.all([
            this.prisma.campaign_analytics.findUnique({ where: { campaign_id: campaignId } }),
            this.prisma.campaign_recipients.groupBy({
                by: ['status'],
                where: { campaign_id: campaignId },
                _count: { status: true },
            }),
        ]);

        const counts = Object.fromEntries(
            recipientStats.map(r => [r.status, r._count.status]),
        ) as Record<string, number>;

        return {
            ...campaign,
            analytics: {
                total: analytics?.total ?? (campaign as any).totalRecipients ?? 0,
                pending: analytics?.pending ?? counts['PENDING'] ?? 0,
                sent: analytics?.sent ?? counts['SENT'] ?? 0,
                delivered: analytics?.delivered ?? ((counts['DELIVERED'] ?? 0) + (counts['READ'] ?? 0)),
                read: analytics?.read ?? counts['READ'] ?? 0,
                failed: analytics?.failed ?? counts['FAILED'] ?? 0,
                delivery_rate: analytics ? Number(analytics.delivery_rate) : 0,
                read_rate: analytics ? Number(analytics.read_rate) : 0,
            },
        };
    }

    async getAnalytics(businessId: string, campaignId: string) {
        const campaign = await this.campaignModel
            .findOne({ _id: campaignId, businessId, isDeleted: false })
            .select('name status totalRecipients startedAt completedAt failureReason')
            .lean();

        if (!campaign) throw new NotFoundException(`Campaign not found`);

        const [analytics, recipientStats] = await Promise.all([
            this.prisma.campaign_analytics.findUnique({ where: { campaign_id: campaignId } }),
            this.prisma.campaign_recipients.groupBy({
                by: ['status'],
                where: { campaign_id: campaignId },
                _count: { status: true },
            }),
        ]);

        const counts = Object.fromEntries(
            recipientStats.map(r => [r.status, r._count.status]),
        ) as Record<string, number>;

        return {
            campaign: {
                id: (campaign as any)._id,
                name: campaign.name,
                status: campaign.status,
                totalRecipients: campaign.totalRecipients,
                startedAt: campaign.startedAt,
                completedAt: campaign.completedAt,
                failureReason: campaign.failureReason,
            },
            summary: {
                total: analytics?.total ?? campaign.totalRecipients,
                pending: analytics?.pending ?? counts['PENDING'] ?? 0,
                sent: analytics?.sent ?? counts['SENT'] ?? 0,
                delivered: analytics?.delivered ?? ((counts['DELIVERED'] ?? 0) + (counts['READ'] ?? 0)),
                read: analytics?.read ?? counts['READ'] ?? 0,
                failed: analytics?.failed ?? counts['FAILED'] ?? 0,
                skipped: counts['SKIPPED'] ?? 0,
                delivery_rate: analytics ? Number(analytics.delivery_rate) : 0,
                read_rate: analytics ? Number(analytics.read_rate) : 0,
                estimated_cost: analytics ? Number(analytics.estimated_cost) : 0,
                last_synced_at: analytics?.last_synced_at ?? null,
            },
        };
    }

    async getRecipients(
        businessId: string,
        campaignId: string,
        page: number = 1,
        limit: number = 50,
        status?: string,
    ) {
        await this.findOne(businessId, campaignId); // 404 if not found

        const where: any = { campaign_id: campaignId };
        if (status) where.status = status;

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.campaign_recipients.findMany({
                where,
                select: {
                    id: true,
                    phone_number: true,
                    contact_id: true,
                    status: true,
                    sent_at: true,
                    delivered_at: true,
                    read_at: true,
                    failed_at: true,
                    error_code: true,
                    error_message: true,
                    retry_count: true,
                    resolved_variables: true,
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.campaign_recipients.count({ where }),
        ]);

        return {
            data,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async pause(businessId: string, campaignId: string) {
        const campaign = await this.campaignModel.findOne({ _id: campaignId, businessId, isDeleted: false });
        if (!campaign) throw new NotFoundException(`Campaign not found`);

        if (campaign.status !== CampaignStatus.RUNNING) {
            throw new BadRequestException(`Only a RUNNING campaign can be paused`);
        }

        await this.campaignModel.findByIdAndUpdate(campaignId, { status: CampaignStatus.PAUSED });
        return { message: 'Campaign paused successfully' };
    }

    async cancel(businessId: string, campaignId: string) {
        const campaign = await this.campaignModel.findOne({ _id: campaignId, businessId, isDeleted: false });
        if (!campaign) throw new NotFoundException(`Campaign not found`);

        const cancellable = [CampaignStatus.DRAFT, CampaignStatus.SCHEDULED, CampaignStatus.RUNNING, CampaignStatus.PAUSED];
        if (!cancellable.includes(campaign.status)) {
            throw new BadRequestException(`Cannot cancel a campaign with status "${campaign.status}"`);
        }

        await this.campaignModel.findByIdAndUpdate(campaignId, { status: CampaignStatus.CANCELLED });
        return { message: 'Campaign cancelled successfully' };
    }

    async remove(businessId: string, campaignId: string) {
        const campaign = await this.campaignModel.findOne({ _id: campaignId, businessId, isDeleted: false });
        if (!campaign) throw new NotFoundException(`Campaign not found`);

        if ([CampaignStatus.RUNNING, CampaignStatus.SCHEDULED].includes(campaign.status)) {
            throw new BadRequestException(`Cannot delete a campaign that is ${campaign.status}`);
        }

        await this.campaignModel.findByIdAndUpdate(campaignId, { isDeleted: true });
        return { message: 'Campaign deleted successfully' };
    }

    async resolveAudience(businessId: string, campaign: CampaignDocument): Promise<ResolvedRecipient[]> {
        if (campaign.explicitPhoneNumbers?.length) {
            const optouts = await this.getOptouts(businessId, campaign.explicitPhoneNumbers);
            return campaign.explicitPhoneNumbers
                .filter(p => !optouts.has(p))
                .map(p => ({ phone_number: p, contact_id: null, name: null }));
        }

        const where: any = { business_id: businessId };

        if (campaign.audienceFilter?.conditions?.length) {
            const conditions = this.buildPrismaConditions(campaign.audienceFilter.conditions);
            if (conditions.length) {
                const op = campaign.audienceFilter.operator === AudienceFilterOperator.OR ? 'OR' : 'AND';
                where[op] = conditions;
            }
        }

        const customers = await this.prisma.customers.findMany({
            where,
            select: { customer_id: true, phone: true, name: true },
        });

        if (!customers.length) return [];

        const phones = customers.map(c => c.phone);
        const optouts = await this.getOptouts(businessId, phones);

        return customers
            .filter(c => !optouts.has(c.phone))
            .map(c => ({
                phone_number: c.phone,
                contact_id: c.customer_id,
                name: c.name ?? null,
            }));
    }

    private buildPrismaConditions(conditions: Array<{ field: string; operator: string; value: any }>): any[] {
        return conditions
            .filter(c => ALLOWED_AUDIENCE_FIELDS.has(c.field))
            .map(c => ({ [c.field]: this.mapOperator(c.operator, c.value) }));
    }

    private mapOperator(operator: string, value: any): any {
        switch (operator) {
            case 'eq': return { equals: value };
            case 'ne': return { not: value };
            case 'gt': return { gt: value };
            case 'gte': return { gte: value };
            case 'lt': return { lt: value };
            case 'lte': return { lte: value };
            case 'contains': return { contains: value, mode: 'insensitive' };
            case 'in': return { in: Array.isArray(value) ? value : [value] };
            case 'not_in': return { notIn: Array.isArray(value) ? value : [value] };
            default:
                throw new BadRequestException(`Unknown audience filter operator: "${operator}"`);
        }
    }

    private async getOptouts(businessId: string, phones: string[]): Promise<Set<string>> {
        if (!phones.length) return new Set();
        const rows = await this.prisma.whatsapp_optouts.findMany({
            where: { business_id: businessId, phone_number: { in: phones } },
            select: { phone_number: true },
        });
        return new Set(rows.map((r: { phone_number: string }) => r.phone_number));
    }

    /**
     * Quick blast: send a plain text message to a list of leads.
     * Used by POST /campaigns/bulk.
     * Replaces {{name}} with the lead's name if available.
     */
    async sendBulkQuickMessage(
        businessId: string,
        leadIds: string[],
        message: string,
    ): Promise<{ sent: number; failed: number; skipped: number }> {
        if (!leadIds?.length) throw new BadRequestException('lead_ids must not be empty');
        if (!message?.trim()) throw new BadRequestException('message must not be empty');

        // Get the business WhatsApp phone number ID
        const account = await this.prisma.social_accounts.findFirst({
            where: { business_id: businessId, platform: 'whatsapp', is_active: true },
            select: { page_id: true, gupshup_app_id: true, username: true },
        });
        if (!account?.page_id) throw new NotFoundException('No active WhatsApp account for this business');

        // Fetch leads
        const leads = await this.prisma.leads.findMany({
            where: { lead_id: { in: leadIds }, business_id: businessId, deleted_at: null },
            select: { lead_id: true, name: true, phone: true },
        });

        const phones = leads.map((l) => l.phone).filter(Boolean) as string[];
        const optouts = await this.getOptouts(businessId, phones);

        let sent = 0;
        let failed = 0;
        let skipped = 0;

        for (const lead of leads) {
            if (!lead.phone) { skipped++; continue; }
            if (optouts.has(lead.phone)) { skipped++; continue; }

            const text = message.replace(/\{\{name\}\}/gi, lead.name ?? 'there');

            try {
                await this.whatsappService.sendViaAccount(
                    {
                        page_id: account.page_id,
                        gupshup_app_id: account.gupshup_app_id,
                        username: account.username,
                    },
                    lead.phone,
                    {
                        messaging_product: 'whatsapp',
                        recipient_type: 'individual',
                        to: lead.phone,
                        type: 'text' as any,
                        text: { body: text, preview_url: false },
                    },
                );
                sent++;
            } catch {
                failed++;
            }
        }

        return { sent, failed, skipped };
    }
}
