import { Injectable } from "@nestjs/common";
import { Node, NodeConfig, NodeConnections, Nodes, WorkflowNodeExecutionContext, WorkflowParameters, WorkflowProcessingContext } from "../interfaces";
import { BaseNode } from "../nodes/base/base-node";
import { NodeFactory } from "../factories/node-factory";

@Injectable()
export class Workflow {
    id: string;
    name: string;
    active: boolean;

    private nodes: Map<string, BaseNode> = new Map();
    private connections: NodeConnections;
    private workflowContext: WorkflowProcessingContext;
    private nodeContext: WorkflowNodeExecutionContext;
    private currentNodeId: string | null = null;
    private waitForInput: boolean = false;

    onPause?: (state: any) => Promise<void>;
    onComplete?: (state: any) => Promise<void>;
    onError?: (nodeId: string, error: Error) => Promise<void>;

    constructor(private readonly nodeFactory: NodeFactory) { }


    init(parameters: WorkflowParameters) {
        this.id = parameters.id;
        this.name = parameters.name;
        this.active = parameters.active;
        this.setNodes(parameters.nodes);
        this.setConnections(parameters.connections);
    }

    private setNodes(nodeConfigs: NodeConfig[]) {
        this.nodes.clear();
        nodeConfigs.forEach(config => {
            const node = this.nodeFactory.createNode(config);
            this.nodes.set(node.id, node);
        });
    }

    setConnections(connections: NodeConnections) {
        this.connections = connections;
    }

    getNode(id: string): BaseNode | null {
        return this.nodes.get(id) || null;
    }

    async execute(context: WorkflowProcessingContext): Promise<void> {
        this.workflowContext = context;
        this.nodeContext = this.buildNodeContext(context);
        // Find the trigger node that matches
        for (const [, node] of this.nodes) {
            if (node.type.startsWith('trigger.')) {
                await this.executeNode(node);
                return;
            }
        }
    }

    /**
     * Start execution directly at a specific node — used by the agent handoff path.
     * Skips the trigger node and runs `nodeId` immediately.
     * Extra top-level keys from `context` (e.g. `availability_navigate`) are merged
     * into nodeContext so nodes can read them.
     */
    async executeFromNode(nodeId: string, context: WorkflowProcessingContext): Promise<void> {
        this.workflowContext = context;
        this.nodeContext = this.buildNodeContext(context);

        // Merge any extra top-level context fields (e.g. availability_navigate) into nodeContext
        const builtInKeys = new Set(['context', 'user_input', 'business_id', 'lead_id', 'tenant_id',
            'intent', 'entities', 'structured_data', 'cart_info', 'channel', 'message_id']);
        for (const [k, v] of Object.entries(context)) {
            if (!builtInKeys.has(k)) {
                this.nodeContext[k] = v;
            }
        }

        const node = this.getNode(nodeId);
        if (!node) {
            throw new Error(`executeFromNode: node "${nodeId}" not found in workflow`);
        }
        await this.executeNode(node);
    }

    private async executeNode(node: BaseNode | null): Promise<any> {
        if (!node || node.disabled) return;

        try {
            const result = await node.execute(this.nodeContext);

            console.log('node==?', node);
            console.log('result==?', result);

            if (node.outputVariable && result !== undefined) {
                this.nodeContext[node.outputVariable] = result;
            }

            if (node.shouldWaitForInput()) {
                this.waitForInput = true;
                this.currentNodeId = node.id;

                if (this.onPause) {
                    await this.onPause({
                        workflowId: this.id,
                        currentNodeId: node.id,
                        context: this.nodeContext,
                        waitingForInput: true,
                    });
                }
                return;
            }

            await this.traverse(node.id);


        } catch (error) {
            console.error(`Error executing node ${node.name}:`, error);
            await this.handleNodeError(node.id, error);
        }
    }

    private async traverse(nodeId: string): Promise<any> {
        const connections = this.connections[nodeId]?.main ?? [];

        console.log('connections', connections)

        for (const conn of connections) {
            console.log("conn", conn)
            if (conn.hasOwnProperty('condition')) {
                const validCondition = this.evaluateCondition(conn.condition);
                console.log("validCondition", validCondition)
                if (!validCondition) {
                    continue;
                }
                const nextNode = this.getNode(conn.to);
                console.log('nextNode', nextNode?.params?.items)
                if (nextNode) {
                    await this.executeNode(nextNode);
                    return;
                }
            } else {
                const nextNode = this.getNode(conn.to);
                console.log("nextNode=>", nextNode?.params?.items)
                if (nextNode) {
                    await this.executeNode(nextNode);
                    return;
                }
            }
        }

        // No more nodes to traverse — workflow completed
        if (!this.waitForInput && this.onComplete) {
            await this.onComplete({
                workflowId: this.id,
                currentNodeId: nodeId,
                context: this.nodeContext,
            });
        }
    }

    private buildNodeContext(context: WorkflowProcessingContext): WorkflowNodeExecutionContext {
        const ctx = context.context;
        return {
            // Spread all nested context (contact, business, lead, etc.)
            ...ctx,
            // Flat aliases for backward compat with node template strings like ${contactName}
            contactName: ctx.contact?.name ?? null,
            from: ctx.contact?.from ?? '',
            phoneNumberId: ctx.contact?.phoneNumberId ?? '',
            business_name: ctx.business?.name ?? '',
            // Runtime fields
            user_input: context.user_input,
            business_id: context.business_id,
            lead_id: context.lead_id,
            tenant_id: context.tenant_id,
            intent: context.intent,
            entities: context.entities,
            structured_data: context.structured_data,
            cart_info: context.cart_info,
        };
    }

