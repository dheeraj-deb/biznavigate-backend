import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConversationService } from '../conversation/conversation.service';
import { WhatsAppService } from '../../engagement/whatsapp/whatsapp.service';
import { HumanHandoffGateway } from './human-handoff.gateway';
import { SendMessageType } from '../../engagement/whatsapp/dto/whatsapp-message.dto';

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
        // MongoDB is source of truth — handed_off conversations are those with is_ai: false
        const mongoConvs = await this.conversationService.findConversationsByBusinessAndStatus(
            businessId, 'handed_off',
        );

        this.logger.log(`getQueue found ${mongoConvs.length} conversations`);

        const data = mongoConvs.map(conv => ({
            conversation_id: conv.conversation_id,
            lead_id: conv.lead_id,
            agent_id: conv.agent_id ?? null,
            is_ai_handled: conv.is_ai ?? conv.is_ai_handled ?? false,
            is_resolved: conv.status === 'resolved',
            status: conv.status,
            channel: conv.channel,
            customer_name: (conv as any).sender_name ?? null,
            message_text: (conv as any).message_text ?? null,
        }));

        return { data, total: data.length };
    }

    /**
     * Get a single escalated conversation with recent messages.
     */
    async getConversation(businessId: string, conversationId: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        const { data: messages } = await this.conversationService.findMessagesByConversation(conversationId, 1, 50, businessId);

        return {
            conversation_id: conversation.conversation_id,
            lead_id: conversation.lead_id,
            agent_id: conversation.agent_id ?? null,
            is_ai_handled: conversation.is_ai ?? conversation.is_ai_handled ?? true,
            is_resolved: conversation.status === 'resolved',
            status: conversation.status,
            conversation,
            messages,
        };
    }

    /**
     * Agent takes over the conversation.
     */
    async takeover(businessId: string, conversationId: string, agentId: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        const assignedAt = new Date();
        await this.conversationService.updateConversation(conversationId, {
            agent_id: agentId,
            is_ai: false,
            status: 'handed_off',
        });

        this.gateway.notifyAgentAssigned(businessId, conversationId, agentId, assignedAt);
        return { success: true, agent_id: agentId, assigned_at: assignedAt };
    }

    /**
     * Agent resolves/closes the conversation.
     */
    async resolve(businessId: string, conversationId: string) {
        const conversation = await this.conversationService.findConversationById(conversationId);

        if (!conversation || conversation.business_id !== businessId) {
            throw new NotFoundException('Conversation not found');
        }

        const resolvedAt = new Date();

        await this.conversationService.updateConversation(conversationId, { status: 'ended' });

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
