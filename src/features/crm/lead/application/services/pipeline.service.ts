import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';

/**
 * Stage templates per industry. Slug values mirror the lead status allowlist
 * (LEAD_STATUSES) so that the legacy `leads.status` column stays in sync.
 * Any new slug here must also be added to LEAD_STATUSES.
 */
const PIPELINE_TEMPLATES = {
  hospitality: {
    name: 'Bookings',
    stages: [
      { slug: 'new',       name: 'New',        position: 1, color: '#94a3b8' },
      { slug: 'contacted', name: 'Contacted',  position: 2, color: '#60a5fa' },
      { slug: 'qualified', name: 'Qualified',  position: 3, color: '#a78bfa' },
      { slug: 'quoted',    name: 'Quoted',     position: 4, color: '#f59e0b' },
      { slug: 'booked',    name: 'Booked',     position: 5, color: '#10b981' },
      { slug: 'won',       name: 'Checked-In', position: 6, color: '#059669', is_won: true },
      { slug: 'lost',      name: 'Lost',       position: 7, color: '#ef4444', is_lost: true },
    ],
  },
  commerce: {
    name: 'Sales',
    stages: [
      { slug: 'new',       name: 'New',       position: 1, color: '#94a3b8' },
      { slug: 'contacted', name: 'Contacted', position: 2, color: '#60a5fa' },
      { slug: 'qualified', name: 'Qualified', position: 3, color: '#a78bfa' },
      { slug: 'quoted',    name: 'Quoted',    position: 4, color: '#f59e0b' },
      { slug: 'booked',    name: 'Ordered',   position: 5, color: '#10b981' },
      { slug: 'won',       name: 'Delivered', position: 6, color: '#059669', is_won: true },
      { slug: 'lost',      name: 'Lost',      position: 7, color: '#ef4444', is_lost: true },
    ],
  },
  generic: {
    name: 'Pipeline',
    stages: [
      { slug: 'new',       name: 'New',       position: 1, color: '#94a3b8' },
      { slug: 'contacted', name: 'Contacted', position: 2, color: '#60a5fa' },
      { slug: 'qualified', name: 'Qualified', position: 3, color: '#a78bfa' },
      { slug: 'quoted',    name: 'Proposal',  position: 4, color: '#f59e0b' },
      { slug: 'won',       name: 'Won',       position: 5, color: '#059669', is_won: true },
      { slug: 'lost',      name: 'Lost',      position: 6, color: '#ef4444', is_lost: true },
    ],
  },
  // Real estate: slugs reuse the canonical set (qualified, quoted, booked, won, lost)
  // so autoAdvance + reporting work unchanged. Stage *names* are industry-specific.
  real_estate: {
    name: 'Property Sales',
    stages: [
      { slug: 'new',       name: 'New Lead',   position: 1, color: '#94a3b8' },
      { slug: 'contacted', name: 'Contacted',  position: 2, color: '#60a5fa' },
      { slug: 'qualified', name: 'Qualified',  position: 3, color: '#a78bfa' },
      { slug: 'quoted',    name: 'Site Visit', position: 4, color: '#f59e0b' },
      { slug: 'booked',    name: 'Visited',    position: 5, color: '#10b981' },
      { slug: 'won',       name: 'Closed',     position: 6, color: '#059669', is_won: true },
      { slug: 'lost',      name: 'Lost',       position: 7, color: '#ef4444', is_lost: true },
    ],
  },
  service: {
    name: 'Service Sales',
    stages: [
      { slug: 'new',       name: 'New',           position: 1, color: '#94a3b8' },
      { slug: 'contacted', name: 'Contacted',     position: 2, color: '#60a5fa' },
      { slug: 'qualified', name: 'Scope Defined', position: 3, color: '#a78bfa' },
      { slug: 'quoted',    name: 'Quoted',        position: 4, color: '#f59e0b' },
      { slug: 'won',       name: 'Won',           position: 5, color: '#059669', is_won: true },
      { slug: 'lost',      name: 'Lost',          position: 6, color: '#ef4444', is_lost: true },
    ],
  },
} as const;

