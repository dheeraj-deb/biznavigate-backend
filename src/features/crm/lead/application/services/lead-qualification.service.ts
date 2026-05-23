import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';

export type QualificationLevel = 'cold' | 'warm' | 'hot' | 'confirmed_interested' | 'negotiating' | 'lost';

// Scores for events that are actually emitted in the codebase.
const BASE_SCORES: Record<string, number> = {
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
    if (leadType === 'lost') return 'lost';
    if (leadType === 'negotiating') return 'negotiating';
    if (
      leadType === 'price_alert_subscriber' ||
      leadType === 'match_alert_subscriber' ||
      leadType === 'slot_alert_subscriber' ||
      leadType === 'activity_update_subscriber' ||
      leadType === 'batch_update_subscriber'
    ) return 'confirmed_interested';
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
    score = Math.min(100, score);

    await this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { qualification_score: score },
    });
  }
}
