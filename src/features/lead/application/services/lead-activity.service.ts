import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

/**
 * Lead Activity Type
 */
export enum LeadActivityType {
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  STATUS_CHANGED = 'status_changed',
  LEAD_ASSIGNED = 'lead_assigned',
  NOTE_ADDED = 'note_added',
  TAG_ADDED = 'tag_added',
  TAG_REMOVED = 'tag_removed',
  FOLLOWUP_SCHEDULED = 'followup_scheduled',
  FOLLOWUP_COMPLETED = 'followup_completed',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  EMAIL_SENT = 'email_sent',
  CALL_MADE = 'call_made',
  CONVERTED = 'converted',
  LOST = 'lost',
}

/**
 * Actor Type
 */
export enum ActorType {
  CUSTOMER = 'customer',
  AI = 'ai',
  AGENT = 'agent',
  SYSTEM = 'system',
}

/**
 * Lead Activity Service
 * Handles automatic activity logging for leads
 */
@Injectable()
export class LeadActivityService {
  private readonly logger = new Logger(LeadActivityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an activity for a lead
   */
  async logActivity(data: {
    lead_id: string;
    tenant_id: string;
    business_id: string;
    activity_type: string;
    description: string;
    actor_type: ActorType | string;
    actor_id?: string;
    actor_name?: string;
    channel?: string;
    message_content?: string;
    metadata?: any;
  }) {
    try {
      return await this.prisma.lead_activities.create({
        data: {
          ...data,
          activity_timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to log activity for lead ${data.lead_id}:`,
        error,
      );
      // Don't throw error - activity logging failure shouldn't break main flow
      return null;
    }
  }

  /**
   * Get activity timeline for a lead
   */
  async getLeadTimeline(leadId: string, tenantId: string) {
    return this.prisma.lead_activities.findMany({
      where: {
        lead_id: leadId,
        tenant_id: tenantId,
      },
      orderBy: {
        activity_timestamp: 'desc',
      },
      take: 100, // Limit to recent 100 activities
    });
  }

  /**
   * Get activities for multiple leads
   */
  async getActivitiesForLeads(leadIds: string[], tenantId: string) {
    return this.prisma.lead_activities.findMany({
      where: {
        lead_id: {
          in: leadIds,
        },
        tenant_id: tenantId,
      },
      orderBy: {
        activity_timestamp: 'desc',
      },
    });
  }

  /**
   * Get recent activities for a business
   */
  async getRecentActivities(
    businessId: string,
    tenantId: string,
    limit: number = 50,
  ) {
    return this.prisma.lead_activities.findMany({
      where: {
        business_id: businessId,
        tenant_id: tenantId,
      },
      orderBy: {
        activity_timestamp: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get activity count by type
   */
  async getActivityStats(businessId: string, tenantId: string) {
    const activities = await this.prisma.lead_activities.groupBy({
      by: ['activity_type'],
      where: {
        business_id: businessId,
        tenant_id: tenantId,
      },
      _count: {
        activity_id: true,
      },
    });

    return activities.map((item) => ({
      activity_type: item.activity_type,
      count: item._count.activity_id,
    }));
  }
}
