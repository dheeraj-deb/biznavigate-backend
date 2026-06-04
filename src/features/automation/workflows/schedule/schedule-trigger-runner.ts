import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../../../../prisma/prisma.service';
import { WorkflowDefinition, WorkflowDefinitionDocument } from '../schema/workflow-definition.schema';
import { BusinessWorkflow, BusinessWorkflowDocument } from '../schema/business-workflow.schema';
import { buildSyntheticContext } from '../triggers/synthetic-context';
import { LeadAudienceFilter, ScheduleTriggerParams } from '../triggers/trigger-schemas';
import { WorkflowsService } from '../workflows.service';

const DEFAULT_MAX_LEADS = 500;
const FAN_OUT_CONCURRENCY = 4;

/**
 * Run a list of async task factories with a small concurrency window. Each
 * factory is called only when a slot opens up so we never have more than
 * `concurrency` promises in flight. Failures inside individual tasks are
 * handled by the tasks themselves; this helper never throws.
 */
async function runWithConcurrency(tasks: Array<() => Promise<void>>, concurrency: number): Promise<void> {
  if (!tasks.length) return;
  const queue = tasks.slice();
  const workers: Array<Promise<void>> = [];
  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push(
      (async () => {
        while (queue.length) {
          const next = queue.shift();
          if (!next) return;
          try {
            await next();
          } catch {
            // tasks own their own error handling; this catch is belt-and-suspenders
          }
        }
      })(),
    );
  }
  await Promise.all(workers);
}

/**
 * Consumed by the schedule processor when a BullMQ job fires. Resolves the
 * workflow's trigger params, expands the audience (per-lead OR business-only),
 * and asks WorkflowsService to run the workflow for each target.
 */
@Injectable()
export class ScheduleTriggerRunner {
  private readonly logger = new Logger(ScheduleTriggerRunner.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(WorkflowDefinition.name) private readonly workflowDefinitionModel: Model<WorkflowDefinitionDocument>,
    @InjectModel(BusinessWorkflow.name) private readonly businessWorkflowModel: Model<BusinessWorkflowDocument>,
    @Inject(forwardRef(() => WorkflowsService))
    private readonly workflowsService: WorkflowsService,
  ) {}

  async run(workflow_id: string, business_id: string): Promise<void> {
    const link = await this.businessWorkflowModel.findOne({ workflow_id, business_id }).lean();
    if (!link || !link.is_active) {
      this.logger.log(`Schedule fire skipped — workflow ${workflow_id} not active for business ${business_id}`);
      return;
    }

    const def = await this.workflowDefinitionModel.findOne({ workflow_id }).lean();
    const triggerNode = (def?.workflow_definition?.nodes ?? []).find(
      (n: any) => n?.type === 'trigger.schedule',
    );
    if (!triggerNode) {
      this.logger.warn(`Schedule fire skipped — no schedule trigger on workflow ${workflow_id}`);
      return;
    }

    const params = triggerNode.params as ScheduleTriggerParams;

    if (params.target === 'business_only') {
      await this.fireOnce(workflow_id, business_id, params);
    } else {
      await this.fanOutPerLead(workflow_id, business_id, params);
    }

    // One-time schedules deactivate themselves so they don't sit forever in the
    // active list. BullMQ's delayed-job runner already removes the queued job
    // after fire, but the workflow_definition.is_active flag is still true —
    // flip it explicitly here.
    if (params.schedule?.mode === 'one_time') {
      try {
        await this.workflowsService.deactivateWorkflow(workflow_id);
      } catch (err: any) {
        this.logger.warn(`Could not auto-deactivate one-time workflow ${workflow_id}: ${err.message}`);
      }
    }
  }

  private async fireOnce(workflow_id: string, business_id: string, _params: ScheduleTriggerParams): Promise<void> {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id },
      select: { tenant_id: true },
    });

    const synthetic = buildSyntheticContext({
      business_id,
      tenant_id: business?.tenant_id ?? null,
      source: 'schedule',
      metadata: { schedule_target: 'business_only' },
    });

    try {
      await this.workflowsService.startWorkflow('', '', 'whatsapp', synthetic, workflow_id);
    } catch (err: any) {
      this.logger.error(`Schedule business_only run failed for ${workflow_id}: ${err.message}`, err.stack);
    }
  }

  private async fanOutPerLead(workflow_id: string, business_id: string, params: ScheduleTriggerParams): Promise<void> {
    const filter = params.audience ?? {};
    const where = this.buildLeadWhere(business_id, filter);
    const max = Math.max(1, Math.min(DEFAULT_MAX_LEADS, filter.max_leads ?? DEFAULT_MAX_LEADS));

    const leads = await this.prisma.leads.findMany({
      where,
      select: { lead_id: true, tenant_id: true },
      take: max,
      orderBy: { updated_at: 'desc' },
    });

    if (!leads.length) {
      this.logger.log(`Schedule fan-out for ${workflow_id}: no matching leads`);
      return;
    }

    this.logger.log(`Schedule fan-out for ${workflow_id}: ${leads.length} lead(s)`);

    // Run up to CONCURRENCY workflows at a time. Pure serial was leaving most
    // of the WhatsApp send capacity idle for big audiences; full parallel
    // would bombard rate limits. The sweet spot is a small window — 4 keeps
    // 4 inbound-style executions in flight without saturating anything.
    const tasks = leads.map((lead) => async () => {
      const synthetic = buildSyntheticContext({
        business_id,
        tenant_id: lead.tenant_id ?? null,
        lead_id: lead.lead_id,
        source: 'schedule',
        metadata: { schedule_target: 'each_lead' },
      });
      try {
        await this.workflowsService.startWorkflow(lead.lead_id, '', 'whatsapp', synthetic, workflow_id);
      } catch (err: any) {
        this.logger.error(
          `Schedule per-lead run failed for ${workflow_id} lead ${lead.lead_id}: ${err.message}`,
        );
      }
    });
    await runWithConcurrency(tasks, FAN_OUT_CONCURRENCY);
  }

  private buildLeadWhere(business_id: string, filter: LeadAudienceFilter): any {
    const where: any = { business_id, deleted_at: null };
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.source?.length) where.source = { in: filter.source };
    if (filter.has_tags?.length) where.tags = { hasEvery: filter.has_tags };
    return where;
  }
}
