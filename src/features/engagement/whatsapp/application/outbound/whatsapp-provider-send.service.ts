import { BadRequestException, Injectable } from '@nestjs/common';
import { SendWhatsAppMessageDto } from '../../dto/whatsapp-message.dto';
import { WhatsAppApiClientService } from '../../infrastructure/whatsapp-api-client.service';
import { GupshupOnboardingService } from '../../../gupshup/gupshup-onboarding.service';

export interface WhatsAppProviderAccount {
  page_id: string;
  gupshup_app_id: string | null;
  username?: string | null;
}

@Injectable()
export class WhatsAppProviderSendService {
  constructor(
    private readonly apiClient: WhatsAppApiClientService,
    private readonly gupshupOnboarding: GupshupOnboardingService,
  ) {}

  async sendViaAccount(
    account: WhatsAppProviderAccount,
    to: string,
    message: SendWhatsAppMessageDto,
  ): Promise<any> {
    return this.sendViaProvider(account, to, message);
  }

  async sendViaProvider(
    account: WhatsAppProviderAccount,
    to: string,
    message: SendWhatsAppMessageDto,
  ): Promise<any> {
    if (!account.gupshup_app_id) {
      throw new BadRequestException(
        'Gupshup app is not configured for this WhatsApp account; refusing to send via Meta API.',
      );
    }

    const sourcePhone = (account.username ?? '').replace(/\D/g, '');
    await this.gupshupOnboarding.ensureAppWebhookSubscription(account.gupshup_app_id);
    const token = await this.gupshupOnboarding.getPartnerAppToken(account.gupshup_app_id);
    return this.apiClient.sendGupshupMessage(token, account.gupshup_app_id, sourcePhone, to, message);
  }
}
