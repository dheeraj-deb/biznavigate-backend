import { Injectable, Logger } from "@nestjs/common";
import { KafkaService } from "./kafka.service";
import { PrismaService } from "../../prisma/prisma.service";
import { EachMessagePayload } from "kafkajs";

/**
 * Kafka Consumer Service
 * Consumes and processes events from Kafka topics
 */
@Injectable()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private messageHandlers: Map<string, any> = new Map();

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Register a message handler for specific lead/business context
   */
  registerMessageHandler(handlerKey: string, handler: any) {
    this.messageHandlers.set(handlerKey, handler);
  }

  /**
   * Get registered message handler
   */
  getMessageHandler(handlerKey: string) {
    return this.messageHandlers.get(handlerKey);
  }

  /**
   * Start consuming messages
   */
  async consume() {
    if (!this.kafkaService.isConnected()) {
      this.logger.warn("Kafka consumer not started because Kafka is not connected");
      return;
    }

    const consumer = this.kafkaService.getConsumer();

    // Subscribe to topics
    await consumer.subscribe({
      topics: ["ai.process.result", "ai.error", "workflow-event"],
      fromBeginning: false,
    });

    // Start consuming
    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;

        try {
          const value = message.value?.toString();
          if (!value) return;

          const event = JSON.parse(value);

          this.logger.debug(
            `Received message from ${topic} [${partition}]: ${event.event_type}`
          );

          // Route to appropriate handler
          await this.handleMessage(topic, event);

          // Commit offset
          // await consumer.commitOffsets([
          //   {
          //     topic,
          //     partition,
          //     offset: (parseInt(message.offset) + 1).toString(),
          //   },
          // ]);
        } catch (error) {
          this.logger.error(`Error processing message from ${topic}:`, error);
          // Don't throw - continue processing other messages
        }
      },
    });

    this.logger.log("Kafka consumer started");
  }

  /**
   * Route message to appropriate handler
   */
  private async handleMessage(topic: string, event: any) {
    switch (event.event_type) {
      case "ai.process.result":
        await this.handleAiProcessResult(event);
        break;
      case "workflow.text.message":
        await this.handleWorkflowMessage(event);
        break;
      case "workflow.interactive.selection":
        await this.handleWorkflowMessage(event);
        break;
      case "workflow.catalog.order.completed":
        await this.handleCatalogOrderCompleted(event);
        break;
      case "ai.error":
        await this.handleAiError(event);
        break;
      default:
        this.logger.warn(`Unknown event type: ${event.event_type}`);
    }
  }

  /**
   * Handle AI processing result
   */
  private async handleAiProcessResult(event: any) {
    const { payload } = event;
    const { lead_id, intent, entities, suggested_actions, suggested_response } =
      payload;

    this.logger.log(
      `Processing AI result for lead ${lead_id}: ${intent?.intent} (${intent?.confidence})`
    );

    // Emit event that can be handled by WhatsApp or other services
    // Store the result so it can be retrieved
    await this.storeAiResult(payload);

    // Call ALL registered handlers (global handlers + per-lead handlers)
    const allHandlers = Array.from(this.messageHandlers.entries());

    for (const [handlerKey, handler] of allHandlers) {
      if (handler && typeof handler.handleAiResponse === 'function') {
        try {
          // Call global handlers (e.g., workflow-orchestration-global) for ALL messages
          // Call per-lead handlers (e.g., lead_id) only for matching lead
          const isGlobalHandler = handlerKey.includes('global');
          const isMatchingLeadHandler = handlerKey === lead_id;

          if (isGlobalHandler || isMatchingLeadHandler) {
            await handler.handleAiResponse(payload);
          }
        } catch (error) {
          this.logger.error(`Error in message handler '${handlerKey}':`, error);
        }
      }
    }
  }

  /**
   * Handle workflow-routed WhatsApp text/interactive messages.
   */
  private async handleWorkflowMessage(event: any) {
    const { payload } = event;
    const { lead_id, user_input } = payload;
    const eventType = event.event_type === 'workflow.interactive.selection'
      ? 'interactive selection'
      : 'text message';

    this.logger.log(
      `Processing workflow ${eventType} for lead ${lead_id}: ${user_input}`
    );

    // Store the selection as an activity
    await this.storeInteractiveSelection(payload);

    // Call ALL registered handlers (same as AI results, to workflow orchestration)
    const allHandlers = Array.from(this.messageHandlers.entries());

    for (const [handlerKey, handler] of allHandlers) {
      if (handler && typeof handler.handleAiResponse === 'function') {
        try {
          const isGlobalHandler = handlerKey.includes('global');
          const isMatchingLeadHandler = handlerKey === lead_id;

          if (isGlobalHandler || isMatchingLeadHandler) {
            await handler.handleAiResponse(payload);
          }
        } catch (error) {
          this.logger.error(`Error in message handler '${handlerKey}':`, error);
        }
      }
    }
  }

  /**
   * Handle catalog order completed (resume workflow)
   */
  private async handleCatalogOrderCompleted(event: any) {
    const { payload } = event;
    const { lead_id, execution_id, cart_info } = payload;

    this.logger.log(
      `Processing catalog order completed for lead ${lead_id}, execution ${execution_id}`
    );

    // Store catalog order activity
    await this.storeCatalogOrderActivity(payload);

    // Call ALL registered handlers to resume workflow
    const allHandlers = Array.from(this.messageHandlers.entries());

    for (const [handlerKey, handler] of allHandlers) {
      if (handler && typeof handler.handleAiResponse === 'function') {
        try {
          const isGlobalHandler = handlerKey.includes('global');
          const isMatchingLeadHandler = handlerKey === lead_id;

          if (isGlobalHandler || isMatchingLeadHandler) {
            await handler.handleAiResponse(payload);
          }
        } catch (error) {
          this.logger.error(`Error in message handler '${handlerKey}':`, error);
        }
      }
    }
  }

  /**
   * Store catalog order activity
   */
  private async storeCatalogOrderActivity(payload: any) {
    try {
      await this.prisma.lead_events.create({
        data: {
          lead_id: payload.lead_id,
          business_id: payload.business_id,
          type: 'catalog_order',
          actor: 'system',
          data: {
            execution_id: payload.execution_id,
            cart_info: payload.cart_info,
            channel: payload.context?.channel || 'whatsapp',
          } as any,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to store catalog order activity:`, error);
    }
  }

  /**
   * Store interactive selection activity
   */
  private async storeInteractiveSelection(payload: any) {
    try {
      await this.prisma.lead_events.create({
        data: {
          lead_id: payload.lead_id,
          business_id: payload.business_id,
          type: 'interactive_selection',
          actor: 'system',
          data: {
            processing_id: payload.processing_id,
            selection_id: payload.user_input,
            selection_text: payload.structured_data?.entities?.selection_text?.[0],
            intent: payload.intent,
            channel: payload.context?.channel || 'whatsapp',
          } as any,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to store interactive selection:`, error);
    }
  }

  /**
   * Store AI result for retrieval
   */
  private async storeAiResult(payload: any) {
    try {
      await this.prisma.lead_events.create({
        data: {
          lead_id: payload.lead_id,
          business_id: payload.business_id,
          type: 'ai_result',
          actor: 'ai',
          data: {
            processing_id: payload.processing_id,
            intent: payload.intent,
            entities: payload.entities,
            suggested_actions: payload.suggested_actions,
            processing_time_ms: payload.processing_time_ms,
          } as any,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to store AI result:`, error);
    }
  }

  /**
   * Handle AI processing error
   */
  private async handleAiError(event: any) {
    const { payload } = event;
    const { lead_id, error_message, error_type } = payload;

    this.logger.error(
      `AI processing error for lead ${lead_id}: ${error_message}`
    );

    try {
      await this.prisma.lead_events.create({
        data: {
          lead_id,
          business_id: payload.business_id,
          type: 'ai_error',
          actor: 'system',
          data: { error_type, error_message } as any,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log AI error for lead ${lead_id}:`, error);
    }
  }

  /**
   * Classify lead priority based on intent
   */
  private async classifyLeadPriority(
    intent: string,
    confidence: number
  ): Promise<string | null> {
    const highPriorityIntents = [
      "ORDER_REQUEST",
      "URGENT_REQUEST",
      "COMPLAINT",
      "PRICING_INQUIRY",
    ];

    const mediumPriorityIntents = [
      "AVAILABILITY_INQUIRY",
      "SCHEDULE_CALL",
      "BATCH_INFO_REQUEST",
      "CUSTOMIZATION_REQUEST",
    ];

    if (highPriorityIntents.includes(intent) && confidence > 0.7) {
      return "hot";
    } else if (mediumPriorityIntents.includes(intent) && confidence > 0.6) {
      return "warm";
    } else if (confidence > 0.5) {
      return "cold";
    }

    return null;
  }

  /**
   * Disconnect consumer
   */
  async disconnect() {
    if (!this.kafkaService.isConnected()) {
      return;
    }

    const consumer = this.kafkaService.getConsumer();
    await consumer.disconnect();
    this.logger.log("Kafka consumer disconnected");
  }
}
