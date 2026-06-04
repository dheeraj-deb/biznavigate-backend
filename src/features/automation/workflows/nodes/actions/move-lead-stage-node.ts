import { NodeConfig, WorkflowNodeExecutionContext } from '../../interfaces';
import { LeadCommandService } from '../../../../crm/lead/application/services/lead-command.service';
import { ActionNode } from '../base/action-node';

interface MoveLeadStageParams {
  stage_id?: string;
  stage_slug?: string;
  actor?: 'human' | 'ai' | 'system';
}

export class MoveLeadStageNode extends ActionNode<MoveLeadStageParams> {
  constructor(
    config: NodeConfig<MoveLeadStageParams>,
    private readonly leadCommands: LeadCommandService,
  ) {
    super(config);
  }

  protected validateAndParseParams(params: any): MoveLeadStageParams {
    if (!params.stage_id && !params.stage_slug) {
      throw new Error(`MoveLeadStageNode ${this.id}: 'stage_id' or 'stage_slug' parameter is required`);
    }
    return {
      stage_id: params.stage_id ?? '',
      stage_slug: params.stage_slug ?? '',
      actor: params.actor ?? 'system',
    };
  }

  async execute(context: WorkflowNodeExecutionContext): Promise<Record<string, any>> {
    const leadId = this.resolveValue(context.lead_id || context.lead?.id, context);
    const businessId = this.resolveValue(context.business_id || context.business?.id, context);
    if (!leadId) throw new Error(`MoveLeadStageNode ${this.id}: lead_id is required in workflow context`);
    if (!businessId) throw new Error(`MoveLeadStageNode ${this.id}: business_id is required in workflow context`);

    const stageId = this.resolveValue(this.params.stage_id, context);
    if (stageId) {
      const updated = await this.leadCommands.moveToStage({
        leadId,
        stageId,
        businessId,
        actor: this.params.actor ?? 'system',
      });
      context.lead_status = updated.status;
      if (context.lead) context.lead.status = updated.status;
      return {
        moved: true,
        lead_id: updated.lead_id,
        status: updated.status,
        stage_id: updated.stage_id ?? null,
      };
    }

    const stageSlug = this.resolveValue(this.params.stage_slug, context);
    const result = await this.leadCommands.autoAdvance({
      leadId,
      toSlug: stageSlug,
      reason: `workflow:${this.id}`,
      actor: this.params.actor === 'ai' ? 'ai' : 'system',
    });

    return {
      moved: result.moved,
      reason: result.reason ?? null,
      stage_slug: stageSlug,
    };
  }

  private resolveValue(value: any, context: WorkflowNodeExecutionContext): string {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') return String(value);
    if (value.startsWith('$')) return value.slice(1);

    const direct = this.getNestedValue(context, value);
    if (direct !== undefined && direct !== null) return String(direct);

    return this.interpolateString(value, context);
  }
}
