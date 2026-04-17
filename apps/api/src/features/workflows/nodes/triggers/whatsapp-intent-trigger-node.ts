import { NodeConfig } from "../../interfaces";
import { TriggerNode } from "../base/trigger-node";

interface WhatsAppIntentTriggerParams {
    intent: string
}

export class WhatsAppIntentTriggerNode extends TriggerNode<WhatsAppIntentTriggerParams> {
    constructor(params: NodeConfig<WhatsAppIntentTriggerParams>) {
        super(params);
    }

    protected validateAndParseParams(params: any): WhatsAppIntentTriggerParams {
        if (!params.intent || typeof params.intent !== 'string') {
            throw new Error(`WhatsAppIntentTriggerNode ${this.id}: 'intent' parameter is required`);
        }
        return {
            intent: params.intent,
        };
    }

    matches(triggerData: any): boolean {
        return triggerData.intent === this.params.intent;
    }
}