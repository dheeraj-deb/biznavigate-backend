import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MessageDebounceProcessor } from './processors/message-debounce.processor';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppOAuthController } from './whatsapp-oauth.controller';
import { WhatsAppCatalogController } from './whatsapp-catalog.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppOAuthService } from './services/whatsapp-oauth.service';
import { WhatsAppCatalogService } from './services/whatsapp-catalog.service';
import { WhatsAppCatalogOrderService } from './services/whatsapp-catalog-order.service';
import { WhatsAppApiClientService } from './infrastructure/whatsapp-api-client.service';
import { WebhookValidatorService } from './infrastructure/webhook-validator.service';
import { CircuitBreakerService } from './infrastructure/circuit-breaker.service';
import { ConversationStateService } from './services/conversation-state.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { KafkaModule } from '../kafka/kafka.module';
import { CartModule } from '../cart/cart.module';
import { ConversationModule } from '../conversation/conversation.module';
import { WhatsAppTemplatesModule } from '../whatsapp-templates/whatsapp-templates.module';
import { WhatsAppFlowsModule } from '../whatsapp-flows/whatsapp-flows.module';
import { GatewayModule } from '../inbox/gateway/gateway.module';
import { HumanHandoffGatewayModule } from '../human-handoff/human-handoff-gateway.module';
import { AgentModule } from '../agent/agent.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { GupshupOnboardingService } from '../gupshup/gupshup-onboarding.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    KafkaModule,
    CartModule,
    ConversationModule,
    WhatsAppTemplatesModule,
    WhatsAppFlowsModule,
    GatewayModule,
    HumanHandoffGatewayModule,
    AgentModule,
    forwardRef(() => WorkflowsModule),
    BullModule.registerQueue({ name: 'message-debounce' }),
  ],
  controllers: [
    WhatsAppController,
    WhatsAppOAuthController,
    WhatsAppCatalogController,
  ],
  providers: [
    WhatsAppService,
    MessageDebounceProcessor,
    WhatsAppOAuthService,
    WhatsAppCatalogService,
    WhatsAppCatalogOrderService,
    WhatsAppApiClientService,
    WebhookValidatorService,
    CircuitBreakerService,
    ConversationStateService,
    GupshupOnboardingService,
  ],
  exports: [WhatsAppService, WhatsAppApiClientService, WhatsAppCatalogService],
})
export class WhatsAppModule { }
