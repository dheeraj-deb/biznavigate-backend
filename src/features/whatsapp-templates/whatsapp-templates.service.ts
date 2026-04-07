import * as crypto from 'crypto';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WhatsAppTemplate, WhatsAppTemplateDocument } from "./schemas/template.schema";
import { WhatsAppApiClientService } from "../whatsapp/infrastructure/whatsapp-api-client.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { ButtonType, HeaderType, TemplateCategory, TemplateStatus } from "./enums/template.enum";
import { PrismaService } from "../../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { QueryTemplateDto } from "./dto/query-template.dto";

@Injectable()
export class WhatsAppTemplatesService {
    private readonly logger = new Logger(WhatsAppTemplatesService.name);

    constructor(
        @InjectModel(WhatsAppTemplate.name)
        private readonly templateModel: Model<WhatsAppTemplateDocument>,
        private readonly metaApi: WhatsAppApiClientService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
    }


    async handleMetaWebhook(value: any) {
        if (value?.event === 'APPROVED' || value?.event === 'REJECTED') {
            const { message_template_id, event, reason } = value;

            await this.templateModel.findOneAndUpdate(
                { metaTemplateId: String(message_template_id) },
                {
                    status: event === 'APPROVED' ? TemplateStatus.APPROVED : TemplateStatus.REJECTED,
                    ...(reason && { rejectionReason: reason }),
                    $push: {
                        submissionHistory: { submittedAt: new Date(), status: event, reason },
                    },
                },
            );
        }
    }

    async create(businessId: string, dto: CreateTemplateDto) {
        const existing = await this.templateModel.findOne({
            businessId: businessId,
            name: dto.name,
            language: dto.language,
            isDeleted: false
        })

        if (existing) {
            throw new ConflictException(
                `Template "${dto.name}" for language "${dto.language}" already exists`,
            );
        }

        const checksum = this.generateChecksum(dto);

        const template = await this.templateModel.create({
            businessId: businessId,
            ...dto,
            checksum,
            status: TemplateStatus.DRAFT,
        });

        return template;
    }


    private generateChecksum(data: any): string {
        return crypto
            .createHash('md5')
            .update(JSON.stringify({ name: data.name, components: data.components }))
            .digest('hex');
    }

    async submit(businessId: string, templateId: string) {
        const template = await this.findOneOrFail(businessId, templateId);

        if (![TemplateStatus.DRAFT, TemplateStatus.REJECTED].includes(template.status)) {
            throw new BadRequestException(
                `Cannot submit a template with status "${template.status}"`,
            );
        }

        this.validateTemplate(template);

        const account = await this.prisma.social_accounts.findFirst({
            where: { business_id: businessId, platform: 'whatsapp', is_active: true },
        });

        if (!account) {
            throw new NotFoundException('No active WhatsApp account found for this business');
        }

        const whatsappBusinessAccountId = account.instagram_business_account_id;

        let metaResult: { id: string; status: string };
        try {
            metaResult = await this.metaApi.createTemplate(
                whatsappBusinessAccountId,
                {
                    name: template.name,
                    category: template.category,
                    language: template.language,
                    components: this.buildMetaComponents(template.components),
                },
            );
        } catch (err) {
            const metaError = err?.response?.data?.error;
            if (metaError?.error_subcode === 2388023) {
                throw new ConflictException(
                    'A template with this name is still being deleted by Meta. Please wait a moment and try again.',
                );
            }
            throw err;
        }

        const { id, status } = metaResult;

        const newStatus = this.mapMetaStatus(status);

        await this.templateModel.findByIdAndUpdate(templateId, {
            status: newStatus,
            metaTemplateId: id,
            $push: {
                submissionHistory: { submittedAt: new Date(), status: newStatus },
            },
        });

        return { message: 'Template submitted for review', metaTemplateId: id, status: newStatus };
    }

