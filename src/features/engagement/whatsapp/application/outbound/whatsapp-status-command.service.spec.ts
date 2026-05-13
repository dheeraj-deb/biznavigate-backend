import { WhatsAppStatusCommandService } from './whatsapp-status-command.service';
import { CampaignStatus } from '../../../campaign/enums/enums';

describe('WhatsAppStatusCommandService', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const conversationId = '00000000-0000-0000-0000-000000000002';
  const campaignId = '000000000000000000000001';

  function buildMocks(recipient: any = {
    id: BigInt(1),
    campaign_id: campaignId,
    business_id: businessId,
    whatsapp_message_id: 'wamid-1',
    status: 'SENT',
    sent_at: new Date('2026-05-13T00:00:00.000Z'),
    delivered_at: null,
    read_at: null,
    failed_at: null,
  }) {
    const prisma = {
      campaign_recipients: {
        findFirst: jest.fn().mockResolvedValue(recipient),
        update: jest.fn().mockResolvedValue({}),
        count: jest.fn()
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(8)
          .mockResolvedValueOnce(7)
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(1)
          .mockResolvedValueOnce(1)
          .mockResolvedValueOnce(1),
      },
      campaign_analytics: {
        upsert: jest.fn().mockResolvedValue({}),
      },
      social_accounts: {
        findFirst: jest.fn().mockResolvedValue({ business_id: businessId }),
      },
    };
    const conversationService = {
      updateMessageStatus: jest.fn().mockResolvedValue(undefined),
      findMessageByPlatformId: jest.fn().mockResolvedValue({ conversation_id: conversationId }),
      findConversationById: jest.fn().mockResolvedValue({ business_id: businessId, conversation_id: conversationId }),
    };
    const inboxGateway = {
      notifyStatusUpdate: jest.fn(),
    };
    const campaignModel = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ status: CampaignStatus.RUNNING }),
        }),
      }),
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    };

    return { prisma, conversationService, inboxGateway, campaignModel };
  }

  it('updates message delivery status, inbox status, recipient status, and campaign analytics', async () => {
    const mocks = buildMocks();
    const service = new WhatsAppStatusCommandService(
      mocks.prisma as any,
      mocks.conversationService as any,
      mocks.inboxGateway as any,
      mocks.campaignModel as any,
    );

    await service.handleStatusWebhook({
      id: 'wamid-1',
      status: 'delivered',
      timestamp: '1770000000',
      recipient_id: '919999999999',
    }, { phone_number_id: 'phone-id' });

    expect(mocks.conversationService.updateMessageStatus).toHaveBeenCalledWith(
      'wamid-1',
      expect.objectContaining({
        delivery_status: 'delivered',
        delivered_at: expect.any(Date),
      }),
    );
    expect(mocks.inboxGateway.notifyStatusUpdate).toHaveBeenCalledWith(
      businessId,
      conversationId,
      'wamid-1',
      'delivered',
    );
    expect(mocks.prisma.campaign_recipients.update).toHaveBeenCalledWith({
      where: { id: BigInt(1) },
      data: expect.objectContaining({
        status: 'DELIVERED',
        delivered_at: expect.any(Date),
      }),
    });
    expect(mocks.prisma.campaign_analytics.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { campaign_id: campaignId },
        update: expect.objectContaining({
          total: 10,
          sent: 8,
          delivered: 7,
          read: 2,
          failed: 1,
        }),
      }),
    );
  });

  it('records failed status details from Gupshup events', async () => {
    const mocks = buildMocks();
    const service = new WhatsAppStatusCommandService(
      mocks.prisma as any,
      mocks.conversationService as any,
      mocks.inboxGateway as any,
      mocks.campaignModel as any,
    );

    await service.handleGupshupMessageEvent({
      gs_app_id: 'app-1',
      timestamp: '1770000000',
      payload: {
        id: 'wamid-1',
        gsId: 'gs-1',
        type: 'failed',
        destination: '919999999999',
        payload: {
          code: '470',
          reason: 'User not reachable',
          details: 'Outside customer care window',
        },
      },
    });

    expect(mocks.conversationService.updateMessageStatus).toHaveBeenCalledWith(
      'wamid-1',
      expect.objectContaining({
        delivery_status: 'failed',
        failed_reason: 'User not reachable',
      }),
    );
    expect(mocks.prisma.campaign_recipients.update).toHaveBeenCalledWith({
      where: { id: BigInt(1) },
      data: expect.objectContaining({
        status: 'FAILED',
        error_code: '470',
        error_message: 'Outside customer care window',
      }),
    });
  });

  it('falls back to recent recipient lookup when message id is not matched', async () => {
    const mocks = buildMocks();
    mocks.prisma.campaign_recipients.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: BigInt(2),
        campaign_id: campaignId,
        business_id: businessId,
        whatsapp_message_id: null,
        status: 'SENT',
        sent_at: new Date('2026-05-13T00:00:00.000Z'),
        delivered_at: null,
        read_at: null,
        failed_at: null,
      });
    const service = new WhatsAppStatusCommandService(
      mocks.prisma as any,
      mocks.conversationService as any,
      mocks.inboxGateway as any,
      mocks.campaignModel as any,
    );

    await service.handleStatusWebhook({
      id: 'wamid-new',
      status: 'read',
      timestamp: '1770000000',
      recipient_id: '919999999999',
    }, { phone_number_id: 'phone-id' });

    expect(mocks.prisma.social_accounts.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          platform: 'whatsapp',
          is_active: true,
        }),
      }),
    );
    expect(mocks.prisma.campaign_recipients.update).toHaveBeenCalledWith({
      where: { id: BigInt(2) },
      data: expect.objectContaining({
        status: 'READ',
        whatsapp_message_id: 'wamid-new',
        delivered_at: expect.any(Date),
        read_at: expect.any(Date),
      }),
    });
  });
});
