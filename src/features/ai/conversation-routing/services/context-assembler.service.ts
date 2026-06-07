import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';
import { normalizeBookingMethodsConfig } from '../../../platform/business-settings/booking-methods.config';
import { normalizeBookingLinkConfig } from '../../../platform/business-settings/booking-link.config';
import {
  BusinessContextCatalogItem,
  BusinessContextSnapshot,
  ContactSession,
  ContextPacket,
  MessageHistoryItem,
  ResolvedConversationConfig,
} from '../types/conversation-routing.types';
import { SystemPromptBuilderService } from './system-prompt-builder.service';

@Injectable()
export class ContextAssemblerService {
  constructor(
    private readonly promptBuilder: SystemPromptBuilderService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async assemble(params: {
    resolvedConfig: ResolvedConversationConfig;
    session: ContactSession;
    history: MessageHistoryItem[];
  }): Promise<ContextPacket> {
    const business = await this.loadBusinessContext(params.session);

    return {
      config: params.resolvedConfig,
      session: params.session,
      history: params.history.slice(-12),
      systemPrompt: this.promptBuilder.build(params.resolvedConfig, business),
      business,
    };
  }

  private async loadBusinessContext(session: ContactSession): Promise<BusinessContextSnapshot | null> {
    const businessId = session.metadata?.businessId;
    if (typeof businessId !== 'string' || !businessId.trim()) return null;

    const [business, settings, account, catalogItems] = await Promise.all([
      this.prisma.businesses.findUnique({
        where: { business_id: businessId },
        select: {
          business_id: true,
          business_name: true,
          business_type: true,
          city: true,
          address: true,
          phone: true,
          website: true,
          public_booking_slug: true,
        },
      }),
      (this.prisma.business_settings as any).findUnique({
        where: { business_id: businessId },
        select: { booking_methods: true, booking_link: true },
      }).catch(() => null),
      this.prisma.social_accounts.findFirst({
        where: { business_id: businessId, platform: 'whatsapp', is_active: true },
        select: { whatsapp_catalog_id: true },
      }),
      this.prisma.catalog_items.findMany({
        where: {
          business_id: businessId,
          is_active: true,
          deleted_at: null,
        },
        select: {
          item_id: true,
          name: true,
          item_type: true,
          category: true,
          base_price: true,
          currency: true,
          stock_quantity: true,
          primary_image_url: true,
          external_catalog_items: {
            where: {
              provider: 'whatsapp',
              sync_status: { in: ['linked', 'synced', 'imported'] },
            },
            orderBy: { updated_at: 'desc' },
            select: {
              external_catalog_id: true,
              retailer_id: true,
              external_product_id: true,
            },
            take: 1,
          },
        },
        orderBy: { updated_at: 'desc' },
        take: 12,
      }),
    ]);

    if (!business) return null;

    const bookingMethods = normalizeBookingMethodsConfig(settings?.booking_methods);
    const bookingLink = normalizeBookingLinkConfig(settings?.booking_link, business.public_booking_slug ?? '');
    const bookingLinkEnabled =
      Boolean(bookingLink.slug) &&
      (bookingLink.enabled || bookingMethods.availability_response.mode === 'website_link');

    return {
      businessId: business.business_id,
      name: business.business_name,
      type: business.business_type ?? 'general',
      city: business.city,
      address: business.address,
      phone: business.phone,
      website: business.website,
      bookingMethods: {
        availability_response: bookingMethods.availability_response,
        interactive: {
          enabled: bookingMethods.interactive.enabled,
          send_room_or_service_list: bookingMethods.interactive.send_room_or_service_list,
        },
        catalog: {
          enabled: bookingMethods.catalog.enabled,
          send_product_messages: bookingMethods.catalog.send_product_messages,
        },
      },
      bookingLink: {
        enabled: bookingLinkEnabled,
        url: bookingLinkEnabled ? this.publicBookingUrl(bookingLink.slug) : '',
      },
      catalogItems: catalogItems.map((item): BusinessContextCatalogItem => ({
        item_id: item.item_id,
        name: item.name,
        item_type: item.item_type,
        category: item.category,
        base_price: item.base_price == null ? null : Number(item.base_price),
        currency: item.currency,
        stock_quantity: item.stock_quantity,
        primary_image_url: item.primary_image_url,
        whatsapp_catalog_id: item.external_catalog_items?.[0]?.external_catalog_id ?? account?.whatsapp_catalog_id ?? null,
        whatsapp_product_retailer_id:
          item.external_catalog_items?.[0]?.retailer_id ??
          item.external_catalog_items?.[0]?.external_product_id ??
          null,
      })),
    };
  }

  private publicBookingUrl(slug: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return new URL(`/book/${encodeURIComponent(slug)}`, frontendUrl).toString();
  }
}
