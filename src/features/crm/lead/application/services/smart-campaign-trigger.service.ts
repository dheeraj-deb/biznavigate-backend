import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { LeadPreferenceWatchService } from './lead-preference-watch.service';

@Injectable()
export class SmartCampaignTriggerService {
  private readonly logger = new Logger(SmartCampaignTriggerService.name);
  private smartCampaignColumnsReady: boolean | null = null;
  private smartCampaignColumnsWarned = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly preferenceWatches: LeadPreferenceWatchService,
  ) {}

  @OnEvent('catalog.vehicle.created')
  async handleVehicleCreated(payload: { businessId: string; itemId: string }) {
    await this.onNewCatalogItem(payload.businessId, payload.itemId);
  }

  @OnEvent('catalog.vehicle.price_dropped')
  async handleVehiclePriceDrop(payload: { businessId: string; itemId: string; newPrice: number }) {
    await this.onPriceDrop(payload.businessId, payload.itemId, payload.newPrice);
  }

  /** Called when a catalog item's base_price is reduced (covers vehicles + products). */
  async onPriceDrop(businessId: string, itemId: string, newPrice: number) {
    const interested = await this.prisma.lead_item_interests.findMany({
      where: {
        business_id: businessId,
        item_id: itemId,
        is_alert_active: true,
        last_price_seen: { gt: newPrice },
      },
      include: { leads: { select: { lead_id: true, name: true } } },
    });
    if (!interested.length) return;

    const item = await this.prisma.catalog_items.findUnique({
      where: { item_id: itemId },
      include: { vehicle_detail: true },
    });
    if (!item) return;

    const itemName = item.vehicle_detail
      ? `${item.vehicle_detail.year} ${item.vehicle_detail.make} ${item.vehicle_detail.model_name}`
      : item.name;

    await this.createDraft(businessId, `Price drop alert — ${itemName}`, interested.map((i) => i.lead_id), {
      trigger: 'price_drop',
      item_id: itemId,
      new_price: newPrice,
      item_name: itemName,
    });
  }

  /** Called when a new catalog item is added (vehicle, product, etc.). */
  async onNewCatalogItem(businessId: string, itemId: string) {
    const item = await this.prisma.catalog_items.findUnique({
      where: { item_id: itemId },
      include: { vehicle_detail: true },
    });
    if (!item || item.item_type !== 'vehicle') return;

    const v = item.vehicle_detail;
    if (!v) return;

    const vehicleData = {
      asking_price: Number(item.base_price),
      make: v.make,
      model_name: v.model_name,
      fuel_type: v.fuel_type,
      year: v.year,
    };
    const watches = await this.preferenceWatches.findMatchingAutomotiveWatches(businessId, vehicleData);
    const matched: string[] = [];

    for (const watch of watches) {
      matched.push(watch.lead_id);
      await this.preferenceWatches.markNotified(watch.watch_id);
    }

    if (!matched.length) return;

    const itemName = `${v.year} ${v.make} ${v.model_name}`;
    await this.createDraft(businessId, `New vehicle match — ${itemName}`, matched, {
      trigger: 'new_inventory',
      item_id: itemId,
      item_name: itemName,
      price: Number(item.base_price),
    });
  }

  /** Called when a new activity / camp / event is published. */
  async onNewActivity(businessId: string, activityName: string, itemId?: string) {
    const subscribers = await this.prisma.leads.findMany({
      where: { business_id: businessId, lead_type: 'activity_update_subscriber', deleted_at: null },
      select: { lead_id: true },
    });
    if (!subscribers.length) return;

    await this.createDraft(businessId, `New activity — ${activityName}`, subscribers.map((s) => s.lead_id), {
      trigger: 'new_activity',
      activity_name: activityName,
      item_id: itemId,
    });
  }

  /** Called when a new course batch is created. */
  async onNewBatch(businessId: string, courseId: string, batchId: string, courseName: string) {
    const watches = await this.preferenceWatches.findActiveWatches(businessId, 'batch_available');
    const matched: string[] = [];

    for (const watch of watches) {
      const criteria: any = watch.criteria;
      if (criteria.course_id === courseId) {
        matched.push(watch.lead_id);
        await this.preferenceWatches.markNotified(watch.watch_id);
      }
    }

    // Also include leads who said "notify on new batch" generally for this business
    const subscribers = await this.prisma.leads.findMany({
      where: { business_id: businessId, lead_type: 'batch_update_subscriber', deleted_at: null },
      select: { lead_id: true },
    });
    for (const s of subscribers) {
      if (!matched.includes(s.lead_id)) matched.push(s.lead_id);
    }

    if (!matched.length) return;

    await this.createDraft(businessId, `New batch — ${courseName}`, matched, {
      trigger: 'new_batch',
      course_id: courseId,
      batch_id: batchId,
      course_name: courseName,
    });
  }

  /** Called when a booking cancellation opens availability for a previously-unavailable date. */
  async onSlotAvailable(businessId: string, itemId: string, availableFrom: string, availableTo: string) {
    const watches = await this.preferenceWatches.findActiveWatches(businessId, 'date_available');
    const matched: string[] = [];

    for (const watch of watches) {
      const criteria: any = watch.criteria;
      if (
        (!criteria.item_id || criteria.item_id === itemId) &&
        this.preferenceWatches.matchesDateRange(criteria, availableFrom, availableTo)
      ) {
        matched.push(watch.lead_id);
        await this.preferenceWatches.markNotified(watch.watch_id);
      }
    }

    if (!matched.length) return;

    await this.createDraft(businessId, `Slot available ${availableFrom} – ${availableTo}`, matched, {
      trigger: 'slot_available',
      item_id: itemId,
      available_from: availableFrom,
      available_to: availableTo,
    });
  }

  /** Called when a lead explicitly asks to negotiate — escalates to human immediately. */
  async onNegotiationRequest(leadId: string, businessId: string) {
    await this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { lead_type: 'negotiating' },
    });
    await this.prisma.lead_events.create({
      data: {
        lead_id: leadId,
        business_id: businessId,
        type: 'handoff',
        actor: 'system',
        data: { reason: 'negotiation_requested' },
      },
    });
    this.logger.log(`Negotiation escalation: lead ${leadId} → human handoff`);
  }

  /** List campaign drafts pending staff approval. */
  async listPendingDrafts(businessId: string) {
    return this.prisma.campaigns.findMany({
      where: { business_id: businessId, status: 'pending_approval' },
      orderBy: { created_at: 'desc' },
    });
  }

  /** Staff approves a draft — status → approved, BullMQ picks it up. */
  async approveDraft(campaignId: string, businessId: string, approvedBy = 'staff') {
    const draft = await this.prisma.campaigns.findFirst({
      where: { campaign_id: campaignId, business_id: businessId, status: 'pending_approval' },
    });
    if (!draft) return null;

    const hasApprovalColumns = await this.hasSmartCampaignQueueColumns();
    return this.prisma.campaigns.update({
      where: { campaign_id: campaignId },
      data: {
        status: 'approved',
        ...(hasApprovalColumns ? { approved_at: new Date(), approved_by: approvedBy } : {}),
        updated_at: new Date(),
      },
    });
  }

  /** Staff rejects a draft. */
  async rejectDraft(campaignId: string, businessId: string) {
    return this.prisma.campaigns.updateMany({
      where: { campaign_id: campaignId, business_id: businessId, status: 'pending_approval' },
      data: { status: 'rejected', updated_at: new Date() },
    });
  }

  private async createDraft(
    businessId: string,
    campaignName: string,
    leadIds: string[],
    triggerMeta: Record<string, any>,
  ) {
    const tenantId = await this.resolveTenantId(businessId);
    const hasQueueColumns = await this.hasSmartCampaignQueueColumns();
    const deduplicationKey = this.buildDeduplicationKey(businessId, triggerMeta);
    if (hasQueueColumns) {
      const existing = await this.prisma.campaigns.findUnique({
        where: { deduplication_key: deduplicationKey },
        select: { campaign_id: true },
      });
      if (existing) {
        this.logger.debug(`Smart campaign draft skipped by dedupe key ${deduplicationKey}`);
        return existing;
      }
    }

    const autoApproveAt = new Date(Date.now() + this.getAutoApproveHours() * 60 * 60 * 1000);

    const draft = await this.prisma.campaigns.create({
      data: {
        business_id: businessId,
        tenant_id: tenantId,
        campaign_name: campaignName,
        campaign_type: 'smart_trigger',
        channel: 'whatsapp',
        status: 'pending_approval',
        audience_type: 'leads',
        audience_filter: { lead_ids: leadIds, trigger_meta: triggerMeta } as any,
        total_recipients: leadIds.length,
        ...(hasQueueColumns ? {
          auto_approve_at: autoApproveAt,
          deduplication_key: deduplicationKey,
        } : {}),
      },
    });

    await this.prisma.lead_events.createMany({
      data: leadIds.map((lead_id) => ({
        lead_id,
        business_id: businessId,
        type: 'smart_campaign_queued',
        actor: 'system',
        data: { campaign_id: draft.campaign_id, trigger: triggerMeta.trigger },
      })),
      skipDuplicates: true,
    });

    this.logger.log(
      `Smart campaign draft created: ${draft.campaign_id} for ${leadIds.length} leads — ${campaignName}`,
    );
    return draft;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoApprovePendingDrafts() {
    if (!(await this.hasSmartCampaignQueueColumns())) return 0;

    const due = await this.prisma.campaigns.findMany({
      where: {
        campaign_type: 'smart_trigger',
        status: 'pending_approval',
        auto_approve_at: { lte: new Date() },
      },
      select: { campaign_id: true, business_id: true },
      take: 100,
    });
    if (!due.length) return 0;

    let approved = 0;
    for (const draft of due) {
      const result = await this.approveDraft(draft.campaign_id, draft.business_id, 'auto');
      if (result) approved++;
    }

    this.logger.log(`Auto-approved ${approved} smart campaign draft(s)`);
    return approved;
  }

  private buildDeduplicationKey(businessId: string, triggerMeta: Record<string, any>) {
    const trigger = String(triggerMeta.trigger ?? 'unknown');
    const item = String(
      triggerMeta.item_id ??
      triggerMeta.course_id ??
      triggerMeta.batch_id ??
      triggerMeta.activity_name ??
      'none',
    );
    const eventDate = String(
      triggerMeta.triggered_at ??
      triggerMeta.available_from ??
      triggerMeta.new_price ??
      new Date().toISOString().slice(0, 10),
    );
    return `${businessId}:${trigger}:${item}:${eventDate}`;
  }

  private getAutoApproveHours() {
    const configured = Number(process.env.SMART_CAMPAIGN_AUTO_APPROVE_HOURS ?? 24);
    return Number.isFinite(configured) && configured > 0 ? configured : 24;
  }

  private async hasSmartCampaignQueueColumns() {
    if (this.smartCampaignColumnsReady !== null) return this.smartCampaignColumnsReady;

    const rows = await this.prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'campaigns'
        AND column_name IN ('approved_at', 'approved_by', 'auto_approve_at', 'deduplication_key')
    `;
    const found = new Set(rows.map((row) => row.column_name));
    this.smartCampaignColumnsReady =
      found.has('approved_at') &&
      found.has('approved_by') &&
      found.has('auto_approve_at') &&
      found.has('deduplication_key');

    if (!this.smartCampaignColumnsReady && !this.smartCampaignColumnsWarned) {
      this.smartCampaignColumnsWarned = true;
      this.logger.warn(
        'Smart campaign auto-approval is disabled until migration 20260603_business_automation_metadata is applied.',
      );
    }

    return this.smartCampaignColumnsReady;
  }

  private async resolveTenantId(businessId: string): Promise<string> {
    const biz = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: { tenant_id: true },
    });
    return biz?.tenant_id ?? businessId;
  }
}
