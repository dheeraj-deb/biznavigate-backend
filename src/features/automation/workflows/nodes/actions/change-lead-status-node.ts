import { NodeConfig, WorkflowNodeExecutionContext } from '../../interfaces';
import { LeadCommandService } from '../../../../crm/lead/application/services/lead-command.service';
import { ActionNode } from '../base/action-node';

interface ChangeLeadStatusParams {
  status: string;
  actor?: string;
  lost_reason?: string;
  quoted_amount?: string;
  converted_value?: string;
}

export class ChangeLeadStatusNode extends ActionNode<ChangeLeadStatusParams> {
  constructor(
    config: NodeConfig<ChangeLeadStatusParams>,
    private readonly leadCommands: LeadCommandService,
  ) {
    super(config);
  }

  protected validateAndParseParams(params: any): ChangeLeadStatusParams {
    if (!params.status || typeof params.status !== 'string') {
      throw new Error(`ChangeLeadStatusNode ${this.id}: 'status' parameter is required`);
    }
    return {
      status: params.status,
      actor: params.actor ?? 'system',
      lost_reason: params.lost_reason ?? '',
      quoted_amount: params.quoted_amount ?? '',
      converted_value: params.converted_value ?? '',
    };
  }

  async execute(context: WorkflowNodeExecutionContext): Promise<Record<string, any>> {
    const leadId = this.resolveValue(context.lead_id || context.lead?.id, context);
    if (!leadId) {
      throw new Error(`ChangeLeadStatusNode ${this.id}: lead_id is required in workflow context`);
    }

    const status = this.resolveValue(this.params.status, context);
    const updated = await this.leadCommands.updateStatus(leadId, status, {
      actor: this.resolveValue(this.params.actor ?? 'system', context),
      lostReason: this.optionalString(this.params.lost_reason, context),
      quotedAmount: this.optionalNumber(this.params.quoted_amount, context),
      convertedValue: this.optionalNumber(this.params.converted_value, context),
    });

    context.lead_status = updated.status;
    if (context.lead) context.lead.status = updated.status;

    return {
      lead_id: updated.lead_id,
      status: updated.status,
      stage_id: updated.stage_id ?? null,
    };
  }

  private optionalString(value: string | undefined, context: WorkflowNodeExecutionContext): string | undefined {
    const resolved = this.resolveValue(value, context);
    return resolved ? resolved : undefined;
  }

  private optionalNumber(value: string | undefined, context: WorkflowNodeExecutionContext): number | undefined {
    const resolved = this.resolveValue(value, context);
    if (resolved === '') return undefined;
    const n = Number(resolved);
    return Number.isFinite(n) ? n : undefined;
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
