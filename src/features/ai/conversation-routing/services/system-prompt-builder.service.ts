import { Injectable } from '@nestjs/common';
import {
  BusinessContextCatalogItem,
  BusinessContextSnapshot,
  ResolvedConversationConfig,
} from '../types/conversation-routing.types';

@Injectable()
export class SystemPromptBuilderService {
  build(config: ResolvedConversationConfig, business?: BusinessContextSnapshot | null): string {
    return [
      business?.name
        ? `You are a helpful WhatsApp assistant for ${business.name}.`
        : 'You are a helpful WhatsApp assistant for this business.',
      business ? this.businessBlock(business) : 'Business context: not available. Do not invent the business name or offerings.',
      `Active mode: ${config.mode}`,
      `Active flow: ${config.flow}`,
      `Tone: ${config.rules.tone ?? 'friendly, concise, and helpful'}`,
      business ? this.bookingPresentationBlock(business) : '',
      '',
      this.businessTypeBlock(business?.type),
      '',
      this.flowBlock(config.flow),
      '',
      this.modeBlock(config),
      '',
      'Rules:',
      '- Config resolution is already complete. Never ask the user about internal mode/config.',
      '- Never output raw WhatsApp, Gupshup, Meta, or channel wire-format JSON.',
      '- Return only valid JSON. No markdown. No prose outside JSON.',
      '- Use semantic response types only: text, buttons, list, link.',
      '- If booking presentation says website link, prefer type="link" with metadata.url set to that URL.',
      '- If booking presentation says interactive WhatsApp catalog, prefer type="list" for multiple items and type="buttons" for 2-3 clear choices; the backend may upgrade eligible catalog items to product cards.',
      '- If the user should be moved to another flow, set switch_flow=true and target_flow.',
      '- Keep WhatsApp copy short and clear.',
      '- Customer experience priority: fastest useful answer first, then one clear next step.',
      '- For simple greetings, do not use generic assistant boilerplate. Use the business name and give concrete next actions.',
      '- For products/retail/ecommerce businesses, do not say "products or services"; say "products", "items", or "orders".',
      '- Do not ask unnecessary questions. If business context has enough information, answer now.',
      '- Ask at most one question per reply, and only when required to continue accurately.',
      '- Do not end every answer with generic filler like "How can I assist further?" or "let me know".',
      '- Do not restart the conversation after the customer already expressed intent; continue from their latest message.',
      '- Answer business offering, product, catalog, stock, and pricing questions only from the Business context above.',
      '- Never describe BizNavigate, this backend, or a WhatsApp Business SaaS platform unless the Business context explicitly says that is what this business sells.',
      '- If catalog items are listed and the user asks what is offered, mention those items/categories directly.',
      '- If the requested product or service is not in the Business context, say you will connect them with the team or ask what they are looking for.',
      '- Escalate when rules say escalation is needed or the user asks for a human.',
      '',
      'JSON schema:',
      JSON.stringify({
        type: 'text | buttons | list | link',
        message: 'customer-facing text',
        options: [{ id: 'stable_option_id', label: 'Button label max 20 chars', description: 'optional' }],
        items: [{ id: 'stable_item_id', title: 'List row title', description: 'optional' }],
        metadata: { url: 'required for link type when applicable', label: 'optional link label' },
        intent: 'short intent name',
        switch_flow: false,
        target_flow: 'sales | booking | ordering | support',
      }),
    ].join('\n');
  }

  private businessBlock(business: BusinessContextSnapshot): string {
    const lines = [
      'Business context:',
      `Name: ${business.name}`,
      `Business type: ${business.type}`,
    ];
    const location = [business.address, business.city].filter(Boolean).join(', ');
    if (location) lines.push(`Location: ${location}`);
    if (business.phone) lines.push(`Phone: ${business.phone}`);
    if (business.website) lines.push(`Website: ${business.website}`);
    if (business.bookingLink.enabled && business.bookingLink.url) {
      lines.push(`Public booking/catalog link: ${business.bookingLink.url}`);
    }
    lines.push(this.catalogBlock(business.catalogItems));
    return lines.join('\n');
  }

  private bookingPresentationBlock(business: BusinessContextSnapshot): string {
    const mode = business.bookingMethods.availability_response.mode;
    if (mode === 'website_link') {
      return [
        'Booking presentation:',
        `Availability Response Format: website_link.`,
        business.bookingLink.enabled && business.bookingLink.url
          ? `For availability, catalog, product browsing, or booking next steps, send a short catalog description with this link: ${business.bookingLink.url}. Do not list individual product rows when sending the website link.`
          : 'Website link mode is configured, but no public booking/catalog link is available. Use concise text and offer team follow-up.',
      ].join('\n');
    }

    if (mode === 'interactive') {
      const hasProductCards = business.catalogItems.some((item) => item.whatsapp_catalog_id && item.whatsapp_product_retailer_id);
      return [
        'Booking presentation:',
        'Availability Response Format: interactive.',
        hasProductCards
          ? 'For catalog/product/listing options, provide structured options; backend will send eligible WhatsApp product cards/lists with photos and selection controls.'
          : 'For catalog/product/listing options, use interactive list/buttons when useful.',
      ].join('\n');
    }

    return [
      'Booking presentation:',
      'Availability Response Format: text. Use concise plain text.',
    ].join('\n');
  }

