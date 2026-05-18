import { NodeConfig } from '../../interfaces';
import { TriggerNode } from '../base/trigger-node';
import { ScheduleTriggerParams } from '../../triggers/trigger-schemas';

/**
 * Placeholder trigger node for scheduled workflows. The actual scheduling is
 * managed by WorkflowSchedulerService — this node only exists so the
 * NodeFactory can instantiate trigger nodes uniformly. matches() is never
 * called for schedule triggers because the scheduler fires them directly.
 */
export class ScheduleTriggerNode extends TriggerNode<ScheduleTriggerParams> {
  constructor(params: NodeConfig<ScheduleTriggerParams>) {
    super(params);
  }

  protected validateAndParseParams(params: any): ScheduleTriggerParams {
    if (!params?.schedule?.mode) {
      throw new Error(`ScheduleTriggerNode ${this.id}: 'schedule.mode' is required`);
    }
    if (!['each_lead', 'business_only'].includes(params.target)) {
      throw new Error(`ScheduleTriggerNode ${this.id}: 'target' must be 'each_lead' or 'business_only'`);
    }
    return params as ScheduleTriggerParams;
  }

  matches(): boolean {
    return false; // never called via the inbound path
  }
}
