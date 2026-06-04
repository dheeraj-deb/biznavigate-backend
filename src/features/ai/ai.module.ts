import { DynamicModule, Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
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
      imports: [AgentModule, RagModule],
      exports: [AgentModule, RagModule],
    };
  }
}
