import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { HumanHandoffService } from './human-handoff.service';

@SkipThrottle()
@Controller('handoff')
@UseGuards(JwtAuthGuard)
export class HumanHandoffController {
    constructor(private readonly service: HumanHandoffService) {}

    /** GET /handoff/queue — escalated, unresolved conversations */
    @Get('queue')
    getQueue(@Req() req: any) {
        return this.service.getQueue(req.user.business_id);
    }

    /** GET /handoff/conversations/:id — full conversation detail */
    @Get('conversations/:id')
    getConversation(@Req() req: any, @Param('id') id: string) {
        return this.service.getConversation(req.user.business_id, id);
    }

    /** POST /handoff/conversations/:id/takeover — assign agent */
    @Post('conversations/:id/takeover')
    takeover(@Req() req: any, @Param('id') id: string) {
        return this.service.takeover(req.user.business_id, id, req.user.user_id);
    }

    /** POST /handoff/conversations/:id/resolve — close conversation */
    @Post('conversations/:id/resolve')
    resolve(@Req() req: any, @Param('id') id: string) {
        return this.service.resolve(req.user.business_id, id);
    }

    /** POST /handoff/conversations/:id/send — agent sends a message */
    @Post('conversations/:id/send')
    sendReply(
        @Req() req: any,
        @Param('id') id: string,
        @Body('content') content: string,
    ) {
        return this.service.sendReply(req.user.business_id, id, req.user.user_id, content);
    }
}
