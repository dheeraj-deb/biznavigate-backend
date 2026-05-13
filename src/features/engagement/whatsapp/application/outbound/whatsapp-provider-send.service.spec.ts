import { BadRequestException } from '@nestjs/common';
import { SendMessageType } from '../../dto/whatsapp-message.dto';
import { WhatsAppProviderSendService } from './whatsapp-provider-send.service';

describe('WhatsAppProviderSendService', () => {
  function buildService() {
    const apiClient = {
      sendGupshupMessage: jest.fn().mockResolvedValue({ messages: [{ id: 'wamid-1' }] }),
    };
    const gupshupOnboarding = {
      ensureAppWebhookSubscription: jest.fn().mockResolvedValue(undefined),
      getPartnerAppToken: jest.fn().mockResolvedValue('partner-token'),
    };

    return {
      service: new WhatsAppProviderSendService(apiClient as any, gupshupOnboarding as any),
      apiClient,
      gupshupOnboarding,
    };
  }

  it('sends through Gupshup using normalized source phone and partner token', async () => {
    const { service, apiClient, gupshupOnboarding } = buildService();
    const message: any = {
      messaging_product: 'whatsapp',
      to: '919999999999',
      type: SendMessageType.TEXT,
      text: { body: 'Hello' },
    };

    const result = await service.sendViaAccount(
      {
        page_id: 'phone-id',
        gupshup_app_id: 'app-1',
        username: '+91 88888 88888',
      },
      '919999999999',
      message,
    );

    expect(gupshupOnboarding.ensureAppWebhookSubscription).toHaveBeenCalledWith('app-1');
    expect(gupshupOnboarding.getPartnerAppToken).toHaveBeenCalledWith('app-1');
    expect(apiClient.sendGupshupMessage).toHaveBeenCalledWith(
      'partner-token',
      'app-1',
      '918888888888',
      '919999999999',
      message,
    );
    expect(result).toEqual({ messages: [{ id: 'wamid-1' }] });
  });

  it('rejects accounts without Gupshup configuration', async () => {
    const { service, apiClient, gupshupOnboarding } = buildService();

    await expect(
      service.sendViaProvider(
        { page_id: 'phone-id', gupshup_app_id: null, username: '+91 88888 88888' },
        '919999999999',
        { messaging_product: 'whatsapp', to: '919999999999', type: SendMessageType.TEXT, text: { body: 'Hello' } } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(gupshupOnboarding.ensureAppWebhookSubscription).not.toHaveBeenCalled();
    expect(apiClient.sendGupshupMessage).not.toHaveBeenCalled();
  });
});
