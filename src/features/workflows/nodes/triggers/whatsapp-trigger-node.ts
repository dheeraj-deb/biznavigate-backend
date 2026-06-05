import { NodeConfig } from "../../interfaces";
import { TriggerNode } from "../base/trigger-node";

export class WhatsAppTriggerNode extends TriggerNode<{}> {
    constructor(params: NodeConfig<{}>) {
        super(params);
    }

    protected validateAndParseParams(_params: any): {} {
        return {};
    }

    matches(_triggerData: any): boolean {
        return true;
    }
}