import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppFlowsController } from './whatsapp-flows.controller';
import { WhatsAppFlowsService } from './whatsapp-flows.service';
import { WhatsAppFlow, WhatsAppFlowSchema } from './schemas/flow.schema';
import { WhatsAppApiClientService } from '../whatsapp/infrastructure/whatsapp-api-client.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        MongooseModule.forFeature([
            { name: WhatsAppFlow.name, schema: WhatsAppFlowSchema },
        ]),
    ],
    controllers: [WhatsAppFlowsController],
    providers: [WhatsAppFlowsService, WhatsAppApiClientService],
    exports: [WhatsAppFlowsService],
})
export class WhatsAppFlowsModule { }
