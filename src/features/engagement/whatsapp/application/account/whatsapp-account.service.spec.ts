import { NotFoundException } from '@nestjs/common';
import { WhatsAppAccountService } from './whatsapp-account.service';

describe('WhatsAppAccountService', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const accountId = '00000000-0000-0000-0000-000000000002';

  function buildService({
    business = { business_id: businessId },
    account = { account_id: accountId, instagram_business_account_id: 'waba-1' },
  }: any = {}) {
    const prisma = {
      businesses: {
        findUnique: jest.fn().mockResolvedValue(business),
      },
      social_accounts: {
        create: jest.fn().mockResolvedValue({ account_id: accountId }),
        findMany: jest.fn().mockResolvedValue([
          {
            account_id: accountId,
            username: '+91 99999 99999',
            page_id: 'phone-id',
            instagram_business_account_id: 'waba-1',
            is_active: true,
            created_at: new Date('2026-05-13T00:00:00.000Z'),
            gupshup_app_id: 'app-1',
            gupshup_app_status: 'active',
            meta_account_review_status: 'APPROVED',
            meta_verification_checked_at: new Date('2026-05-13T00:00:00.000Z'),
            meta_verified_name: 'Biz Navigate',
          },
        ]),
        findFirst: jest.fn().mockResolvedValue(account),
        findUnique: jest.fn().mockResolvedValue({
          meta_account_review_status: 'APPROVED',
          meta_verification_checked_at: new Date('2026-05-13T00:00:00.000Z'),
        }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const apiClient = {
      getPhoneNumberDetails: jest.fn().mockResolvedValue({
        id: 'phone-platform-id',
        display_phone_number: '+91 99999 99999',
        verified_name: 'Biz Navigate',
        quality_rating: 'GREEN',
      }),
      subscribeToWebhooks: jest.fn().mockResolvedValue(undefined),
      getBusinessAccountDetails: jest.fn().mockResolvedValue({ account_review_status: 'APPROVED' }),
    };
    const circuitBreaker = {
      execute: jest.fn((_key: string, callback: any) => callback()),
    };

    return {
      service: new WhatsAppAccountService(prisma as any, apiClient as any, circuitBreaker as any),
      prisma,
      apiClient,
      circuitBreaker,
    };
  }

  it('connects a WhatsApp account for a business', async () => {
    const { service, prisma, apiClient, circuitBreaker } = buildService();

    const result = await service.connectWhatsAppAccount('waba-1', 'phone-id', businessId);

    expect(circuitBreaker.execute).toHaveBeenCalledWith(
      'whatsapp-phone-details-phone-id',
      expect.any(Function),
    );
    expect(prisma.social_accounts.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        business_id: businessId,
        platform: 'whatsapp',
        platform_user_id: 'phone-platform-id',
        page_id: 'phone-id',
        instagram_business_account_id: 'waba-1',
        is_active: true,
      }),
    });
    expect(apiClient.subscribeToWebhooks).toHaveBeenCalledWith('waba-1');
    expect(result).toEqual({
      accountId,
      phoneNumber: '+91 99999 99999',
      verifiedName: 'Biz Navigate',
      qualityRating: 'GREEN',
    });
  });

  it('rejects connect when business does not exist', async () => {
    const { service, apiClient } = buildService({ business: null });

    await expect(service.connectWhatsAppAccount('waba-1', 'phone-id', businessId))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(apiClient.subscribeToWebhooks).not.toHaveBeenCalled();
  });

  it('returns normalized account list response', async () => {
    const { service } = buildService();

    const result = await service.getWhatsAppAccounts(businessId);

    expect(result[0]).toEqual(expect.objectContaining({
      phone_number_id: 'phone-id',
      whatsapp_business_account_id: 'waba-1',
      business_verification_status: 'APPROVED',
      business_verification_url: 'https://business.facebook.com/settings/security',
    }));
  });

  it('disconnects accounts scoped to business', async () => {
    const { service, prisma } = buildService();

    await service.disconnectAccount(accountId, businessId);

    expect(prisma.social_accounts.findFirst).toHaveBeenCalledWith({
      where: { account_id: accountId, business_id: businessId, platform: 'whatsapp' },
    });
    expect(prisma.social_accounts.update).toHaveBeenCalledWith({
      where: { account_id: accountId },
      data: { is_active: false },
    });
  });

  it('refreshes verification status', async () => {
    const { service, prisma, apiClient } = buildService();

    const result = await service.refreshAccountVerification(accountId, businessId);

    expect(apiClient.getBusinessAccountDetails).toHaveBeenCalledWith('waba-1');
    expect(prisma.social_accounts.update).toHaveBeenCalledWith({
      where: { account_id: accountId },
      data: expect.objectContaining({
        meta_account_review_status: 'APPROVED',
        meta_verification_checked_at: expect.any(Date),
      }),
    });
    expect(result).toEqual(expect.objectContaining({ meta_account_review_status: 'APPROVED' }));
  });
});
