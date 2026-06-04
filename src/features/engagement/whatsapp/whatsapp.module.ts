import { forwardRef, Module } from '@nestjs/common';
// Note: LeadModule and WhatsAppModule have a mutual dependency (WhatsApp sends messages on behalf of leads).
// Both sides must use forwardRef() to avoid a circular-import crash at startup.
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageDebounceProcessor } from './processors/message-debounce.processor';
import { WhatsAppController } from './application/whatsapp.controller';
import { WhatsAppOAuthController } from './application/oauth/whatsapp-oauth.controller';
import { WhatsAppCatalogController } from './application/catalog/whatsapp-catalog.controller';
import { WhatsAppService } from './application/whatsapp.service';
import { WhatsAppOAuthService } from './application/oauth/whatsapp-oauth.service';
import { WhatsAppCatalogService } from './application/catalog/whatsapp-catalog.service';
import { WhatsAppCatalogOrderService } from './application/catalog/whatsapp-catalog-order.service';
import { WhatsAppAccountService } from './application/account/whatsapp-account.service';
import { AgentReplyDispatcherService } from './application/agent-reply-dispatcher.service';
import { AutomationRouter } from './application/inbound/automation-router.service';
import { ContactResolutionService } from './application/inbound/contact-resolution.service';
import { ConversationCommandService } from './application/inbound/conversation-command.service';
import { WhatsAppApiClientService } from './infrastructure/whatsapp-api-client.service';
import { WhatsAppMessageNormalizer } from './application/inbound/whatsapp-message-normalizer.service';
import { WebhookIngestionService } from './application/inbound/webhook-ingestion.service';
import { WhatsAppOutboundCommandService } from './application/outbound/whatsapp-outbound-command.service';
import { WhatsAppProviderSendService } from './application/outbound/whatsapp-provider-send.service';
import { WhatsAppStatusCommandService } from './application/outbound/whatsapp-status-command.service';
import { WebhookValidatorService } from './infrastructure/webhook-validator.service';
import { CircuitBreakerService } from './infrastructure/circuit-breaker.service';
import { ConversationStateService } from './application/state/conversation-state.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { KafkaModule } from '../../kafka/kafka.module';
import { CartModule } from '../../commerce/cart/cart.module';
import { ConversationModule } from '../../crm/conversation/conversation.module';
import { WhatsAppTemplatesModule } from '../whatsapp-templates/whatsapp-templates.module';
import { GatewayModule } from '../../crm/inbox/gateway/gateway.module';
import { HumanHandoffGatewayModule } from '../../crm/human-handoff/human-handoff-gateway.module';
import { AgentModule } from '../../ai/agent/agent.module';
import { ConversationRoutingModule } from '../../ai/conversation-routing/conversation-routing.module';
import { WorkflowsModule } from '../../automation/workflows/workflows.module';
import { LeadModule } from '../../crm/lead/lead.module';
import { BookingsModule } from '../../industries/hospitality/bookings/bookings.module';
import { BusinessSettingsModule } from '../../platform/business-settings/business-settings.module';
import { GupshupOnboardingService } from '../gupshup/gupshup-onboarding.service';
import { Campaign, CampaignSchema } from '../campaign/schemas/campaign.schema';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    KafkaModule,
    CartModule,
    ConversationModule,
    WhatsAppTemplatesModule,
    GatewayModule,
    HumanHandoffGatewayModule,
    AgentModule,
    forwardRef(() => ConversationRoutingModule),
    BusinessSettingsModule,
    forwardRef(() => LeadModule),
    BookingsModule,
    forwardRef(() => WorkflowsModule),
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    BullModule.registerQueue({ name: 'message-debounce' }),
  ],
  controllers: [
    WhatsAppController,
    WhatsAppOAuthController,
    WhatsAppCatalogController,
  ],
  providers: [
    WhatsAppService,
    AgentReplyDispatcherService,
    MessageDebounceProcessor,
    WhatsAppOAuthService,
    WhatsAppCatalogService,
    WhatsAppCatalogOrderService,
    WhatsAppAccountService,
    WhatsAppMessageNormalizer,
    WebhookIngestionService,
    WhatsAppOutboundCommandService,
    WhatsAppProviderSendService,
    WhatsAppStatusCommandService,
    ContactResolutionService,
    ConversationCommandService,
    AutomationRouter,
    WhatsAppApiClientService,
    WebhookValidatorService,
    CircuitBreakerService,
    ConversationStateService,
    GupshupOnboardingService,
  ],
  exports: [WhatsAppService, WhatsAppApiClientService, WhatsAppCatalogService],
})
export class WhatsAppModule { }
