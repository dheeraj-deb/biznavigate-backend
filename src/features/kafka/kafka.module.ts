import { Module, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaController } from './kafka.controller';
import { KafkaService } from './kafka.service';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { ConversationModule } from '../conversation/conversation.module';
import { SellerOsModule } from '../seller-os/seller-os.module';
import { ProductSellerAiWorkerService } from '../ai-worker/product-seller-ai-worker.service';

@Module({
  imports: [ConfigModule, ConversationModule, SellerOsModule],
  controllers: [KafkaController],
  providers: [
    KafkaService,
    KafkaProducerService,
    KafkaConsumerService,
    ProductSellerAiWorkerService,
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
