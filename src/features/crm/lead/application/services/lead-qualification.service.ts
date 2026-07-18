import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { LeadTypes } from '../lead-types';

export type QualificationLevel = 'cold' | 'warm' | 'hot' | 'confirmed_interested' | 'negotiating' | 'lost';

// Scores for events that are actually emitted in the codebase.
const BASE_SCORES: Record<string, number> = {
  resort_enquiry:               15,
  hospitality_inquiry_created:  15,
  product_inquiry_created:      15,
  public_booking_requested:     18,
  booking_link_sent:            18,
  availability_checked:         10,
  demand_miss:                  12,
  booking_pending:              35,
  booked:                       55,
  booking_cancelled:           -50,
  cancelled:                   -40,
  public_product_order_created: 35,
  product_order_created:        35,
  product_order_paid:           45,
  stock_held:                   30,
  product_order_cancelled:     -40,
  // Lead replied to an exit-intent prompt — real engagement signal
  exit_intent_captured:          15,
  // Lead opted into an alert — highest explicit intent signal
  alert_subscription_confirmed:  35,
  // Any pipeline forward move (AI or human)
  auto_progressed:                8,
  stage_changed:                  8,
  // Follow-up was scheduled — lead is warm enough to track
  followup_set:                   8,
  // Negotiation escalation — very hot, near purchase
  handoff:                       20,
  // Smart campaign created for this lead (they were matched to a trigger)
  smart_campaign_queued:          5,
};

// status_changed events carry `data.to` — score based on which status was reached.
const STATUS_SCORES: Record<string, number> = {
  contacted:  5,
  qualified: 10,
  quoted:    20,   // price was shared — strong buying signal
  booked:    30,   // visit/test drive / booking initiated
  won:       50,
  lost:     -40,
  cancelled:-40,
};

@Injectable()
export class LeadQualificationService {
  private readonly logger = new Logger(LeadQualificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget — call after any lead event. Does not throw. */
  recalculate(leadId: string): void {
    this.computeAndPersist(leadId).catch((err) =>
      this.logger.warn(`recalculate failed for lead ${leadId}: ${err.message}`),
    );
  }

  getLevel(score: number, leadType?: string | null): QualificationLevel {
    if (leadType === LeadTypes.LOST || leadType === LeadTypes.RESORT_CANCELLED || leadType === LeadTypes.PRODUCT_CANCELLED) return 'lost';
    if (leadType === LeadTypes.NEGOTIATING) return 'negotiating';
    if (
      leadType === LeadTypes.PRICE_ALERT_SUBSCRIBER ||
      leadType === LeadTypes.MATCH_ALERT_SUBSCRIBER ||
      leadType === LeadTypes.SLOT_ALERT_SUBSCRIBER ||
      leadType === LeadTypes.ACTIVITY_UPDATE_SUBSCRIBER ||
      leadType === LeadTypes.BATCH_UPDATE_SUBSCRIBER ||
      leadType === LeadTypes.STOCK_ALERT_SUBSCRIBER
    ) return 'confirmed_interested';
    if (leadType === LeadTypes.RESORT_BOOKED || leadType === LeadTypes.PRODUCT_ORDERED) return 'hot';
    if (score >= 50) return 'hot';
    if (score >= 20) return 'warm';
    return 'cold';
  }

  private async computeAndPersist(leadId: string): Promise<void> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const events = await this.prisma.lead_events.findMany({
      where: { lead_id: leadId, created_at: { gte: since } },
      select: { type: true, data: true },
    });

    let score = 0;
    for (const ev of events) {
      const base = BASE_SCORES[ev.type];
      if (base !== undefined) {
        score += base;
        continue;
      }
      if (ev.type === 'status_changed') {
        const to = (ev.data as any)?.to as string | undefined;
        score += STATUS_SCORES[to ?? ''] ?? 3;
      }
    }
    score = Math.max(0, Math.min(100, score));

    await this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { qualification_score: score },
    });
  }
}
