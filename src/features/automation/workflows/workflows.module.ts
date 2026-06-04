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
import { LeadModule } from '../../crm/lead/lead.module';
import { AiActionsModule } from '../ai-actions/ai-actions.module';
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
import { WorkflowDefinitionValidator } from './validation/workflow-definition.validator';
import { WorkflowSchedulerService } from './schedule/workflow-scheduler.service';
import { ScheduleTriggerRunner } from './schedule/schedule-trigger-runner';
import { WorkflowScheduleProcessor } from './schedule/workflow-schedule.processor';
import { WorkflowEventBusService } from './events/workflow-event-bus.service';
import { InactiveLeadScannerService } from './events/inactive-lead-scanner.service';
import { InactiveScannerProcessor } from './events/inactive-scanner.processor';
import { ExternalWorkflowEventsController } from './events/external-workflow-events.controller';
import {
  WorkflowInactiveFire,
  WorkflowInactiveFireSchema,
} from './schema/workflow-inactive-fire.schema';

@Module({
  imports: [
    KafkaModule,
    PrismaModule,
    forwardRef(() => WhatsAppModule),
    forwardRef(() => LeadModule),
    forwardRef(() => AiActionsModule),
    InstagramModule,
    CartModule,
    ConversationModule,
    WhatsAppTemplatesModule,
    BullModule.registerQueue({ name: 'workflow-timeouts' }),
    BullModule.registerQueue({ name: 'workflow-schedules' }),
    BullModule.registerQueue({ name: 'workflow-inactive-scanner' }),
    MongooseModule.forFeature([
      { name: WorkflowDefinition.name, schema: WorkflowDefinitionSchema },
      { name: BusinessWorkflow.name, schema: BusinessWorkflowSchema },
      { name: WorkflowExecution.name, schema: WorkflowExecutionSchema },
      { name: WorkflowInactiveFire.name, schema: WorkflowInactiveFireSchema },
    ]),
  ],
  controllers: [
    WorkflowsController,
    ExternalWorkflowEventsController,
  ],
  providers: [
    WorkflowsService,
    CircuitBreakerService,
    NodeFactory,
    Workflow,
    WorkflowAnalyzerService,
    WorkflowTimeoutProcessor,
    WorkflowDefinitionValidator,
    WorkflowSchedulerService,
    ScheduleTriggerRunner,
    WorkflowScheduleProcessor,
    WorkflowEventBusService,
    InactiveLeadScannerService,
    InactiveScannerProcessor,
  ],
  exports: [
    WorkflowsService,
  ],
})
export class WorkflowsModule { }
