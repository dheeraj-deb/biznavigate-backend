import { NodeConfig, WorkflowNodeExecutionContext } from "../../interfaces";


export abstract class BaseNode<TParams = any, TResult = any> {
    readonly id: string;
    readonly type: string
    readonly name: string;
    readonly position: { x: number; y: number }
    readonly params: TParams;
    readonly disabled?: boolean;
    readonly outputVariable?: string;


    constructor(config: NodeConfig<TParams>) {
        this.id = config.id;
        this.type = config.type;
        this.name = config.name;
        this.position = config.position;
        this.disabled = config.disabled;
        // Support both camelCase (NodeConfig) and snake_case (Node/workflow definition)
        this.outputVariable = config.outputVariable ?? (config as any).output_variable;
        this.params = this.validateAndParseParams(config.params);
    }

    protected abstract validateAndParseParams(params: any): TParams;

    abstract execute(context: WorkflowNodeExecutionContext): Promise<TResult>;

    abstract shouldWaitForInput(): boolean;

    getType(): string {
        return this.type;
    }

    /** Override in nodes that present fixed options (menu/buttons/list). */
    validateInput(_input: string): boolean {
        return true;
    }

    /** Called when validateInput returns false. Re-sends the prompt with an error prefix. */
    async reprompt(_context: WorkflowNodeExecutionContext): Promise<void> {
        // no-op by default
    }

    /** Called when the user selects "exit". Override to send a farewell message. */
    async onExit(_context: WorkflowNodeExecutionContext): Promise<void> {
        // no-op by default
    }

    protected interpolateString(template: string, context: WorkflowNodeExecutionContext): string {
        return template.replace(/\$\{([^}]+)\}/g, (match, path) => {
            const value = this.getNestedValue(context, path.trim());
            return value !== undefined ? String(value) : match;
        });
    }

    protected getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}