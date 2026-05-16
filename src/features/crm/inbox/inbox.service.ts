import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConversationService } from '../conversation/conversation.service';
import { WhatsAppService } from '../../engagement/whatsapp/whatsapp.service';
import { InboxGateway } from './gateway/inbox.gateway';
import { PrismaService } from '../../../prisma/prisma.service';
import { SendMessageType } from '../../engagement/whatsapp/dto/whatsapp-message.dto';

export interface InboxQueryDto {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
    search?: string;
}

export interface SendReplyDto {
    content: string;
}

export interface UpdateInboxConversationDto {
    status?: string;
    assigned_to?: string;
    is_resolved?: boolean;
    agent_id?: string;
}

export interface BatchMessagesDto {
    conversationIds: string[];
    /** Max messages to return per conversation (default 50, max 100) */
    limit?: number;
    /** ISO timestamp or message _id of the oldest message currently visible.
     *  Only messages older than this cursor are returned (load-older pagination). */
    cursor?: string;
}

@Injectable()
export class InboxService {
    constructor(
        private readonly conversationService: ConversationService,
        private readonly whatsappService: WhatsAppService,
        private readonly inboxGateway: InboxGateway,
        private readonly prisma: PrismaService,
    ) {}

    async listConversations(businessId: string, tenantId: string, query: InboxQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 20, 100);

        const { data, total } = await this.conversationService.findConversationsPaginated(
            businessId,
            tenantId,
            { status: query.status, channel: query.channel, search: query.search },
            page,
            limit,
        );

        // Fetch lead names/phones for any conversation missing customer_id / sender_name
        const leadIds = Array.from(new Set(data.map(c => c.lead_id).filter(Boolean)));
        const leads = leadIds.length
            ? await this.prisma.leads.findMany({
                where: { lead_id: { in: leadIds } },
                select: { lead_id: true, name: true, phone: true },
            })
            : [];
        const leadById = new Map(leads.map(l => [l.lead_id, l]));

        // All conversation state lives in MongoDB — return directly
        const enriched = data.map(conv => {
            const obj = conv.toObject() as any;
            const lead = leadById.get(conv.lead_id);
            return {
                ...obj,
                customer_id: obj.customer_id ?? lead?.phone ?? conv.platform_id ?? conv.lead_id,
                sender_name: obj.sender_name ?? lead?.name ?? lead?.phone ?? conv.platform_id ?? 'Customer',
                is_ai_handled: conv.is_ai ?? conv.is_ai_handled ?? true,
                is_resolved: conv.status === 'resolved',
                agent_id: conv.agent_id ?? null,
            };
        });

        return {
            data: enriched,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async getConversation(businessId: string, conversationId: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        // Get recent messages (last 50)
        const { data: messages } = await this.conversationService.findMessagesByConversation(
            conversationId,
            1,
            50,
            businessId,
        );

        return { conversation, messages };
    }

    async getMessages(businessId: string, conversationId: string, page: number = 1, limit: number = 50) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        const { data, total } = await this.conversationService.findMessagesByConversation(
            conversationId,
            Number(page) || 1,
            Math.min(Number(limit) || 50, 100),
            businessId,
        );

        return {
            data,
            pagination: {
                total,
                page: Number(page) || 1,
                limit: Math.min(Number(limit) || 50, 100),
                totalPages: Math.ceil(total / (Math.min(Number(limit) || 50, 100))),
            },
        };
    }

    async sendReply(businessId: string, conversationId: string, dto: SendReplyDto) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        // Look up active WhatsApp account for this business
        const account = await this.prisma.social_accounts.findFirst({
            where: { business_id: businessId, platform: 'whatsapp', is_active: true },
        });

        if (!account?.page_id) {
            throw new BadRequestException('No active WhatsApp account connected for this business');
        }

        const phoneNumberId = account.page_id;

        const lead = conversation.lead_id
            ? await this.prisma.leads.findUnique({
                where: { lead_id: conversation.lead_id },
                select: { phone: true },
            })
            : null;
        const to = lead?.phone ?? conversation.customer_id ?? conversation.platform_id;

        if (!to) {
            throw new BadRequestException('Conversation has no recipient phone number');
        }

        const result = await this.whatsappService.sendMessage(phoneNumberId, to, {
            messaging_product: 'whatsapp',
            to,
            type: SendMessageType.TEXT,
            text: { body: dto.content },
        });

        const sentMessage = {
            conversation_id: conversationId,
            sender_type: 'business',
            message_type: 'text',
            message_text: dto.content,
            delivery_status: 'sent',
            timestamp: new Date(),
        };

        this.inboxGateway.notifyMessageSent(businessId, conversationId, sentMessage);

        return { success: true, message: sentMessage, whatsapp: result };
    }

    async batchMessages(businessId: string, dto: BatchMessagesDto) {
        const ids = dto.conversationIds;
        if (!ids?.length) return { data: {} };

        const limit = Math.min(Number(dto.limit) || 50, 100);

        const messages = await this.conversationService.findBatchMessagesByCursor(businessId, ids, limit, dto.cursor);
        console.log(" => batchMessages result", { messages });

        return {
            data: messages,
            meta: {
                conversationIds: ids,
                limit,
                cursor: dto.cursor ?? null,
                // nextCursor: timestamp of the oldest message across all buckets
                nextCursor: (() => {
                    let oldest: Date | null = null;
                    for (const msgs of Object.values(messages)) {
                        if (msgs.length > 0) {
                            const ts = new Date((msgs[0] as any).timestamp);
                            if (!oldest || ts < oldest) oldest = ts;
                        }
                    }
                    return oldest ? oldest.toISOString() : null;
                })(),
            },
        };
    }

    async updateConversation(businessId: string, conversationId: string, dto: UpdateInboxConversationDto) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        // Update MongoDB
        const updated = await this.conversationService.updateConversation(conversationId, dto);

        // Sync relevant fields to Postgres
        const pgUpdate: Record<string, any> = {};
        if (dto.status) pgUpdate.status = dto.status;
        if (dto.agent_id !== undefined) pgUpdate.agent_id = dto.agent_id;
        if (dto.is_resolved !== undefined) {
            pgUpdate.is_resolved = dto.is_resolved;
            if (dto.is_resolved) pgUpdate.resolved_at = new Date();
        }

        // Postgres mirror removed — MongoDB is source of truth for conversation state

        return updated;
    }

    async resolveConversation(businessId: string, conversationId: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        const resolvedAt = new Date();

        await this.conversationService.updateConversation(conversationId, { status: 'resolved' });

        this.inboxGateway.notifyConversationResolved(businessId, conversationId, resolvedAt);

        return { success: true, resolved_at: resolvedAt };
    }

    async takeoverConversation(businessId: string, conversationId: string, agentId: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        await this.conversationService.updateConversation(conversationId, { agent_id: agentId, is_ai: false });

        this.inboxGateway.notifyConversationUpdated(businessId, conversationId, {
            message_text: conversation.message_text,
            timestamp: new Date(),
        });

        return { success: true, agent_id: agentId, is_ai_handled: false };
    }
}
