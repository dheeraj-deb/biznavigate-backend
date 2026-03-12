import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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
    private readonly logger = new Logger(InboxService.name);

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

        return {
            data,
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

        const updated = await this.conversationService.updateConversation(conversationId, dto);
        return updated;
    }
}
