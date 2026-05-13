import { BadRequestException } from '@nestjs/common';
import { WebhookIngestionService } from './webhook-ingestion.service';

describe('WebhookIngestionService', () => {
  function buildService(isValid = true) {
    const webhookValidator = {
      validateWebhookEvent: jest.fn().mockReturnValue(isValid),
      extractChanges: jest.fn().mockReturnValue([
        {
          field: 'messages',
          value: {
            metadata: { phone_number_id: 'phone-number-id' },
            contacts: [{ wa_id: '919999999999' }],
            messages: [{ id: 'wamid-1' }],
            statuses: [{ id: 'wamid-2', status: 'delivered' }],
          },
        },
      ]),
      extractMessages: jest.fn((value) => value.messages ?? []),
      extractStatuses: jest.fn((value) => value.statuses ?? []),
    };
    const whatsappTemplatesService = {
      handleMetaWebhook: jest.fn().mockResolvedValue(undefined),
    };

    return {
      service: new WebhookIngestionService(webhookValidator as any, whatsappTemplatesService as any),
      webhookValidator,
      whatsappTemplatesService,
    };
  }

  it('validates webhook and dispatches messages/statuses to handlers', async () => {
    const { service, webhookValidator } = buildService();
    const handlers = {
      onMessage: jest.fn().mockResolvedValue(undefined),
      onStatus: jest.fn().mockResolvedValue(undefined),
    };
    const webhook: any = { entry: [{ id: 'entry-1' }] };

    await service.processMetaWebhook(webhook, handlers);

    expect(webhookValidator.validateWebhookEvent).toHaveBeenCalledWith(webhook);
    expect(handlers.onMessage).toHaveBeenCalledWith(
      { id: 'wamid-1' },
      { phone_number_id: 'phone-number-id' },
      [{ wa_id: '919999999999' }],
    );
    expect(handlers.onStatus).toHaveBeenCalledWith(
      { id: 'wamid-2', status: 'delivered' },
      { phone_number_id: 'phone-number-id' },
    );
  });

  it('routes template status updates to template service', async () => {
    const { service, webhookValidator, whatsappTemplatesService } = buildService();
    webhookValidator.extractChanges.mockReturnValue([
      { field: 'message_template_status_update', value: { template_id: 'template-1' } },
    ]);
    const handlers = {
      onMessage: jest.fn(),
      onStatus: jest.fn(),
    };

    await service.processMetaWebhook({ entry: [{}] } as any, handlers);

    expect(whatsappTemplatesService.handleMetaWebhook).toHaveBeenCalledWith({ template_id: 'template-1' });
    expect(handlers.onMessage).not.toHaveBeenCalled();
    expect(handlers.onStatus).not.toHaveBeenCalled();
  });

  it('rejects invalid webhook structures', async () => {
    const { service } = buildService(false);

    await expect(
      service.processMetaWebhook({ entry: [] } as any, { onMessage: jest.fn(), onStatus: jest.fn() }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
