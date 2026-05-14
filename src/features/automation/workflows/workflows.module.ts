import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsService } from './workflows.service';
import { KafkaModule } from '../../kafka/kafka.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { WhatsAppModule } from '../../engagement/whatsapp/whatsapp.module';
import { InstagramModule } from '../../engagement/instagram/instagram.module';
import { CartModule } from '../../commerce/cart/cart.module';
import { ConversationModule } from '../../crm/conversation/conversation.module';
import { CircuitBreakerService } from '../../engagement/whatsapp/infrastructure/circuit-breaker.service';
import { Workflow } from './core/workflow';
import { NodeFactory } from './factories/node-factory';
import { WorkflowsController } from './workflows.controller';
import { WorkflowDefinition, WorkflowDefinitionSchema } from './schema/workflow-definition.schema';
import { BusinessWorkflow, BusinessWorkflowSchema } from './schema/business-workflow.schema';
import { WorkflowExecution, WorkflowExecutionSchema } from './schema/workflow-execution.schema';
import { WhatsAppTemplatesModule } from '../../engagement/whatsapp-templates/whatsapp-templates.module';
import { WorkflowAnalyzerService } from './workflow-analyzer.service';
import { WorkflowTimeoutProcessor } from './workflow-timeout.processor';

@Module({
  imports: [
    KafkaModule,
    PrismaModule,
    forwardRef(() => WhatsAppModule),
    InstagramModule,
    CartModule,
    ConversationModule,
    WhatsAppTemplatesModule,
    BullModule.registerQueue({ name: 'workflow-timeouts' }),
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
    WorkflowAnalyzerService,
    WorkflowTimeoutProcessor,
  ],
  exports: [
    WorkflowsService,
  ],
})
export class WorkflowsModule { }
