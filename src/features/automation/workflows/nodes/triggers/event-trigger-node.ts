import { NodeConfig } from '../../interfaces';
import { TriggerNode } from '../base/trigger-node';
import { EventTriggerParams } from '../../triggers/trigger-schemas';

/**
 * Placeholder trigger node for event-driven workflows. The actual subscription
 * is managed by WorkflowEventBus — this node only exists so the NodeFactory can
 * instantiate trigger nodes uniformly.
 */
export class EventTriggerNode extends TriggerNode<EventTriggerParams> {
  constructor(params: NodeConfig<EventTriggerParams>) {
    super(params);
  }

  protected validateAndParseParams(params: any): EventTriggerParams {
    if (!params?.event) {
      throw new Error(`EventTriggerNode ${this.id}: 'event' is required`);
    }
    return params as EventTriggerParams;
  }

  matches(): boolean {
    return false; // never called via the inbound path
  }
}
