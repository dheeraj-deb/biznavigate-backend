import { Module } from '@nestjs/common';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { ConversationModule } from '../conversation/conversation.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { GatewayModule } from './gateway/gateway.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [ConversationModule, WhatsAppModule, GatewayModule, PrismaModule],
    controllers: [InboxController],
    providers: [InboxService],
})
export class InboxModule {}
