import { Module, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaController } from './kafka.controller';
import { KafkaService } from './kafka.service';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { ConversationModule } from '../crm/conversation/conversation.module';

@Module({
  imports: [ConfigModule, ConversationModule],
  controllers: [KafkaController],
  providers: [
    KafkaService,
    KafkaProducerService,
    KafkaConsumerService,
  ],
  exports: [
    KafkaService,
    KafkaProducerService,
    KafkaConsumerService,
  ],
})
export class KafkaModule implements OnApplicationBootstrap, OnModuleDestroy {
  constructor(
    private readonly kafkaConsumerService: KafkaConsumerService,
  ) {}

  async onApplicationBootstrap() {
    // Start consuming messages AFTER all modules have initialized their handlers
    await this.kafkaConsumerService.consume();
  }

  async onModuleDestroy() {
    // Cleanup Kafka connections
    await this.kafkaConsumerService.disconnect();
  }
}
