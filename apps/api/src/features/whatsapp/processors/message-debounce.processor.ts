import { Processor, WorkerHost, InjectQueue } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job, Queue, QueueEvents } from "bullmq";
import { KafkaProducerService } from "src/features/kafka/kafka-producer.service";
import { WhatsAppService } from "../whatsapp.service";
import { WorkflowsService } from "src/features/workflows/workflows.service";
import { HospitalityFlowService } from "src/features/whatsapp-flows/hospitality-flow.service";
import { getRedis } from "src/utils/redis";
import { PrismaService } from "src/prisma/prisma.service";
import { ConversationService } from "src/features/conversation/conversation.service";
import { InboxGateway } from "src/features/inbox/gateway/inbox.gateway";
import { HumanHandoffGateway } from "src/features/human-handoff/human-handoff.gateway";
import {
    AGENT_QUEUE_NAME,
    AgentJobType,
    ProcessMessageJobPayload,
} from "@biznavigate/common";

export const AGENT_QUEUE_EVENTS = 'AGENT_QUEUE_EVENTS';

/** Max time (ms) to wait for the agent worker to return a reply. */
const AGENT_REPLY_TIMEOUT_MS = 60_000;

@Processor('message-debounce')
export class MessageDebounceProcessor extends WorkerHost {
    private readonly logger = new Logger(MessageDebounceProcessor.name);

    constructor(
        private readonly kafkaProducer: KafkaProducerService,
        @InjectQueue(AGENT_QUEUE_NAME) private readonly agentQueue: Queue,
        @Inject(AGENT_QUEUE_EVENTS) private readonly agentQueueEvents: QueueEvents,
        private readonly whatsappService: WhatsAppService,
        private readonly workflowsService: WorkflowsService,
        private readonly hospitalityFlowService: HospitalityFlowService,
        private readonly prisma: PrismaService,
        private readonly conversationService: ConversationService,
        private readonly inboxGateway: InboxGateway,
        private readonly humanHandoffGateway: HumanHandoffGateway,
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

        const payloads: any[] = raw.map(r => JSON.parse(r));
        const combinedText = payloads.map(p => p.user_input).filter(Boolean).join(' ');
        const lastPayload = payloads[payloads.length - 1];

        this.logger.log(
            `🔀 Debounce fired for conv ${conversationId}: ${payloads.length} message(s) → "${combinedText}"`,
        );

        try {
            // ── Dispatch to agent worker process ────────────────────────────────
            const jobPayload: ProcessMessageJobPayload = {
                text: combinedText,
                businessId: lastPayload.business_id,
                leadId: lastPayload.lead_id,
                phone: lastPayload.context?.contact?.from,
                conversationId: lastPayload.context?.conversation_id ?? conversationId,
                enqueuedAt: new Date().toISOString(),
            };

            const agentJob = await this.agentQueue.add(
                AgentJobType.PROCESS_MESSAGE,
                jobPayload,
                {
                    attempts: 2,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            );

            // Block until the agent process returns the LLM reply
            const reply: string = await agentJob.waitUntilFinished(
                this.agentQueueEvents,
                AGENT_REPLY_TIMEOUT_MS,
            );

            const phoneNumberId = lastPayload.context?.contact?.phoneNumberId;
            const customerPhone = lastPayload.context?.contact?.from;

            if (reply.startsWith('HANDOFF:')) {
                const { reason } = JSON.parse(reply.slice(8));
                const activeConvId = lastPayload.context?.conversation_id ?? conversationId;
                const escalatedAt = new Date();

                await this.conversationService.updateConversation(activeConvId, {
                    is_ai: false,
                    status: 'handed_off',
                });

                const saved = await this.conversationService.createMessage({
                    conversation_id: activeConvId,
                    lead_id: lastPayload.lead_id,
                    business_id: lastPayload.business_id,
                    tenant_id: lastPayload.tenant_id,
                    sender_type: 'system',
                    sender_name: 'System',
                    message_text: `Conversation escalated to human agent: ${reason}`,
                    message_type: 'text',
                    delivery_status: 'sent',
                    metadata: { is_escalation: true, reason },
                });

                this.humanHandoffGateway.notifyNewEscalation(lastPayload.business_id, {
                    conversationId: activeConvId,
                    reason,
                    phone: customerPhone,
                    escalated_at: escalatedAt,
                    customer_name: lastPayload.context?.contact?.name,
                    lead_id: lastPayload.lead_id,
                });

                this.inboxGateway.notifyNewMessage(lastPayload.business_id, activeConvId, {
                    _id: (saved._id as any).toString(),
                    conversation_id: activeConvId,
                    sender_type: 'system',
                    message_type: 'text',
                    message_text: `Conversation escalated to human agent: ${reason}`,
                    timestamp: escalatedAt,
                });

                await this.whatsappService.sendAgentReply(
                    lastPayload.business_id,
                    phoneNumberId,
                    customerPhone,
                    "You're being connected to a human agent. Someone will be with you shortly.",
                );

                this.logger.log(`🙋 Escalated conv ${activeConvId} to human — reason: ${reason}`);

            } else if (reply.startsWith('FLOW:')) {
                const { businessId, checkIn, checkOut } = JSON.parse(reply.slice(5));

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
                    this.logger.log(`🏨 Started workflow at send_flow node for ${customerPhone}`);
                } else {
                    const fallbackText = screenResult.data?.error_message
                        || `No rooms available from ${checkIn} to ${checkOut}.`;
                    await this.whatsappService.sendAgentReply(businessId, phoneNumberId, customerPhone, fallbackText);
                }

            } else {
                await this.whatsappService.sendAgentReply(
                    lastPayload.business_id,
                    phoneNumberId,
                    customerPhone,
                    reply,
                    {
                        conversationId: lastPayload.context?.conversation_id ?? conversationId,
                        leadId: lastPayload.lead_id,
                        tenantId: lastPayload.tenant_id,
                    },
                );
            }

            this.logger.log(`🤖 Agent replied to ${customerPhone}`);

        } catch (err) {
            this.logger.error(
                `Agent failed for conv ${conversationId}, falling back to workflow: ${err.message}`,
            );
            await this.kafkaProducer.publishTextMessage({
                ...job.data,
                user_input: combinedText,
            });
        }
    }
}
