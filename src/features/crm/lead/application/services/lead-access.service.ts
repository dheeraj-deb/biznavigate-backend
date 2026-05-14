import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';

/**
 * Centralised tenant ownership check for the lead module.
 *
 * Every lead-mutating endpoint must call requireLead(id, businessId) before
 * acting. Skipping the call = IDOR vulnerability — see audit C1.
 *
 * Returns the lead so callers can avoid a second fetch.
 */
@Injectable()
export class LeadAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async requireLead(leadId: string, businessId: string) {
    const lead = await this.prisma.leads.findUnique({ where: { lead_id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.business_id !== businessId) {
      // Same response as not-found so we don't leak existence to other tenants.
      throw new NotFoundException('Lead not found');
    }
    if (lead.deleted_at) throw new NotFoundException('Lead not found');
    return lead;
  }

  async requireFollowup(followupId: string, businessId: string) {
    const followup = await this.prisma.lead_followups.findUnique({
      where: { followup_id: followupId },
    });
    if (!followup) throw new NotFoundException('Followup not found');
    if (followup.business_id !== businessId) {
      throw new NotFoundException('Followup not found');
    }
    return followup;
  }

  async assertAssigneeInBusiness(userId: string, businessId: string) {
    const user = await this.prisma.users.findFirst({
      where: { user_id: userId, business_id: businessId },
      select: { user_id: true },
    });
    if (!user) {
      throw new ForbiddenException('Cannot assign to a user outside this business');
    }
  }
}
