import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadService } from './application/services/lead.service';
import { PrismaModule } from '@biznavigate/prisma';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';

/**
 * LeadCoreModule — service layer only, no HTTP controllers.
 * Safe to import by the agent worker process.
 * Requires MongooseModule.forRoot() and PrismaModule to be registered globally.
 */
@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  providers: [LeadService],
  exports: [LeadService],
})
export class LeadCoreModule {}
