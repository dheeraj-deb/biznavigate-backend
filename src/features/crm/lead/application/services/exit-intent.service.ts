import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { WhatsAppService } from '../../../../engagement/whatsapp/application/whatsapp.service';

export type BusinessGroup = 'A' | 'B_hospitality' | 'B_tours' | 'C' | 'D_education';

/**
 * Map a business_type string to the correct exit-intent group.
 * Uses substring matching — same strategy as pipeline.service.ts pickIndustry().
 * Call this before sendExitIntent() so the caller never hardcodes the group.
 */
export function resolveBusinessGroup(businessType: string | null | undefined): BusinessGroup {
  const t = (businessType ?? '').toLowerCase();

  // Check experience/stay keywords FIRST so "luxury hotel" → B_hospitality, not A.
  // Group B_hospitality — hotels, resorts, stays.
  // "camping resort" / "adventure resort" are excluded (they're tours-focused)
  // by requiring that camp/trek/adventure is NOT also present alongside resort.
  const isStayFocused =
    t.includes('hotel') || t.includes('homestay') || t.includes('hospitality') ||
    t.includes('cottage') || t.includes('villa') ||
    (t.includes('resort') && !t.includes('camp') && !t.includes('trek') && !t.includes('adventure'));
  if (isStayFocused) return 'B_hospitality';

  // Group B_tours — camping, treks, activities, events (before generic luxury check)
  if (
    t.includes('tour') || t.includes('trek') || t.includes('camp') ||
    t.includes('adventure') || t.includes('activity') || t.includes('bonfire') ||
    t.includes('yoga') || t.includes('retreat') || t.includes('event') ||
    t.includes('venue') || t.includes('wedding')
  ) return 'B_tours';

  // Group A — high-value single purchase (automotive, real estate, luxury goods)
  if (
    t.includes('automotive') || t.includes('used car') || t.includes('used_car') ||
    t.includes('new car') || t.includes('vehicle') || t.includes('dealer') ||
    t.includes('real estate') || t.includes('realestate') || t.includes('property') ||
    t.includes('realty') || t.includes('jewellery') || t.includes('jewelry') ||
    t.includes('solar') || t.includes('luxury')
  ) return 'A';

  // Group D_education — courses, coaching, training
  if (
    t.includes('education') || t.includes('coaching') || t.includes('training') ||
    t.includes('course') || t.includes('school') || t.includes('institute') ||
    t.includes('workshop') || t.includes('tutor')
  ) return 'D_education';

  // Group C — products and services (default)
  return 'C';
}

/** Button IDs used in exit intent messages. */
export const EXIT_BUTTON = {
  PRICE_TOO_HIGH: 'exit_price_too_high',
  NEED_MORE_TIME: 'exit_need_more_time',
  NOT_INTERESTED: 'exit_not_interested',
  STILL_PLANNING: 'exit_still_planning',
  CHANGED_DATES: 'exit_changed_dates',
  NOT_ANYMORE: 'exit_not_anymore',
  BOOK_NOW: 'exit_book_now',
  NOT_YET: 'exit_not_yet',
  YES_NOTIFY: 'exit_alert_yes',
  NO_THANKS: 'exit_alert_no',
  YES_ORDER: 'exit_order_yes',
  YES_ENROLL: 'exit_enroll_yes',
  DIFF_TIMING: 'exit_diff_timing',
} as const;

@Injectable()
export class ExitIntentService {
  private readonly logger = new Logger(ExitIntentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsAppService,
  ) {}

