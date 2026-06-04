import { Injectable } from '@nestjs/common';
import {
  AgentItem,
  AgentOption,
  AgentStructuredResponse,
  ConversationMode,
  MappedConversationResponse,
} from '../types/conversation-routing.types';

@Injectable()
export class ComponentMapperService {
  map(response: AgentStructuredResponse, mode: ConversationMode): MappedConversationResponse {
    if (mode === 'text') {
      return { kind: 'text', text: response.message };
    }

    if (mode === 'web') {
      const url = this.stringValue(response.metadata?.url);
      if (response.type === 'link' && url) {
        return {
          kind: 'link',
          text: `${response.message}\n${url}`,
          url,
          label: this.stringValue(response.metadata?.label) || 'Open link',
        };
      }
      return { kind: 'text', text: response.message };
    }

    if (response.type === 'buttons' && response.options?.length) {
      return {
        kind: 'buttons',
        body: response.message,
        buttons: this.options(response.options).slice(0, 3),
      };
    }

    if (response.type === 'list' && response.items?.length) {
      return {
        kind: 'list',
        body: response.message,
        buttonText: this.stringValue(response.metadata?.buttonText) || 'View options',
        sections: [{ title: this.stringValue(response.metadata?.sectionTitle) || 'Options', rows: this.items(response.items).slice(0, 10) }],
      };
    }

    if (response.type === 'link' && this.stringValue(response.metadata?.url)) {
      const url = this.stringValue(response.metadata?.url)!;
      return {
        kind: 'link',
        text: `${response.message}\n${url}`,
        url,
        label: this.stringValue(response.metadata?.label) || 'Open link',
      };
    }

    return { kind: 'text', text: response.message };
  }

  private options(options: AgentOption[]): AgentOption[] {
    return options.map((option, index) => ({
      id: this.buttonId(option.id, index),
      label: String(option.label ?? `Option ${index + 1}`).slice(0, 20),
      description: option.description ? String(option.description).slice(0, 72) : undefined,
    }));
  }

  private items(items: AgentItem[]): AgentItem[] {
    return items.map((item, index) => ({
      id: this.buttonId(item.id, index),
      title: String(item.title ?? `Option ${index + 1}`).slice(0, 24),
      description: item.description ? String(item.description).slice(0, 72) : undefined,
    }));
  }

  private buttonId(value: unknown, index: number): string {
    const raw = typeof value === 'string' && value.trim() ? value.trim() : `option_${index + 1}`;
    return raw.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 200);
  }

  private stringValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
  }
}
