import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { InboxService, InboxQueryDto, SendReplyDto, UpdateInboxConversationDto, BatchMessagesDto } from './inbox.service';

@Controller('inbox')
@UseGuards(JwtAuthGuard)
export class InboxController {
    constructor(private readonly inboxService: InboxService) { }

    @Get('conversations')
    @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 60000, limit: 120 } })
    listConversations(@Req() req: any, @Query() query: InboxQueryDto) {
        return this.inboxService.listConversations(req.user.business_id, req.user.tenant_id, query);
    }

    @Get('conversations/:id')
    @Throttle({ short: { ttl: 1000, limit: 8 }, medium: { ttl: 60000, limit: 180 } })
    getConversation(@Req() req: any, @Param('id') id: string) {
        return this.inboxService.getConversation(req.user.business_id, id);
    }

    @Get('conversations/:id/messages')
    @Throttle({ short: { ttl: 1000, limit: 8 }, medium: { ttl: 60000, limit: 180 } })
    getMessages(
        @Req() req: any,
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.inboxService.getMessages(req.user.business_id, id, page, limit);
    }

    @Post('conversations/:id/send')
    @Throttle({ short: { ttl: 1000, limit: 3 }, medium: { ttl: 60000, limit: 60 } })
    sendReply(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: SendReplyDto,
    ) {
        return this.inboxService.sendReply(req.user.business_id, id, dto);
    }

    @Post('conversations/batch-messages')
    @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 60000, limit: 120 } })
    batchMessages(@Req() req: any, @Body() dto: BatchMessagesDto) {
        return this.inboxService.batchMessages(req.user.business_id, dto);
    }

    @Patch('conversations/:id')
    @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 60000, limit: 120 } })
    updateConversation(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateInboxConversationDto,
    ) {
        return this.inboxService.updateConversation(req.user.business_id, id, dto);
    }

    @Post('conversations/:id/resolve')
    @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 60000, limit: 120 } })
    resolveConversation(@Req() req: any, @Param('id') id: string) {
        return this.inboxService.resolveConversation(req.user.business_id, id);
    }

    @Post('conversations/:id/takeover')
    @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 60000, limit: 120 } })
    takeoverConversation(@Req() req: any, @Param('id') id: string) {
        return this.inboxService.takeoverConversation(req.user.business_id, id, req.user.user_id);
    }
}
