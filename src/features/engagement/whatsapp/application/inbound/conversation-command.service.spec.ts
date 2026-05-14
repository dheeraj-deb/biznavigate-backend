import { ConversationCommandService } from './conversation-command.service';

describe('ConversationCommandService', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const tenantId = '00000000-0000-0000-0000-000000000002';
  const leadId = '00000000-0000-0000-0000-000000000003';
  const conversationId = '00000000-0000-0000-0000-000000000004';

  const account = {
    business_id: businessId,
    businesses: { tenant_id: tenantId },
  };
  const lead = {
    lead_id: leadId,
    name: 'Dheeraj',
    status: 'new',
    phone: '919999999999',
  };
  const message: any = {
    from: '919999999999',
    message_id: 'wamid-1',
    message_type: 'text',
    message_text: 'Hello',
    button_id: null,
  };

  function buildMocks({
    existingMessage = null,
    activeConversation = { conversation_id: conversationId },
    mongoConversation = { conversation_id: conversationId, is_ai: true, status: 'open' },
    waitingExecution = { current_node_id: 'node-1' },
  }: any = {}) {
    const prisma = {
      workflow_executions: {
        findFirst: jest.fn().mockResolvedValue(waitingExecution),
      },
    };
    const conversationService = {
      findMessageByPlatformId: jest.fn().mockResolvedValue(existingMessage),
      findActiveConversation: jest.fn().mockResolvedValue(activeConversation),
      createConversation: jest.fn().mockResolvedValue({ conversation_id: conversationId }),
      createMessage: jest.fn().mockResolvedValue({ _id: { toString: () => 'mongo-message-id' } }),
      touchConversation: jest.fn().mockResolvedValue(undefined),
      findConversationById: jest.fn().mockResolvedValue(mongoConversation),
    };
    const inboxGateway = {
      notifyNewMessage: jest.fn(),
      notifyConversationUpdated: jest.fn(),
    };
    const humanHandoffGateway = {
      notifyCustomerMessage: jest.fn(),
    };

    return { prisma, conversationService, inboxGateway, humanHandoffGateway };
  }

  it('skips duplicate platform messages', async () => {
    const mocks = buildMocks({ existingMessage: { _id: 'existing' } });
    const service = new ConversationCommandService(
      mocks.prisma as any,
      mocks.conversationService as any,
      mocks.inboxGateway as any,
      mocks.humanHandoffGateway as any,
    );

    const result = await service.persistInboundMessage({
      account,
      lead,
      contact_name: 'Dheeraj',
      phone_number_id: 'phone-number-id',
      message,
    });

    expect(result).toBeNull();
    expect(mocks.conversationService.createMessage).not.toHaveBeenCalled();
  });

  it('creates a conversation when none exists and stores inbound message with tenant scope', async () => {
    const mocks = buildMocks({ activeConversation: null });
    const service = new ConversationCommandService(
      mocks.prisma as any,
      mocks.conversationService as any,
      mocks.inboxGateway as any,
      mocks.humanHandoffGateway as any,
    );

    const result = await service.persistInboundMessage({
      account,
      lead,
      contact_name: 'Dheeraj',
      phone_number_id: 'phone-number-id',
      message,
    });

    expect(mocks.conversationService.createConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        lead_id: leadId,
        platform_id: '919999999999',
        business_id: businessId,
        channel: 'whatsapp',
        status: 'open',
        is_ai: true,
      }),
    );
    expect(mocks.conversationService.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: conversationId,
        lead_id: leadId,
        business_id: businessId,
        tenant_id: tenantId,
        message_text: 'Hello',
        platform_message_id: 'wamid-1',
        workflow_node_id: 'node-1',
      }),
    );
    expect(mocks.inboxGateway.notifyNewMessage).toHaveBeenCalledWith(
      businessId,
      conversationId,
      expect.objectContaining({ _id: 'mongo-message-id', message_text: 'Hello' }),
    );
    expect(mocks.inboxGateway.notifyConversationUpdated).toHaveBeenCalled();
    expect(result).toEqual({ conversation: { conversation_id: conversationId }, lead_message_id: 'mongo-message-id' });
  });

  it('notifies human handoff gateway for human-handled conversations', async () => {
    const mocks = buildMocks({
      mongoConversation: { conversation_id: conversationId, is_ai: false, status: 'handed_off' },
    });
    const service = new ConversationCommandService(
      mocks.prisma as any,
      mocks.conversationService as any,
      mocks.inboxGateway as any,
      mocks.humanHandoffGateway as any,
    );

    await service.persistInboundMessage({
      account,
      lead,
      contact_name: 'Dheeraj',
      phone_number_id: 'phone-number-id',
      message,
    });

    expect(mocks.humanHandoffGateway.notifyCustomerMessage).toHaveBeenCalledWith(
      businessId,
      conversationId,
      expect.objectContaining({ message_text: 'Hello', platform_message_id: 'wamid-1' }),
    );
  });
});