type IndustryKey = keyof typeof PIPELINE_TEMPLATES;

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Pick the template that best fits a business_type string.
   *  Order matters: more-specific keywords are checked first to avoid
   *  near-collisions (e.g. "realty" before any "re*" patterns). */
  private pickIndustry(businessType?: string | null): IndustryKey {
    const t = (businessType ?? '').toLowerCase();

    // Real estate first (matches "realty" before "retail"-style fallbacks).
    if (t.includes('real estate') || t.includes('realestate') || t.includes('realty') ||
        t.includes('property') || t.includes('broker')) return 'real_estate';

    if (t.includes('hotel') || t.includes('resort') || t.includes('camp') ||
        t.includes('hospitality')) return 'hospitality';

    if (t.includes('product') || t.includes('commerce') || t.includes('retail') ||
        t.includes('ecom')) return 'commerce';

    if (t.includes('service') || t.includes('consulting') || t.includes('agency') ||
        t.includes('freelance')) return 'service';

    return 'generic';
  }

  /**
   * Ensure a business has at least one pipeline. Idempotent — safe to call
   * on every login. Returns the default pipeline.
   */
  async ensureDefaultPipeline(businessId: string) {
    const existing = await this.prisma.pipelines.findFirst({
      where: { business_id: businessId, is_archived: false },
    });
    if (existing) return existing;

    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: { business_type: true },
    });
    const industry = this.pickIndustry(business?.business_type);
    const template = PIPELINE_TEMPLATES[industry];

    const pipeline = await this.prisma.pipelines.create({
      data: {
        business_id: businessId,
        name: template.name,
        industry,
        is_default: true,
        stages: {
          create: template.stages.map((s) => ({
            business_id: businessId,
            name: s.name,
            slug: s.slug,
            position: s.position,
            color: s.color,
            is_won: (s as any).is_won ?? false,
            is_lost: (s as any).is_lost ?? false,
          })),
        },
      },
    });
    this.logger.log(`Seeded ${industry} pipeline for business ${businessId}`);
    return pipeline;
  }

  /**
   * Kanban board view: stages in order, with lead count + the first N leads
   * per stage. One query for counts, one for leads, assembled in memory —
   * O(stages) round-trips would be worse.
   *
   * `perStage` caps how many lead cards we hydrate per column for the
   * initial render. Frontend paginates per-column separately.
   */
  async getBoard(pipelineId: string, businessId: string, perStage = 20) {
    const pipeline = await this.getPipeline(pipelineId, businessId);
    const stageIds = pipeline.stages.map((s) => s.stage_id);
    if (stageIds.length === 0) return { ...pipeline, columns: [] };

    const safePerStage = Math.min(100, Math.max(1, Number(perStage) || 20));

    const counts = await this.prisma.leads.groupBy({
      by: ['stage_id'],
      where: { business_id: businessId, deleted_at: null, stage_id: { in: stageIds } },
      _count: { _all: true },
    });
    const countByStage = new Map(counts.map((c) => [c.stage_id, c._count._all]));

    // One windowed query for per-stage card preview using a CTE with ROW_NUMBER.
    // Avoids fanning out to N queries (one per column).
    const cards = await this.prisma.$queryRaw<Array<any>>`
      SELECT lead_id, stage_id, name, phone, email, status, quoted_amount,
             assigned_to, followup_at, updated_at, context, tags
      FROM (
        SELECT l.*,
               ROW_NUMBER() OVER (PARTITION BY l.stage_id ORDER BY l.updated_at DESC) AS rn
        FROM leads l
        WHERE l.business_id = ${businessId}::uuid
          AND l.deleted_at IS NULL
          AND l.stage_id IS NOT NULL
          AND l.stage_id = ANY(${stageIds}::uuid[])
      ) ranked
      WHERE rn <= ${safePerStage}
      ORDER BY stage_id, rn
    `;

    const cardsByStage = new Map<string, any[]>();
    for (const c of cards) {
      const arr = cardsByStage.get(c.stage_id) ?? [];
      arr.push({
        lead_id: c.lead_id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        status: c.status,
        quoted_amount: c.quoted_amount ? Number(c.quoted_amount) : null,
        assigned_to: c.assigned_to,
        followup_at: c.followup_at,
        updated_at: c.updated_at,
        tags: c.tags ?? [],
        intent_type: (c.context as any)?.type ?? null,
      });
      cardsByStage.set(c.stage_id, arr);
    }

    return {
      pipeline_id: pipeline.pipeline_id,
      name: pipeline.name,
      is_default: pipeline.is_default,
      columns: pipeline.stages.map((s) => ({
        stage_id: s.stage_id,
        name: s.name,
        slug: s.slug,
        position: s.position,
        color: s.color,
        is_won: s.is_won,
        is_lost: s.is_lost,
        count: countByStage.get(s.stage_id) ?? 0,
        leads: cardsByStage.get(s.stage_id) ?? [],
      })),
    };
  }

  async listPipelines(businessId: string) {
    return this.prisma.pipelines.findMany({
      where: { business_id: businessId, is_archived: false },
      orderBy: [{ is_default: 'desc' }, { created_at: 'asc' }],
      include: {
        stages: { orderBy: { position: 'asc' } },
      },
    });
  }

  async getPipeline(pipelineId: string, businessId: string) {
    const pipeline = await this.prisma.pipelines.findUnique({
      where: { pipeline_id: pipelineId },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
    if (!pipeline || pipeline.business_id !== businessId) {
      throw new NotFoundException('Pipeline not found');
    }
    return pipeline;
  }

  async createPipeline(params: {
    businessId: string;
    name: string;
    industry?: IndustryKey;
    fromTemplate?: IndustryKey;
  }) {
    const template = params.fromTemplate
      ? PIPELINE_TEMPLATES[params.fromTemplate]
      : null;

    return this.prisma.pipelines.create({
      data: {
        business_id: params.businessId,
        name: params.name,
        industry: params.industry ?? params.fromTemplate ?? null,
        is_default: false,
        stages: template
          ? {
              create: template.stages.map((s) => ({
                business_id: params.businessId,
                name: s.name,
                slug: s.slug,
                position: s.position,
                color: s.color,
                is_won: (s as any).is_won ?? false,
                is_lost: (s as any).is_lost ?? false,
              })),
            }
          : undefined,
      },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
  }

  async renamePipeline(pipelineId: string, businessId: string, name: string) {
    await this.getPipeline(pipelineId, businessId);
    return this.prisma.pipelines.update({
      where: { pipeline_id: pipelineId },
      data: { name, updated_at: new Date() },
    });
  }

  async archivePipeline(pipelineId: string, businessId: string) {
    const pipeline = await this.getPipeline(pipelineId, businessId);
    if (pipeline.is_default) {
      throw new BadRequestException('Cannot archive the default pipeline');
    }
    return this.prisma.pipelines.update({
      where: { pipeline_id: pipelineId },
      data: { is_archived: true, updated_at: new Date() },
    });
  }

  async setDefault(pipelineId: string, businessId: string) {
    await this.getPipeline(pipelineId, businessId);
    // Atomically unset all other defaults, set this one.
    await this.prisma.$transaction([
      this.prisma.pipelines.updateMany({
        where: { business_id: businessId, NOT: { pipeline_id: pipelineId } },
        data: { is_default: false },
      }),
      this.prisma.pipelines.update({
        where: { pipeline_id: pipelineId },
        data: { is_default: true },
      }),
    ]);
    return this.getPipeline(pipelineId, businessId);
  }

  // ── Stages ────────────────────────────────────────────────────────────────

  async addStage(params: {
    pipelineId: string;
    businessId: string;
    name: string;
    slug: string;
    position?: number;
    color?: string;
    isWon?: boolean;
    isLost?: boolean;
  }) {
    await this.getPipeline(params.pipelineId, params.businessId);

    const existingCount = await this.prisma.pipeline_stages.count({
      where: { pipeline_id: params.pipelineId },
    });

    try {
      return await this.prisma.pipeline_stages.create({
        data: {
          pipeline_id: params.pipelineId,
          business_id: params.businessId,
          name: params.name,
          slug: params.slug,
          position: params.position ?? existingCount + 1,
          color: params.color,
          is_won: params.isWon ?? false,
          is_lost: params.isLost ?? false,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('A stage with this slug or position already exists in this pipeline');
      }
      throw e;
    }
  }

  async updateStage(stageId: string, businessId: string, patch: { name?: string; color?: string; isWon?: boolean; isLost?: boolean }) {
    const stage = await this.prisma.pipeline_stages.findUnique({ where: { stage_id: stageId } });
    if (!stage || stage.business_id !== businessId) throw new NotFoundException('Stage not found');
    return this.prisma.pipeline_stages.update({
      where: { stage_id: stageId },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.color !== undefined ? { color: patch.color } : {}),
        ...(patch.isWon !== undefined ? { is_won: patch.isWon } : {}),
        ...(patch.isLost !== undefined ? { is_lost: patch.isLost } : {}),
      },
    });
  }

  /**
   * Reorder stages. `stageOrder` is the full ordered list of stage_ids.
   * Uses a two-phase update (negative offsets then real positions) to dodge
   * the (pipeline_id, position) unique constraint mid-transaction.
   */
  async reorderStages(pipelineId: string, businessId: string, stageOrder: string[]) {
    await this.getPipeline(pipelineId, businessId);
    const existing = await this.prisma.pipeline_stages.findMany({
      where: { pipeline_id: pipelineId },
      select: { stage_id: true },
    });
    const existingIds = new Set(existing.map((s) => s.stage_id));
    if (stageOrder.length !== existing.length || !stageOrder.every((id) => existingIds.has(id))) {
      throw new BadRequestException('stageOrder must include every stage in the pipeline exactly once');
    }

    await this.prisma.$transaction([
      ...stageOrder.map((id, i) =>
        this.prisma.pipeline_stages.update({
          where: { stage_id: id },
          data: { position: -(i + 1) },
        }),
      ),
      ...stageOrder.map((id, i) =>
        this.prisma.pipeline_stages.update({
          where: { stage_id: id },
          data: { position: i + 1 },
        }),
      ),
    ]);

    return this.getPipeline(pipelineId, businessId);
  }

  async deleteStage(stageId: string, businessId: string) {
    const stage = await this.prisma.pipeline_stages.findUnique({ where: { stage_id: stageId } });
    if (!stage || stage.business_id !== businessId) throw new NotFoundException('Stage not found');

    const leadsInStage = await this.prisma.leads.count({ where: { stage_id: stageId } });
    if (leadsInStage > 0) {
      throw new ConflictException(`Cannot delete stage — ${leadsInStage} lead(s) currently in it. Move them first.`);
    }
    return this.prisma.pipeline_stages.delete({ where: { stage_id: stageId } });
  }
}
