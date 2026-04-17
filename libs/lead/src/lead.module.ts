import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadController } from './controllers/lead.controller';
import { LeadService } from './application/services/lead.service';
import { PrismaService } from '@biznavigate/prisma';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [LeadController],
  providers: [LeadService, PrismaService],
  exports: [LeadService],
})
export class LeadModule {}
