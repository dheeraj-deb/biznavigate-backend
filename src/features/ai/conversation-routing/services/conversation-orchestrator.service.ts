import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WhatsAppService } from 'src/features/engagement/whatsapp/application/whatsapp.service';
import { ConfigResolverService } from './config-resolver.service';
import { ContextAssemblerService } from './context-assembler.service';
import { ExistingLlmAgentService } from './existing-llm-agent.service';
import { ComponentMapperService } from './component-mapper.service';
import { FlowTransitionService } from './flow-transition.service';
import {
  AgentStructuredResponse,
  BusinessContextCatalogItem,
  ContextPacket,
  ConversationOrchestratorInput,
  MappedConversationResponse,
} from '../types/conversation-routing.types';

@Injectable()
export class ConversationOrchestratorService {
  private readonly logger = new Logger(ConversationOrchestratorService.name);

  constructor(
    private readonly configResolver: ConfigResolverService,
    private readonly contextAssembler: ContextAssemblerService,
    private readonly agent: ExistingLlmAgentService,
    private readonly mapper: ComponentMapperService,
    private readonly transitions: FlowTransitionService,
    private readonly whatsappService: WhatsAppService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async handleIncoming(input: ConversationOrchestratorInput): Promise<void> {
    const resolvedConfig = await this.configResolver.resolve(input.tenantId, input.wabaId);
    const session = await this.transitions.getSession(input.tenantId, input.wabaId, {
      ...input.session,
      activeFlow: input.session.activeFlow ?? resolvedConfig.flow,
    });
    const effectiveConfig = session.activeFlow && session.activeFlow !== resolvedConfig.flow
      ? { ...resolvedConfig, flow: session.activeFlow }
      : resolvedConfig;

    const packet = await this.contextAssembler.assemble({
      resolvedConfig: effectiveConfig,
      session,
      history: input.history,
    });

    const aiResponse = await this.agent.respond(packet, input.userMessage);
    await this.transitions.applyIfNeeded({
      tenantId: input.tenantId,
      wabaId: input.wabaId,
      session,
      response: aiResponse,
    });

    const mapped = this.applyEntryButtons(
      input,
      packet,
      aiResponse,
      this.applyBookingPresentation(
        input,
        packet,
        aiResponse,
        this.mapper.map(aiResponse, effectiveConfig.mode),
      ),
    );
    await this.send(input, mapped);
  }

  private async send(input: ConversationOrchestratorInput, mapped: MappedConversationResponse): Promise<void> {
    const ctx = {
      conversationId: input.session.conversationId,
      leadId: input.session.leadId ?? '',
      tenantId: input.tenantId,
    };

    if (mapped.kind === 'buttons') {
      await this.whatsappService.sendButtonMessage(
        input.phoneNumberId,
        input.customerPhone,
        mapped.body,
        mapped.buttons.map((button) => ({ id: button.id, title: button.label })),
      );
      return;
    }

    if (mapped.kind === 'list') {
      await this.whatsappService.sendListMessage(
        input.phoneNumberId,
        input.customerPhone,
        mapped.body,
        mapped.buttonText,
        mapped.sections.map((section) => ({
          title: section.title,
          rows: section.rows.map((row) => ({ id: row.id, title: row.title, description: row.description })),
        })),
      );
      return;
    }

    if (mapped.kind === 'product') {
      await this.whatsappService.sendSingleProductMessage(
        input.phoneNumberId,
        input.customerPhone,
        mapped.catalogId,
        mapped.productRetailerId,
        mapped.body,
        mapped.footerText,
      );
      return;
    }

    if (mapped.kind === 'product_list') {
      await this.whatsappService.sendProductListMessage(
        input.phoneNumberId,
        input.customerPhone,
        mapped.catalogId,
        mapped.sections,
        mapped.body,
        mapped.headerText,
        mapped.footerText,
      );
      return;
    }

    const text = mapped.kind === 'link' ? mapped.text : mapped.text;
    if (!text.trim()) {
      this.logger.warn(`AI mapped an empty response for conversation ${input.session.conversationId}`);
      return;
    }

    await this.whatsappService.sendAgentReply(
      input.session.metadata?.businessId as string,
      input.phoneNumberId,
      input.customerPhone,
      text,
      ctx,
    );
    this.emitBookingLinkSentIfPresent(input, text);
  }

  private applyBookingPresentation(
    input: ConversationOrchestratorInput,
    packet: ContextPacket,
    response: AgentStructuredResponse,
    mapped: MappedConversationResponse,
  ): MappedConversationResponse {
    const business = packet.business;
    if (!business) return mapped;

    const mode = business.bookingMethods.availability_response.mode;
    const isCatalogOrAvailabilityRequest = this.isCatalogOrAvailabilityRequest(input.userMessage, response);

    if (mode === 'website_link' && business.bookingLink.enabled && business.bookingLink.url && isCatalogOrAvailabilityRequest) {
      const message = response.message?.trim() || `You can view options and continue here:`;
      return {
        kind: 'link',
        text: `${message}\n${business.bookingLink.url}`,
        url: business.bookingLink.url,
        label: 'Open',
      };
    }

    if (mode !== 'interactive' || !business.bookingMethods.interactive.enabled) {
      return mapped;
    }

    const shouldUseCatalogCards =
      isCatalogOrAvailabilityRequest ||
      mapped.kind === 'list' ||
      mapped.kind === 'buttons';
    if (!shouldUseCatalogCards) return mapped;

    const productItems = this.whatsappCatalogItems(business.catalogItems);
    if (!productItems.length) return mapped;

    const body = response.message?.trim() || 'Here are the available options.';
    if (productItems.length === 1) {
      return {
        kind: 'product',
        body,
        catalogId: productItems[0].catalogId,
        productRetailerId: productItems[0].productRetailerId,
        footerText: 'Select the product to continue.',
      };
    }

    const catalogId = productItems[0].catalogId;
    const sameCatalogItems = productItems
      .filter((item) => item.catalogId === catalogId)
      .slice(0, 10);

    if (!sameCatalogItems.length) return mapped;

    return {
      kind: 'product_list',
      body,
      catalogId,
      headerText: business.name.slice(0, 60),
      footerText: 'Tap an item to view photos and details.',
      sections: [
        {
          title: 'Available options',
          product_items: sameCatalogItems.map((item) => ({
            product_retailer_id: item.productRetailerId,
          })),
        },
      ],
    };
  }

  private applyEntryButtons(
    input: ConversationOrchestratorInput,
    packet: ContextPacket,
    response: AgentStructuredResponse,
    mapped: MappedConversationResponse,
  ): MappedConversationResponse {
    const business = packet.business;
    if (!business || !this.isProductsBusiness(business.type)) return mapped;
    if (!this.isGenericEntryMessage(input.userMessage) && !this.isStoreOpeningReply(response.message)) return mapped;

    return {
      kind: 'list',
      body: `Welcome to ${business.name}. What would you like to do?`,
      buttonText: 'Choose',
      sections: [
        {
          title: 'Store options',
          rows: [
            { id: 'menu_browse', title: 'Browse Products' },
            { id: 'menu_order', title: 'My Order' },
            { id: 'menu_chat', title: 'Chat with Us' },
            { id: 'menu_support', title: 'Support' },
          ],
        },
      ],
    };
  }

  private isProductsBusiness(type?: string | null): boolean {
    return ['products', 'retail', 'ecommerce'].includes(String(type ?? '').trim().toLowerCase());
  }

  private isGenericEntryMessage(text: string): boolean {
    const normalized = String(text ?? '').toLowerCase().replace(/[!.?,\s]+/g, ' ').trim();
    return [
      'hi',
      'hii',
      'hello',
      'hey',
      'start',
      'menu',
      'options',
      'good morning',
      'good afternoon',
      'good evening',
    ].includes(normalized);
  }

  private isStoreOpeningReply(message?: string | null): boolean {
    const text = String(message ?? '').toLowerCase();
    return text.includes('welcome to') &&
      text.includes('browse') &&
      text.includes('products') &&
      text.includes('support');
  }

  private whatsappCatalogItems(items: BusinessContextCatalogItem[]): Array<{
    catalogId: string;
    productRetailerId: string;
  }> {
    return items
      .map((item) => ({
        catalogId: item.whatsapp_catalog_id?.trim() ?? '',
        productRetailerId: item.whatsapp_product_retailer_id?.trim() ?? '',
      }))
      .filter((item) => item.catalogId && item.productRetailerId);
  }

  private isCatalogOrAvailabilityRequest(message: string, response: AgentStructuredResponse): boolean {
    const intent = String(response.intent ?? '').toLowerCase();
    if (['browse', 'catalog', 'availability', 'booking', 'ordering', 'sales', 'product_browse'].includes(intent)) {
      return true;
    }

    const text = String(message ?? '').toLowerCase();
    return [
      'offer',
      'offering',
      'available',
      'availability',
      'catalog',
      'product',
      'products',
      'item',
      'items',
      'room',
      'rooms',
      'property',
      'properties',
      'vehicle',
      'car',
      'book',
      'buy',
      'price',
      'stock',
    ].some((token) => text.includes(token));
  }

  private emitBookingLinkSentIfPresent(input: ConversationOrchestratorInput, text: string): void {
    const bookingLink = this.extractBookingLink(text);
    const businessId = input.session.metadata?.businessId;
    if (!bookingLink || typeof businessId !== 'string') return;

    const url = new URL(bookingLink);
    const checkIn = url.searchParams.get('checkIn') || undefined;
    const checkOut = url.searchParams.get('checkOut') || undefined;
    this.eventEmitter.emit('workflow.event.booking.link_sent', {
      business_id: businessId,
      tenant_id: input.tenantId,
      lead_id: input.session.leadId,
      event_name: 'booking.link_sent',
      payload: {
        booking_link: bookingLink,
        dates: checkIn && checkOut ? `${checkIn} to ${checkOut}` : undefined,
        check_in: checkIn,
        check_out: checkOut,
        guests: url.searchParams.get('guests') || undefined,
        customer_phone: input.customerPhone,
      },
      emitted_at: new Date().toISOString(),
    });
  }

  private extractBookingLink(text: string): string | null {
    const match = text.match(/https?:\/\/\S+\/book\/[^\s]+/);
    if (!match) return null;
    try {
      return new URL(match[0]).toString();
    } catch {
      return null;
    }
  }
}
