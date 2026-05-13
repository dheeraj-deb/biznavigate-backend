import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { CircuitBreakerService } from '../../infrastructure/circuit-breaker.service';
import { WhatsAppApiClientService } from '../../infrastructure/whatsapp-api-client.service';

@Injectable()
export class WhatsAppAccountService {
  private readonly logger = new Logger(WhatsAppAccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiClient: WhatsAppApiClientService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async connectWhatsAppAccount(
    whatsappBusinessAccountId: string,
    phoneNumberId: string,
    businessId: string,
  ): Promise<any> {
    try {
      const business = await this.prisma.businesses.findUnique({
        where: { business_id: businessId },
      });

      if (!business) {
        throw new NotFoundException('Business not found');
      }

      const phoneDetails = await this.circuitBreaker.execute(
        `whatsapp-phone-details-${phoneNumberId}`,
        () => this.apiClient.getPhoneNumberDetails(phoneNumberId),
      );

      const account = await this.prisma.social_accounts.create({
        data: {
          business_id: businessId,
          platform: 'whatsapp',
          platform_user_id: phoneDetails.id,
          username: phoneDetails.display_phone_number,
          page_id: phoneNumberId,
          access_token: '',
          instagram_business_account_id: whatsappBusinessAccountId,
          is_active: true,
        },
      });

      await this.apiClient.subscribeToWebhooks(whatsappBusinessAccountId);

      this.logger.log(`WhatsApp account ${phoneDetails.display_phone_number} connected for business ${businessId}`);

      return {
        accountId: account.account_id,
        phoneNumber: phoneDetails.display_phone_number,
        verifiedName: phoneDetails.verified_name,
        qualityRating: phoneDetails.quality_rating,
      };
    } catch (error) {
      this.logger.error('Failed to connect WhatsApp account:', error);
      throw error;
    }
  }

  async getWhatsAppAccounts(businessId: string): Promise<any[]> {
    const accounts = await this.prisma.social_accounts.findMany({
      where: {
        business_id: businessId,
        platform: 'whatsapp',
        OR: [
          { is_active: true },
          { gupshup_app_status: 'pending' },
          { gupshup_app_status: 'error' },
        ],
      },
      select: {
        account_id: true,
        username: true,
        page_id: true,
        instagram_business_account_id: true,
        is_active: true,
        created_at: true,
        gupshup_app_id: true,
        gupshup_app_status: true,
        meta_account_review_status: true,
        meta_verification_checked_at: true,
        meta_verified_name: true,
      },
    });

    return accounts.map((account) => ({
      ...account,
      phone_number_id: account.page_id,
      whatsapp_business_account_id: account.instagram_business_account_id,
      business_verification_status: account.meta_account_review_status ?? 'UNKNOWN',
      business_verification_url: 'https://business.facebook.com/settings/security',
    }));
  }

  async disconnectAccount(accountId: string, businessId: string): Promise<void> {
    const account = await this.prisma.social_accounts.findFirst({
      where: { account_id: accountId, business_id: businessId, platform: 'whatsapp' },
    });

    if (!account) {
      throw new NotFoundException('WhatsApp account not found');
    }

    await this.prisma.social_accounts.update({
      where: { account_id: accountId },
      data: { is_active: false },
    });

    this.logger.log(`WhatsApp account ${accountId} disconnected`);
  }

  async fetchAndStoreVerificationStatus(accountId: string, wabaId: string): Promise<void> {
    try {
      const details = await this.apiClient.getBusinessAccountDetails(wabaId);
      await this.prisma.social_accounts.update({
        where: { account_id: accountId },
        data: {
          meta_account_review_status: details.account_review_status ?? null,
          meta_verification_checked_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Could not fetch verification status for account ${accountId}: ${error.message}`);
    }
  }

  async refreshAccountVerification(accountId: string, businessId: string): Promise<any> {
    const account = await this.prisma.social_accounts.findFirst({
      where: { account_id: accountId, business_id: businessId, platform: 'whatsapp' },
    });
    if (!account) throw new NotFoundException('Account not found');

    await this.fetchAndStoreVerificationStatus(accountId, account.instagram_business_account_id);

    return this.prisma.social_accounts.findUnique({
      where: { account_id: accountId },
      select: { meta_account_review_status: true, meta_verification_checked_at: true },
    });
  }
}
