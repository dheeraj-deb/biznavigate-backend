import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards";
import { SubscriptionGuard } from "../billing/subscription/subscription.guard";
import { CampaignService } from "./campaign.service";
import { CreateCampaignDto, QueryCampaignDto } from "./dto/campaign.dto";

@Controller('campaigns')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
export class CampaignController {
    constructor(private readonly service: CampaignService) { }

    @Post('bulk')
    bulkQuickSend(
        @Req() req: any,
        @Body() body: { lead_ids: string[]; message: string },
    ) {
        return this.service.sendBulkQuickMessage(req.user.business_id, body.lead_ids, body.message);
    }

    @Post()
    create(@Req() req: any, @Body() dto: CreateCampaignDto) {
        return this.service.create(req.user.business_id, dto);
    }

    @Get()
    findAll(@Req() req: any, @Query() query: QueryCampaignDto) {
        return this.service.findAll(req.user.business_id, query);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user.business_id, id);
    }

    @Get(':id/analytics')
    getAnalytics(@Req() req: any, @Param('id') id: string) {
        return this.service.getAnalytics(req.user.business_id, id);
    }

    @Get(':id/recipients')
    getRecipients(
        @Req() req: any,
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: string,
    ) {
        return this.service.getRecipients(req.user.business_id, id, page, limit, status);
    }

    @Post(':id/launch')
    launch(@Req() req: any, @Param('id') id: string) {
        return this.service.launchCampaign(req.user.business_id, id);
    }

    @Patch(':id/pause')
    pause(@Req() req: any, @Param('id') id: string) {
        return this.service.pause(req.user.business_id, id);
    }

    @Patch(':id/cancel')
    cancel(@Req() req: any, @Param('id') id: string) {
        return this.service.cancel(req.user.business_id, id);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.service.remove(req.user.business_id, id);
    }
}
