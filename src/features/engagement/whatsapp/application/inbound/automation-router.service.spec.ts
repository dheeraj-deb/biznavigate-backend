import { getRedis } from '../../../../../utils/redis';
import { AutomationRouter } from './automation-router.service';

jest.mock('../../../../../utils/redis', () => ({
  getRedis: jest.fn(),
}));

describe('AutomationRouter', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const tenantId = '00000000-0000-0000-0000-000000000002';
  const leadId = '00000000-0000-0000-0000-000000000003';
  const conversationId = '00000000-0000-0000-0000-000000000004';

  const baseParams: any = {
    account: {
      business_id: businessId,
      businesses: { tenant_id: tenantId },
    },
    lead: {
      lead_id: leadId,
      name: 'Dheeraj',
      status: 'new',
      phone: '919999999999',
    },
    conversation: { conversation_id: conversationId },
    lead_message_id: 'mongo-message-id',
    contact_name: 'Dheeraj',
    phone_number_id: 'phone-number-id',
  };

  function buildService() {
    const kafkaProducer = {
      publishInteractiveSelection: jest.fn().mockResolvedValue(undefined),
    };
    const debounceQueue = {
      add: jest.fn().mockResolvedValue(undefined),
    };
    const redis = {
      rpush: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
    };
    (getRedis as jest.Mock).mockReturnValue(redis);

    return {
      service: new AutomationRouter(kafkaProducer as any, debounceQueue as any),
      kafkaProducer,
      debounceQueue,
      redis,
    };
  }

  it('routes interactive messages to Kafka workflow selection', async () => {
    const { service, kafkaProducer, debounceQueue, redis } = buildService();

    await service.routeInboundMessage({
      ...baseParams,
      message: {
        from: '919999999999',
        message_id: 'wamid-1',
        message_type: 'interactive',
        message_text: 'Confirm',
        button_id: 'confirm',
        user_input: 'confirm',
        is_interactive: true,
      },
    });

    expect(kafkaProducer.publishInteractiveSelection).toHaveBeenCalledWith(
      expect.objectContaining({
        lead_id: leadId,
        business_id: businessId,
        tenant_id: tenantId,
        user_input: 'confirm',
        context: expect.objectContaining({
          message_id: 'mongo-message-id',
          conversation_id: conversationId,
          channel: 'whatsapp',
        }),
      }),
    );
    expect(redis.rpush).not.toHaveBeenCalled();
    expect(debounceQueue.add).not.toHaveBeenCalled();
  });

  it('buffers normal messages in Redis and schedules a delayed debounce job', async () => {
    const { service, kafkaProducer, debounceQueue, redis } = buildService();

    await service.routeInboundMessage({
      ...baseParams,
      message: {
        from: '919999999999',
        message_id: 'wamid-2',
        message_type: 'text',
        message_text: 'I need a room',
        user_input: 'I need a room',
        is_interactive: false,
      },
    });

    expect(kafkaProducer.publishInteractiveSelection).not.toHaveBeenCalled();
    expect(redis.rpush).toHaveBeenCalledWith(
      `msg_buffer:${conversationId}`,
      expect.stringContaining('"user_input":"I need a room"'),
    );
    expect(redis.expire).toHaveBeenCalledWith(`msg_buffer:${conversationId}`, 30);
    expect(debounceQueue.add).toHaveBeenCalledWith(
      'process-messages',
      { conversationId },
      {
        jobId: `conv:${conversationId}`,
        delay: 1500,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  });
});
