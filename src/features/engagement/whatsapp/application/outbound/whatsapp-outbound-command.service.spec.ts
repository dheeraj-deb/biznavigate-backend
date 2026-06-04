import { WhatsAppOutboundCommandService } from './whatsapp-outbound-command.service';

describe('WhatsAppOutboundCommandService', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const tenantId = '00000000-0000-0000-0000-000000000002';
  const leadId = '00000000-0000-0000-0000-000000000003';
  const conversationId = '00000000-0000-0000-0000-000000000004';

  function buildMocks(activeConversation: any = { conversation_id: conversationId }) {
    const conversationService = {
      findActiveConversation: jest.fn().mockResolvedValue(activeConversation),
      createConversation: jest.fn().mockResolvedValue({ conversation_id: conversationId }),
      createMessage: jest.fn().mockResolvedValue({ _id: { toString: () => 'mongo-message-id' } }),
      touchConversation: jest.fn().mockResolvedValue(undefined),
    };
    const inboxGateway = {
      notifyNewMessage: jest.fn(),
      notifyConversationUpdated: jest.fn(),
    };
    return { conversationService, inboxGateway };
  }

  it('persists a local message id when provider did not return a platform message id', async () => {
    const mocks = buildMocks();
    const service = new WhatsAppOutboundCommandService(mocks.conversationService as any, mocks.inboxGateway as any);

    await service.persistSentMessage({
      account: { business_id: businessId, page_id: 'phone-id', businesses: { tenant_id: tenantId } },
      lead: { lead_id: leadId },
      to: '919999999999',
      text: 'Hello',
      message_type: 'text',
      platform_message_id: null,
    });

    expect(mocks.conversationService.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        platform_message_id: expect.stringMatching(/^local_/),
        message_text: 'Hello',
      }),
    );
    expect(mocks.inboxGateway.notifyNewMessage).toHaveBeenCalledWith(
      businessId,
      conversationId,
      expect.objectContaining({
        platform_message_id: expect.stringMatching(/^local_/),
        message_text: 'Hello',
      }),
    );
  });

  it('finds an active conversation, stores outbound message, and publishes inbox updates', async () => {
    const mocks = buildMocks();
    const service = new WhatsAppOutboundCommandService(mocks.conversationService as any, mocks.inboxGateway as any);

    await service.persistSentMessage({
      account: {
        business_id: businessId,
        page_id: 'phone-id',
        businesses: { tenant_id: tenantId, business_name: 'Biz Navigate' },
      },
      lead: { lead_id: leadId },
      to: '919999999999',
      text: 'Hello',
      message_type: 'text',
      platform_message_id: 'wamid-out-1',
      workflow_node_id: 'node-1',
      metadata: { template: { name: 'hello_world' } },
    });

    expect(mocks.conversationService.findActiveConversation).toHaveBeenCalledWith(leadId, 'whatsapp', businessId);
    expect(mocks.conversationService.createConversation).not.toHaveBeenCalled();
    expect(mocks.conversationService.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: conversationId,
        lead_id: leadId,
        business_id: businessId,
        tenant_id: tenantId,
        sender_name: 'Biz Navigate',
        message_text: 'Hello',
        message_type: 'text',
        platform_message_id: 'wamid-out-1',
        workflow_node_id: 'node-1',
        metadata: { template: { name: 'hello_world' } },
      }),
    );
    expect(mocks.conversationService.touchConversation).toHaveBeenCalledWith(conversationId, 'Hello');
    expect(mocks.inboxGateway.notifyNewMessage).toHaveBeenCalledWith(
      businessId,
      conversationId,
      expect.objectContaining({
        _id: 'mongo-message-id',
        message_text: 'Hello',
        platform_message_id: 'wamid-out-1',
        metadata: { template: { name: 'hello_world' } },
      }),
    );
    expect(mocks.inboxGateway.notifyConversationUpdated).toHaveBeenCalledWith(
      businessId,
      conversationId,
      expect.objectContaining({ message_text: 'Hello' }),
    );
  });

  it('creates a conversation when no active one exists', async () => {
    const mocks = buildMocks(null);
    const service = new WhatsAppOutboundCommandService(mocks.conversationService as any, mocks.inboxGateway as any);

    await service.persistSentMessage({
      account: {
        business_id: businessId,
        page_id: 'phone-id',
        businesses: { tenant_id: tenantId },
      },
      lead: { lead_id: leadId },
      to: '919999999999',
      text: 'Hello',
      message_type: 'text',
      platform_message_id: 'wamid-out-1',
    });

    expect(mocks.conversationService.createConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        lead_id: leadId,
        customer_id: '919999999999',
        business_id: businessId,
        tenant_id: tenantId,
        channel: 'whatsapp',
        status: 'active',
        sender_id: 'phone-id',
      }),
    );
  });

  it('uses supplied conversation context for agent replies', async () => {
    const mocks = buildMocks();
    const service = new WhatsAppOutboundCommandService(mocks.conversationService as any, mocks.inboxGateway as any);

    await service.persistSentMessage({
      account: { business_id: businessId, page_id: 'phone-id' },
      to: '919999999999',
      text: 'Agent reply',
      message_type: 'text',
      platform_message_id: 'wamid-agent-1',
      sender_name: 'AI Agent',
      assigned_to: 'bot',
      metadata: { is_ai: true },
      conversation_context: {
        conversation_id: conversationId,
        lead_id: leadId,
        tenant_id: tenantId,
      },
    });

    expect(mocks.conversationService.findActiveConversation).not.toHaveBeenCalled();
    expect(mocks.conversationService.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: conversationId,
        lead_id: leadId,
        tenant_id: tenantId,
        sender_name: 'AI Agent',
        assigned_to: 'bot',
        metadata: { is_ai: true },
      }),
    );
  });
});
