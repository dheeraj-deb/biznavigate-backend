import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadService } from '../application/services/lead.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { User } from '../../../common/decorators';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  // ─── List & detail ───────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List leads with filters. Returns { data, meta }.' })
  getLeads(
    @Query('businessId') businessId: string,
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
    return this.leadService.getLeads(businessId, { status, channel, source, assignedTo, search, intent_type, sortBy, sortOrder, page, limit });
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Lead funnel stats for a date range. Returns totals, by_status, by_source, by_quality.' })
  getStatsOverview(
    @Query('businessId') businessId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('intent_type') intent_type?: string,
  ) {
    return this.leadService.getStatsOverview(businessId, { from, to, intent_type });
  }

  @Get(':leadId')
  @ApiOperation({ summary: 'Get a single lead' })
  getLead(@Param('leadId') leadId: string) {
    return this.leadService.getLeadById(leadId);
  }

  @Get(':leadId/events')
  @ApiOperation({ summary: 'Get event timeline for a lead' })
  getLeadEvents(@Param('leadId') leadId: string) {
    return this.leadService.getLeadEvents(leadId);
  }

  @Delete(':leadId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a lead' })
  deleteLead(@Param('leadId') leadId: string) {
    return this.leadService.softDeleteLead(leadId);
  }

  // ─── Status, context, notes ──────────────────────────────────

  @Patch(':leadId/status')
  @ApiOperation({ summary: 'Update lead status' })
  updateStatus(
    @Param('leadId') leadId: string,
    @Body() body: { status: string; lostReason?: string; quotedAmount?: number; convertedValue?: number },
    @User() user: any,
  ) {
    return this.leadService.updateStatus(leadId, body.status, {
      lostReason: body.lostReason,
      quotedAmount: body.quotedAmount,
      convertedValue: body.convertedValue,
      actorId: user?.userId,
      actor: 'human',
    });
  }

  @Patch(':leadId/context')
  @ApiOperation({ summary: 'Update AI-extracted lead context (resort/camp/product)' })
  updateContext(@Param('leadId') leadId: string, @Body() context: any) {
    return this.leadService.updateContext(leadId, context);
  }

  @Post(':leadId/notes')
  @ApiOperation({ summary: 'Add a staff note to a lead' })
  addNote(
    @Param('leadId') leadId: string,
    @Body() body: { text: string },
    @User() user: any,
  ) {
    return this.leadService.addNote(leadId, body.text, user?.userId);
  }

  @Patch(':leadId/tags')
  @ApiOperation({ summary: 'Set tags on a lead (replaces existing tags)' })
  updateTags(
    @Param('leadId') leadId: string,
    @Body() body: { tags: string[] },
  ) {
    return this.leadService.updateTags(leadId, body.tags ?? []);
  }

  @Patch(':leadId/assign')
  @ApiOperation({ summary: 'Assign lead to a staff member' })
  assignLead(
    @Param('leadId') leadId: string,
    @Body() body: { assignedTo: string },
    @User() user: any,
  ) {
    return this.leadService.assignLead(leadId, body.assignedTo, user?.userId);
  }

  // ─── Follow-ups ───────────────────────────────────────────────

  @Post(':leadId/followups')
  @ApiOperation({ summary: 'Schedule a follow-up for a lead' })
  scheduleFollowup(
    @Param('leadId') leadId: string,
    @Body() body: { note: string; scheduledAt: string; assignedTo: string },
    @User() user: any,
  ) {
    return this.leadService.scheduleFollowup({
      leadId,
      businessId: user?.businessId,
      note: body.note,
      scheduledAt: new Date(body.scheduledAt),
      assignedTo: body.assignedTo,
      createdBy: user?.userId,
    });
  }

  @Patch('followups/:followupId/done')
  @ApiOperation({ summary: 'Mark a follow-up as done' })
  completeFollowup(
    @Param('followupId') followupId: string,
    @Body() body: { doneNote?: string },
  ) {
    return this.leadService.completeFollowup(followupId, body.doneNote);
  }

  // ─── Dashboard ────────────────────────────────────────────────

  @Get('dashboard/daily-overview')
  @ApiOperation({ summary: 'Owner home screen: today\'s enquiries, bookings, revenue' })
  getDailyOverview(
    @Query('businessId') businessId: string,
    @Query('date') date?: string,
  ) {
    return this.leadService.getDailyOverview(businessId, date ? new Date(date) : undefined);
  }

  @Get('dashboard/needs-attention')
  @ApiOperation({ summary: 'Leads that need immediate owner follow-up' })
  getNeedsAttention(
    @Query('businessId') businessId: string,
    @Query('limit') limit?: number,
  ) {
    return this.leadService.getNeedsAttention(businessId, limit);
  }

  @Get('dashboard/channel-analytics')
  @ApiOperation({ summary: 'Conversion rates per channel and source' })
  getChannelAnalytics(
    @Query('businessId') businessId: string,
    @Query('days') days?: number,
  ) {
    return this.leadService.getChannelAnalytics(businessId, days ?? 30);
  }

  @Get('dashboard/demand-signals')
  @ApiOperation({ summary: 'Services/products asked but unavailable — missed revenue' })
  getDemandSignals(
    @Query('businessId') businessId: string,
    @Query('days') days?: number,
  ) {
    return this.leadService.getDemandSignals(businessId, days ?? 7);
  }

  @Get('dashboard/followup-queue')
  @ApiOperation({ summary: 'Staff follow-up queue with call script hints' })
  getFollowupQueue(
    @Query('businessId') businessId: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('limit') limit?: number,
  ) {
    return this.leadService.getFollowupQueue(businessId, assignedTo, limit);
  }

  // ─── Inbox (MongoDB) ──────────────────────────────────────────

  @Get('inbox/conversations')
  @ApiOperation({ summary: 'Open conversations for inbox' })
  getOpenConversations(
    @Query('businessId') businessId: string,
    @Query('limit') limit?: number,
  ) {
    return this.leadService.getOpenConversations(businessId, limit);
  }

  @Get('inbox/conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Load message thread for a conversation' })
  getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: number,
  ) {
    return this.leadService.getMessages(conversationId, limit);
  }
}
