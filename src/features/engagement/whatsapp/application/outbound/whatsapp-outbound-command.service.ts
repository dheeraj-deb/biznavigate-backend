import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConversationService } from '../../../../crm/conversation/conversation.service';
import { InboxGateway } from '../../../../crm/inbox/gateway/inbox.gateway';

export interface PersistOutboundMessageCommand {
  account: any;
  lead?: any | null;
  to: string;
  text: string;
  message_type: string;
  platform_message_id?: string | null;
  workflow_node_id?: string;
  metadata?: Record<string, any>;
  sender_name?: string;
  assigned_to?: string;
  conversation_context?: {
    conversation_id: string;
    lead_id: string;
    tenant_id: string;
  };
}

@Injectable()
export class WhatsAppOutboundCommandService {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly inboxGateway: InboxGateway,
  ) {}

  async persistSentMessage(command: PersistOutboundMessageCommand): Promise<void> {
    if (!command.platform_message_id) return;

    const context = command.conversation_context ?? await this.resolveConversationContext(command);
    if (!context) return;

    const senderName = command.sender_name ?? command.account.businesses?.business_name ?? 'Business';
    const saved = await this.conversationService.createMessage({
      conversation_id: context.conversation_id,
      lead_id: context.lead_id,
      business_id: command.account.business_id,
      tenant_id: context.tenant_id,
      sender_type: 'business',
      sender_id: command.account.page_id,
      sender_name: senderName,
      message_text: command.text,
      message_type: command.message_type,
      platform_message_id: command.platform_message_id,
      delivery_status: 'sent',
      workflow_node_id: command.workflow_node_id,
      assigned_to: command.assigned_to,
      ...(command.metadata && { metadata: command.metadata }),
    });

    const timestamp = new Date();
    await this.conversationService.touchConversation(context.conversation_id, command.text);

    this.inboxGateway.notifyNewMessage(command.account.business_id, context.conversation_id, {
      _id: (saved._id as any).toString(),
      conversation_id: context.conversation_id,
      sender_type: 'business',
      sender_name: senderName,
      message_type: command.message_type,
      message_text: command.text,
      platform_message_id: command.platform_message_id,
      delivery_status: 'sent',
      timestamp,
      ...(command.metadata && { metadata: command.metadata }),
    });
    this.inboxGateway.notifyConversationUpdated(command.account.business_id, context.conversation_id, {
      message_text: command.text,
      timestamp,
    });
  }

  private async resolveConversationContext(command: PersistOutboundMessageCommand) {
    const lead = command.lead;
    if (!lead) return null;

    let conversation = await this.conversationService.findActiveConversation(
      lead.lead_id,
      'whatsapp',
      command.account.business_id,
    );

    if (!conversation) {
      conversation = await this.conversationService.createConversation({
        conversation_id: randomUUID(),
        lead_id: lead.lead_id,
        customer_id: command.to,
        business_id: command.account.business_id,
        tenant_id: command.account.businesses.tenant_id,
        channel: 'whatsapp',
        status: 'active',
        sender_id: command.account.page_id,
      });
    }

    return {
      conversation_id: conversation.conversation_id,
      lead_id: lead.lead_id,
      tenant_id: command.account.businesses.tenant_id,
    };
  }
}
