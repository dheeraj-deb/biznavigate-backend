import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Cache } from 'cache-manager';
import { KafkaProducerService } from 'src/features/kafka/kafka-producer.service';
import { AgentService, AgentContext } from 'src/features/ai/agent/agent.service';
import { WhatsAppService } from '../whatsapp.service';
import { WorkflowsService } from 'src/features/automation/workflows/workflows.service';
import { HospitalityFlowService } from 'src/features/whatsapp-flows/hospitality-flow.service';
import { getRedis } from 'src/utils/redis';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConversationService } from 'src/features/crm/conversation/conversation.service';
import { InboxGateway } from 'src/features/crm/inbox/gateway/inbox.gateway';
import { HumanHandoffGateway } from 'src/features/crm/human-handoff/human-handoff.gateway';
import { GenerationHandle } from 'src/features/ai/agent/types/generation-handle';
import { decodeHandoff, decodeFlow } from 'src/features/ai/agent/types/handoff';
import { AcknowledgmentService } from 'src/features/ai/agent/services/acknowledgment.service';
import { CustomerLanguage, detectCustomerLanguage } from 'src/features/ai/agent/utils/language-detector';

type LocalizedMessageKey = 'handoff' | 'error' | 'no_availability' | 'appointment_slots';

@Processor('message-debounce')
export class MessageDebounceProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageDebounceProcessor.name);

  // Track one speculative handle per conversationId (mirrors agents-js preemptive generation)
  private readonly speculativeHandles = new Map<string, { handle: GenerationHandle; promise: Promise<string | null> }>();
  private readonly conversationLanguages = new Map<string, CustomerLanguage>();
  private readonly maxLanguageMemoryEntries = 10_000;

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly agentService: AgentService,
    private readonly whatsappService: WhatsAppService,
    private readonly workflowsService: WorkflowsService,
    private readonly hospitalityFlowService: HospitalityFlowService,
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly inboxGateway: InboxGateway,
    private readonly humanHandoffGateway: HumanHandoffGateway,
    private readonly acknowledgmentService: AcknowledgmentService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { conversationId } = job.data;
    const redis = getRedis();
    const bufferKey = `msg_buffer:${conversationId}`;

    const raw = await redis.lrange(bufferKey, 0, -1);
    await redis.del(bufferKey);

    if (!raw.length) {
      this.logger.debug(`Buffer empty for conversation ${conversationId}, skipping`);
      return;
    }

    const payloads: any[] = raw.map((r) => JSON.parse(r));
    const combinedText = payloads.map((p) => p.user_input).filter(Boolean).join(' ');
    const lastPayload = payloads[payloads.length - 1];
    const firstText = payloads[0]?.user_input ?? combinedText;
    const previousLanguage = await this.getPreviousConversationLanguage(conversationId);
    const languageDetection = detectCustomerLanguage(combinedText, previousLanguage);
    const customerLanguage = languageDetection.language;
    await this.rememberConversationLanguage(conversationId, customerLanguage);

    this.logger.log(`🔀 Debounce fired for conv ${conversationId}: ${payloads.length} msg(s) → "${combinedText}"`);

    const agentCtx: AgentContext = {
      businessId: lastPayload.business_id,
      leadId: lastPayload.lead_id,
      phone: lastPayload.context?.contact?.from,
      conversationId: lastPayload.context?.conversation_id ?? conversationId,
    };
    const phoneNumberId = lastPayload.context?.contact?.phoneNumberId;
    const customerPhone = lastPayload.context?.contact?.from;

    try {
      let reply: string | null = null;

      // ── Preemptive generation (mirrors agents-js onPreemptiveGeneration) ──────
      // The job fires as soon as the first message arrives (before debounce window).
      // If the user sent only one message and the speculative result is still valid, use it.
      const spec = this.speculativeHandles.get(conversationId);
      if (spec && !spec.handle.cancelled && combinedText === firstText) {
        this.logger.debug(`Using speculative result for conv ${conversationId}`);
        reply = await spec.promise;
        spec.handle._markDone();
        this.speculativeHandles.delete(conversationId);
      }

      // If speculative result was cancelled or text changed, run fresh
      if (reply === null) {
        reply = await this.agentService.processMessage(combinedText, agentCtx);
      }

      if (reply === null) return; // cancelled

      await this.dispatchReply(reply, agentCtx, lastPayload, phoneNumberId, customerPhone, conversationId, customerLanguage);
      this.logger.log(`🤖 Agent replied to ${customerPhone}`);
    } catch (err) {
      this.logger.error(`Agent failed for conv ${conversationId}, falling back to workflow: ${err.message}`);
      await this.kafkaProducer.publishTextMessage({ ...lastPayload, user_input: combinedText });
    }
  }

  // Called externally (from whatsapp.service) when a new message arrives —
  // starts speculative LLM inference before the debounce window closes.
  startSpeculativeGeneration(conversationId: string, text: string, ctx: AgentContext): void {
    // Cancel any previous speculation for this conversation
    const existing = this.speculativeHandles.get(conversationId);
    if (existing && !existing.handle.cancelled) {
      existing.handle.cancel();
    }

    const handle = new GenerationHandle(`spec_${conversationId}_${Date.now()}`);
    const promise = this.agentService
      .processMessage(text, ctx)
      .catch(() => null);

    this.speculativeHandles.set(conversationId, { handle, promise });
    this.logger.debug(`Speculative generation started for conv ${conversationId}`);
  }

  // ── Reply dispatcher ────────────────────────────────────────────────────────

  private async dispatchReply(
    reply: string,
    ctx: AgentContext,
    lastPayload: any,
    phoneNumberId: string,
    customerPhone: string,
    conversationId: string,
    customerLanguage: CustomerLanguage,
  ): Promise<void> {
    const handoff = decodeHandoff(reply);
    if (handoff) {
      await this.handleHandoff(handoff, ctx, lastPayload, phoneNumberId, customerPhone, customerLanguage);
      return;
    }

    const flow = decodeFlow(reply);
    if (flow) {
      await this.handleFlow(flow, ctx, lastPayload, phoneNumberId, customerPhone, customerLanguage);
      return;
    }

    // Plain text reply — split into natural multi-message chunks and send with pacing
    const chunks = await this.acknowledgmentService.splitIntoChunks(reply);
    const replyCtx = {
      conversationId: lastPayload.context?.conversation_id ?? conversationId,
      leadId: lastPayload.lead_id,
      tenantId: lastPayload.tenant_id,
    };

    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        // Small typing pause between messages — scales with chunk length (min 600ms, max 2s)
        const pauseMs = Math.min(2000, Math.max(600, chunks[i].length * 18));
        await new Promise((resolve) => setTimeout(resolve, pauseMs));
      }
      await this.whatsappService.sendAgentReply(
        ctx.businessId,
        phoneNumberId,
        customerPhone,
        chunks[i],
        replyCtx,
      );
    }
  }

  private async handleHandoff(
    handoff: ReturnType<typeof decodeHandoff>,
    ctx: AgentContext,
    lastPayload: any,
    phoneNumberId: string,
    customerPhone: string,
    customerLanguage: CustomerLanguage,
  ): Promise<void> {
    const activeConvId = lastPayload.context?.conversation_id ?? ctx.conversationId;
    const escalatedAt = new Date();
    const { reason } = handoff!;

    await this.conversationService.updateConversation(activeConvId, {
      is_ai: false,
      status: 'handed_off',
    });

    const saved = await this.conversationService.createMessage({
      conversation_id: activeConvId,
      lead_id: lastPayload.lead_id,
      business_id: ctx.businessId,
      tenant_id: lastPayload.tenant_id,
      sender_type: 'system',
      sender_name: 'System',
      message_text: `Conversation escalated to human agent: ${reason}`,
      message_type: 'text',
      delivery_status: 'sent',
      metadata: { is_escalation: true, reason },
    });

    this.humanHandoffGateway.notifyNewEscalation(ctx.businessId, {
      conversationId: activeConvId,
      reason,
      phone: customerPhone,
      escalated_at: escalatedAt,
      customer_name: lastPayload.context?.contact?.name,
      lead_id: lastPayload.lead_id,
    });

    this.inboxGateway.notifyNewMessage(ctx.businessId, activeConvId, {
      _id: (saved._id as any).toString(),
      conversation_id: activeConvId,
      sender_type: 'system',
      message_type: 'text',
      message_text: `Conversation escalated to human agent: ${reason}`,
      timestamp: escalatedAt,
    });

    await this.whatsappService.sendAgentReply(
      ctx.businessId,
      phoneNumberId,
      customerPhone,
      this.localizedMessage(customerLanguage, 'handoff'),
    );

    this.logger.log(`🙋 Escalated conv ${activeConvId} to human — reason: ${reason}`);
  }

  private async handleFlow(
    flow: ReturnType<typeof decodeFlow>,
    ctx: AgentContext,
    lastPayload: any,
    phoneNumberId: string,
    customerPhone: string,
    customerLanguage: CustomerLanguage,
  ): Promise<void> {
    const { flowType } = flow!;

    if (flowType === 'availability') {
      const { businessId, checkIn, checkOut } = flow as any;
      const screenResult = await this.hospitalityFlowService.checkAvailability(
        { check_in: checkIn, check_out: checkOut },
        '',
        businessId,
      );
      const nodeId = await this.workflowsService.findSendFlowNodeId(businessId);

      if (nodeId && screenResult.screen === 'AVAILABILITY_RESULT') {
        await this.workflowsService.startFromNode(
          businessId,
          nodeId,
          lastPayload.lead_id,
          phoneNumberId,
          'whatsapp',
          { ...lastPayload, availability_navigate: screenResult },
        );
        this.logger.log(`🏨 Started availability flow for ${customerPhone}`);
      } else {
        const fallbackText =
          screenResult.data?.error_message ?? this.localizedMessage(customerLanguage, 'no_availability', { checkIn, checkOut });
        await this.whatsappService.sendAgentReply(ctx.businessId, phoneNumberId, customerPhone, fallbackText);
      }
      return;
    }

    // appointment / order flows — send plain summary for now (extend per vertical)
    if (flowType === 'appointment') {
      const { slots, date, serviceName } = flow as any;
      const slotList = Array.isArray(slots) ? slots.join('\n') : String(slots ?? '');
      const msg = this.localizedMessage(customerLanguage, 'appointment_slots', { serviceName, date, slotList });
      await this.whatsappService.sendAgentReply(ctx.businessId, phoneNumberId, customerPhone, msg);
      return;
    }

    // Unrecognised flow type — send raw payload as fallback
    this.logger.warn(`Unknown flowType "${flowType}" — sending fallback`);
    await this.whatsappService.sendAgentReply(
      ctx.businessId,
      phoneNumberId,
      customerPhone,
      this.localizedMessage(customerLanguage, 'error'),
    );
  }

  private localizedMessage(
    language: CustomerLanguage,
    key: LocalizedMessageKey,
    data: Record<string, any> = {},
  ): string {
    const messages: Record<LocalizedMessageKey, Record<CustomerLanguage, string>> = {
      handoff: {
        english: "You're being connected to a human agent. Someone will be with you shortly.",
        hindi: 'आपको human agent से जोड़ा जा रहा है। हमारी टीम जल्द ही आपसे बात करेगी।',
        malayalam: 'നിങ്ങളെ human agent-ലേക്ക് connect ചെയ്യുകയാണ്. ഞങ്ങളുടെ ടീം ഉടൻ സഹായിക്കും.',
        tamil: 'உங்களை human agent உடன் இணைக்கிறோம். எங்கள் குழு விரைவில் உதவும்.',
      },
      error: {
        english: 'Something went wrong processing your request. Please try again.',
        hindi: 'आपकी request process करते समय कुछ समस्या हुई। कृपया फिर से कोशिश करें।',
        malayalam: 'നിങ്ങളുടെ request process ചെയ്യുമ്പോൾ പ്രശ്നം സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
        tamil: 'உங்கள் request process செய்யும்போது ஒரு பிரச்சனை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
      },
      no_availability: {
        english: `No rooms available from ${data.checkIn} to ${data.checkOut}.`,
        hindi: `${data.checkIn} से ${data.checkOut} तक rooms available नहीं हैं।`,
        malayalam: `${data.checkIn} മുതൽ ${data.checkOut} വരെ rooms available അല്ല.`,
        tamil: `${data.checkIn} முதல் ${data.checkOut} வரை rooms available இல்லை.`,
      },
      appointment_slots: {
        english: `Available slots${data.serviceName ? ` for ${data.serviceName}` : ''} on ${data.date}:\n${data.slotList}`,
        hindi: `${data.date} को${data.serviceName ? ` ${data.serviceName} के लिए` : ''} available slots:\n${data.slotList}`,
        malayalam: `${data.date}-ന്${data.serviceName ? ` ${data.serviceName}ക്ക്` : ''} available slots:\n${data.slotList}`,
        tamil: `${data.date} அன்று${data.serviceName ? ` ${data.serviceName} க்கு` : ''} available slots:\n${data.slotList}`,
      },
    };

    return messages[key][language] ?? messages[key].english;
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
