import { MessageProcessingContext } from "../../interfaces";
import { BaseNode } from "./base-node";

export abstract class TriggerNode<TParams = any, TResult = any> extends BaseNode<TParams, TResult> {
    async execute(context: MessageProcessingContext): Promise<null> {
        return null;
    }

    shouldWaitForInput(): boolean {
        return false;
    }

    abstract matches(triggerData: any): boolean;
}