    private evaluateCondition(condition: any): boolean {
        const variableToCheck = condition.variable || 'user_input';
        const actual = this.getNestedValue(this.nodeContext, variableToCheck);

        console.log('Evaluating condition:', condition, 'checking variable:', variableToCheck, 'with actual value:', actual);

        switch (condition.operator) {
            case 'equals':
                return actual === condition.value;
            case 'not_equals':
                return actual !== condition.value;
            case 'exists':
                return actual !== undefined && actual !== null;
            case 'not_exists':
                return actual === undefined || actual === null;
            default:
                return false;
        }
    }

    private getNestedValue(obj: any, path: string): any {
        console.log("obj", obj, "path", path);
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    async resume(userInput: any): Promise<void> {
        if (!this.waitForInput || !this.currentNodeId) {
            throw new Error('Workflow is not waiting for input');
        }

        console.log(`Resuming workflow from node ${this.currentNodeId} with input:`, userInput);

        const currentNode = this.getNode(this.currentNodeId);

        // Validate input against the waiting node's accepted options
        if (currentNode && !currentNode.validateInput(userInput)) {
            await currentNode.reprompt(this.nodeContext);
            // Stay paused — waitForInput remains true, DB state unchanged
            return;
        }

        // Exit — end the workflow cleanly
        if (userInput === 'exit') {
            this.waitForInput = false;
            this.currentNodeId = null;
            if (currentNode) {
                await currentNode.onExit(this.nodeContext);
            }
            if (this.onComplete) {
                await this.onComplete({
                    workflowId: this.id,
                    currentNodeId: currentNode?.id,
                    context: this.nodeContext,
                });
            }
            return;
        }

        this.nodeContext.user_input = userInput;

        // Handle filter node selections BEFORE overwriting
        if (currentNode?.type === 'action.collect_filter' && currentNode.outputVariable) {
            const filterMetadata = this.nodeContext[currentNode.outputVariable];

            if (filterMetadata && filterMetadata.filterOptions) {
                // Find the selected filter option
                const selectedOption = filterMetadata.filterOptions.find(
                    (opt: any) => opt.id === userInput
                );

                // Initialize filters object if needed
                if (!this.nodeContext.filters) {
                    this.nodeContext.filters = {};
                }

                // Store filter selection (skip if user selected 'skip_filter')
                if (selectedOption && userInput !== 'skip_filter' && userInput !== 'skip') {
                    this.nodeContext.filters[filterMetadata.filterDimension] = {
                        filterKey: selectedOption.filterKey,
                        filterValue: selectedOption.filterValue,
                        selected: selectedOption.id
                    };
                    console.log('Filter stored:', filterMetadata.filterDimension, this.nodeContext.filters[filterMetadata.filterDimension]);
                }
            }
        }

        // Add the user input to the context (NOW after filter handling)
        if (currentNode?.outputVariable) {
            if (currentNode.type === 'action.send_flow') {
                if (typeof userInput === 'object' && userInput !== null) {
                    // Pre-parsed + enriched by resumeWorkflow
                    this.nodeContext[currentNode.outputVariable] = userInput;
                } else {
                    try {
                        this.nodeContext[currentNode.outputVariable] = JSON.parse(userInput);
                    } catch {
                        this.nodeContext[currentNode.outputVariable] = userInput;
                    }
                }
            } else {
                this.nodeContext[currentNode.outputVariable] = userInput;
            }
        }

        console.log("node context =>")
        console.dir(this.nodeContext)

        // Reset the waiting state
        this.waitForInput = false;

        // Continue traversing from the current node
        await this.traverse(this.currentNodeId);
    }

    getExecutionState() {
        return {
            workflowId: this.id,
            currentNodeId: this.currentNodeId,
            context: this.nodeContext,
            waitingForInput: this.waitForInput,
        };
    }

    restoreState(state: any) {
        this.nodeContext = state.context || {};
        this.currentNodeId = state.currentNodeId || null;
        this.waitForInput = state.waitingForInput || false;
    }

    private async handleNodeError(nodeId: string, error: Error): Promise<void> {
        const errorConnections = this.connections[nodeId]?.error ?? [];

        if (errorConnections.length > 0) {
            for (const conn of errorConnections) {
                const nextNode = this.getNode(conn.to);
                if (nextNode) {
                    this.nodeContext['lastError'] = {
                        nodeId,
                        message: error.message,
                    };
                    await this.executeNode(nextNode);
                    return;
                }
            }
        }

        const fallbackConnections = this.connections[nodeId]?.fallback ?? [];

        for (const conn of fallbackConnections) {
            const nextNode = this.getNode(conn.to);
            if (nextNode) {
                this.nodeContext['lastError'] = {
                    nodeId,
                    message: error.message,
                };
                await this.executeNode(nextNode);
                return;
            }
        }

        // No error/fallback connections — workflow failed
        if (this.onError) {
            await this.onError(nodeId, error);
        }
    }

}