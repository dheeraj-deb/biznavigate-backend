import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadController } from './controllers/lead.controller';
import { PipelineController } from './controllers/pipeline.controller';
import { LeadCommandService } from './application/services/lead-command.service';
import { LeadQueryService } from './application/services/lead-query.service';
import { LeadAccessService } from './application/services/lead-access.service';
import { PipelineService } from './application/services/pipeline.service';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { BillingModule } from '../../platform/billing/billing.module';

@Module({
  imports: [
    BillingModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [LeadController, PipelineController],
  providers: [LeadCommandService, LeadQueryService, LeadAccessService, PipelineService],
  exports: [LeadCommandService, LeadQueryService, LeadAccessService, PipelineService],
})
export class LeadModule {}
