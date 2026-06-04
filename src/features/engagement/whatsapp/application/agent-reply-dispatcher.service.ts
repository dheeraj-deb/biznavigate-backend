import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentContext } from 'src/features/ai/agent/agent.service';
import { decodeFlow, decodeHandoff, FlowPayload, HandoffPayload } from 'src/features/ai/agent/types/handoff';
import { ConversationService } from 'src/features/crm/conversation/conversation.service';
import { HumanHandoffGateway } from 'src/features/crm/human-handoff/human-handoff.gateway';
import { InboxGateway } from 'src/features/crm/inbox/gateway/inbox.gateway';
import { HospitalityFlowService } from 'src/features/whatsapp-flows/hospitality-flow.service';
import { WhatsAppFlowsService } from 'src/features/whatsapp-flows/whatsapp-flows.service';
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
    private readonly hospitalityFlowService: HospitalityFlowService,
    private readonly whatsappFlowsService: WhatsAppFlowsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async dispatch(input: AgentReplyDispatchInput): Promise<void> {
    const replyCtx = this.replyContext(input);

    const handoff = decodeHandoff(input.reply);
    if (handoff) {
      await this.handleHandoff(handoff, input, replyCtx);
      return;
    }

    const flow = decodeFlow(input.reply);
    if (flow) {
      await this.handleFlow(flow, input, replyCtx);
      return;
    }

    await this.whatsappService.sendAgentReply(
      input.ctx.businessId,
      input.phoneNumberId,
      input.customerPhone,
      input.reply,
      replyCtx,
    );

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

  private async handleFlow(
    flow: FlowPayload,
    input: AgentReplyDispatchInput,
    replyCtx: ReplyContext,
  ): Promise<void> {
    this.eventEmitter.emit('conversation.flow.requested', {
      business_id: input.ctx.businessId,
      tenant_id: replyCtx.tenantId,
      lead_id: replyCtx.leadId,
      conversation_id: replyCtx.conversationId,
      channel: 'whatsapp',
      flow_type: flow.flowType,
      payload: flow,
      emitted_at: new Date().toISOString(),
    });

    if (flow.flowType !== 'availability') {
      await this.whatsappService.sendAgentReply(
        input.ctx.businessId,
        input.phoneNumberId,
        input.customerPhone,
        "You're being connected to our team. Someone will help you shortly.",
        replyCtx,
      );
      return;
    }

    const businessId = this.stringValue(flow.businessId) || input.ctx.businessId;
    const checkIn = this.stringValue(flow.checkIn) || this.stringValue(flow.check_in);
    const checkOut = this.stringValue(flow.checkOut) || this.stringValue(flow.check_out);
    const propertyName = this.stringValue(flow.propertyName) || this.stringValue(flow.property_name);

    if (!checkIn || !checkOut) {
      await this.whatsappService.sendAgentReply(
        businessId,
        input.phoneNumberId,
        input.customerPhone,
        'Please share your check-in and check-out dates so I can check availability.',
        replyCtx,
      );
      return;
    }

    const flowId = await this.whatsappFlowsService.findHospitalityFlowId(businessId).catch((error) => {
      this.logger.warn(`Could not find hospitality WhatsApp flow for business ${businessId}: ${error?.message ?? error}`);
      return null;
    });

    if (flowId) {
      await this.whatsappService.sendFlowMessage(
        input.phoneNumberId,
        input.customerPhone,
        `I found your stay dates: ${checkIn} to ${checkOut}. Tap below to view available rooms.`,
        'View rooms',
        flowId,
        'Check availability',
        undefined,
        undefined,
        JSON.stringify({ check_in: checkIn, check_out: checkOut, property_name: propertyName }),
        undefined,
        {
          business_id: businessId,
          check_in: checkIn,
          check_out: checkOut,
          property_name: propertyName,
        },
      );

      this.emitAvailabilityChecked(input, replyCtx, businessId, checkIn, checkOut, propertyName, 'whatsapp_flow');
      return;
    }

    const availability = await this.hospitalityFlowService.checkAvailability(
      { check_in: checkIn, check_out: checkOut, property_name: propertyName },
      '',
      businessId,
    );
    await this.whatsappService.sendAgentReply(
      businessId,
      input.phoneNumberId,
      input.customerPhone,
      this.availabilityText(availability, checkIn, checkOut),
      replyCtx,
    );

    this.emitAvailabilityChecked(input, replyCtx, businessId, checkIn, checkOut, propertyName, 'text_fallback', availability);
  }

  private emitAvailabilityChecked(
    input: AgentReplyDispatchInput,
    replyCtx: ReplyContext,
    businessId: string,
    checkIn: string,
    checkOut: string,
    propertyName: string | undefined,
    deliveryMode: 'whatsapp_flow' | 'text_fallback',
    result?: any,
  ) {
    this.eventEmitter.emit('conversation.availability.checked', {
      business_id: businessId,
      tenant_id: replyCtx.tenantId,
      lead_id: replyCtx.leadId,
      conversation_id: replyCtx.conversationId,
      channel: 'whatsapp',
      check_in: checkIn,
      check_out: checkOut,
      property_name: propertyName,
      delivery_mode: deliveryMode,
      available_count: Array.isArray(result?.data?.available_services) ? result.data.available_services.length : undefined,
      customer_phone: input.customerPhone,
      emitted_at: new Date().toISOString(),
    });
  }

  private availabilityText(result: any, checkIn: string, checkOut: string): string {
    const services = Array.isArray(result?.data?.available_services) ? result.data.available_services : [];
    if (!services.length) {
      return result?.data?.error_message || `No rooms are available from ${checkIn} to ${checkOut}.`;
    }

    const lines = services.slice(0, 5).map((service: any, index: number) => {
      const title = service?.['main-content']?.title || service?.title || service?.name || `Option ${index + 1}`;
      const price = service?.['main-content']?.metadata ? ` - ${service['main-content'].metadata}` : '';
      return `${index + 1}. ${title}${price}`;
    });
    return `Available rooms from ${checkIn} to ${checkOut}:\n${lines.join('\n')}\n\nReply with the room name or number to continue.`;
  }

  private replyContext(input: AgentReplyDispatchInput): ReplyContext {
    return {
      conversationId: input.lastPayload.context?.conversation_id ?? input.conversationId,
      leadId: input.lastPayload.lead_id,
      tenantId: input.lastPayload.tenant_id,
    };
  }

  private stringValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
  }
}
