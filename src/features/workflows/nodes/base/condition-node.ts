import { NodeConnectionCondition, WorkflowNodeExecutionContext } from '../../interfaces';
import { BaseNode } from './base-node';

/**
 * Base class for condition/branching nodes.
 * Subclasses implement evaluate() to express their logic.
 * execute() calls evaluate() and returns the boolean result,
 * which is stored in outputVariable and used by downstream
 * connection conditions (e.g. operator: 'equals', value: true).
 */
export abstract class ConditionNode<TParams = any> extends BaseNode<TParams, boolean> {

    shouldWaitForInput(): boolean {
        return false;
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<boolean> {
        return this.evaluate(context);
    }

    abstract evaluate(context: WorkflowNodeExecutionContext): boolean;

    protected evaluateCondition(
        condition: NodeConnectionCondition,
        context: WorkflowNodeExecutionContext,
    ): boolean {
        const value = this.getNestedValue(context, condition.variable);
        switch (condition.operator) {
            case 'equals': return value === condition.value;
            case 'not_equals': return value !== condition.value;
            case 'exists': return value !== undefined && value !== null && value !== '';
            case 'not_exists': return value === undefined || value === null || value === '';
            default: return false;
        }
    }

    protected evaluateAll(
        conditions: NodeConnectionCondition[],
        context: WorkflowNodeExecutionContext,
    ): boolean {
        return conditions.every(c => this.evaluateCondition(c, context));
    }

    protected evaluateAny(
        conditions: NodeConnectionCondition[],
        context: WorkflowNodeExecutionContext,
    ): boolean {
        return conditions.some(c => this.evaluateCondition(c, context));
    }
}
