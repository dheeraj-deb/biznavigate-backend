import { Module, OnModuleInit } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { InstagramModule } from '../instagram/instagram.module';
import { CartModule } from '../cart/cart.module';
import { CircuitBreakerService } from '../whatsapp/infrastructure/circuit-breaker.service';
import { Workflow } from './core/workflow';
import { NodeFactory } from './factories/node-factory';
import { WorkflowsController } from './workflows.controller';

@Module({
  imports: [
    KafkaModule,
    PrismaModule,
    WhatsAppModule,
    InstagramModule,
    CartModule,
  ],
  controllers: [
    WorkflowsController,
  ],
  providers: [
    WorkflowsService,
    CircuitBreakerService,
    NodeFactory,
    Workflow,
  ],
  exports: [
    WorkflowsService,
  ],
})
export class WorkflowsModule {
  constructor() { }

  // onModuleInit() {
  // }
}
