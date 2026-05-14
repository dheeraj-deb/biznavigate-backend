import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { MongooseModule } from "@nestjs/mongoose";
import { CampaignController } from "./campaign.controller";
import { CrmCampaignController } from "./crm-campaign.controller";
import { CampaignService } from "./campaign.service";
import { Campaign, CampaignSchema } from "./schemas/campaign.schema";
import { WhatsAppTemplate, WhatsAppTemplateSchema } from "../whatsapp-templates/schemas/template.schema";
import { PrismaModule } from "../../../prisma/prisma.module";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { CampaignDispatchProcessor, CAMPAIGN_DISPATCH_QUEUE } from "./jobs/campaign-dispatch.processor";
import { CampaignSchedulerService } from "./jobs/campaign-scheduler.service";
import { BillingModule } from "../../platform/billing/billing.module";

@Module({
    imports: [
        PrismaModule,
        WhatsAppModule,
        BillingModule,
        BullModule.registerQueue({ name: CAMPAIGN_DISPATCH_QUEUE }),
        MongooseModule.forFeature([
            { name: Campaign.name, schema: CampaignSchema },
            { name: WhatsAppTemplate.name, schema: WhatsAppTemplateSchema },
        ]),
    ],
    controllers: [CampaignController, CrmCampaignController],
    providers: [CampaignService, CampaignDispatchProcessor, CampaignSchedulerService],
    exports: [CampaignService],
})
export class CampaignModule { }
