import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  CreateLeadDto,
  UpdateLeadDto,
  FilterLeadDto,
  AssignLeadDto,
  UpdateStatusDto,
  ConvertLeadDto,
  BulkImportDto,
  StatsFilterDto,
} from "../dto";
import {
  LeadActivityService,
  LeadActivityType,
  ActorType,
} from "./lead-activity.service";
import { createPaginationMeta } from "../../../../common/dto/pagination.dto";

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: LeadActivityService
  ) {}

  /**
   * Create a new lead
   */
  async create(
    createLeadDto: CreateLeadDto,
    tenantId: string = "45427fad-d86a-472a-82a3-0eabcdc648db",
    userId: string = "57e16592-dbe4-4c47-8c65-7dafd9d95ea8"
  ) {
    try {
      // Extract business_id before spreading (it will be used in relation)
      const { business_id, ...leadData } = createLeadDto;

      // Create the lead with proper relations
      const lead = await this.prisma.leads.create({
        data: {
          ...leadData,
          created_by: userId,
          updated_by: userId,
          lead_score: 0,
          followup_count: 0,
          // Connect to existing business and tenant (this sets the foreign keys)
          businesses: {
            connect: {
              business_id: business_id,
            },
          },
          tenants: {
            connect: {
              tenant_id: tenantId,
            },
          },
        },
      });

      // Log activity
      await this.activityService.logActivity({
        lead_id: lead.lead_id,
        tenant_id: tenantId,
        business_id: lead.business_id,
        activity_type: LeadActivityType.LEAD_CREATED,
        description: `Lead created from ${createLeadDto.source}`,
        actor_type: ActorType.SYSTEM,
        actor_id: userId,
        metadata: { source: createLeadDto.source },
      });

      // Check for duplicates asynchronously (don't block response)
      this.checkDuplicatesAsync(lead.lead_id, tenantId);

      return lead;
    } catch (error) {
      this.logger.error("Failed to create lead:", error);
      throw new BadRequestException("Failed to create lead");
    }
  }

  /**
   * Find all leads with filtering and pagination
   */
  async findAll(filterDto: FilterLeadDto, tenantId: string) {
    const {
      page,
      limit,
      sort_by,
      sort_order,
      status,
      source,
      assigned_agent_id,
      lead_quality,
      search,
      date_from,
      date_to,
      score_min,
      score_max,
      is_converted,
      include_inactive,
    } = filterDto;

    // Build where clause
    const where: any = {
      tenant_id: tenantId,
    };

    if (!include_inactive) {
      where.deleted_at = null;
      where.is_active = true;
    }

    if (status) where.status = status;
    if (source) where.source = source;
    if (assigned_agent_id) where.assigned_agent_id = assigned_agent_id;
    if (lead_quality) where.lead_quality = lead_quality;
    if (is_converted !== undefined) where.is_converted = is_converted;

    // Date range filter
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    // Score range filter
    if (score_min !== undefined || score_max !== undefined) {
      where.lead_score = {};
      if (score_min !== undefined) where.lead_score.gte = score_min;
      if (score_max !== undefined) where.lead_score.lte = score_max;
    }

    // Full-text search
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    // Execute query with pagination
    const [leads, total] = await Promise.all([
      this.prisma.leads.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          [sort_by]: sort_order,
        },
        include: {
          assigned_agent: {
            select: {
              user_id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.leads.count({ where }),
    ]);

    return {
      data: leads,
      pagination: createPaginationMeta(page, limit, total),
    };
  }

  /**
   * Find one lead by ID
   */
  async findOne(id: string, tenantId: string) {
    const lead = await this.prisma.leads.findFirst({
      where: {
        lead_id: id,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        assigned_agent: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
        lead_activities: {
          take: 10,
          orderBy: {
            activity_timestamp: "desc",
          },
        },
        lead_notes: {
          where: {
            is_pinned: true,
          },
          take: 5,
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  /**
   * Update a lead
   */
  async update(
    id: string,
    updateLeadDto: UpdateLeadDto,
    tenantId: string,
    userId: string
  ) {
    // Check if lead exists
    await this.findOne(id, tenantId);

    const lead = await this.prisma.leads.update({
      where: { lead_id: id },
      data: {
        ...updateLeadDto,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    // Log activity
    await this.activityService.logActivity({
      lead_id: id,
      tenant_id: tenantId,
      business_id: lead.business_id,
      activity_type: LeadActivityType.LEAD_UPDATED,
      description: "Lead information updated",
      actor_type: ActorType.AGENT,
      actor_id: userId,
      metadata: { updated_fields: Object.keys(updateLeadDto) },
    });

    return lead;
  }

  /**
   * Soft delete a lead
   */
  async remove(id: string, tenantId: string, userId: string) {
    // Check if lead exists
    const lead = await this.findOne(id, tenantId);

    await this.prisma.leads.update({
      where: { lead_id: id },
      data: {
        deleted_at: new Date(),
        deleted_by: userId,
        is_active: false,
      },
    });

    // Log activity
    await this.activityService.logActivity({
      lead_id: id,
      tenant_id: tenantId,
      business_id: lead.business_id,
      activity_type: "lead_deleted",
      description: "Lead was deleted",
      actor_type: ActorType.AGENT,
      actor_id: userId,
    });

    return { message: "Lead deleted successfully" };
  }

  /**
   * Assign lead to an agent
   */
  async assign(
    id: string,
    assignDto: AssignLeadDto,
    tenantId: string,
    userId: string
  ) {
    // Check if lead exists
    const lead = await this.findOne(id, tenantId);

    // Update lead
    const updatedLead = await this.prisma.leads.update({
      where: { lead_id: id },
      data: {
        assigned_agent_id: assignDto.agent_id,
        assigned_at: new Date(),
        assigned_by: userId,
      },
      include: {
        assigned_agent: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await this.activityService.logActivity({
      lead_id: id,
      tenant_id: tenantId,
      business_id: lead.business_id,
      activity_type: LeadActivityType.LEAD_ASSIGNED,
      description: `Lead assigned to ${updatedLead.assigned_agent?.name || assignDto.agent_id}`,
      actor_type: ActorType.AGENT,
      actor_id: userId,
      metadata: {
        agent_id: assignDto.agent_id,
        reason: assignDto.reason,
      },
    });

    return updatedLead;
  }

  /**
   * Update lead status
   */
  async updateStatus(
    id: string,
    statusDto: UpdateStatusDto,
    tenantId: string,
    userId: string
  ) {
    // Check if lead exists
    const lead = await this.findOne(id, tenantId);

    const oldStatus = lead.status;

    // Update lead
    const updatedLead = await this.prisma.leads.update({
      where: { lead_id: id },
      data: {
        status: statusDto.status,
        ...(statusDto.status === "lost" && {
          lost_at: new Date(),
          lost_reason: statusDto.reason,
        }),
        ...(statusDto.status === "invalid" && {
          invalid_reason: statusDto.reason,
        }),
      },
    });

    // Log activity
    await this.activityService.logActivity({
      lead_id: id,
      tenant_id: tenantId,
      business_id: lead.business_id,
      activity_type: LeadActivityType.STATUS_CHANGED,
      description: `Status changed from ${oldStatus} to ${statusDto.status}`,
      actor_type: ActorType.AGENT,
      actor_id: userId,
      metadata: {
        old_status: oldStatus,
        new_status: statusDto.status,
        reason: statusDto.reason,
      },
    });

    // Create status history record
    await this.prisma.lead_status_history.create({
      data: {
        lead_id: id,
        business_id: lead.business_id,
        tenant_id: tenantId,
        from_status: oldStatus,
        to_status: statusDto.status,
        changed_by: userId,
        changed_by_type: "agent",
        reason: statusDto.reason,
        changed_at: new Date(),
      },
    });

    return updatedLead;
  }

  /**
   * Convert lead
   */
  async convert(
    id: string,
    convertDto: ConvertLeadDto,
    tenantId: string,
    userId: string
  ) {
    // Check if lead exists
    const lead = await this.findOne(id, tenantId);

    // Update lead
    const updatedLead = await this.prisma.leads.update({
      where: { lead_id: id },
      data: {
        is_converted: true,
        converted_at: new Date(),
        conversion_value: convertDto.conversion_value,
        status: "won",
      },
    });

    // Log activity
    await this.activityService.logActivity({
      lead_id: id,
      tenant_id: tenantId,
      business_id: lead.business_id,
      activity_type: LeadActivityType.CONVERTED,
      description: `Lead converted with value ${convertDto.conversion_value}`,
      actor_type: ActorType.AGENT,
      actor_id: userId,
      metadata: {
        conversion_value: convertDto.conversion_value,
        notes: convertDto.conversion_notes,
      },
    });

    return updatedLead;
  }

  /**
   * Get lead activity timeline
   */
  async getTimeline(id: string, tenantId: string) {
    // Check if lead exists
    await this.findOne(id, tenantId);

    return this.activityService.getLeadTimeline(id, tenantId);
  }

  /**
   * Get lead statistics
   */
  async getStats(filterDto: StatsFilterDto, tenantId: string) {
    const { date_from, date_to, assigned_agent_id } = filterDto;

    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (assigned_agent_id) {
      where.assigned_agent_id = assigned_agent_id;
    }

    // Get various stats
    const [total, byStatus, bySource, byQuality, converted, avgScore] =
      await Promise.all([
        this.prisma.leads.count({ where }),
        this.prisma.leads.groupBy({
          by: ["status"],
          where,
          _count: { lead_id: true },
        }),
        this.prisma.leads.groupBy({
          by: ["source"],
          where,
          _count: { lead_id: true },
        }),
        this.prisma.leads.groupBy({
          by: ["lead_quality"],
          where,
          _count: { lead_id: true },
        }),
        this.prisma.leads.count({ where: { ...where, is_converted: true } }),
        this.prisma.leads.aggregate({
          where,
          _avg: { lead_score: true },
        }),
      ]);

    return {
      total_leads: total,
      converted_leads: converted,
      conversion_rate: total > 0 ? ((converted / total) * 100).toFixed(2) : 0,
      avg_lead_score: avgScore._avg.lead_score || 0,
      by_status: byStatus.map((s) => ({
        status: s.status,
        count: s._count.lead_id,
      })),
      by_source: bySource.map((s) => ({
        source: s.source,
        count: s._count.lead_id,
      })),
      by_quality: byQuality.map((q) => ({
        quality: q.lead_quality,
        count: q._count.lead_id,
      })),
    };
  }

  /**
   * Bulk import leads
   */
  async bulkImport(
    bulkImportDto: BulkImportDto,
    tenantId: string,
    userId: string
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const leadDto of bulkImportDto.leads) {
      try {
        await this.create(leadDto, tenantId, userId);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          lead: leadDto,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Check for duplicate leads (async)
   */
  private async checkDuplicatesAsync(leadId: string, tenantId: string) {
    try {
      const lead = await this.prisma.leads.findUnique({
        where: { lead_id: leadId },
      });

      if (!lead) return;

      // Find potential duplicates based on phone or email
      const duplicates = await this.prisma.leads.findMany({
        where: {
          tenant_id: tenantId,
          lead_id: { not: leadId },
          deleted_at: null,
          OR: [
            ...(lead.phone ? [{ phone: lead.phone }] : []),
            ...(lead.email ? [{ email: lead.email }] : []),
          ],
        },
        take: 5,
      });

      // Create duplicate records
      for (const duplicate of duplicates) {
        await this.prisma.lead_duplicates.create({
          data: {
            business_id: lead.business_id,
            tenant_id: tenantId,
            lead_id_1: leadId,
            lead_id_2: duplicate.lead_id,
            match_type: lead.phone === duplicate.phone ? "phone" : "email",
            similarity_score: 90,
            detected_at: new Date(),
          },
        });
      }
    } catch (error) {
      this.logger.error("Error checking duplicates:", error);
    }
  }
}
