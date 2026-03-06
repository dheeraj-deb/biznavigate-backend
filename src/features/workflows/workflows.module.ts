import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowsService } from './workflows.service';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { InstagramModule } from '../instagram/instagram.module';
import { CartModule } from '../cart/cart.module';
import { ConversationModule } from '../conversation/conversation.module';
import { CircuitBreakerService } from '../whatsapp/infrastructure/circuit-breaker.service';
import { Workflow } from './core/workflow';
import { NodeFactory } from './factories/node-factory';
import { WorkflowsController } from './workflows.controller';
import { WorkflowDefinition, WorkflowDefinitionSchema } from './schema/workflow-definition.schema';
import { BusinessWorkflow, BusinessWorkflowSchema } from './schema/business-workflow.schema';
import { WorkflowExecution, WorkflowExecutionSchema } from './schema/workflow-execution.schema';

@Module({
  imports: [
    KafkaModule,
    PrismaModule,
    WhatsAppModule,
    InstagramModule,
    CartModule,
    ConversationModule,
    MongooseModule.forFeature([
      { name: WorkflowDefinition.name, schema: WorkflowDefinitionSchema },
      { name: BusinessWorkflow.name, schema: BusinessWorkflowSchema },
      { name: WorkflowExecution.name, schema: WorkflowExecutionSchema },
    ]),
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
export class WorkflowsModule { }