import { Module } from '@nestjs/common';
import { HumanHandoffController } from './human-handoff.controller';
import { HumanHandoffService } from './human-handoff.service';
import { HumanHandoffGatewayModule } from './human-handoff-gateway.module';
import { ConversationModule } from '../conversation/conversation.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [HumanHandoffGatewayModule, ConversationModule, WhatsAppModule, PrismaModule],
    controllers: [HumanHandoffController],
    providers: [HumanHandoffService],
    exports: [HumanHandoffService],
})
export class HumanHandoffModule {}
