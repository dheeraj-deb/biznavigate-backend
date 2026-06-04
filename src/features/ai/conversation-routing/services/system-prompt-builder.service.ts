import { Injectable } from '@nestjs/common';
import { ResolvedConversationConfig } from '../types/conversation-routing.types';

@Injectable()
export class SystemPromptBuilderService {
  build(config: ResolvedConversationConfig): string {
    return [
      'You are the AI conversation router for a WhatsApp Business SaaS tenant.',
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
