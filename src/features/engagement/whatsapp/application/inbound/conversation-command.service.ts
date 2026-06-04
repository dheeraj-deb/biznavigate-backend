import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ConversationService } from '../../../../crm/conversation/conversation.service';
import { HumanHandoffGateway } from '../../../../crm/human-handoff/human-handoff.gateway';
import { InboxGateway } from '../../../../crm/inbox/gateway/inbox.gateway';
import { NormalizedWhatsAppMessage } from './whatsapp-message-normalizer.service';
import { MessageWindowService } from '../../../../crm/conversation/messaging-window/message-window.service';

export interface PersistedInboundConversationMessage {
  conversation: any;
  lead_message_id: string;
}

@Injectable()
export class ConversationCommandService {
  private readonly logger = new Logger(ConversationCommandService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly inboxGateway: InboxGateway,
    private readonly humanHandoffGateway: HumanHandoffGateway,
    private readonly messageWindow: MessageWindowService,
  ) {}

  async persistInboundMessage(params: {
    account: any;
    lead: any;
    contact_name: string;
    phone_number_id: string;
    message: NormalizedWhatsAppMessage;
  }): Promise<PersistedInboundConversationMessage | null> {
    const existingMessage = await this.conversationService.findMessageByPlatformId(params.message.message_id);
    if (existingMessage) {
      this.logger.debug(`Message ${params.message.message_id} already processed, skipping duplicate`);
      return null;
    }

    let conversation = await this.conversationService.findActiveConversation(
      params.lead.lead_id,
      'whatsapp',
      params.account.business_id,
    );

    if (!conversation) {
      conversation = await this.conversationService.createConversation({
        conversation_id: randomUUID(),
        lead_id: params.lead.lead_id,
        platform_id: params.message.from,
        customer_id: params.message.from,
        sender_name: params.contact_name,
        business_id: params.account.business_id,
        tenant_id: params.account.businesses?.tenant_id,
        channel: 'whatsapp',
        status: 'open',
        is_ai: true,
      });
    }

    const waitingExecution = await this.prisma.workflow_executions.findFirst({
      where: { lead_id: params.lead.lead_id, waiting_for_input: true, channel: 'whatsapp' },
      select: { current_node_id: true },
    });

    let leadMessage: any;
    try {
      leadMessage = await this.conversationService.createMessage({
        conversation_id: conversation.conversation_id,
        lead_id: params.lead.lead_id,
        business_id: params.account.business_id,
        tenant_id: params.account.businesses.tenant_id,
        sender_type: 'lead',
        sender_id: params.phone_number_id,
        sender_name: params.contact_name,
        message_text: params.message.message_text,
        message_type: params.message.message_type,
        message_response_based_on_type: params.message.button_id,
        platform_message_id: params.message.message_id,
        delivery_status: 'received',
        workflow_node_id: waitingExecution?.current_node_id ?? undefined,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        this.logger.debug(`Duplicate insert for message ${params.message.message_id}, skipping`);
        return null;
      }
      throw error;
    }

    const leadMessageId = (leadMessage._id as any).toString();
    await this.conversationService.touchConversation(conversation.conversation_id, params.message.message_text);
    // Anchor the 24-hour messaging window. Automations check this when deciding
    // whether they can send free-form text to this customer.
    await this.conversationService.markInbound(conversation.conversation_id);
    this.messageWindow.invalidate(params.account.business_id, params.lead.lead_id);

    const msgTimestamp = new Date();
    this.inboxGateway.notifyNewMessage(params.account.business_id, conversation.conversation_id, {
      _id: leadMessageId,
      conversation_id: conversation.conversation_id,
      sender_type: 'lead',
      sender_name: params.contact_name,
      message_type: params.message.message_type,
      message_text: params.message.message_text,
      platform_message_id: params.message.message_id,
      delivery_status: 'received',
      timestamp: msgTimestamp,
    });
    this.inboxGateway.notifyConversationUpdated(params.account.business_id, conversation.conversation_id, {
      message_text: params.message.message_text,
      timestamp: msgTimestamp,
    });

    const mongoConv = await this.conversationService.findConversationById(conversation.conversation_id);
    if (mongoConv && mongoConv.is_ai === false && mongoConv.status !== 'resolved') {
      this.humanHandoffGateway.notifyCustomerMessage(params.account.business_id, conversation.conversation_id, {
        _id: leadMessageId,
        conversation_id: conversation.conversation_id,
        sender_type: 'lead',
        sender_name: params.contact_name,
        message_type: params.message.message_type,
        message_text: params.message.message_text,
        platform_message_id: params.message.message_id,
        timestamp: msgTimestamp,
      });
    }

    return {
      conversation,
      lead_message_id: leadMessageId,
    };
  }
}
