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
      '- If the user should be moved to another flow, set switch_flow=true and target_flow.',
      '- Keep WhatsApp copy short and clear.',
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
    lines.push(this.catalogBlock(business.catalogItems));
    return lines.join('\n');
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
