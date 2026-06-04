import {
    Controller, Get, Post, Patch, Delete, Body, Param,
    Query, HttpCode, HttpStatus, UseGuards, Req,
} from '@nestjs/common';
import { WhatsAppTemplatesService } from './whatsapp-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('whatsapp/templates')
@UseGuards(JwtAuthGuard)
export class WhatsAppTemplatesController {
    constructor(private readonly service: WhatsAppTemplatesService) { }

    // POST /whatsapp/templates/sync-from-meta — import all templates from Meta into local DB
    @Post('sync-from-meta')
    @HttpCode(HttpStatus.OK)
    syncFromMeta(@Req() req) {
        return this.service.syncFromMeta(req.user.business_id);
    }

    // POST /whatsapp/templates/apply-system-blueprints — create/submit default templates for this business type
    @Post('apply-system-blueprints')
    @HttpCode(HttpStatus.OK)
    applySystemBlueprints(@Req() req) {
        return this.service.applySystemBlueprintTemplates(req.user.business_id);
    }

    @Post()
    create(@Req() req, @Body() dto: CreateTemplateDto) {
        const businessId = req.user.business_id; // from JWT
        return this.service.create(businessId, dto);
    }

    // GET /whatsapp/templates — list with filters
    @Get()
    findAll(@Req() req, @Query() query: QueryTemplateDto) {
        return this.service.findAll(req.user.business_id, query);
    }

    // GET /whatsapp/templates/stats
    @Get('stats')
    getStats(@Req() req) {
        return this.service.getStats(req.user.business_id);
    }

    // GET /whatsapp/templates/approved — all approved templates
    @Get('approved')
    findApproved(@Req() req) {
        return this.service.findApproved(req.user.business_id);
    }

    // GET /whatsapp/templates/by-name/:name — find approved template by name
    @Get('by-name/:name')
    findByName(@Req() req, @Param('name') name: string) {
        return this.service.findByName(req.user.business_id, name);
    }

    // GET /whatsapp/templates/:id
    @Get(':id')
    findOne(@Req() req, @Param('id') id: string) {
        return this.service.findOne(req.user.business_id, id);
    }

    // PATCH /whatsapp/templates/:id
    @Patch(':id')
    update(@Req() req, @Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
        return this.service.update(req.user.business_id, id, dto);
    }

    // POST /whatsapp/templates/:id/submit — submit to Meta
    @Post(':id/submit')
    @HttpCode(HttpStatus.OK)
    submit(@Req() req, @Param('id') id: string) {
        return this.service.submit(req.user.business_id, id);
    }

    // POST /whatsapp/templates/:id/duplicate
    @Post(':id/duplicate')
    duplicate(@Req() req, @Param('id') id: string) {
        return this.service.duplicate(req.user.business_id, id);
    }

    // POST /whatsapp/templates/:id/sync — manually sync status from Meta
    @Post(':id/sync')
    @HttpCode(HttpStatus.OK)
    sync(@Req() req, @Param('id') id: string) {
        return this.service.syncStatus(req.user.business_id, id);
    }

    // DELETE /whatsapp/templates/:id
    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
        return this.service.remove(req.user.business_id, id);
    }

    // // POST /whatsapp/webhook — Meta status update webhook
    // @Post('/webhook/meta')
    // @HttpCode(HttpStatus.OK)
    // webhook(@Body() payload: any) {
    //     // Meta sends GET first to verify, then POST for events
    //     return this.service.handleMetaWebhook(payload);
    // }
}
