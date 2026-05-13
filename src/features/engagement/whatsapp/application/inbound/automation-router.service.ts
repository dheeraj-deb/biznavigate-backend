import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { getRedis } from '../../../../../utils/redis';
import { KafkaProducerService } from '../../../../kafka/kafka-producer.service';
import { NormalizedWhatsAppMessage } from './whatsapp-message-normalizer.service';

@Injectable()
export class AutomationRouter {
  private readonly logger = new Logger(AutomationRouter.name);

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    @InjectQueue('message-debounce') private readonly debounceQueue: Queue,
  ) {}

  async routeInboundMessage(params: {
    account: any;
    lead: any;
    conversation: any;
    lead_message_id: string;
    contact_name: string;
    phone_number_id: string;
    message: NormalizedWhatsAppMessage;
  }) {
    const workflowPayload = {
      lead_id: params.lead.lead_id,
      business_id: params.account.business_id,
      tenant_id: params.account.businesses.tenant_id,
      user_input: params.message.user_input,
      context: {
        message_id: params.lead_message_id,
        conversation_id: params.conversation.conversation_id,
        channel: 'whatsapp' as const,
        message_type: params.message.message_type,
        contact: {
          name: params.contact_name,
          from: params.message.from,
          phoneNumberId: params.phone_number_id,
        },
        lead: {
          id: params.lead.lead_id,
          name: params.lead.name,
          status: params.lead.status,
          phone: params.lead.phone,
        },
      },
    };

    if (params.message.is_interactive) {
      this.logger.log(`Interactive selection: ${params.message.user_input}`);
      await this.kafkaProducer.publishInteractiveSelection(workflowPayload);
      return;
    }

    const bufferKey = `msg_buffer:${params.conversation.conversation_id}`;
    const redis = getRedis();
    await redis.rpush(bufferKey, JSON.stringify(workflowPayload));
    await redis.expire(bufferKey, 30);

    await this.debounceQueue.add(
      'process-messages',
      { conversationId: params.conversation.conversation_id },
      {
        jobId: `conv:${params.conversation.conversation_id}`,
        delay: 10000,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