  /** Send the group-appropriate exit intent button message to a lead. */
  async sendExitIntent(leadId: string, businessId: string, group: BusinessGroup) {
    const lead = await this.prisma.leads.findUnique({
      where: { lead_id: leadId },
      select: { phone: true, context: true, exit_intent_sent_at: true },
    });
    if (!lead?.phone) return;

    // Don't re-send within 7 days
    if (lead.exit_intent_sent_at) {
      const daysSince = (Date.now() - lead.exit_intent_sent_at.getTime()) / 86400000;
      if (daysSince < 7) return;
    }

    const account = await this.resolveAccount(businessId);
    if (!account) return;

    const ctx: any = lead.context ?? {};
    const name = await this.getLeadName(leadId);

    let body: string;
    let buttons: { id: string; title: string }[];

    switch (group) {
      case 'A':
        body = `Hi ${name}! Still interested in the ${ctx.make ?? ''} ${ctx.model ?? 'item'}?`;
        buttons = [
          { id: EXIT_BUTTON.PRICE_TOO_HIGH, title: 'Price is too high' },
          { id: EXIT_BUTTON.NEED_MORE_TIME, title: 'Need more time' },
          { id: EXIT_BUTTON.NOT_INTERESTED, title: 'Not interested' },
        ];
        break;

      case 'B_hospitality':
        body = `Hi ${name}! Is ${ctx.check_in ?? 'your date'} still your plan?`;
        buttons = [
          { id: EXIT_BUTTON.STILL_PLANNING, title: 'Yes, still planning' },
          { id: EXIT_BUTTON.CHANGED_DATES, title: 'Changed my dates' },
          { id: EXIT_BUTTON.NOT_ANYMORE, title: 'Not anymore' },
        ];
        break;

      case 'B_tours':
        body = `Hi ${name}! Still interested in the ${ctx.activity ?? 'activity'}?`;
        buttons = [
          { id: EXIT_BUTTON.BOOK_NOW, title: 'Yes, book it!' },
          { id: EXIT_BUTTON.CHANGED_DATES, title: 'Different dates' },
          { id: EXIT_BUTTON.NOT_ANYMORE, title: 'Not anymore' },
        ];
        break;

      case 'C':
        body = `Hey! Still want the item you were looking at?`;
        buttons = [
          { id: EXIT_BUTTON.YES_ORDER, title: 'Yes, order it!' },
          { id: EXIT_BUTTON.NO_THANKS, title: 'No thanks' },
        ];
        break;

      case 'D_education':
        body = `Hi ${name}! Still interested in ${ctx.course_name ?? 'the course'}?`;
        buttons = [
          { id: EXIT_BUTTON.YES_ENROLL, title: 'Yes, want to enroll' },
          { id: EXIT_BUTTON.DIFF_TIMING, title: 'Different timing' },
          { id: EXIT_BUTTON.NOT_ANYMORE, title: 'Not now' },
        ];
        break;
    }

    await this.whatsapp.sendButtonMessage(account.page_id!, lead.phone, body, buttons);

    await this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { exit_intent_sent_at: new Date() },
    });

    await this.prisma.lead_events.create({
      data: {
        lead_id: leadId,
        business_id: businessId,
        type: 'exit_intent_sent',
        actor: 'system',
        data: { group },
      },
    });
  }

  /** Process a button reply from a lead.  buttonId should be one of EXIT_BUTTON.*  */
  async processExitReply(
    leadId: string,
    businessId: string,
    buttonId: string,
    group: BusinessGroup,
  ) {
    const lead = await this.prisma.leads.findUnique({
      where: { lead_id: leadId },
      select: { phone: true, context: true },
    });
    if (!lead?.phone) return;

    const account = await this.resolveAccount(businessId);
    const name = await this.getLeadName(leadId);
    const ctx: any = lead.context ?? {};

    await this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { exit_captured_at: new Date(), exit_reason: buttonId },
    });

    await this.prisma.lead_events.create({
      data: {
        lead_id: leadId,
        business_id: businessId,
        type: 'exit_intent_captured',
        actor: 'system',
        data: { button_id: buttonId },
      },
    });

    if (buttonId === EXIT_BUTTON.NOT_INTERESTED || buttonId === EXIT_BUTTON.NOT_ANYMORE) {
      if (group === 'A' && account) {
        // Group A: ask match-alert before marking lost
        const make = ctx.make ?? '';
        const model = ctx.model ?? '';
        if (make || model) {
          await this.whatsapp.sendButtonMessage(
            account.page_id!,
            lead.phone,
            `No problem! Want us to notify you when a new ${make} ${model} arrives?`,
            [
              { id: EXIT_BUTTON.YES_NOTIFY, title: 'Yes, let me know' },
              { id: EXIT_BUTTON.NO_THANKS, title: 'No thanks' },
            ],
          );
          return; // don't mark lost yet — wait for next reply
        }
      }
      if (group === 'B_tours' && account) {
        await this.whatsapp.sendButtonMessage(
          account.page_id!,
          lead.phone,
          `No worries! Want updates on our upcoming ${ctx.activity ?? 'activities'}?`,
          [
            { id: EXIT_BUTTON.YES_NOTIFY, title: 'Yes, keep me posted' },
            { id: EXIT_BUTTON.NO_THANKS, title: 'No thanks' },
          ],
        );
        return;
      }
      if (group === 'D_education' && account) {
        await this.whatsapp.sendButtonMessage(
          account.page_id!,
          lead.phone,
          `No problem! Want us to notify you when a new batch starts?`,
          [
            { id: EXIT_BUTTON.YES_NOTIFY, title: 'Yes, notify me' },
            { id: EXIT_BUTTON.NO_THANKS, title: 'No thanks' },
          ],
        );
        return;
      }
      await this.markLost(leadId, businessId, buttonId);
      return;
    }

    if (buttonId === EXIT_BUTTON.PRICE_TOO_HIGH && account) {
      await this.whatsapp.sendButtonMessage(
        account.page_id!,
        lead.phone,
        `Got it! Want us to message you if the price drops?`,
        [
          { id: EXIT_BUTTON.YES_NOTIFY, title: 'Yes, notify me' },
          { id: EXIT_BUTTON.NO_THANKS, title: 'No thanks' },
        ],
      );
      return;
    }

    if (buttonId === EXIT_BUTTON.STILL_PLANNING && account) {
      await this.whatsapp.sendButtonMessage(
        account.page_id!,
        lead.phone,
        `Great! Ready to book now?`,
        [
          { id: EXIT_BUTTON.BOOK_NOW, title: 'Yes, book now!' },
          { id: EXIT_BUTTON.NOT_YET, title: 'Not yet' },
        ],
      );
      return;
    }

    if (buttonId === EXIT_BUTTON.NEED_MORE_TIME || buttonId === EXIT_BUTTON.NOT_YET) {
      await this.scheduleFollowUp(leadId, businessId);
      return;
    }
  }

  /** Process the alert-subscription confirmation tap (Yes/No notify me). */
  async processAlertConfirmation(
    leadId: string,
    businessId: string,
    buttonId: string,
    alertType: 'price_alert_subscriber' | 'match_alert_subscriber' | 'activity_update_subscriber' | 'batch_update_subscriber',
  ) {
    if (buttonId === EXIT_BUTTON.YES_NOTIFY) {
      await this.prisma.leads.update({
        where: { lead_id: leadId },
        data: { lead_type: alertType },
      });
      await this.prisma.lead_events.create({
        data: {
          lead_id: leadId,
          business_id: businessId,
          type: 'alert_subscription_confirmed',
          actor: 'system',
          data: { alert_type: alertType },
        },
      });
    } else {
      await this.markLost(leadId, businessId, 'declined_alert');
    }
  }

  private async markLost(leadId: string, businessId: string, reason: string) {
    await this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { lead_type: 'lost', status: 'lost' },
    });
    await this.prisma.lead_events.create({
      data: {
        lead_id: leadId,
        business_id: businessId,
        type: 'status_changed',
        actor: 'system',
        data: { from: 'active', to: 'lost', reason },
      },
    });
  }

  private async scheduleFollowUp(leadId: string, businessId: string) {
    const followupAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await this.prisma.leads.update({
      where: { lead_id: leadId },
      data: { lead_type: 'follow_up_scheduled', followup_at: followupAt },
    });
    await this.prisma.lead_events.create({
      data: {
        lead_id: leadId,
        business_id: businessId,
        type: 'followup_set',
        actor: 'system',
        data: { scheduled_at: followupAt.toISOString() },
      },
    });
  }

  private async resolveAccount(businessId: string) {
    // For WhatsApp, page_id holds the phone_number_id (Meta WABA phone number ID)
    return this.prisma.social_accounts.findFirst({
      where: { business_id: businessId, platform: 'whatsapp', is_active: true },
      select: { page_id: true },
    });
  }

  private async getLeadName(leadId: string): Promise<string> {
    const lead = await this.prisma.leads.findUnique({
      where: { lead_id: leadId },
      select: { name: true },
    });
    return lead?.name ?? 'there';
  }
}
