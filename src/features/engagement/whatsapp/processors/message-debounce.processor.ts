import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Cache } from 'cache-manager';
import { AgentContext, AgentService } from 'src/features/ai/agent/agent.service';
import { decodeFlow, decodeHandoff, FlowPayload, HandoffPayload } from 'src/features/ai/agent/types/handoff';
import { CustomerLanguage, detectCustomerLanguage } from 'src/features/ai/agent/utils/language-detector';
import { ConversationService } from 'src/features/crm/conversation/conversation.service';
import { HumanHandoffGateway } from 'src/features/crm/human-handoff/human-handoff.gateway';
import { InboxGateway } from 'src/features/crm/inbox/gateway/inbox.gateway';
import { HospitalityFlowService } from 'src/features/whatsapp-flows/hospitality-flow.service';
import { WhatsAppFlowsService } from 'src/features/whatsapp-flows/whatsapp-flows.service';
import { getRedis } from 'src/utils/redis';
import { WhatsAppService } from '../application/whatsapp.service';

@Processor('message-debounce')
export class MessageDebounceProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageDebounceProcessor.name);
  private readonly conversationLanguages = new Map<string, CustomerLanguage>();
  private readonly maxLanguageMemoryEntries = 10_000;

  constructor(
    private readonly agentService: AgentService,
    private readonly whatsappService: WhatsAppService,
    private readonly conversationService: ConversationService,
    private readonly inboxGateway: InboxGateway,
    private readonly humanHandoffGateway: HumanHandoffGateway,
    private readonly hospitalityFlowService: HospitalityFlowService,
    private readonly whatsappFlowsService: WhatsAppFlowsService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { conversationId } = job.data;
    const redis = getRedis();
    const bufferKey = `msg_buffer:${conversationId}`;

    const raw = await redis.lrange(bufferKey, 0, -1);
    await redis.del(bufferKey);

    if (!raw.length) {
      this.logger.debug(`Buffer empty for conversation ${conversationId}, skipping`);
      return;
    }

    const payloads: any[] = raw.map((entry) => JSON.parse(entry));
    const combinedText = payloads.map((payload) => payload.user_input).filter(Boolean).join(' ');
    const lastPayload = payloads[payloads.length - 1];
    const previousLanguage = await this.getPreviousConversationLanguage(conversationId);
    const languageDetection = detectCustomerLanguage(combinedText, previousLanguage);
    await this.rememberConversationLanguage(conversationId, languageDetection.language);

    this.logger.log(`Debounce fired for conv ${conversationId}: ${payloads.length} msg(s)`);

    const phoneNumberId = lastPayload.context?.contact?.phoneNumberId;
    const customerPhone = lastPayload.context?.contact?.from;
    const agentCtx: AgentContext = {
      businessId: lastPayload.business_id,
      businessType: lastPayload.context?.business?.type,
      leadId: lastPayload.lead_id,
      phone: customerPhone,
      conversationId: lastPayload.context?.conversation_id ?? conversationId,
    };

    if (!phoneNumberId || !customerPhone || !agentCtx.businessId) {
      this.logger.warn(`Missing WhatsApp routing context for conversation ${conversationId}`);
      return;
    }

    this.logger.log(`Routing conv ${conversationId} to AI agent conversation mode`);
    const reply = await this.agentService.processMessage(combinedText, agentCtx);
    if (!reply) return;

    await this.dispatchAgentReply(reply, agentCtx, lastPayload, phoneNumberId, customerPhone, conversationId);
  }

  // Kept as a no-op for callers compiled against the old pre-generation hook.
  startSpeculativeGeneration(conversationId: string): void {
    this.logger.debug(`Speculative AI generation skipped: ${conversationId}`);
  }

  private async dispatchAgentReply(
    reply: string,
    ctx: AgentContext,
    lastPayload: any,
    phoneNumberId: string,
    customerPhone: string,
    conversationId: string,
  ): Promise<void> {
    const replyCtx = {
      conversationId: lastPayload.context?.conversation_id ?? conversationId,
      leadId: lastPayload.lead_id,
      tenantId: lastPayload.tenant_id,
    };

    const handoff = decodeHandoff(reply);
    if (handoff) {
      await this.handleHandoff(handoff, ctx, lastPayload, phoneNumberId, customerPhone, replyCtx);
      return;
    }

    const flow = decodeFlow(reply);
    if (flow) {
      await this.handleFlow(flow, ctx, phoneNumberId, customerPhone, replyCtx);
      return;
    }

    await this.whatsappService.sendAgentReply(
      ctx.businessId,
      phoneNumberId,
      customerPhone,
      reply,
      replyCtx,
    );
  }

  private async handleHandoff(
    handoff: HandoffPayload,
    ctx: AgentContext,
    lastPayload: any,
    phoneNumberId: string,
    customerPhone: string,
    replyCtx: { conversationId: string; leadId: string; tenantId: string },
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
      business_id: ctx.businessId,
      tenant_id: replyCtx.tenantId,
      sender_type: 'system',
      sender_name: 'System',
      message_text: systemText,
      message_type: 'text',
      delivery_status: 'sent',
      metadata: { is_escalation: true, reason, intent: handoff.intent, escalate_to: handoff.escalateTo },
      timestamp: escalatedAt,
    });

    this.humanHandoffGateway.notifyNewEscalation(ctx.businessId, {
      conversationId: replyCtx.conversationId,
      reason,
      phone: customerPhone,
      escalated_at: escalatedAt,
      customer_name: lastPayload.context?.contact?.name,
      lead_id: replyCtx.leadId,
    });
    this.inboxGateway.notifyEscalation(ctx.businessId, replyCtx.conversationId, {
      reason,
      phone: customerPhone,
      escalated_at: escalatedAt,
    });
    this.inboxGateway.notifyNewMessage(ctx.businessId, replyCtx.conversationId, {
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

    await this.whatsappService.sendAgentReply(
      ctx.businessId,
      phoneNumberId,
      customerPhone,
      "You're being connected to our team. Someone will help you shortly.",
      replyCtx,
    );
  }

  private async handleFlow(
    flow: FlowPayload,
    ctx: AgentContext,
    phoneNumberId: string,
    customerPhone: string,
    replyCtx: { conversationId: string; leadId: string; tenantId: string },
  ): Promise<void> {
    if (flow.flowType !== 'availability') {
      await this.whatsappService.sendAgentReply(
        ctx.businessId,
        phoneNumberId,
        customerPhone,
        "You're being connected to our team. Someone will help you shortly.",
        replyCtx,
      );
      return;
    }

    const businessId = this.stringValue(flow.businessId) || ctx.businessId;
    const checkIn = this.stringValue(flow.checkIn) || this.stringValue(flow.check_in);
    const checkOut = this.stringValue(flow.checkOut) || this.stringValue(flow.check_out);
    const propertyName = this.stringValue(flow.propertyName) || this.stringValue(flow.property_name);

    if (!checkIn || !checkOut) {
      await this.whatsappService.sendAgentReply(
        businessId,
        phoneNumberId,
        customerPhone,
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
        phoneNumberId,
        customerPhone,
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
      return;
    }

    const availability = await this.hospitalityFlowService.checkAvailability(
      { check_in: checkIn, check_out: checkOut, property_name: propertyName },
      '',
      businessId,
    );
    await this.whatsappService.sendAgentReply(
      businessId,
      phoneNumberId,
      customerPhone,
      this.availabilityText(availability, checkIn, checkOut),
      replyCtx,
    );
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

  private stringValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
  }

  private async getPreviousConversationLanguage(conversationId: string): Promise<CustomerLanguage | undefined> {
    const cached = this.conversationLanguages.get(conversationId);
    if (cached) return cached;

    const stored = await this.cache.get<CustomerLanguage>(this.languageCacheKey(conversationId));
    if (stored) {
      this.rememberConversationLanguageInMemory(conversationId, stored);
      return stored;
    }

    return undefined;
  }

  private async rememberConversationLanguage(conversationId: string, language: CustomerLanguage) {
    this.rememberConversationLanguageInMemory(conversationId, language);
    await this.cache.set(this.languageCacheKey(conversationId), language, 30 * 24 * 60 * 60 * 1000);
  }

  private rememberConversationLanguageInMemory(conversationId: string, language: CustomerLanguage) {
    this.conversationLanguages.delete(conversationId);
    this.conversationLanguages.set(conversationId, language);

    if (this.conversationLanguages.size <= this.maxLanguageMemoryEntries) return;

    const oldestKey = this.conversationLanguages.keys().next().value;
    if (oldestKey) this.conversationLanguages.delete(oldestKey);
  }

  private languageCacheKey(conversationId: string): string {
    return `agent:conversation_language:${conversationId}`;
  }
}
