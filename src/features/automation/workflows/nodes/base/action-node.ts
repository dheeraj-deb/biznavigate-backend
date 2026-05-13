import { BaseNode } from "./base-node";

export abstract class ActionNode<TParams = any, TResult = any>
    extends BaseNode<TParams, TResult> {

    shouldWaitForInput(): boolean {
        return false;
    }
}
