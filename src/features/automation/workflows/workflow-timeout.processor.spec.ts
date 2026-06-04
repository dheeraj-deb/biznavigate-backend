import { WorkflowTimeoutProcessor } from './workflow-timeout.processor';

describe('WorkflowTimeoutProcessor', () => {
  const executionId = '00000000-0000-0000-0000-000000000001';
  const workflowId = '00000000-0000-0000-0000-000000000002';
  const businessId = '00000000-0000-0000-0000-000000000003';
  const tenantId = '00000000-0000-0000-0000-000000000004';
  const conversationId = '00000000-0000-0000-0000-000000000005';
  const currentNodeId = 'wait_for_reply';

  function buildModelMock(execution: any) {
    return {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(execution),
      }),
      findOneAndUpdate: jest.fn().mockResolvedValue({}),
    };
  }

  function buildPrismaMock() {
    return {
      workflow_executions: {
        findUnique: jest.fn().mockResolvedValue({
          execution_id: executionId,
          workflow_id: workflowId,
          business_id: businessId,
          tenant_id: tenantId,
          current_node_id: currentNodeId,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      workflow_execution_steps: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
  }

  function buildProcessor(execution: any) {
    const model = buildModelMock(execution);
    const conversationService = {
      updateConversation: jest.fn().mockResolvedValue({}),
    };
    const prisma = buildPrismaMock();

    return {
      processor: new WorkflowTimeoutProcessor(model as any, conversationService as any, prisma as any),
      model,
      conversationService,
      prisma,
    };
  }

  it('does nothing when the workflow resumed before the timeout job runs', async () => {
    const { processor, model, conversationService, prisma } = buildProcessor({
      execution_id: executionId,
      workflow_id: workflowId,
      business_id: businessId,
      status: 'running',
      waiting_for_input: false,
      current_node_id: currentNodeId,
    });

    await processor.process({
      name: 'drop-inactive-workflow',
      data: { execution_id: executionId, conversation_id: conversationId, currentNodeId },
    } as any);

    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    expect(prisma.workflow_executions.findUnique).not.toHaveBeenCalled();
    expect(prisma.workflow_executions.update).not.toHaveBeenCalled();
    expect(prisma.workflow_execution_steps.create).not.toHaveBeenCalled();
    expect(conversationService.updateConversation).not.toHaveBeenCalled();
  });

  it('drops a paused workflow, logs timeout step, and updates the conversation', async () => {
    const { processor, model, conversationService, prisma } = buildProcessor({
      execution_id: executionId,
      workflow_id: workflowId,
      business_id: businessId,
      status: 'paused',
      waiting_for_input: true,
      current_node_id: currentNodeId,
    });

    await processor.process({
      name: 'drop-inactive-workflow',
      data: { execution_id: executionId, conversation_id: conversationId, currentNodeId },
    } as any);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { execution_id: executionId },
      { $set: { status: 'dropped', waiting_for_input: false } },
    );
    expect(prisma.workflow_executions.update).toHaveBeenCalledWith({
      where: { execution_id: executionId },
      data: expect.objectContaining({
        status: 'dropped',
        waiting_for_input: false,
        current_node_id: currentNodeId,
        completed_at: expect.any(Date),
        updated_at: expect.any(Date),
      }),
    });
    expect(prisma.workflow_execution_steps.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        execution_id: executionId,
        workflow_id: workflowId,
        business_id: businessId,
        tenant_id: tenantId,
        node_id: currentNodeId,
        node_type: 'system.timeout',
        node_name: 'Workflow inactivity timeout',
        status: 'timeout',
        input: {
          conversation_id: conversationId,
          current_node_id: currentNodeId,
        },
        output: {
          status: 'dropped',
        },
        completed_at: expect.any(Date),
        duration_ms: 0,
      }),
    });
    expect(conversationService.updateConversation).toHaveBeenCalledWith(conversationId, {
      status: 'dropped',
      current_node_id: currentNodeId,
    });
  });

  it('ignores jobs with a different name', async () => {
    const { processor, model, prisma } = buildProcessor({
      execution_id: executionId,
      status: 'paused',
      waiting_for_input: true,
      current_node_id: currentNodeId,
    });

    await processor.process({
      name: 'other-job',
      data: { execution_id: executionId },
    } as any);

    expect(model.findOne).not.toHaveBeenCalled();
    expect(prisma.workflow_executions.update).not.toHaveBeenCalled();
  });
});
