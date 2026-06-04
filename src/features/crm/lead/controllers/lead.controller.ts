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
import { LeadAccessService } from '../application/services/lead-access.service';
import { SmartCampaignTriggerService } from '../application/services/smart-campaign-trigger.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../../platform/billing/subscription/subscription.guard';
import { PrismaService } from '../../../../prisma/prisma.service';

@Controller('leads')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard)
export class LeadController {
  constructor(
    private readonly leadCommands: LeadCommandService,
    private readonly leadQueries: LeadQueryService,
    private readonly access: LeadAccessService,
    private readonly campaignTrigger: SmartCampaignTriggerService,
    private readonly prisma: PrismaService,
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
    @Query('q') q?: string,
    @Query('intent_type') intent_type?: string,
    @Query('stage_id') stage_id?: string,
    @Query('pipeline_id') pipeline_id?: string,
    @Query('lead_type') lead_type?: string,
    @Query('qualification_score_min') qualification_score_min?: string,
    @Query('exit_reason') exit_reason?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leadQueries.getLeads(req.user.business_id, {
      status, channel, source, assignedTo, search: search ?? q, intent_type, stage_id, pipeline_id,
      lead_type, exit_reason,
      qualification_score_min: qualification_score_min ? Number(qualification_score_min) : undefined,
      sortBy, sortOrder, page, limit,
    });
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

  @Get(':leadId([0-9a-fA-F-]{36})')
  async getLead(@Req() req: any, @Param('leadId') leadId: string) {
    await this.access.requireLead(leadId, req.user.business_id);
    return this.leadQueries.getLeadById(leadId);
  }

  @Get(':leadId([0-9a-fA-F-]{36})/events')
  async getLeadEvents(@Req() req: any, @Param('leadId') leadId: string) {
    await this.access.requireLead(leadId, req.user.business_id);
    return this.leadQueries.getLeadEvents(leadId);
  }

  @Delete(':leadId([0-9a-fA-F-]{36})')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLead(@Req() req: any, @Param('leadId') leadId: string) {
    await this.access.requireLead(leadId, req.user.business_id);
    await this.leadCommands.softDeleteLead(leadId, {
      businessId: req.user.business_id,
      actorId: req.user.user_id,
    });
  }

  // ─── Status, context, notes ──────────────────────────────────

  @Patch(':leadId([0-9a-fA-F-]{36})/status')
  async updateStatus(
    @Req() req: any,
    @Param('leadId') leadId: string,
    @Body() body: { status: string; lostReason?: string; quotedAmount?: number; convertedValue?: number },
  ) {
    const lead = await this.access.requireLead(leadId, req.user.business_id);
    return this.leadCommands.updateStatus(leadId, body.status, {
      lostReason: body.lostReason,
      quotedAmount: body.quotedAmount,
      convertedValue: body.convertedValue,
      actorId: req.user.user_id,
      actor: 'human',
      lead: { lead_id: lead.lead_id, business_id: lead.business_id, status: lead.status, pipeline_id: lead.pipeline_id },
    });
  }

  /** Pipeline-aware move. Source of truth when pipelines are used. */
  @Patch(':leadId([0-9a-fA-F-]{36})/stage')
  async moveToStage(
    @Req() req: any,
    @Param('leadId') leadId: string,
    @Body() body: { stage_id: string },
  ) {
    await this.access.requireLead(leadId, req.user.business_id);
    return this.leadCommands.moveToStage({
      leadId,
      stageId: body.stage_id,
      businessId: req.user.business_id,
      actorId: req.user.user_id,
      actor: 'human',
    });
  }

  @Patch(':leadId([0-9a-fA-F-]{36})/context')
  async updateContext(@Req() req: any, @Param('leadId') leadId: string, @Body() context: any) {
    await this.access.requireLead(leadId, req.user.business_id);
    return this.leadCommands.updateContext(leadId, context);
  }

  @Post(':leadId([0-9a-fA-F-]{36})/notes')
  async addNote(
    @Req() req: any,
    @Param('leadId') leadId: string,
    @Body() body: { text: string },
  ) {
    await this.access.requireLead(leadId, req.user.business_id);
    return this.leadCommands.addNote(leadId, body.text, req.user.user_id);
  }

  @Patch(':leadId([0-9a-fA-F-]{36})/tags')
  async updateTags(
    @Req() req: any,
    @Param('leadId') leadId: string,
    @Body() body: { tags: string[] },
  ) {
    await this.access.requireLead(leadId, req.user.business_id);
    return this.leadCommands.updateTags(leadId, body.tags ?? []);
  }

  @Patch(':leadId([0-9a-fA-F-]{36})/assign')
  async assignLead(
    @Req() req: any,
    @Param('leadId') leadId: string,
    @Body() body: { assignedTo: string },
  ) {
    await this.access.requireLead(leadId, req.user.business_id);
    await this.access.assertAssigneeInBusiness(body.assignedTo, req.user.business_id);
    return this.leadCommands.assignLead(leadId, body.assignedTo, req.user.user_id);
  }

  // ─── Follow-ups ───────────────────────────────────────────────

  @Post(':leadId([0-9a-fA-F-]{36})/followups')
  async scheduleFollowup(
    @Req() req: any,
    @Param('leadId') leadId: string,
    @Body() body: { note: string; scheduledAt: string; assignedTo: string },
  ) {
    await this.access.requireLead(leadId, req.user.business_id);
    await this.access.assertAssigneeInBusiness(body.assignedTo, req.user.business_id);
    return this.leadCommands.scheduleFollowup({
      leadId,
      businessId: req.user.business_id,
      note: body.note,
      scheduledAt: new Date(body.scheduledAt),
      assignedTo: body.assignedTo,
      createdBy: req.user.user_id,
    });
  }

  @Patch('followups/:followupId/done')
  async completeFollowup(
    @Req() req: any,
    @Param('followupId') followupId: string,
    @Body() body: { doneNote?: string },
  ) {
    await this.access.requireFollowup(followupId, req.user.business_id);
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

  @Get('dashboard/resort-worklist')
  getResortWorklist(@Req() req: any, @Query('days') days?: string) {
    return this.leadQueries.getResortWorklist(req.user.business_id, days ? Number(days) : 14);
  }

  @Get('dashboard/resort-reminders')
  getResortReminderReadiness(@Req() req: any, @Query('days') days?: string) {
    return this.leadQueries.getResortReminderReadiness(req.user.business_id, days ? Number(days) : 14);
  }

  // ─── Inbox (MongoDB) ──────────────────────────────────────────

  @Get('inbox/conversations')
  getOpenConversations(@Req() req: any, @Query('limit') limit?: number) {
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    return this.leadQueries.getOpenConversations(req.user.business_id, safeLimit);
  }

  @Get('inbox/conversations/:conversationId/messages')
  getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: number,
  ) {
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));
    return this.leadQueries.getMessages(conversationId, safeLimit);
  }

  // ─── Lead Item Interests ─────────────────────────────────────

  @Get(':leadId([0-9a-fA-F-]{36})/interests')
  async getLeadInterests(@Req() req: any, @Param('leadId') leadId: string) {
    await this.access.requireLead(leadId, req.user.business_id);
    return this.prisma.lead_item_interests.findMany({
      where: { lead_id: leadId },
      orderBy: { updated_at: 'desc' },
    });
  }

  @Post(':leadId([0-9a-fA-F-]{36})/interests')
  async recordInterest(
    @Req() req: any,
    @Param('leadId') leadId: string,
    @Body() body: {
      item_id?: string;
      item_type: string;
      item_name: string;
      interest_level?: string;
      last_price_seen?: number;
    },
  ) {
    await this.access.requireLead(leadId, req.user.business_id);
    const commonData = {
      item_type: body.item_type,
      item_name: body.item_name,
      interest_level: body.interest_level ?? 'viewed',
      last_price_seen: body.last_price_seen,
    };
    // Can only upsert when item_id is known (unique key requires it); otherwise just create.
    if (body.item_id) {
      return this.prisma.lead_item_interests.upsert({
        where: { uq_lead_item_interest: { lead_id: leadId, item_id: body.item_id } } as any,
        create: { lead_id: leadId, business_id: req.user.business_id, item_id: body.item_id, ...commonData },
        update: { ...commonData, updated_at: new Date() },
      });
    }
    return this.prisma.lead_item_interests.create({
      data: { lead_id: leadId, business_id: req.user.business_id, ...commonData },
    });
  }

  // ─── Smart Campaign Drafts (staff approval) ──────────────────

  @Get('campaigns/pending-approvals')
  getPendingCampaigns(@Req() req: any) {
    return this.campaignTrigger.listPendingDrafts(req.user.business_id);
  }

  @Post('campaigns/:campaignId/approve')
  @HttpCode(HttpStatus.OK)
  approveCampaign(
    @Req() req: any,
    @Param('campaignId') campaignId: string,
  ) {
    return this.campaignTrigger.approveDraft(campaignId, req.user.business_id, req.user.user_id);
  }

  @Post('campaigns/:campaignId/reject')
  @HttpCode(HttpStatus.OK)
  rejectCampaign(
    @Req() req: any,
    @Param('campaignId') campaignId: string,
  ) {
    return this.campaignTrigger.rejectDraft(campaignId, req.user.business_id);
  }
}
