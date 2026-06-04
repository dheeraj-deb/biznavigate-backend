import { DynamicModule, Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { ConversationRoutingModule } from './conversation-routing/conversation-routing.module';
import { RagModule } from './rag/rag.module';

/**
 * AI boundary module.
 *
 * Owns reasoning/retrieval capabilities. Deterministic business action
 * execution remains under AutomationModule via AiActionsModule.
 */
@Module({})
export class AiModule {
  static withRag(): DynamicModule {
    return {
      module: AiModule,
      imports: [AgentModule, ConversationRoutingModule, RagModule],
      exports: [AgentModule, ConversationRoutingModule, RagModule],
    };
  }
}
