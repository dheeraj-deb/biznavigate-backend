import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { CircuitBreakerService } from '../../infrastructure/circuit-breaker.service';
import { WhatsAppApiClientService } from '../../infrastructure/whatsapp-api-client.service';
import { WhatsAppTemplatesService } from '../../../whatsapp-templates/whatsapp-templates.service';

@Injectable()
export class WhatsAppAccountService {
  private readonly logger = new Logger(WhatsAppAccountService.name);
  private readonly businessVerificationUrl = 'https://business.facebook.com/settings/security';

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiClient: WhatsAppApiClientService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly whatsappTemplatesService: WhatsAppTemplatesService,
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
      await this.applyBlueprintTemplatesNonBlocking(businessId);

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

    return accounts.map((account) => {
      const verificationStatus = account.meta_account_review_status ?? 'UNKNOWN';
      const onboardingStatus = this.resolveOnboardingStatus(account.gupshup_app_status, verificationStatus);

      return {
        ...account,
        phone_number_id: account.page_id,
        whatsapp_business_account_id: account.instagram_business_account_id,
        business_verification_status: verificationStatus,
        business_verification_url: this.businessVerificationUrl,
        onboarding_status: onboardingStatus,
        verification_checklist: this.buildVerificationChecklist(verificationStatus),
        usage_limits: this.resolveUsageLimits(onboardingStatus),
      };
    });
  }

  private resolveOnboardingStatus(
    gupshupStatus: string | null,
    verificationStatus: string,
  ): string {
    const status = verificationStatus.toUpperCase();

    if (gupshupStatus === 'pending') return 'gupshup_provisioning';
    if (gupshupStatus === 'stuck') return 'setup_requires_attention';
    if (gupshupStatus === 'error') return 'setup_failed';
    if (status === 'APPROVED' || status === 'VERIFIED') return 'verified';
    if (status === 'PENDING' || status === 'PENDING_REVIEW') return 'business_verification_submitted';
    if (status === 'REJECTED' || status === 'FAILED') return 'business_verification_rejected';
    return 'live_trial';
  }

  private buildVerificationChecklist(verificationStatus: string): Array<{
    key: string;
    label: string;
    completed: boolean;
  }> {
    const status = verificationStatus.toUpperCase();
    const isVerified = status === 'APPROVED' || status === 'VERIFIED';

    return [
      {
        key: 'phone_connected',
        label: 'WhatsApp phone number connected',
        completed: true,
      },
      {
        key: 'business_details',
        label: 'Business name, address, website, and contact details match Meta records',
        completed: isVerified,
      },
      {
        key: 'business_documents',
        label: 'Legal business document ready or submitted',
        completed: isVerified,
      },
      {
        key: 'meta_business_verification',
        label: 'Meta Business Verification approved',
        completed: isVerified,
      },
    ];
  }

  private resolveUsageLimits(onboardingStatus: string): {
    can_reply_to_customers: boolean;
    can_send_campaigns: boolean;
    message: string;
  } {
    if (onboardingStatus === 'verified') {
      return {
        can_reply_to_customers: true,
        can_send_campaigns: true,
        message: 'Business verification is approved. Campaign and template sending can scale based on Meta quality and messaging limits.',
      };
    }

    return {
      can_reply_to_customers: true,
      can_send_campaigns: false,
      message: 'Connected in limited mode. Customer replies can work now, but campaigns and higher-volume business-initiated messaging should wait for Meta Business Verification.',
    };
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
          meta_account_review_status: details.business_verification_status ?? details.account_review_status ?? null,
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

  private async applyBlueprintTemplatesNonBlocking(businessId: string): Promise<void> {
    try {
      const result = await this.whatsappTemplatesService.applySystemBlueprintTemplates(businessId);
      this.logger.log(`Blueprint WhatsApp templates applied for business ${businessId}: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.warn(`Blueprint WhatsApp template apply failed for business ${businessId}: ${error?.message ?? error}`);
    }
  }
}
