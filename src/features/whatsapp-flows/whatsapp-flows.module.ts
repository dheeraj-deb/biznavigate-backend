import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppFlowsController } from './whatsapp-flows.controller';
import { WhatsAppFlowsService } from './whatsapp-flows.service';
import { WhatsAppFlow, WhatsAppFlowSchema } from './schemas/flow.schema';
import { WhatsAppApiClientService } from '../whatsapp/infrastructure/whatsapp-api-client.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FlowDataExchangeController } from './flow-data-exchange.controller';
import { FlowDataExchangeService } from './flow-data-exchange.service';
import { HospitalityFlowService } from './hospitality-flow.service';
import { InventoryModule } from '../inventory/inventory.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        InventoryModule,
        BookingsModule,
        MongooseModule.forFeature([
            { name: WhatsAppFlow.name, schema: WhatsAppFlowSchema },
        ]),
    ],
    controllers: [WhatsAppFlowsController, FlowDataExchangeController],
    providers: [WhatsAppFlowsService, WhatsAppApiClientService, FlowDataExchangeService, HospitalityFlowService],
    exports: [WhatsAppFlowsService, HospitalityFlowService],
})
export class WhatsAppFlowsModule { }
