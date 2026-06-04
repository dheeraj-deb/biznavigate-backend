import { NodeConfig, WorkflowNodeExecutionContext } from '../../interfaces';
import { AiActionName, AI_ACTION_NAMES } from '../../../ai-actions/dto/ai-action.dto';
import { AiActionRouterService } from '../../../ai-actions/ai-action-router.service';
import { ActionNode } from '../base/action-node';

interface ParamMapping {
  key: string;
  value: string;
}

interface CallAiActionParams {
  action: AiActionName;
  params?: ParamMapping[];
  idempotency_key?: string;
}

export class CallAiActionNode extends ActionNode<CallAiActionParams> {
  constructor(
    config: NodeConfig<CallAiActionParams>,
    private readonly aiActions: AiActionRouterService,
  ) {
    super(config);
  }

  protected validateAndParseParams(params: any): CallAiActionParams {
    if (!AI_ACTION_NAMES.includes(params.action)) {
      throw new Error(`CallAiActionNode ${this.id}: unsupported action '${params.action}'`);
    }
    return {
      action: params.action,
      params: Array.isArray(params.params) ? params.params : [],
      idempotency_key: params.idempotency_key ?? '',
    };
  }

  async execute(context: WorkflowNodeExecutionContext): Promise<Record<string, any>> {
    const businessId = this.resolveValue(context.business_id || context.business?.id, context);
    if (!businessId) throw new Error(`CallAiActionNode ${this.id}: business_id is required in workflow context`);

    const actionParams: Record<string, any> = {};
    for (const mapping of this.params.params ?? []) {
      if (!mapping?.key) continue;
      actionParams[mapping.key] = this.resolveParamValue(mapping.value, context);
    }

    return this.aiActions.execute({
      action: this.params.action,
      business_id: businessId,
      tenant_id: this.resolveOptionalUuid(context.tenant_id, context),
      lead_id: this.resolveOptionalUuid(context.lead_id || context.lead?.id, context),
      conversation_id: this.resolveOptionalUuid(context.conversation_id, context),
      idempotency_key: this.resolveOptionalString(this.params.idempotency_key, context),
      params: actionParams,
    });
  }

  private resolveOptionalUuid(value: any, context: WorkflowNodeExecutionContext): string | undefined {
    const resolved = this.resolveValue(value, context);
    return resolved || undefined;
  }

  private resolveOptionalString(value: any, context: WorkflowNodeExecutionContext): string | undefined {
    const resolved = this.resolveValue(value, context);
    return resolved || undefined;
  }

  private resolveParamValue(value: any, context: WorkflowNodeExecutionContext): any {
    const resolved = this.resolveValue(value, context);
    if (resolved === 'true') return true;
    if (resolved === 'false') return false;
    if (resolved !== '' && !Number.isNaN(Number(resolved)) && /^-?\d+(\.\d+)?$/.test(resolved)) {
      return Number(resolved);
    }
    return resolved;
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
