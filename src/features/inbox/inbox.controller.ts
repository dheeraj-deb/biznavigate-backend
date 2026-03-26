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
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/common/guards';
import { InboxService, InboxQueryDto, SendReplyDto, UpdateInboxConversationDto, BatchMessagesDto } from './inbox.service';

@SkipThrottle()
@Controller('inbox')
@UseGuards(JwtAuthGuard)
export class InboxController {
    constructor(private readonly inboxService: InboxService) {}

    @Get('conversations')
    listConversations(@Req() req: any, @Query() query: InboxQueryDto) {
        return this.inboxService.listConversations(req.user.business_id, req.user.tenant_id, query);
    }

    @Get('conversations/:id')
    getConversation(@Req() req: any, @Param('id') id: string) {
        return this.inboxService.getConversation(req.user.business_id, id);
    }

    @Get('conversations/:id/messages')
    getMessages(
        @Req() req: any,
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.inboxService.getMessages(req.user.business_id, id, page, limit);
    }

    @Post('conversations/:id/send')
    sendReply(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: SendReplyDto,
    ) {
        return this.inboxService.sendReply(req.user.business_id, id, dto);
    }

    @Post('conversations/batch-messages')
    batchMessages(@Req() req: any, @Body() dto: BatchMessagesDto) {
        return this.inboxService.batchMessages(req.user.business_id, dto);
    }

    @Patch('conversations/:id')
    updateConversation(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateInboxConversationDto,
    ) {
        return this.inboxService.updateConversation(req.user.business_id, id, dto);
    }
}