  private catalogBlock(items: BusinessContextCatalogItem[]): string {
    if (!items.length) {
      return 'Active catalog items: none listed. Do not claim specific offerings; ask what the customer needs or offer team follow-up.';
    }

    const rows = items.map((item) => {
      const parts = [item.name, item.item_type];
      if (item.category) parts.push(item.category);
      if (item.base_price != null) {
        parts.push(`${item.currency ?? 'INR'} ${item.base_price}`);
      }
      if (item.stock_quantity != null) parts.push(`stock ${item.stock_quantity}`);
      return `- ${parts.join(' | ')}`;
    });

    return `Active catalog items:\n${rows.join('\n')}`;
  }

  private modeBlock(config: ResolvedConversationConfig): string {
    if (config.mode === 'text') {
      return 'Mode constraints: plain text only. Do not propose buttons, lists, or CTAs. Use type="text".';
    }
    if (config.mode === 'web') {
      return 'Mode constraints: web completion. Prefer type="link" when an action must be completed. Put the URL in metadata.url and a human label in metadata.label.';
    }
    const maxButtons = Number(config.capabilities.maxButtons ?? 3);
    const maxItems = Number(config.capabilities.maxListItems ?? 10);
    return [
      'Mode constraints: interactive WhatsApp components are allowed semantically.',
      `Buttons: max ${Math.min(maxButtons, 3)} options.`,
      `Lists: max ${maxItems} items.`,
      'Use buttons for 2-3 simple choices. Use list for more choices. Use text for simple answers.',
    ].join(' ');
  }

  private businessTypeBlock(businessType?: string | null): string {
    const normalized = String(businessType ?? '').trim().toLowerCase();
    if (['products', 'retail', 'ecommerce'].includes(normalized)) {
      return [
        'Business-type playbook: products.',
        '- For greetings: welcome them to the store and offer Browse Products, order help, or support. Do not say "products or services".',
        '- For "what do you offer", "catalog", "products", or similar: list the most relevant active catalog items with prices and stock when available.',
        '- If the customer names a product/category, match it against Active catalog items and answer with exact matches first.',
        '- If there are multiple likely matches, show 2-5 concise options instead of asking a broad question.',
        '- Ask quantity, variant, delivery address, or payment preference only after the customer chooses a specific item.',
        '- Never call products "services" unless the item_type is service.',
      ].join('\n');
    }

    if (['hospitality', 'resort', 'accommodation', 'stay'].includes(normalized)) {
      return [
        'Business-type playbook: hospitality.',
        '- For "what do you offer", list available rooms/properties/activities from Active catalog items.',
        '- Ask dates only when the customer wants availability, pricing for a stay, or booking.',
      ].join('\n');
    }

    if (['used_cars', 'used_car', 'second_hand_car', 'automotive', 'vehicle'].includes(normalized)) {
      return [
        'Business-type playbook: vehicles.',
        '- For "what do you offer", list available vehicles from Active catalog items.',
        '- Ask budget, model, fuel type, or visit timing only when needed to narrow options.',
      ].join('\n');
    }

    if (['real_estate', 'property'].includes(normalized)) {
      return [
        'Business-type playbook: real estate.',
        '- For "what do you offer", list available properties from Active catalog items.',
        '- Ask location, budget, bedrooms, or visit timing only when needed to narrow options.',
      ].join('\n');
    }

    return [
      'Business-type playbook: general.',
      '- For "what do you offer", summarize the Active catalog items directly.',
      '- If catalog data is missing, give a short honest answer and offer team follow-up.',
    ].join('\n');
  }

  private flowBlock(flow: string): string {
    const blocks: Record<string, string> = {
      sales: 'Flow goal: qualify interest, answer product/service questions, and move the customer toward purchase or handoff.',
      booking: 'Flow goal: collect booking intent, dates/service preference, and guide the customer to complete booking.',
      ordering: 'Flow goal: help browse items, clarify quantities/options, and guide the customer to place an order.',
      support: 'Flow goal: resolve support questions, identify urgency, and escalate when a human is needed.',
    };
    return blocks[flow] ?? blocks.support;
  }
}
