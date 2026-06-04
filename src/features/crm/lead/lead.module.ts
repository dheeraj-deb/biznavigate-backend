import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadController } from './controllers/lead.controller';
import { AiManagerController } from './controllers/ai-manager.controller';
import { PipelineController } from './controllers/pipeline.controller';
import { LeadCommandService } from './application/services/lead-command.service';
import { LeadQueryService } from './application/services/lead-query.service';
import { LeadAccessService } from './application/services/lead-access.service';
import { PipelineService } from './application/services/pipeline.service';
import { LeadPhoneResolverService } from './utils/lead-phone-resolver.service';
import { LeadQualificationService } from './application/services/lead-qualification.service';
import { LeadPreferenceWatchService } from './application/services/lead-preference-watch.service';
import { ExitIntentService } from './application/services/exit-intent.service';
import { SmartCampaignTriggerService } from './application/services/smart-campaign-trigger.service';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { BillingModule } from '../../platform/billing/billing.module';
import { WhatsAppModule } from '../../engagement/whatsapp/whatsapp.module';

@Module({
  imports: [
    BillingModule,
    forwardRef(() => WhatsAppModule),
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [LeadController, AiManagerController, PipelineController],
  providers: [
    LeadCommandService,
    LeadQueryService,
    LeadAccessService,
    PipelineService,
    LeadPhoneResolverService,
    LeadQualificationService,
    LeadPreferenceWatchService,
    ExitIntentService,
    SmartCampaignTriggerService,
  ],
  exports: [
    LeadCommandService,
    LeadQueryService,
    LeadAccessService,
    PipelineService,
    LeadPhoneResolverService,
    LeadQualificationService,
    LeadPreferenceWatchService,
    ExitIntentService,
    SmartCampaignTriggerService,
  ],
})
export class LeadModule {}
