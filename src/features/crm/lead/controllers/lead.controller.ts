import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeadCommandService } from '../application/services/lead-command.service';
import { LeadQueryService } from '../application/services/lead-query.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../../platform/billing/subscription/subscription.guard';
import { User } from '../../../../common/decorators';

@Controller('leads')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard)
export class LeadController {
  constructor(
    private readonly leadCommands: LeadCommandService,
    private readonly leadQueries: LeadQueryService,
  ) {}

  // ─── Create ──────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createLead(
    @Req() req: any,
    @Body() body: {
      name?: string;
      phone?: string;
      email?: string;
      channel?: string;
      source?: string;
      status?: string;
      context?: any;
      tags?: string[];
      quotedAmount?: number;
    },
  ) {
    return this.leadCommands.createLead({
      ...body,
      businessId: req.user.business_id,
      tenantId: req.user.tenant_id,
    });
  }

  // ─── List & detail ───────────────────────────────────────────

  @Get()
  getLeads(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('source') source?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('search') search?: string,
    @Query('intent_type') intent_type?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leadQueries.getLeads(req.user.business_id, { status, channel, source, assignedTo, search, intent_type, sortBy, sortOrder, page, limit });
  }

  @Get('stats/overview')
  getStatsOverview(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('intent_type') intent_type?: string,
  ) {
    return this.leadQueries.getStatsOverview(req.user.business_id, { from, to, intent_type });
  }

  @Get(':leadId')
  getLead(@Param('leadId') leadId: string) {
    return this.leadQueries.getLeadById(leadId);
  }

  @Get(':leadId/events')
  getLeadEvents(@Param('leadId') leadId: string) {
    return this.leadQueries.getLeadEvents(leadId);
  }

  @Delete(':leadId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLead(@Param('leadId') leadId: string) {
    return this.leadCommands.softDeleteLead(leadId);
  }

  // ─── Status, context, notes ──────────────────────────────────

  @Patch(':leadId/status')
  updateStatus(
    @Param('leadId') leadId: string,
    @Body() body: { status: string; lostReason?: string; quotedAmount?: number; convertedValue?: number },
    @User() user: any,
  ) {
    return this.leadCommands.updateStatus(leadId, body.status, {
      lostReason: body.lostReason,
      quotedAmount: body.quotedAmount,
      convertedValue: body.convertedValue,
      actorId: user?.userId,
      actor: 'human',
    });
  }

  @Patch(':leadId/context')
  updateContext(@Param('leadId') leadId: string, @Body() context: any) {
    return this.leadCommands.updateContext(leadId, context);
  }

  @Post(':leadId/notes')
  addNote(
    @Param('leadId') leadId: string,
    @Body() body: { text: string },
    @User() user: any,
  ) {
    return this.leadCommands.addNote(leadId, body.text, user?.userId);
  }

  @Patch(':leadId/tags')
  updateTags(
    @Param('leadId') leadId: string,
    @Body() body: { tags: string[] },
  ) {
    return this.leadCommands.updateTags(leadId, body.tags ?? []);
  }

  @Patch(':leadId/assign')
  assignLead(
    @Param('leadId') leadId: string,
    @Body() body: { assignedTo: string },
    @User() user: any,
  ) {
    return this.leadCommands.assignLead(leadId, body.assignedTo, user?.userId);
  }

  // ─── Follow-ups ───────────────────────────────────────────────

  @Post(':leadId/followups')
  scheduleFollowup(
    @Param('leadId') leadId: string,
    @Body() body: { note: string; scheduledAt: string; assignedTo: string },
    @User() user: any,
  ) {
    return this.leadCommands.scheduleFollowup({
      leadId,
      businessId: user?.businessId,
      note: body.note,
      scheduledAt: new Date(body.scheduledAt),
      assignedTo: body.assignedTo,
      createdBy: user?.userId,
    });
  }

  @Patch('followups/:followupId/done')
  completeFollowup(
    @Param('followupId') followupId: string,
    @Body() body: { doneNote?: string },
  ) {
    return this.leadCommands.completeFollowup(followupId, body.doneNote);
  }

  // ─── Dashboard ────────────────────────────────────────────────

  @Get('dashboard/daily-overview')
  getDailyOverview(@Req() req: any, @Query('date') date?: string) {
    return this.leadQueries.getDailyOverview(req.user.business_id, date ? new Date(date) : undefined);
  }

  @Get('dashboard/needs-attention')
  getNeedsAttention(@Req() req: any, @Query('limit') limit?: string) {
    return this.leadQueries.getNeedsAttention(req.user.business_id, limit ? Number(limit) : 20);
  }

  @Get('dashboard/channel-analytics')
  getChannelAnalytics(@Req() req: any, @Query('days') days?: string) {
    return this.leadQueries.getChannelAnalytics(req.user.business_id, days ? Number(days) : 30);
  }

  @Get('dashboard/demand-signals')
  getDemandSignals(@Req() req: any, @Query('days') days?: string) {
    return this.leadQueries.getDemandSignals(req.user.business_id, days ? Number(days) : 7);
  }

  @Get('dashboard/followup-queue')
  getFollowupQueue(@Req() req: any, @Query('assignedTo') assignedTo?: string, @Query('limit') limit?: string) {
    return this.leadQueries.getFollowupQueue(req.user.business_id, assignedTo, limit ? Number(limit) : 30);
  }

  // ─── Inbox (MongoDB) ──────────────────────────────────────────

  @Get('inbox/conversations')
  getOpenConversations(@Req() req: any, @Query('limit') limit?: number) {
    return this.leadQueries.getOpenConversations(req.user.business_id, limit);
  }

  @Get('inbox/conversations/:conversationId/messages')
  getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: number,
  ) {
    return this.leadQueries.getMessages(conversationId, limit);
  }
}
