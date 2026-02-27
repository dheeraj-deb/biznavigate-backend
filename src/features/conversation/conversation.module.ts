import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversations.schema';
import { Messages, MessagesSchema } from './schemas/messages.schema';
import { ConversationContext, ConversationContextSchema } from './schemas/conversation_context.schema';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Messages.name, schema: MessagesSchema },
      { name: ConversationContext.name, schema: ConversationContextSchema },
    ]),
  ],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
