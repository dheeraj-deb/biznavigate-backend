import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentContext } from 'src/features/ai/agent/agent.service';
import { decodeHandoff, HandoffPayload } from 'src/features/ai/agent/types/handoff';
import { ConversationService } from 'src/features/crm/conversation/conversation.service';
import { HumanHandoffGateway } from 'src/features/crm/human-handoff/human-handoff.gateway';
import { InboxGateway } from 'src/features/crm/inbox/gateway/inbox.gateway';
import { WhatsAppService } from './whatsapp.service';

export interface AgentReplyDispatchInput {
  reply: string;
  ctx: AgentContext;
  lastPayload: any;
  phoneNumberId: string;
  customerPhone: string;
  conversationId: string;
}

interface ReplyContext {
  conversationId: string;
  leadId: string;
  tenantId: string;
}

@Injectable()
export class AgentReplyDispatcherService {
  private readonly logger = new Logger(AgentReplyDispatcherService.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly conversationService: ConversationService,
    private readonly inboxGateway: InboxGateway,
    private readonly humanHandoffGateway: HumanHandoffGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async dispatch(input: AgentReplyDispatchInput): Promise<void> {
    const replyCtx = this.replyContext(input);

    const handoff = decodeHandoff(input.reply);
    if (handoff) {
      await this.handleHandoff(handoff, input, replyCtx);
      return;
    }

    await this.whatsappService.sendAgentReply(
      input.ctx.businessId,
      input.phoneNumberId,
      input.customerPhone,
      input.reply,
      replyCtx,
    );
    this.emitBookingLinkSentIfPresent(input, replyCtx);

    this.eventEmitter.emit('conversation.agent.replied', {
      business_id: input.ctx.businessId,
      tenant_id: replyCtx.tenantId,
      lead_id: replyCtx.leadId,
      conversation_id: replyCtx.conversationId,
      channel: 'whatsapp',
      reply_type: 'text',
      emitted_at: new Date().toISOString(),
    });
  }

  private async handleHandoff(
    handoff: HandoffPayload,
    input: AgentReplyDispatchInput,
    replyCtx: ReplyContext,
  ): Promise<void> {
    const escalatedAt = new Date();
    const reason = handoff.reason || 'Customer needs human assistance';
    const systemText = `Conversation escalated to human agent: ${reason}`;

    await this.conversationService.updateConversation(replyCtx.conversationId, {
      is_ai: false,
      is_ai_handled: false,
      status: 'handed_off',
      human_takeover_at: escalatedAt,
      human_takeover_reason: reason,
    });

    const saved = await this.conversationService.createMessage({
      conversation_id: replyCtx.conversationId,
      lead_id: replyCtx.leadId,
      business_id: input.ctx.businessId,
      tenant_id: replyCtx.tenantId,
      sender_type: 'system',
      sender_name: 'System',
      message_text: systemText,
      message_type: 'text',
      delivery_status: 'sent',
      metadata: { is_escalation: true, reason, intent: handoff.intent, escalate_to: handoff.escalateTo },
      timestamp: escalatedAt,
    });

    this.humanHandoffGateway.notifyNewEscalation(input.ctx.businessId, {
      conversationId: replyCtx.conversationId,
      reason,
      phone: input.customerPhone,
      escalated_at: escalatedAt,
      customer_name: input.lastPayload.context?.contact?.name,
      lead_id: replyCtx.leadId,
    });
    this.inboxGateway.notifyEscalation(input.ctx.businessId, replyCtx.conversationId, {
      reason,
      phone: input.customerPhone,
      escalated_at: escalatedAt,
    });
    this.inboxGateway.notifyNewMessage(input.ctx.businessId, replyCtx.conversationId, {
      _id: (saved._id as any).toString(),
      conversation_id: replyCtx.conversationId,
      sender_type: 'system',
      sender_name: 'System',
      message_type: 'text',
      message_text: systemText,
      delivery_status: 'sent',
      timestamp: escalatedAt,
      is_escalation: true,
      reason,
    });

    this.eventEmitter.emit('conversation.handoff.requested', {
      business_id: input.ctx.businessId,
      tenant_id: replyCtx.tenantId,
      lead_id: replyCtx.leadId,
      conversation_id: replyCtx.conversationId,
      channel: 'whatsapp',
      reason,
      intent: handoff.intent,
      escalate_to: handoff.escalateTo,
      emitted_at: escalatedAt.toISOString(),
    });

    await this.whatsappService.sendAgentReply(
      input.ctx.businessId,
      input.phoneNumberId,
      input.customerPhone,
      "You're being connected to our team. Someone will help you shortly.",
      replyCtx,
    );
  }

  private replyContext(input: AgentReplyDispatchInput): ReplyContext {
    return {
      conversationId: input.lastPayload.context?.conversation_id ?? input.conversationId,
      leadId: input.lastPayload.lead_id,
      tenantId: input.lastPayload.tenant_id,
    };
  }

  private emitBookingLinkSentIfPresent(input: AgentReplyDispatchInput, replyCtx: ReplyContext): void {
    const bookingLink = this.extractBookingLink(input.reply);
    if (!bookingLink) return;

    const url = new URL(bookingLink);
    const checkIn = url.searchParams.get('checkIn') || undefined;
    const checkOut = url.searchParams.get('checkOut') || undefined;
    this.eventEmitter.emit('workflow.event.booking.link_sent', {
      business_id: input.ctx.businessId,
      tenant_id: replyCtx.tenantId,
      lead_id: replyCtx.leadId,
      event_name: 'booking.link_sent',
      payload: {
        booking_link: bookingLink,
        dates: checkIn && checkOut ? `${checkIn} to ${checkOut}` : undefined,
        check_in: checkIn,
        check_out: checkOut,
        guests: url.searchParams.get('guests') || undefined,
        customer_phone: input.customerPhone,
      },
      emitted_at: new Date().toISOString(),
    });
  }

  private extractBookingLink(text: string): string | null {
    const match = text.match(/https?:\/\/\S+\/book\/[^\s]+/);
    if (!match) return null;
    try {
      return new URL(match[0]).toString();
    } catch {
      return null;
    }
  }
}
