import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface UpdateBusinessSettingsDto {
  timezone?: string;
  language?: string;
  currency?: string;
  business_hours?: Record<string, { open: string; close: string; closed?: boolean }>;
  onboarding_step?: number;
  onboarding_done?: boolean;
  ai_agent_enabled?: boolean;
  auto_reply_enabled?: boolean;
  low_balance_alert?: number;
}

@Injectable()
export class BusinessSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(businessId: string) {
    const settings = await this.prisma.business_settings.findUnique({
      where: { business_id: businessId },
    });

    if (!settings) {
      // MEDIUM-6: Validate business exists before auto-provisioning settings.
      // Without this check a crafted JWT with a fake business_id creates orphan rows.
      const business = await this.prisma.businesses.findUnique({
        where: { business_id: businessId },
        select: { business_id: true },
      });
      if (!business) throw new NotFoundException('Business not found');

      return this.prisma.business_settings.create({
        data: { business_id: businessId },
      });
    }

    return settings;
  }

  async updateSettings(businessId: string, dto: UpdateBusinessSettingsDto) {
    // Ensure the business exists
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    return this.prisma.business_settings.upsert({
      where: { business_id: businessId },
      create: {
        business_id: businessId,
        ...dto,
        updated_at: new Date(),
      },
      update: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async advanceOnboardingStep(businessId: string) {
    const settings = await this.getSettings(businessId);
    const nextStep = settings.onboarding_step + 1;

    return this.prisma.business_settings.update({
      where: { business_id: businessId },
      data: {
        onboarding_step: nextStep,
        onboarding_done: nextStep >= 5,
        updated_at: new Date(),
      },
    });
  }
}
