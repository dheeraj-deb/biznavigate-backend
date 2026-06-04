import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BookingMethodsConfig,
  normalizeBookingMethodsConfig,
} from './booking-methods.config';
import {
  BookingLinkConfig,
  inferExperienceType,
  normalizeBookingLinkConfig,
  slugifyBookingLink,
} from './booking-link.config';

export interface UpdateBusinessSettingsDto {
  timezone?: string;
  language?: string;
  currency?: string;
  business_hours?: Record<string, { open: string; close: string; closed?: boolean }>;
  onboarding_step?: number;
  onboarding_done?: boolean;
  ai_agent_enabled?: boolean;
  auto_reply_enabled?: boolean;
  booking_methods?: Partial<BookingMethodsConfig>;
  booking_link?: Partial<BookingLinkConfig>;
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

  async getBookingMethods(businessId: string): Promise<BookingMethodsConfig> {
    const settings = await this.getSettings(businessId);
    return normalizeBookingMethodsConfig((settings as any).booking_methods);
  }

  async getBookingLink(businessId: string): Promise<BookingLinkConfig> {
    const [settings, business] = await Promise.all([
      this.getSettings(businessId),
      this.prisma.businesses.findUnique({
        where: { business_id: businessId },
        select: { business_name: true, business_type: true, public_booking_slug: true },
      }),
    ]);

    const fallbackSlug = business?.public_booking_slug ?? slugifyBookingLink(business?.business_name ?? businessId);
    const normalized = normalizeBookingLinkConfig((settings as any).booking_link, fallbackSlug);
    if (!normalized.experience_type || normalized.experience_type === 'generic') {
      normalized.experience_type = inferExperienceType(business?.business_type);
    }
    return normalized;
  }

  async updateBookingLink(businessId: string, dto: Partial<BookingLinkConfig>): Promise<BookingLinkConfig> {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: { business_id: true, business_name: true, business_type: true, public_booking_slug: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    const current = await this.getBookingLink(businessId);
    const desiredSlug = slugifyBookingLink(dto.slug ?? current.slug ?? business.business_name);
    const next = normalizeBookingLinkConfig({
      ...current,
      ...dto,
      slug: desiredSlug,
      theme: { ...current.theme, ...dto.theme },
      policies: { ...current.policies, ...dto.policies },
      contact: { ...current.contact, ...dto.contact },
      required_fields: { ...current.required_fields, ...dto.required_fields },
      experience_type: dto.experience_type ?? current.experience_type ?? inferExperienceType(business.business_type),
    }, desiredSlug);

    const slugOwner = next.slug
      ? await this.prisma.businesses.findFirst({
          where: { public_booking_slug: next.slug, business_id: { not: businessId } },
          select: { business_id: true },
        })
      : null;
    if (slugOwner) throw new BadRequestException('Booking link slug is already taken');

    await this.prisma.$transaction([
      this.prisma.businesses.update({
        where: { business_id: businessId },
        data: { public_booking_slug: next.slug || null, updated_at: new Date() },
      }),
      this.prisma.business_settings.upsert({
        where: { business_id: businessId },
        create: {
          business_id: businessId,
          booking_link: next as any,
          updated_at: new Date(),
        },
        update: {
          booking_link: next as any,
          updated_at: new Date(),
        },
      }),
    ]);

    return next;
  }

  async updateBookingMethods(businessId: string, dto: Partial<BookingMethodsConfig>): Promise<BookingMethodsConfig> {
    const current = await this.getBookingMethods(businessId);
    const next = normalizeBookingMethodsConfig({
      ...current,
      ...dto,
      availability_response: { ...current.availability_response, ...dto.availability_response },
      ai_chat: { ...current.ai_chat, ...dto.ai_chat },
      interactive: { ...current.interactive, ...dto.interactive },
      catalog: { ...current.catalog, ...dto.catalog },
      templates: { ...current.templates, ...dto.templates },
      human_handoff: { ...current.human_handoff, ...dto.human_handoff },
    });

    await this.prisma.business_settings.upsert({
      where: { business_id: businessId },
      create: {
        business_id: businessId,
        booking_methods: next as any,
        updated_at: new Date(),
      },
      update: {
        booking_methods: next as any,
        updated_at: new Date(),
      },
    });

    return next;
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
