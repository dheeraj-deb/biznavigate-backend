import * as crypto from 'crypto';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhatsAppFlow, WhatsAppFlowDocument, FlowStatus } from './schemas/flow.schema';
import { CreateFlowDto } from './dto/create-flow.dto';
import { QueryFlowDto } from './dto/query-flow.dto';
import { WhatsAppApiClientService } from '../whatsapp/infrastructure/whatsapp-api-client.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppFlowsService {
    private readonly logger = new Logger(WhatsAppFlowsService.name);

    constructor(
        @InjectModel(WhatsAppFlow.name)
        private readonly flowModel: Model<WhatsAppFlowDocument>,
        private readonly metaApi: WhatsAppApiClientService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    async create(businessId: string, dto: CreateFlowDto) {
        const existing = await this.flowModel.findOne({ businessId, name: dto.name, isDeleted: false });
        if (existing) {
            throw new ConflictException(`Flow "${dto.name}" already exists`);
        }

        return this.flowModel.create({
            businessId,
            name: dto.name,
            category: dto.category,
            flowJson: dto.flowJson,
            endpointUri: dto.endpointUri,
            status: FlowStatus.DRAFT,
        });
    }

    async findAll(businessId: string, query: QueryFlowDto) {
        const { status, category, search, page = 1, limit = 20 } = query;
        const filter: any = { businessId, isDeleted: false };

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const [data, total] = await Promise.all([
            this.flowModel.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
            this.flowModel.countDocuments(filter),
        ]);

        return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(businessId: string, id: string) {
        return this.findOneOrFail(businessId, id);
    }

    async update(businessId: string, id: string, dto: Partial<CreateFlowDto>) {
        const flow = await this.findOneOrFail(businessId, id);

        if (flow.status === FlowStatus.PUBLISHED) {
            throw new BadRequestException('Published flows cannot be edited locally. Deprecate first.');
        }

        return this.flowModel.findByIdAndUpdate(id, { ...dto }, { new: true });
    }

    /**
     * Step 1: Create the flow shell on Meta, then upload the Flow JSON asset.
     * After this the flow is still in DRAFT on Meta — call publish() to go live.
     */
    async submit(businessId: string, id: string) {
        const flow = await this.findOneOrFail(businessId, id);

        if (!flow.flowJson) {
            throw new BadRequestException('Flow JSON is required before submitting to Meta');
        }

        if (flow.status === FlowStatus.PUBLISHED) {
            throw new BadRequestException('Flow is already published');
        }

        const account = await this.getActiveAccount(businessId);
        const accessToken = this.decryptToken(account.access_token);
        const wabaId = account.instagram_business_account_id;

        let metaFlowId = flow.metaFlowId;

        // Create on Meta if not yet created
        if (!metaFlowId) {
            const created = await this.metaApi.createFlow(wabaId, accessToken, flow.name, [flow.category]);
            metaFlowId = created.id;
            await this.flowModel.findByIdAndUpdate(id, { metaFlowId });
        }

        // Upload the Flow JSON
        await this.metaApi.uploadFlowAsset(metaFlowId, accessToken, flow.flowJson, flow.endpointUri);

        await this.flowModel.findByIdAndUpdate(id, { status: FlowStatus.DRAFT, metaFlowId });

        return { message: 'Flow submitted to Meta. Call /publish to make it live.', metaFlowId };
    }

    /**
     * Step 2: Publish the flow so it can be sent to users.
     */
    async publish(businessId: string, id: string) {
        const flow = await this.findOneOrFail(businessId, id);

        if (!flow.metaFlowId) {
            throw new BadRequestException('Flow must be submitted to Meta before publishing. Call /submit first.');
        }

        if (flow.status === FlowStatus.PUBLISHED) {
            throw new BadRequestException('Flow is already published');
        }

        const account = await this.getActiveAccount(businessId);
        const accessToken = this.decryptToken(account.access_token);

        await this.metaApi.publishFlow(flow.metaFlowId, accessToken);

        await this.flowModel.findByIdAndUpdate(id, { status: FlowStatus.PUBLISHED });

        return { message: 'Flow published successfully', metaFlowId: flow.metaFlowId };
    }

    async deprecate(businessId: string, id: string) {
        const flow = await this.findOneOrFail(businessId, id);

        if (!flow.metaFlowId) {
            throw new BadRequestException('Flow has not been submitted to Meta');
        }

        if (flow.status !== FlowStatus.PUBLISHED) {
            throw new BadRequestException('Only published flows can be deprecated');
        }

        const account = await this.getActiveAccount(businessId);
        const accessToken = this.decryptToken(account.access_token);

        await this.metaApi.deprecateFlow(flow.metaFlowId, accessToken);
        await this.flowModel.findByIdAndUpdate(id, { status: FlowStatus.DEPRECATED });

        return { message: 'Flow deprecated' };
    }

    async remove(businessId: string, id: string) {
        const flow = await this.findOneOrFail(businessId, id);

        if (flow.metaFlowId) {
            const account = await this.getActiveAccount(businessId).catch(() => null);
            if (account) {
                const accessToken = this.decryptToken(account.access_token);
                await this.metaApi.deleteFlow(flow.metaFlowId, accessToken).catch((err) => {
                    this.logger.warn(`Could not delete flow from Meta: ${err.message}`);
                });
            }
        }

        await this.flowModel.findByIdAndUpdate(id, { isDeleted: true });
        return { message: 'Flow deleted' };
    }

    async syncStatus(businessId: string, id: string) {
        const flow = await this.findOneOrFail(businessId, id);

        if (!flow.metaFlowId) {
            throw new BadRequestException('Flow has not been submitted to Meta');
        }

        const account = await this.getActiveAccount(businessId);
        const accessToken = this.decryptToken(account.access_token);

        const metaFlow = await this.metaApi.getFlow(flow.metaFlowId, accessToken);
        const status = metaFlow.status as FlowStatus;

        await this.flowModel.findByIdAndUpdate(id, { status });

        return { status };
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async findOneOrFail(businessId: string, id: string): Promise<WhatsAppFlowDocument> {
        const flow = await this.flowModel.findOne({ _id: id, businessId, isDeleted: false });
        if (!flow) throw new NotFoundException('Flow not found');
        return flow;
    }

    private async getActiveAccount(businessId: string) {
        const account = await this.prisma.social_accounts.findFirst({
            where: { business_id: businessId, platform: 'whatsapp', is_active: true },
        });
        if (!account) throw new NotFoundException('No active WhatsApp account found');
        return account;
    }

    private decryptToken(encryptedToken: string): string {
        const key = this.configService.get<string>('ENCRYPTION_KEY');
        const [ivHex, encrypted] = encryptedToken.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    }
}
