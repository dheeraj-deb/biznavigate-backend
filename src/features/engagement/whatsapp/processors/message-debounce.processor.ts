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
import { normalizeBookingMethodsConfig } from 'src/features/platform/business-settings/booking-methods.config';
import { HospitalityBookingCommandService } from 'src/features/industries/hospitality/bookings/application/services/hospitality-booking-command.service';

type LocalizedMessageKey = 'handoff' | 'error' | 'no_availability' | 'appointment_slots';

interface NativeBookingDraft {
  businessId: string;
  tenantId?: string;
  leadId?: string;
  conversationId: string;
  customerPhone: string;
  phoneNumberId: string;
  checkIn: string;
  checkOut: string;
  selectedItemId?: string;
  selectedItemName?: string;
  selectedItemPrice?: string;
  guestName?: string;
  numGuests?: number;
  step: 'awaiting_selection' | 'awaiting_guest_details' | 'awaiting_confirmation';
  options: Array<{ itemId: string; name: string; price?: string }>;
}

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
    private readonly hospitalityBookingCommandService: HospitalityBookingCommandService,
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
      if (await this.handleNativeBookingDraftMessage(combinedText, lastPayload, agentCtx, phoneNumberId, customerPhone, conversationId, customerLanguage)) {
        return;
      }

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
      const bookingMethods = await this.getBookingMethods(businessId);

      if (screenResult.screen === 'AVAILABILITY_RESULT' && bookingMethods.availability_response.mode === 'flow' && nodeId) {
        await this.workflowsService.startFromNode(
          businessId,
          nodeId,
          lastPayload.lead_id,
          phoneNumberId,
          'whatsapp',
          { ...lastPayload, availability_navigate: screenResult },
        );
        this.logger.log(`🏨 Started availability flow for ${customerPhone}`);
      } else if (
        screenResult.screen === 'AVAILABILITY_RESULT' &&
        bookingMethods.availability_response.mode === 'interactive' &&
        bookingMethods.interactive.enabled
      ) {
        await this.sendAvailabilityOptions(
          screenResult,
          ctx,
          lastPayload,
          phoneNumberId,
          customerPhone,
          checkIn,
          checkOut,
          customerLanguage,
        );
        this.logger.log(`🏨 Sent availability options for ${customerPhone}`);
      } else {
        const fallbackText =
          this.nonEmptyString(screenResult.data?.error_message) ??
          this.availabilitySummary(screenResult, checkIn, checkOut, customerLanguage) ??
          this.localizedMessage(customerLanguage, 'no_availability', { checkIn, checkOut });
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

  private async sendAvailabilityOptions(
    screenResult: any,
    ctx: AgentContext,
    lastPayload: any,
    phoneNumberId: string,
    customerPhone: string,
    checkIn: string,
    checkOut: string,
    customerLanguage: CustomerLanguage,
  ) {
    const services = Array.isArray(screenResult?.data?.available_services)
      ? screenResult.data.available_services
      : [];

    if (!services.length) {
      await this.whatsappService.sendAgentReply(
        ctx.businessId,
        phoneNumberId,
        customerPhone,
        this.localizedMessage(customerLanguage, 'no_availability', { checkIn, checkOut }),
      );
      return;
    }

    const rows = services.slice(0, 10).map((service: any) => {
      const title = this.truncateForWhatsAppList(
        String(service?.['main-content']?.title ?? service?.name ?? 'Room option'),
        24,
      );
      const metadata = this.truncateForWhatsAppList(String(service?.['main-content']?.metadata ?? ''), 72);
      return {
        id: `book_${String(service.id).slice(0, 80)}`,
        title,
        ...(metadata ? { description: metadata } : {}),
      };
    });

    if (rows.length) {
      await this.saveNativeBookingDraft({
        businessId: ctx.businessId,
        tenantId: lastPayload.tenant_id,
        leadId: lastPayload.lead_id,
        conversationId: lastPayload.context?.conversation_id ?? ctx.conversationId,
        customerPhone,
        phoneNumberId,
        checkIn,
        checkOut,
        step: 'awaiting_selection',
        options: services.slice(0, 10).map((service: any) => ({
          itemId: String(service.id),
          name: String(service?.['main-content']?.title ?? service?.name ?? 'Room option'),
          price: String(service?.['main-content']?.metadata ?? '').trim() || undefined,
        })),
      });
      await this.whatsappService.sendListMessage(
        phoneNumberId,
        customerPhone,
        this.localizedAvailabilityIntro(customerLanguage, checkIn, checkOut),
        'View rooms',
        [{ title: 'Available rooms', rows }],
        'Available rooms',
      );
      return;
    }

    await this.whatsappService.sendAgentReply(
      ctx.businessId,
      phoneNumberId,
      customerPhone,
      this.availabilitySummary(screenResult, checkIn, checkOut, customerLanguage) ??
        this.localizedMessage(customerLanguage, 'no_availability', { checkIn, checkOut }),
    );
  }

  private async handleNativeBookingDraftMessage(
    input: string,
    lastPayload: any,
    ctx: AgentContext,
    phoneNumberId: string,
    customerPhone: string,
    conversationId: string,
    customerLanguage: CustomerLanguage,
  ): Promise<boolean> {
    const normalized = input.trim();
    const draft = await this.getNativeBookingDraft(conversationId);

    if (normalized.startsWith('book_')) {
      if (!draft) {
        await this.whatsappService.sendAgentReply(
          ctx.businessId,
          phoneNumberId,
          customerPhone,
          'Please check availability again, then choose a room from the latest list.',
        );
        return true;
      }

      const itemId = normalized.slice('book_'.length);
      const option = draft.options.find((candidate) => candidate.itemId === itemId);
      if (!option) {
        await this.whatsappService.sendAgentReply(
          ctx.businessId,
          phoneNumberId,
          customerPhone,
          'That room option is no longer available in this booking session. Please check availability again.',
        );
        return true;
      }

      const nextDraft: NativeBookingDraft = {
        ...draft,
        selectedItemId: option.itemId,
        selectedItemName: option.name,
        selectedItemPrice: option.price,
        step: 'awaiting_guest_details',
      };
      await this.saveNativeBookingDraft(nextDraft);
      await this.whatsappService.sendAgentReply(
        ctx.businessId,
        phoneNumberId,
        customerPhone,
        `Great choice: ${option.name}${option.price ? ` (${option.price})` : ''}.\nPlease share guest name and number of guests.`,
      );
      return true;
    }

    if (!draft) return false;

    if (normalized === 'booking_cancel' || /^(cancel|stop|no)$/i.test(normalized)) {
      await this.clearNativeBookingDraft(conversationId);
      await this.whatsappService.sendAgentReply(ctx.businessId, phoneNumberId, customerPhone, 'Booking cancelled. How else can I help?');
      return true;
    }

    if (draft.step === 'awaiting_guest_details') {
      const details = this.extractGuestDetails(normalized, customerPhone);
      const nextDraft: NativeBookingDraft = {
        ...draft,
        guestName: details.guestName,
        numGuests: details.numGuests,
        step: 'awaiting_confirmation',
        tenantId: draft.tenantId ?? lastPayload.tenant_id,
        leadId: draft.leadId ?? lastPayload.lead_id,
      };
      await this.saveNativeBookingDraft(nextDraft);
      await this.whatsappService.sendButtonMessage(
        phoneNumberId,
        customerPhone,
        this.bookingConfirmationText(nextDraft),
        [
          { id: 'booking_confirm', title: 'Confirm' },
          { id: 'booking_cancel', title: 'Cancel' },
        ],
        'Confirm booking',
      );
      return true;
    }

    if (draft.step === 'awaiting_confirmation') {
      if (normalized === 'booking_confirm' || /^(yes|confirm|ok|okay|book|proceed)$/i.test(normalized)) {
        await this.createNativeBooking(draft, ctx, phoneNumberId, customerPhone);
        await this.clearNativeBookingDraft(conversationId);
        return true;
      }

      await this.whatsappService.sendAgentReply(
        ctx.businessId,
        phoneNumberId,
        customerPhone,
        'Please tap Confirm to create the booking, or Cancel to stop.',
      );
      return true;
    }

    return false;
  }

  private bookingConfirmationText(draft: NativeBookingDraft): string {
    return [
      `Confirm booking for ${draft.selectedItemName ?? 'selected room'}?`,
      `Dates: ${draft.checkIn} to ${draft.checkOut}`,
      `Guest: ${draft.guestName ?? 'Guest'}`,
      `Guests: ${draft.numGuests ?? 1}`,
      draft.selectedItemPrice ? `Price: ${draft.selectedItemPrice}` : '',
    ].filter(Boolean).join('\n');
  }

  private async createNativeBooking(
    draft: NativeBookingDraft,
    ctx: AgentContext,
    phoneNumberId: string,
    customerPhone: string,
  ) {
    if (!draft.selectedItemId) {
      await this.whatsappService.sendAgentReply(ctx.businessId, phoneNumberId, customerPhone, 'Please choose a room before confirming.');
      return;
    }

    const result = await this.hospitalityBookingCommandService.createBooking({
      business_id: draft.businessId,
      service_id: draft.selectedItemId,
      check_in: draft.checkIn,
      check_out: draft.checkOut,
      guest_name: draft.guestName,
      num_guests: draft.numGuests ?? 1,
      customer_phone: draft.customerPhone,
      lead_id: draft.leadId,
      source: 'whatsapp_interactive',
      actor: 'ai',
    });

    await this.whatsappService.sendAgentReply(
      ctx.businessId,
      phoneNumberId,
      customerPhone,
      `Booking confirmed. Booking ID: ${result.hospitality_booking_id ?? result.booking_id ?? result.legacy_order_id}`,
    );
  }

  private extractGuestDetails(input: string, fallbackPhone: string) {
    const guestsMatch = input.match(/\b(\d{1,2})\b/);
    const numGuests = guestsMatch ? Math.max(1, Number(guestsMatch[1])) : 1;
    const guestName = input
      .replace(/\b\d{1,2}\b/g, '')
      .replace(/\b(guest|guests|person|persons|people|adults|adult|pax|for)\b/gi, '')
      .replace(/[,+]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || fallbackPhone;

    return { guestName, numGuests };
  }

  private nativeBookingDraftKey(conversationId: string) {
    return `booking:draft:${conversationId}`;
  }

  private async saveNativeBookingDraft(draft: NativeBookingDraft) {
    const redis = getRedis();
    await redis.set(this.nativeBookingDraftKey(draft.conversationId), JSON.stringify(draft), 'EX', 60 * 60);
  }

  private async getNativeBookingDraft(conversationId: string): Promise<NativeBookingDraft | null> {
    const redis = getRedis();
    const raw = await redis.get(this.nativeBookingDraftKey(conversationId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as NativeBookingDraft;
    } catch {
      await redis.del(this.nativeBookingDraftKey(conversationId));
      return null;
    }
  }

  private async clearNativeBookingDraft(conversationId: string) {
    const redis = getRedis();
    await redis.del(this.nativeBookingDraftKey(conversationId));
  }

  private availabilitySummary(
    screenResult: any,
    checkIn: string,
    checkOut: string,
    language: CustomerLanguage,
  ): string | null {
    const services = Array.isArray(screenResult?.data?.available_services)
      ? screenResult.data.available_services
      : [];
    if (!services.length) return null;

    const lines = services.slice(0, 5).map((service: any, index: number) => {
      const title = String(service?.['main-content']?.title ?? service?.name ?? `Room ${index + 1}`);
      const price = String(service?.['main-content']?.metadata ?? '').trim();
      return `${index + 1}. ${title}${price ? ` - ${price}` : ''}`;
    });

    return `${this.localizedAvailabilityIntro(language, checkIn, checkOut)}\n${lines.join('\n')}\n\nReply with the room number/name to continue booking.`;
  }

  private localizedAvailabilityIntro(language: CustomerLanguage, checkIn: string, checkOut: string): string {
    const messages: Record<CustomerLanguage, string> = {
      english: `Rooms are available from ${checkIn} to ${checkOut}. Please choose an option:`,
      hindi: `${checkIn} से ${checkOut} तक rooms available हैं। कृपया option चुनें:`,
      malayalam: `${checkIn} മുതൽ ${checkOut} വരെ rooms available ആണ്. ഒരു option തിരഞ്ഞെടുക്കൂ:`,
      tamil: `${checkIn} முதல் ${checkOut} வரை rooms available உள்ளது. ஒரு option தேர்வு செய்யவும்:`,
    };
    return messages[language] ?? messages.english;
  }

  private truncateForWhatsAppList(value: string, maxLength: number): string {
    const trimmed = value.replace(/\s+/g, ' ').trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd();
  }

  private nonEmptyString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private async getBookingMethods(businessId: string) {
    const settings = await (this.prisma.business_settings as any).findUnique({
      where: { business_id: businessId },
      select: { booking_methods: true },
    }).catch(() => null);

    return normalizeBookingMethodsConfig(settings?.booking_methods);
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
