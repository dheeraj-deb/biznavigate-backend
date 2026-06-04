import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../../prisma/prisma.module';
import { WhatsAppModule } from '../../engagement/whatsapp/whatsapp.module';
import { ExistingLlmAgentService } from './services/existing-llm-agent.service';
import { ComponentMapperService } from './services/component-mapper.service';
import { ConfigResolverService } from './services/config-resolver.service';
import { ContextAssemblerService } from './services/context-assembler.service';
import { ConversationOrchestratorService } from './services/conversation-orchestrator.service';
import { FlowTransitionService } from './services/flow-transition.service';
import { SystemPromptBuilderService } from './services/system-prompt-builder.service';

@Module({
  imports: [ConfigModule, PrismaModule, forwardRef(() => WhatsAppModule)],
  providers: [
    ConfigResolverService,
    ContextAssemblerService,
    SystemPromptBuilderService,
    ExistingLlmAgentService,
    ComponentMapperService,
    FlowTransitionService,
    ConversationOrchestratorService,
  ],
  exports: [
    ConfigResolverService,
    ContextAssemblerService,
    SystemPromptBuilderService,
    ExistingLlmAgentService,
    ComponentMapperService,
    FlowTransitionService,
    ConversationOrchestratorService,
  ],
})
export class ConversationRoutingModule {}
