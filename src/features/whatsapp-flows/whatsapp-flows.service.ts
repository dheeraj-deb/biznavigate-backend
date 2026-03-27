import * as crypto from 'crypto';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhatsAppFlow, WhatsAppFlowDocument, FlowStatus, FlowCategory } from './schemas/flow.schema';
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

        // Auto-generate RSA 2048-bit key pair if not already done
        const baseUrl = this.configService.get<string>('APP_BASE_URL', '');
        let endpointUri = `${baseUrl}/whatsapp/flows/exchange/${id}`;
        if (!flow.privateKey) {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            });

            // Upload the public key to Meta (signs the key for the phone number)
            const phoneNumberId = account.platform_user_id;
            await this.metaApi.uploadBusinessPublicKey(phoneNumberId, accessToken, publicKey);

            // Encrypt the private key at rest using the same ENCRYPTION_KEY used for tokens
            const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
            const encryptedPrivateKey = this.encryptPrivateKey(privateKey, encryptionKey);

            await this.flowModel.findByIdAndUpdate(id, {
                publicKey,
                privateKey: encryptedPrivateKey,
                endpointUri,
            });
        }

        // Set the endpoint URI on the Meta flow
        this.logger.log(`Setting endpoint_uri on Meta flow ${metaFlowId}: ${endpointUri}`);
        await this.metaApi.updateFlow(metaFlowId, accessToken, { endpoint_uri: endpointUri });

        // Upload the Flow JSON
        await this.metaApi.uploadFlowAsset(metaFlowId, accessToken, flow.flowJson, endpointUri);

        await this.flowModel.findByIdAndUpdate(id, { status: FlowStatus.DRAFT, metaFlowId });

        return { message: 'Flow submitted to Meta. Call /publish to make it live.', metaFlowId, endpointUri };
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

        // Re-upload this flow's public key before publishing so Meta uses the correct key for health check
        if (flow.publicKey) {
            const phoneNumberId = account.platform_user_id;
            await this.metaApi.uploadBusinessPublicKey(phoneNumberId, accessToken, flow.publicKey);
        }

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

    /**
     * Regenerate RSA key pair and update endpoint URI on Meta.
     * Use this when a flow was synced from Meta and has no private key,
     * or when the endpoint URI is stale (points to a deleted document).
     */
    async rekey(businessId: string, id: string) {
        const flow = await this.findOneOrFail(businessId, id);

        if (!flow.metaFlowId) {
            throw new BadRequestException('Flow has no Meta ID — submit it first');
        }

        const account = await this.getActiveAccount(businessId);
        const accessToken = this.decryptToken(account.access_token);

        const baseUrl = this.configService.get<string>('APP_BASE_URL', '');
        const endpointUri = `${baseUrl}/whatsapp/flows/exchange/${id}`;

        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const phoneNumberId = account.platform_user_id;
        await this.metaApi.uploadBusinessPublicKey(phoneNumberId, accessToken, publicKey);

        await this.metaApi.updateFlow(flow.metaFlowId, accessToken, { endpoint_uri: endpointUri });

        const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
        const encryptedPrivateKey = this.encryptPrivateKey(privateKey, encryptionKey);

        await this.flowModel.findByIdAndUpdate(id, {
            publicKey,
            privateKey: encryptedPrivateKey,
            endpointUri,
        });

        this.logger.log(`Flow ${id} rekeyed — new endpointUri: ${endpointUri}`);
        return { message: 'Flow rekeyed successfully', endpointUri };
    }

    async migrate(businessId: string, id: string, targetBusinessId: string) {
        const flow = await this.findOneOrFail(businessId, id);

        const existing = await this.flowModel.findOne({
            businessId: targetBusinessId,
            name: flow.name,
            isDeleted: false,
        });

        if (existing) {
            throw new ConflictException(`A flow named "${flow.name}" already exists in the target business`);
        }

        const migrated = await this.flowModel.create({
            businessId: targetBusinessId,
            name: flow.name,
            category: flow.category,
            flowJson: flow.flowJson,
            status: FlowStatus.DRAFT,
        });

        this.logger.log(`Flow "${flow.name}" migrated from ${businessId} → ${targetBusinessId} as ${migrated._id}`);

        return {
            message: 'Flow migrated successfully. Submit and publish it in the target business to go live.',
            flowId: migrated._id,
            name: migrated.name,
            targetBusinessId,
        };
    }

    async syncFromMeta(businessId: string) {
        const account = await this.getActiveAccount(businessId);
        const accessToken = this.decryptToken(account.access_token);
        const wabaId = account.instagram_business_account_id;
        const baseUrl = this.configService.get<string>('APP_BASE_URL', '');
        const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
        const phoneNumberId = account.platform_user_id;

        const metaFlows = await this.metaApi.listFlows(wabaId, accessToken);

        let created = 0;
        let updated = 0;

        for (const mf of metaFlows) {
            const status = (mf.status as FlowStatus) ?? FlowStatus.DRAFT;
            const category = (mf.categories?.[0] as FlowCategory) ?? FlowCategory.OTHER;

            let doc = await this.flowModel.findOne({ businessId, metaFlowId: mf.id });

            if (!doc) {
                doc = await this.flowModel.create({
                    businessId,
                    name: mf.name,
                    category,
                    status,
                    metaFlowId: mf.id,
                });
                created++;
            } else {
                await this.flowModel.findByIdAndUpdate(doc._id, { status });
                updated++;
            }

            // Generate RSA key pair and update endpoint URI on Meta
            const docId = doc._id.toString();
            const endpointUri = `${baseUrl}/whatsapp/flows/exchange/${docId}`;

            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            });

            try {
                await this.metaApi.uploadBusinessPublicKey(phoneNumberId, accessToken, publicKey);
                await this.metaApi.updateFlow(mf.id, accessToken, { endpoint_uri: endpointUri });
            } catch (err) {
                this.logger.warn(`Could not rekey flow "${mf.name}" (${mf.id}): ${err.message}`);
                continue;
            }

            const encryptedPrivateKey = this.encryptPrivateKey(privateKey, encryptionKey);
            await this.flowModel.findByIdAndUpdate(docId, {
                publicKey,
                privateKey: encryptedPrivateKey,
                endpointUri,
            });

            this.logger.log(`Flow "${mf.name}" rekeyed → ${endpointUri}`);
        }

        return { message: 'Flows synced and rekeyed from Meta', created, updated, total: metaFlows.length };
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

    /**
     * Returns the Meta flow ID for the business's APPOINTMENT_BOOKING (hospitality) flow.
     * Used by the AI agent to trigger the availability result screen directly.
     */
    async findHospitalityFlowId(businessId: string): Promise<string | null> {
        const flow = await this.flowModel.findOne({
            businessId,
            category: FlowCategory.APPOINTMENT_BOOKING,
            isDeleted: false,
            metaFlowId: { $exists: true, $ne: null },
        });
        return flow?.metaFlowId ?? null;
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

    private encryptPrivateKey(pem: string, encryptionKey: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
        const encrypted = cipher.update(pem, 'utf8', 'hex') + cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
}
