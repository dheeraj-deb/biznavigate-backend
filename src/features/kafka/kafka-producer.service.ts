import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Kafka Producer Service
 * Publishes events to Kafka topics
 */
@Injectable()
export class KafkaProducerService {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(private readonly kafkaService: KafkaService) {}

  /**
   * Publish lead created event
   */
  async publishLeadCreated(payload: {
    lead_id: string;
    business_id: string;
    tenant_id: string;
    source: string;
    platform_user_id?: string;
    initial_message?: string;
    phone?: string;
    email?: string;
    metadata?: any;
  }) {
    const event = {
      event_id: uuidv4(),
      event_type: 'lead.created',
      timestamp: new Date().toISOString(),
      payload,
    };

    await this.publishEvent('lead.created', event, payload.lead_id);
    this.logger.log(`Published lead.created event for lead: ${payload.lead_id}`);
  }

  /**
   * Publish lead updated event
   */
  async publishLeadUpdated(payload: {
    lead_id: string;
    business_id: string;
    updated_fields: string[];
    metadata?: any;
  }) {
    const event = {
      event_id: uuidv4(),
      event_type: 'lead.updated',
      timestamp: new Date().toISOString(),
      payload,
    };

    await this.publishEvent('lead.updated', event, payload.lead_id);
    this.logger.log(`Published lead.updated event for lead: ${payload.lead_id}`);
  }

  /**
   * Publish new message event
   */
  async publishLeadMessage(payload: {
    lead_id: string;
    business_id: string;
    message_id: string;
    message_text: string;
    direction: 'inbound' | 'outbound';
    channel?: string;
    metadata?: any;
  }) {
    const event = {
      event_id: uuidv4(),
      event_type: 'lead.message',
      timestamp: new Date().toISOString(),
      payload,
    };

    await this.publishEvent('lead.message', event, payload.lead_id);
    this.logger.log(`Published lead.message event for lead: ${payload.lead_id}`);
  }

  /**
   * Request AI processing explicitly
   */
  async requestAiProcessing(payload: {
    lead_id: string;
    business_id: string;
    text: string;
    business_type?: string;
    conversation_history?: any[];
    context?: any;
    priority?: 'low' | 'normal' | 'high';
  }) {
    const event = {
      event_id: uuidv4(),
      event_type: 'ai.process.request',
      timestamp: new Date().toISOString(),
      payload: {
        ...payload,
        priority: payload.priority || 'normal',
      },
    };

    await this.publishEvent('ai.process.request', event, payload.lead_id);
    this.logger.log(`Published ai.process.request for lead: ${payload.lead_id}`);
  }

  /**
   * Publish a plain text message directly to workflow (no AI processing)
   */
  async publishTextMessage(payload: any) {
    const event = {
      event_id: uuidv4(),
      event_type: 'workflow.text.message',
      timestamp: new Date().toISOString(),
      payload,
    };

    await this.publishEvent('workflow-event', event, payload.lead_id);
    this.logger.log(`Published workflow.text.message for lead: ${payload.lead_id}`);
  }

  /**
   * Publish interactive selection directly to workflow (bypass AI)
   */
  async publishInteractiveSelection(payload: any) {
    const event = {
      event_id: uuidv4(),
      event_type: 'workflow.interactive.selection',
      timestamp: new Date().toISOString(),
      payload,
    };

    await this.publishEvent('workflow-event', event, payload.lead_id);
    this.logger.log(`Published workflow-event for interactive selection from lead: ${payload.lead_id}`);
  }

  /**
   * Publish catalog order completed event to resume workflow
   */
  async publishCatalogOrderCompleted(payload: {
    execution_id: string | null;
    lead_id: string;
    business_id: string;
    tenant_id: string | null;
    cart_info: any;
    context: any;
  }) {
    const event = {
      event_id: uuidv4(),
      event_type: 'workflow.catalog.order.completed',
      timestamp: new Date().toISOString(),
      payload,
    };

    await this.publishEvent('workflow-event', event, payload.lead_id);
    this.logger.log(`Published catalog order completed event for lead: ${payload.lead_id}`);
  }

  /**
   * Generic event publisher
   */
  private async publishEvent(topic: string, event: any, key?: string) {
    try {
      if (!this.kafkaService.isConnected()) {
        this.logger.warn(
          `Skipped publishing ${event.event_type} to ${topic} because Kafka is not connected`,
        );
        return;
      }

      const producer = this.kafkaService.getProducer();
      
      await producer.send({
        topic,
        messages: [
          {
            key: key || event.event_id,
            value: JSON.stringify(event),
            headers: {
              event_type: event.event_type,
              timestamp: event.timestamp,
            },
          },
        ],
      });

    } catch (error) {
      this.logger.error(`Failed to publish event to ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Publish batch of events
   */
  async publishBatch(topic: string, events: any[]) {
    try {
      if (!this.kafkaService.isConnected()) {
        this.logger.warn(`Skipped publishing batch to ${topic} because Kafka is not connected`);
        return;
      }

      const producer = this.kafkaService.getProducer();
      
      const messages = events.map((event) => ({
        key: event.event_id,
        value: JSON.stringify(event),
        headers: {
          event_type: event.event_type,
          timestamp: event.timestamp,
        },
      }));

      await producer.send({
        topic,
        messages,
      });

      this.logger.log(`Published batch of ${events.length} events to ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish batch to ${topic}:`, error);
      throw error;
    }
  }
}
