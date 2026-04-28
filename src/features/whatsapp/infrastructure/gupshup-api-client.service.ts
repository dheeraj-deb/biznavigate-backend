import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GupshupOnboardingService } from '../../gupshup/gupshup-onboarding.service';
import { SendWhatsAppMessageDto } from '../dto/whatsapp-message.dto';
import axios, { AxiosError } from 'axios';

/**
 * Gupshup V3 Passthrough API Client
 *
 * Sends WhatsApp messages via Gupshup's partner passthrough API.
 * The request body is identical to Meta Cloud API — only the endpoint and auth differ.
 *
 * Endpoint: POST https://partner.gupshup.io/partner/app/{appId}/v3/message
 * Auth:     Authorization: {PARTNER_APP_TOKEN}  (no "Bearer" prefix)
 */
@Injectable()
export class GupshupApiClientService {
  private readonly logger = new Logger(GupshupApiClientService.name);
  private readonly baseUrl = 'https://partner.gupshup.io';

  constructor(
    private readonly prisma: PrismaService,
    private readonly gupshupOnboarding: GupshupOnboardingService,
  ) {}

  /**
   * Send any message type via Gupshup passthrough.
   * The message body is identical to Meta Cloud API format.
   */
  async sendMessage(appId: string, message: SendWhatsAppMessageDto | Record<string, any>): Promise<any> {
    const token = await this.gupshupOnboarding.getPartnerAppToken(appId);

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/partner/app/${appId}/v3/message`,
        message,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`[Gupshup] Message sent via appId=${appId}: msgId=${data?.messages?.[0]?.id}`);
      return data;
    } catch (err: any) {
      const errData = err?.response?.data;
      this.logger.error(`[Gupshup] sendMessage failed for appId=${appId}: ${JSON.stringify(errData ?? err.message)}`);
      throw err;
    }
  }

  /**
   * Mark a message as read via Gupshup passthrough.
   * Same payload as Meta Cloud API.
   */
  async markAsRead(appId: string, messageId: string): Promise<void> {
    const token = await this.gupshupOnboarding.getPartnerAppToken(appId);

    try {
      await axios.post(
        `${this.baseUrl}/partner/app/${appId}/v3/message`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err: any) {
      // Non-fatal — log but don't throw
      this.logger.warn(`[Gupshup] markAsRead failed for msgId=${messageId}: ${err?.response?.data?.message ?? err.message}`);
    }
  }

  /**
   * Resolve the Gupshup appId for a given business + phoneNumberId.
   * Falls back to looking up by page_id (phone_number_id stored during onboarding).
   */
  async resolveAppId(businessId: string, phoneNumberId?: string): Promise<string | null> {
    const account = await this.prisma.social_accounts.findFirst({
      where: {
        business_id: businessId,
        platform: 'whatsapp',
        gupshup_app_status: 'live',
        gupshup_app_id: { not: null },
        ...(phoneNumberId ? { page_id: phoneNumberId } : {}),
      },
    });
    return account?.gupshup_app_id ?? null;
  }

  /**
   * Resolve appId from gs_app_id in Gupshup webhook payload.
   * Returns the social_account for the given gupshup_app_id.
   */
  async resolveAccountByAppId(gsAppId: string): Promise<any | null> {
    return this.prisma.social_accounts.findFirst({
      where: { gupshup_app_id: gsAppId, platform: 'whatsapp' },
      include: { businesses: true },
    });
  }
}
