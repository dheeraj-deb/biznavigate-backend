import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationService } from '../conversation/conversation.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { HumanHandoffGateway } from './human-handoff.gateway';
import { SendMessageType } from '../whatsapp/dto/whatsapp-message.dto';

@Injectable()
export class HumanHandoffService {
    private readonly logger = new Logger(HumanHandoffService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly conversationService: ConversationService,
        private readonly whatsappService: WhatsAppService,
        private readonly gateway: HumanHandoffGateway,
    ) {}

    /**
     * List all escalated, unresolved conversations for this business.
     * Sorted oldest-first so agents handle the longest-waiting first.
     */
    async getQueue(businessId: string) {
        this.logger.log(`getQueue for business ${businessId}`);
        const pgRows = await this.prisma.lead_conversations.findMany({
            where: { business_id: businessId, is_ai_handled: false, is_resolved: false },
            orderBy: { human_takeover_at: 'asc' },
            select: {
                conversation_id: true,
                lead_id: true,
                agent_id: true,
                is_ai_handled: true,
                human_takeover_at: true,
                human_takeover_reason: true,
                is_resolved: true,
                status: true,
                channel: true,
                customer_identifier: true,
            },
        });

        this.logger.log(`getQueue found ${pgRows.length} Postgres rows`);
        if (!pgRows.length) return { data: [], total: 0 };

        const conversationIds = pgRows.map(r => r.conversation_id);

        // Fetch MongoDB conversations for customer name / last message preview
        const mongoConvs = await this.conversationService.findConversationsByIds(conversationIds);
        const mongoMap = new Map(mongoConvs.map(c => [c.conversation_id, c]));

        const data = pgRows.map(row => {
            const mongo = mongoMap.get(row.conversation_id);
            return {
                ...row,
                customer_id: mongo?.customer_id ?? row.customer_identifier ?? null,
                customer_name: mongo?.sender_name ?? null,
                message_text: mongo?.message_text ?? null,
                channel: mongo?.channel ?? row.channel,
            };
        });

        return { data, total: data.length };
    }

    /**
     * Get a single escalated conversation with recent messages.
     */
    async getConversation(businessId: string, conversationId: string) {
        const pgRow = await this.prisma.lead_conversations.findFirst({
            where: { conversation_id: conversationId, business_id: businessId },
            select: {
                conversation_id: true,
                lead_id: true,
                agent_id: true,
                is_ai_handled: true,
                human_takeover_at: true,
                human_takeover_reason: true,
                is_resolved: true,
                status: true,
            },
        });

        if (!pgRow) throw new NotFoundException('Conversation not found');

        const conversation = await this.conversationService.findConversationById(conversationId);
        const { data: messages } = await this.conversationService.findMessagesByConversation(conversationId, 1, 50, businessId);

        return {
            ...pgRow,
            conversation,
            messages,
        };
    }

    /**
     * Agent takes over the conversation.
     */
    async takeover(businessId: string, conversationId: string, agentId: string) {
        const pgRow = await this.prisma.lead_conversations.findFirst({
            where: { conversation_id: conversationId, business_id: businessId },
        });

        if (!pgRow) throw new NotFoundException('Conversation not found');

        const assignedAt = new Date();

        await Promise.all([
            this.prisma.lead_conversations.updateMany({
                where: { conversation_id: conversationId },
                data: { agent_id: agentId, is_ai_handled: false },
            }),
            this.conversationService.updateConversation(conversationId, { agent_id: agentId }),
        ]);

        this.gateway.notifyAgentAssigned(businessId, conversationId, agentId, assignedAt);

        return { success: true, agent_id: agentId, assigned_at: assignedAt };
    }

    /**
     * Agent resolves/closes the conversation.
     */
    async resolve(businessId: string, conversationId: string) {
        const pgRow = await this.prisma.lead_conversations.findFirst({
            where: { conversation_id: conversationId, business_id: businessId },
        });

        if (!pgRow) throw new NotFoundException('Conversation not found');

        const resolvedAt = new Date();

        await Promise.all([
            this.prisma.lead_conversations.updateMany({
                where: { conversation_id: conversationId },
                data: { is_resolved: true, resolved_at: resolvedAt, status: 'ended' },
            }),
            this.conversationService.updateConversation(conversationId, { status: 'ended' }),
        ]);

        this.gateway.notifyResolved(businessId, conversationId, resolvedAt);

        return { success: true, resolved_at: resolvedAt };
    }

    /**
     * Agent sends a WhatsApp message to the customer.
     */
    async sendReply(businessId: string, conversationId: string, agentId: string, content: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        const account = await this.prisma.social_accounts.findFirst({
            where: { business_id: businessId, platform: 'whatsapp', is_active: true },
        });

        if (!account?.page_id) {
            throw new BadRequestException('No active WhatsApp account connected for this business');
        }

        const phoneNumberId = account.page_id;
        const to = conversation.customer_id;

        const apiResult = await this.whatsappService.sendMessage(phoneNumberId, to, {
            messaging_product: 'whatsapp',
            to,
            type: SendMessageType.TEXT,
            text: { body: content },
        });

        const platformMessageId = apiResult?.messages?.[0]?.id;
        const timestamp = new Date();

        const saved = await this.conversationService.createMessage({
            conversation_id: conversationId,
            lead_id: conversation.lead_id,
            business_id: businessId,
            tenant_id: conversation.tenant_id,
            sender_type: 'business',
            sender_id: phoneNumberId,
            sender_name: 'Agent',
            message_text: content,
            message_type: 'text',
            platform_message_id: platformMessageId,
            delivery_status: 'sent',
            assigned_to: agentId,
            metadata: { is_agent: true, agent_id: agentId },
        });

        const message = {
            _id: (saved._id as any).toString(),
            conversation_id: conversationId,
            sender_type: 'business',
            sender_name: 'Agent',
            message_type: 'text',
            message_text: content,
            timestamp,
            metadata: { is_agent: true, agent_id: agentId },
        };

        this.gateway.notifyAgentMessage(businessId, conversationId, message);

        return { success: true, message };
    }

    /**
     * Called by WhatsApp webhook when a customer replies to a human-handled conversation.
     * Emits customer_message on the /handoff namespace so agents see it in real-time.
     */
    async notifyInboundCustomerMessage(
        businessId: string,
        conversationId: string,
        message: any,
    ) {
        this.gateway.notifyCustomerMessage(businessId, conversationId, message);
    }
}
