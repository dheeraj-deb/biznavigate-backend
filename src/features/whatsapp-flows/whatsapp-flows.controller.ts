import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus,
    Param, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { WhatsAppFlowsService } from './whatsapp-flows.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { QueryFlowDto } from './dto/query-flow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('whatsapp/flows')
@UseGuards(JwtAuthGuard)
export class WhatsAppFlowsController {
    constructor(private readonly service: WhatsAppFlowsService) { }

    // POST /whatsapp/flows — create locally (no Meta call yet)
    @Post()
    create(@Req() req, @Body() dto: CreateFlowDto) {
        return this.service.create(req.user.business_id, dto);
    }

    // GET /whatsapp/flows
    @Get()
    findAll(@Req() req, @Query() query: QueryFlowDto) {
        return this.service.findAll(req.user.business_id, query);
    }

    // GET /whatsapp/flows/:id
    @Get(':id')
    findOne(@Req() req, @Param('id') id: string) {
        return this.service.findOne(req.user.business_id, id);
    }

    // PATCH /whatsapp/flows/:id — update local draft
    @Patch(':id')
    update(@Req() req, @Param('id') id: string, @Body() dto: Partial<CreateFlowDto>) {
        return this.service.update(req.user.business_id, id, dto);
    }

    // POST /whatsapp/flows/:id/rekey — regenerate RSA keys + fix endpoint URI on Meta
    @Post(':id/rekey')
    @HttpCode(HttpStatus.OK)
    rekey(@Req() req, @Param('id') id: string) {
        return this.service.rekey(req.user.business_id, id);
    }

    // POST /whatsapp/flows/:id/migrate — copy flow to another business
    @Post(':id/migrate')
    @HttpCode(HttpStatus.OK)
    migrate(@Req() req, @Param('id') id: string, @Body('targetBusinessId') targetBusinessId: string) {
        return this.service.migrate(req.user.business_id, id, targetBusinessId);
    }

    // POST /whatsapp/flows/sync-from-meta — import all flows from Meta into local DB
    @Post('sync-from-meta')
    @HttpCode(HttpStatus.OK)
    syncFromMeta(@Req() req) {
        return this.service.syncFromMeta(req.user.business_id);
    }

    // POST /whatsapp/flows/:id/submit — create on Meta + upload Flow JSON
    // Pass { force: true } in body to re-create a stale/deleted Meta flow
    @Post(':id/submit')
    @HttpCode(HttpStatus.OK)
    submit(@Req() req, @Param('id') id: string, @Body('force') force?: boolean) {
        return this.service.submit(req.user.business_id, id, force);
    }

    // POST /whatsapp/flows/:id/publish — publish on Meta (go live)
    @Post(':id/publish')
    @HttpCode(HttpStatus.OK)
    publish(@Req() req, @Param('id') id: string) {
        return this.service.publish(req.user.business_id, id);
    }

    // POST /whatsapp/flows/:id/deprecate
    @Post(':id/deprecate')
    @HttpCode(HttpStatus.OK)
    deprecate(@Req() req, @Param('id') id: string) {
        return this.service.deprecate(req.user.business_id, id);
    }

    // POST /whatsapp/flows/:id/sync — sync status from Meta
    @Post(':id/sync')
    @HttpCode(HttpStatus.OK)
    sync(@Req() req, @Param('id') id: string) {
        return this.service.syncStatus(req.user.business_id, id);
    }

    // DELETE /whatsapp/flows/:id
    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
        return this.service.remove(req.user.business_id, id);
    }
}
