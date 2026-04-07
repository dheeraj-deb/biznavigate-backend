import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConversationService } from '../conversation/conversation.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { InboxGateway } from './gateway/inbox.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageType } from '../whatsapp/dto/whatsapp-message.dto';

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

        // Merge Postgres escalation/resolution fields into each conversation
        const conversationIds = data.map(c => c.conversation_id);
        const pgRows = conversationIds.length
            ? await this.prisma.lead_conversations.findMany({
                where: { conversation_id: { in: conversationIds } },
                select: {
                    conversation_id: true,
                    is_ai_handled: true,
                    human_takeover_at: true,
                    human_takeover_reason: true,
                    is_resolved: true,
                    agent_id: true,
                },
            })
            : [];

        const pgMap = new Map(pgRows.map(r => [r.conversation_id, r]));

        const enriched = data.map(conv => {
            const pg = pgMap.get(conv.conversation_id);
            return {
                ...conv.toObject(),
                is_ai_handled: pg?.is_ai_handled ?? true,
                human_takeover_at: pg?.human_takeover_at ?? null,
                human_takeover_reason: pg?.human_takeover_reason ?? null,
                is_resolved: pg?.is_resolved ?? false,
                agent_id: pg?.agent_id ?? conv.agent_id ?? null,
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
        const to = conversation.customer_id; // customer's phone number

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

        if (Object.keys(pgUpdate).length) {
            await this.prisma.lead_conversations.updateMany({
                where: { conversation_id: conversationId },
                data: pgUpdate,
            });
        }

        return updated;
    }

    async resolveConversation(businessId: string, conversationId: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        const resolvedAt = new Date();

        await Promise.all([
            this.conversationService.updateConversation(conversationId, { status: 'ended' }),
            this.prisma.lead_conversations.updateMany({
                where: { conversation_id: conversationId },
                data: { is_resolved: true, resolved_at: resolvedAt, status: 'ended' },
            }),
        ]);

        this.inboxGateway.notifyConversationResolved(businessId, conversationId, resolvedAt);

        return { success: true, resolved_at: resolvedAt };
    }

    async takeoverConversation(businessId: string, conversationId: string, agentId: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        await Promise.all([
            this.conversationService.updateConversation(conversationId, { agent_id: agentId }),
            this.prisma.lead_conversations.updateMany({
                where: { conversation_id: conversationId },
                data: { agent_id: agentId, is_ai_handled: false },
            }),
        ]);

        this.inboxGateway.notifyConversationUpdated(businessId, conversationId, {
            message_text: conversation.message_text,
            timestamp: new Date(),
        });

        return { success: true, agent_id: agentId, is_ai_handled: false };
    }
}
