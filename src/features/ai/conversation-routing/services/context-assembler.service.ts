import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
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

    const [business, catalogItems] = await Promise.all([
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
        },
      }),
      this.prisma.catalog_items.findMany({
        where: {
          business_id: businessId,
          is_active: true,
          deleted_at: null,
        },
        select: {
          name: true,
          item_type: true,
          category: true,
          base_price: true,
          currency: true,
          stock_quantity: true,
        },
        orderBy: { updated_at: 'desc' },
        take: 12,
      }),
    ]);

    if (!business) return null;

    return {
      businessId: business.business_id,
      name: business.business_name,
      type: business.business_type ?? 'general',
      city: business.city,
      address: business.address,
      phone: business.phone,
      website: business.website,
      catalogItems: catalogItems.map((item): BusinessContextCatalogItem => ({
        name: item.name,
        item_type: item.item_type,
        category: item.category,
        base_price: item.base_price == null ? null : Number(item.base_price),
        currency: item.currency,
        stock_quantity: item.stock_quantity,
      })),
    };
  }
}