    async findAll(businessId: string, query: QueryTemplateDto) {
        const { status, category, search, language, page = 1, limit = 20 } = query;

        const filter: any = {
            businessId: businessId,
            isDeleted: false,
        };

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (language) filter.language = language;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const [templates, total] = await Promise.all([
            this.templateModel
                .find(filter)
                .select('-submissionHistory -__v')
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            this.templateModel.countDocuments(filter),
        ]);

        return {
            data: templates,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(businessId: string, templateId: string) {
        return this.findOneOrFail(businessId, templateId);
    }

    async findApproved(businessId: string) {
        return this.templateModel
            .find({ businessId, status: TemplateStatus.APPROVED, isDeleted: false })
            .select('-submissionHistory -__v')
            .sort({ updatedAt: -1 });
    }

    async findByName(businessId: string, name: string) {
        const template = await this.templateModel.findOne({
            businessId,
            name,
            isDeleted: false,
        }).select('-submissionHistory -__v');

        if (!template) throw new NotFoundException(`Template "${name}" not found`);
        return template;
    }

    async update(businessId: string, templateId: string, dto: Partial<CreateTemplateDto>) {
        const template = await this.findOneOrFail(businessId, templateId);

        if (![TemplateStatus.DRAFT, TemplateStatus.REJECTED].includes(template.status)) {
            throw new BadRequestException(
                'Only DRAFT or REJECTED templates can be edited',
            );
        }

        const checksum = this.generateChecksum({ ...template.toObject(), ...dto });

        return this.templateModel.findByIdAndUpdate(
            templateId,
            { ...dto, checksum, status: TemplateStatus.DRAFT },
            { returnDocument: 'after' },
        );
    }

    async duplicate(businessId: string, templateId: string) {
        const source = await this.findOneOrFail(businessId, templateId);

        const newName = `${source.name}_copy_${Date.now()}`;
        return this.create(businessId, {
            name: newName,
            category: source.category,
            language: source.language,
            components: source.components as any,
        });
    }

    async remove(businessId: string, templateId: string) {
        const template = await this.findOneOrFail(businessId, templateId);

        // Also delete from Meta if it was submitted
        if (template.metaTemplateId) {
            const account = await this.prisma.social_accounts.findFirst({
                where: { business_id: businessId, platform: 'whatsapp', is_active: true },
            });

            if (account) {
                await this.metaApi.deleteTemplate(
                    account.instagram_business_account_id,
                    template.name,
                ).catch((err) => {
                    this.logger.warn(`Could not delete template from Meta: ${err.message}`);
                });
            }
        }

        await this.templateModel.findByIdAndUpdate(templateId, { isDeleted: true });
        return { message: 'Template deleted successfully' };
    }

    async syncFromMeta(businessId: string) {
        const account = await this.prisma.social_accounts.findFirst({
            where: { business_id: businessId, platform: 'whatsapp', is_active: true },
        });
        if (!account) throw new NotFoundException('No active WhatsApp account found');

        const wabaId = account.instagram_business_account_id;

        const metaTemplates = await this.metaApi.getTemplates(wabaId);

        let created = 0;
        let updated = 0;

        for (const mt of metaTemplates) {
            const status = this.mapMetaStatus(mt.status);
            const components = this.parseMetaComponents(mt.components ?? []);
            const language = mt.language ?? 'en';
            const category = (mt.category as TemplateCategory) ?? TemplateCategory.MARKETING;

            const existing = await this.templateModel.findOne({
                businessId,
                metaTemplateId: String(mt.id),
                language,
            });

            if (existing) {
                await this.templateModel.findByIdAndUpdate(existing._id, {
                    status,
                    ...(mt.rejected_reason && { rejectionReason: mt.rejected_reason }),
                });
                updated++;
            } else {
                const checksum = this.generateChecksum({ name: mt.name, components });
                await this.templateModel.create({
                    businessId,
                    name: mt.name,
                    category,
                    language,
                    components,
                    status,
                    metaTemplateId: String(mt.id),
                    checksum,
                    ...(mt.rejected_reason && { rejectionReason: mt.rejected_reason }),
                });
                created++;
            }
        }

        return { message: 'Templates synced from Meta', created, updated, total: metaTemplates.length };
    }

    private parseMetaComponents(metaComponents: any[]): any {
        const result: any = { body: '', bodyExamples: [], buttons: [] };

        for (const comp of metaComponents) {
            if (comp.type === 'HEADER') {
                result.header = {
                    type: comp.format as HeaderType,
                    text: comp.text,
                    example: comp.example?.header_text?.[0] ?? comp.example?.header_handle?.[0],
                };
            } else if (comp.type === 'BODY') {
                result.body = comp.text ?? '';
                result.bodyExamples = comp.example?.body_text?.[0] ?? [];
            } else if (comp.type === 'FOOTER') {
                result.footer = comp.text;
            } else if (comp.type === 'BUTTONS') {
                result.buttons = (comp.buttons ?? []).map((btn: any) => {
                    if (btn.type === 'QUICK_REPLY') {
                        return { type: ButtonType.QUICK_REPLY, text: btn.text };
                    }
                    return {
                        type: ButtonType.CALL_TO_ACTION,
                        text: btn.text,
                        url: btn.url,
                        phoneNumber: btn.phone_number,
                        urlExample: btn.example?.[0],
                    };
                });
            }
        }

        return result;
    }

    async syncStatus(businessId: string, templateId: string) {
        const template = await this.findOneOrFail(businessId, templateId);

        if (!template.metaTemplateId) {
            throw new BadRequestException('Template has not been submitted to Meta yet');
        }

        const account = await this.prisma.social_accounts.findFirst({
            where: { business_id: businessId, platform: 'whatsapp', is_active: true },
        });

        if (!account) {
            throw new NotFoundException('No active WhatsApp account found for this business');
        }

        const { status, rejectedReason } = await this.metaApi.getTemplateStatus(
            template.metaTemplateId,
        );

        const mappedStatus = this.mapMetaStatus(status);

        await this.templateModel.findByIdAndUpdate(templateId, {
            status: mappedStatus,
            ...(rejectedReason && { rejectionReason: rejectedReason }),
        });

        return { status: mappedStatus, rejectionReason: rejectedReason };
    }

    private buildMetaComponents(components: WhatsAppTemplateDocument['components']): any[] {
        const result: any[] = [];

        if (components.header) {
            const header: any = { type: 'HEADER', format: components.header.type };
            if (components.header.text) header.text = components.header.text;

            if (components.header.type === 'TEXT') {
                // Text header with variable {{1}} needs header_text example
                if (components.header.example) {
                    header.example = { header_text: [components.header.example] };
                }
            } else {
                // IMAGE / VIDEO / DOCUMENT — use mediaUrl as the example handle
                const mediaSample = components.header.example || components.header.mediaUrl;
                if (mediaSample) {
                    header.example = { header_handle: [mediaSample] };
                }
            }

            result.push(header);
        }

        const body: any = { type: 'BODY', text: components.body };
        // Body variables {{1}}, {{2}}, ... — supply sample values
        if (components.bodyExamples?.length) {
            body.example = { body_text: [components.bodyExamples] };
        }
        result.push(body);

        if (components.footer) {
            result.push({ type: 'FOOTER', text: components.footer });
        }

        if (components.buttons?.length) {
            result.push({
                type: 'BUTTONS',
                buttons: components.buttons.map(btn => {
                    if (btn.type === 'QUICK_REPLY') {
                        return { type: 'QUICK_REPLY', text: btn.text };
                    }
                    if (btn.phoneNumber) {
                        return { type: 'PHONE_NUMBER', text: btn.text, phone_number: btn.phoneNumber };
                    }
                    // CALL_TO_ACTION with URL — URL may contain {{1}} variable
                    const urlBtn: any = { type: 'URL', text: btn.text, url: btn.url };
                    if (btn.urlExample) {
                        urlBtn.example = [btn.urlExample];
                    }
                    return urlBtn;
                }),
            });
        }

        return result;
    }

    async incrementAnalytics(
        templateId: string,
        field: 'sent' | 'delivered' | 'read' | 'clicked' | 'failed',
    ) {
        await this.templateModel.findByIdAndUpdate(templateId, {
            $inc: { [`analytics.${field}`]: 1 },
        });
    }

    async getStats(businessId: string) {
        return this.templateModel.aggregate([
            { $match: { businessId: businessId, isDeleted: false } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalSent: { $sum: '$analytics.sent' },
                    totalDelivered: { $sum: '$analytics.delivered' },
                },
            },
        ]);
    }

    private validateTemplate(template: WhatsAppTemplateDocument) {
        const { body } = template.components;
        const vars = body.match(/\{\{(\d+)\}\}/g) || [];
        const indices = vars.map((v) => parseInt(v.replace(/[{}]/g, '')));

        const sorted = [...new Set(indices)].sort((a, b) => a - b);
        sorted.forEach((val, i) => {
            if (val !== i + 1) {
                throw new BadRequestException(
                    `Variables must be sequential. Found {{${val}}} but expected {{${i + 1}}}`,
                );
            }
        });

        if (template.components.footer?.includes('{{')) {
            throw new BadRequestException('Footer cannot contain variables');
        }

        if ((template.components.buttons?.length ?? 0) > 3) {
            throw new BadRequestException('Maximum 3 buttons allowed');
        }
    }

    private async findOneOrFail(businessId: string, templateId: string) {
        const template = await this.templateModel.findOne({
            _id: new Types.ObjectId(templateId),
            businessId: businessId,
            isDeleted: false,
        });

        if (!template) throw new NotFoundException('Template not found');
        return template;
    }

    private mapMetaStatus(metaStatus: string): TemplateStatus {
        const map: Record<string, TemplateStatus> = {
            APPROVED: TemplateStatus.APPROVED,
            REJECTED: TemplateStatus.REJECTED,
            PENDING: TemplateStatus.PENDING,
            PAUSED: TemplateStatus.PAUSED,
            //   DISABLED: TemplateStatus.DISABLED,
        };
        return map[metaStatus] ?? TemplateStatus.PENDING;
    }

}