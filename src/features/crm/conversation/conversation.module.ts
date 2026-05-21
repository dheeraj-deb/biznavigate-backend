import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversations.schema';
import { Messages, MessagesSchema } from './schemas/messages.schema';
import { ConversationService } from './conversation.service';
import { MessageWindowService } from './messaging-window/message-window.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Messages.name, schema: MessagesSchema },
    ]),
  ],
  providers: [ConversationService, MessageWindowService],
  exports: [ConversationService, MessageWindowService],
})
export class ConversationModule {}
