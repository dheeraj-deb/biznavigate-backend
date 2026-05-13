import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadController } from './controllers/lead.controller';
import { LeadCommandService } from './application/services/lead-command.service';
import { LeadQueryService } from './application/services/lead-query.service';
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
  controllers: [LeadController],
  providers: [LeadCommandService, LeadQueryService],
  exports: [LeadCommandService, LeadQueryService],
})
export class LeadModule {}
