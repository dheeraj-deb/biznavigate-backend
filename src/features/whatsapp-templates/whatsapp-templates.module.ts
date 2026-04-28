// whatsapp-templates.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { WhatsAppTemplatesController } from './whatsapp-templates.controller';
import { WhatsAppTemplatesService } from './whatsapp-templates.service';
import { WhatsAppTemplate, WhatsAppTemplateSchema } from './schemas/template.schema';
import { WhatsAppApiClientService } from '../whatsapp/infrastructure/whatsapp-api-client.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TemplateSyncProcessor } from './jobs/template-sync.processor';
import { TemplateSyncSchedulerService } from './jobs/template-sync-scheduler.service';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        MongooseModule.forFeature([
            { name: WhatsAppTemplate.name, schema: WhatsAppTemplateSchema },
        ]),
        BullModule.registerQueue({ name: 'whatsapp-template-sync' }),
    ],
    controllers: [WhatsAppTemplatesController],
    providers: [
        WhatsAppTemplatesService,
        WhatsAppApiClientService,
        TemplateSyncProcessor,
        TemplateSyncSchedulerService,
    ],
    exports: [WhatsAppTemplatesService],
})
export class WhatsAppTemplatesModule { }