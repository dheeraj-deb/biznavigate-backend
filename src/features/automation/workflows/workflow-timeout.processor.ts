import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConversationService } from '../../crm/conversation/conversation.service';
import { WorkflowExecution, WorkflowExecutionDocument } from './schema/workflow-execution.schema';

@Processor('workflow-timeouts')
export class WorkflowTimeoutProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowTimeoutProcessor.name);

  constructor(
    @InjectModel(WorkflowExecution.name)
    private readonly workflowExecutionModel: Model<WorkflowExecutionDocument>,
    private readonly conversationService: ConversationService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ execution_id: string; conversation_id?: string; currentNodeId?: string }>) {
    if (job.name !== 'drop-inactive-workflow') return;

    const { execution_id, conversation_id, currentNodeId } = job.data;
    const execution = await this.workflowExecutionModel.findOne({ execution_id }).lean();

    if (!execution || execution.status !== 'paused' || !execution.waiting_for_input) {
      return;
    }

    this.logger.warn(`Workflow ${execution_id} dropped after inactivity`);
    const resolvedNodeId = currentNodeId ?? execution.current_node_id ?? null;
    const durableExecution = await this.prisma.workflow_executions.findUnique({
      where: { execution_id },
      select: {
        execution_id: true,
        workflow_id: true,
        business_id: true,
        tenant_id: true,
        current_node_id: true,
      },
    }).catch((error) => {
      this.logger.warn(`Could not load durable timeout state for ${execution_id}: ${error.message}`);
      return null;
    });

    await this.workflowExecutionModel.findOneAndUpdate(
      { execution_id },
      { $set: { status: 'dropped', waiting_for_input: false } },
    );
    await this.prisma.workflow_executions.update({
      where: { execution_id },
      data: {
        status: 'dropped',
        waiting_for_input: false,
        current_node_id: resolvedNodeId,
        completed_at: new Date(),
        updated_at: new Date(),
      },
    }).catch((error) => {
      this.logger.warn(`Could not update durable timeout state for ${execution_id}: ${error.message}`);
    });

    if (durableExecution) {
      await this.prisma.workflow_execution_steps.create({
        data: {
          execution_id,
          workflow_id: durableExecution.workflow_id,
          business_id: durableExecution.business_id,
          tenant_id: durableExecution.tenant_id,
          node_id: resolvedNodeId ?? 'workflow_timeout',
          node_type: 'system.timeout',
          node_name: 'Workflow inactivity timeout',
          status: 'timeout',
          input: {
            conversation_id: conversation_id ?? null,
            current_node_id: resolvedNodeId,
          },
          output: {
            status: 'dropped',
          },
          started_at: new Date(),
          completed_at: new Date(),
          duration_ms: 0,
        },
      }).catch((error) => {
        this.logger.warn(`Could not create timeout step log for ${execution_id}: ${error.message}`);
      });
    }

    if (conversation_id) {
      await this.conversationService.updateConversation(conversation_id, {
        status: 'dropped',
        current_node_id: resolvedNodeId,
      });
    }
  }
}
