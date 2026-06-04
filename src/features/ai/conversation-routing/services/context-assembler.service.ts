import { Injectable } from '@nestjs/common';
import {
  ContactSession,
  ContextPacket,
  MessageHistoryItem,
  ResolvedConversationConfig,
} from '../types/conversation-routing.types';
import { SystemPromptBuilderService } from './system-prompt-builder.service';

@Injectable()
export class ContextAssemblerService {
  constructor(private readonly promptBuilder: SystemPromptBuilderService) {}

  assemble(params: {
    resolvedConfig: ResolvedConversationConfig;
    session: ContactSession;
    history: MessageHistoryItem[];
  }): ContextPacket {
    return {
      config: params.resolvedConfig,
      session: params.session,
      history: params.history.slice(-12),
      systemPrompt: this.promptBuilder.build(params.resolvedConfig),
    };
  }
}
