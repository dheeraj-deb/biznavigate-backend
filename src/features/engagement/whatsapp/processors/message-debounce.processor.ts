import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
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

@Processor('message-debounce')
export class MessageDebounceProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageDebounceProcessor.name);

  // Track one speculative handle per conversationId (mirrors agents-js preemptive generation)
  private readonly speculativeHandles = new Map<string, { handle: GenerationHandle; promise: Promise<string | null> }>();

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

      await this.dispatchReply(reply, agentCtx, lastPayload, phoneNumberId, customerPhone, conversationId);
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
  ): Promise<void> {
    const handoff = decodeHandoff(reply);
    if (handoff) {
      await this.handleHandoff(handoff, ctx, lastPayload, phoneNumberId, customerPhone);
      return;
    }

    const flow = decodeFlow(reply);
    if (flow) {
      await this.handleFlow(flow, ctx, lastPayload, phoneNumberId, customerPhone);
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
      "You're being connected to a human agent. Someone will be with you shortly.",
    );

    this.logger.log(`🙋 Escalated conv ${activeConvId} to human — reason: ${reason}`);
  }

  private async handleFlow(
    flow: ReturnType<typeof decodeFlow>,
    ctx: AgentContext,
    lastPayload: any,
    phoneNumberId: string,
    customerPhone: string,
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
          screenResult.data?.error_message ?? `No rooms available from ${checkIn} to ${checkOut}.`;
        await this.whatsappService.sendAgentReply(ctx.businessId, phoneNumberId, customerPhone, fallbackText);
      }
      return;
    }

    // appointment / order flows — send plain summary for now (extend per vertical)
    if (flowType === 'appointment') {
      const { slots, date, serviceName } = flow as any;
      const slotList = Array.isArray(slots) ? slots.join('\n') : String(slots ?? '');
      const msg = `Available slots${serviceName ? ` for ${serviceName}` : ''} on ${date}:\n${slotList}`;
      await this.whatsappService.sendAgentReply(ctx.businessId, phoneNumberId, customerPhone, msg);
      return;
    }

    // Unrecognised flow type — send raw payload as fallback
    this.logger.warn(`Unknown flowType "${flowType}" — sending fallback`);
    await this.whatsappService.sendAgentReply(
      ctx.businessId,
      phoneNumberId,
      customerPhone,
      `Something went wrong processing your request. Please try again.`,
    );
  }
}
