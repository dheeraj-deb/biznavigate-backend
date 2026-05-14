import { Injectable } from "@nestjs/common";
import { NodeConfig } from "../interfaces";
import { BaseNode } from "../nodes/base/base-node";
import { WhatsAppService } from "src/features/engagement/whatsapp/application/whatsapp.service";
import { WhatsAppCatalogService } from "src/features/engagement/whatsapp/application/catalog/whatsapp-catalog.service";
import { CartService } from "src/features/commerce/cart/application/services/cart.service";
import { WhatsAppIntentTriggerNode } from "../nodes/triggers/whatsapp-intent-trigger-node";
import { WhatsAppTriggerNode } from "../nodes/triggers/whatsapp-trigger-node";
import { SendMessageNode } from "../nodes/actions/send-message-node";
import { SendMessageWithMenuNode } from "../nodes/actions/send-message-with-menu-node";
import { SendCatalogNode } from "../nodes/actions/send-catalog-node";
import { SendMessageWithButtonsNode } from "../nodes/actions/send-message-with-btns.node";
import { WaitForTextNode } from "../nodes/actions/wait-for-text-node";
import { CollectFilterNode } from "../nodes/actions/collect-filter-node";
import { RAGSearchNode } from "../nodes/actions/rag-search-node";
import { RagChatNode } from "../nodes/actions/rag-chat-node";
import { SendPaymentRequestNode } from "../nodes/actions/send-payment-req-node";
import { SendFlowNode } from "../nodes/actions/send-flow-node";
import { SendTemplateNode } from "../nodes/actions/send-template-node";

export type NodeConstructor<T extends BaseNode = BaseNode> =
    new (config: NodeConfig, ...deps: any[]) => T;

// ── Node Definition types ──────────────────────────────────────────────────
// NodeDefinition is a static, declarative description of a node type's behavior.
// It is NOT a node instance. Node instances are represented by NodeConfig (interfaces.ts).

export interface NodeParamConstraints {
    /** array: min/max item count  |  number: min/max value  |  string: min/max length */
    min?: number;
    max?: number;
    /** string: regex the value must match */
    pattern?: string;
    /** select: allowed values */
    enum?: string[];
}

export interface NodeParamDefinition {
    key: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'select';
    /** For type === 'array': describes the shape of each element */
    items?: NodeParamDefinition[];
    constraints?: NodeParamConstraints;
}

export interface NodeDefinition {
    type: string;
    category: 'trigger' | 'action';
    label: string;
    description: string;
    icon: string;
    /** True when this node pauses execution and waits for user input */
    waitForInput: boolean;
    /** Default context variable name where this node stores its output, null if not applicable */
    output_variable: string | null;
    params: NodeParamDefinition[];
}

// ──────────────────────────────────────────────────────────────────────────

@Injectable()
export class NodeFactory {
    private nodeRegistry: Map<string, NodeConstructor> = new Map();

    /** Static catalogue of all available node types. */
    static readonly NODE_DEFINITIONS: NodeDefinition[] = [
        // ── Triggers ──────────────────────────────────────────────────────
        {
            type: 'trigger.whatsapp',
            category: 'trigger',
            label: 'WhatsApp Trigger',
            description: 'Starts the workflow when any incoming WhatsApp message is received.',
            icon: '💬',
            waitForInput: false,
            output_variable: null,
            params: [],
        },
        {
            type: 'trigger.whatsapp.intent',
            category: 'trigger',
            label: 'WhatsApp Intent Trigger',
            description: 'Starts the workflow when an incoming WhatsApp message matches a specific intent.',
            icon: '💬',
            waitForInput: false,
            output_variable: null,
            params: [
                { key: 'intent', type: 'string' },
            ],
        },

        // ── Messaging ──────────────────────────────────────────────────────
        {
            type: 'action.send_message',
            category: 'action',
            label: 'Send Message',
            description: 'Sends a plain text message.',
            icon: '📤',
            waitForInput: false,
            output_variable: null,
            params: [
                { key: 'message', type: 'string' },
            ],
        },
        {
            type: 'action.send_message_withmenu',
            category: 'action',
            label: 'Send List',
            description: 'Sends a WhatsApp list message and waits for the user to pick an option.',
            icon: '📋',
            waitForInput: true,
            output_variable: 'menu_selection',
            params: [
                { key: 'message', type: 'string' },
                {
                    key: 'menu', type: 'array', constraints: { min: 1, max: 10 }, items: [
                        { key: 'id', type: 'string' },
                        { key: 'label', type: 'string' },
                        { key: 'description', type: 'string' },
                    ]
                },
            ],
        },
        {
            type: 'action.send_message_with_btns',
            category: 'action',
            label: 'Send Buttons',
            description: 'Sends a WhatsApp button message and waits for a reply.',
            icon: '🔘',
            waitForInput: true,
            output_variable: 'button_selection',
            params: [
                { key: 'message', type: 'string' },
                {
                    key: 'buttons', type: 'array', constraints: { min: 1, max: 3 }, items: [
                        { key: 'id', type: 'string' },
                        { key: 'title', type: 'string', constraints: { max: 20 } },
                    ]
                },
                { key: 'header', type: 'string' },
                { key: 'footer', type: 'string' },
            ],
        },
        {
            type: 'action.wait_for_text',
            category: 'action',
            label: 'Wait for Text',
            description: 'Optionally sends a prompt then pauses the workflow until the user replies with any text.',
            icon: '⌨️',
            waitForInput: true,
            output_variable: 'user_input',
            params: [
                { key: 'prompt', type: 'string' },
            ],
        },

        // ── Filter / Catalog ───────────────────────────────────────────────
        {
            type: 'action.collect_filter',
            category: 'action',
            label: 'Collect Filter',
            description: "Presents filter options and stores the user's selection for downstream catalog nodes.",
            icon: '🔍',
            waitForInput: true,
            output_variable: 'filter_metadata',
            params: [
                { key: 'filterDimension', type: 'string' },
                { key: 'message', type: 'string' },
                { key: 'presentationType', type: 'select', constraints: { enum: ['buttons', 'list', 'menu'] } },
                {
                    key: 'filterOptions', type: 'array', constraints: { min: 1 }, items: [
                        { key: 'id', type: 'string' },
                        { key: 'label', type: 'string' },
                        { key: 'filterKey', type: 'string' },
                        { key: 'filterValue', type: 'string' },
                    ]
                },
                { key: 'optional', type: 'boolean' },
                { key: 'skipLabel', type: 'string' },
            ],
        },
        {
            type: 'action.send_catalog',
            category: 'action',
            label: 'Send Catalog',
            description: 'Sends a WhatsApp product catalog. Optionally applies filters collected by an earlier Collect Filter node.',
            icon: '🛍️',
            waitForInput: true,
            output_variable: 'catalog_selection',
            params: [
                { key: 'header', type: 'string' },
                { key: 'message', type: 'string' },
                { key: 'footer', type: 'string' },
                { key: 'limit', type: 'number' },
                { key: 'applyFilters', type: 'boolean' },
            ],
        },

        // ── Payments ───────────────────────────────────────────────────────
        {
            type: 'action.send_payment_request',
            category: 'action',
            label: 'Send Payment Request',
            description: 'Sends a WhatsApp order_details message with a UPI or payment gateway pay button.',
            icon: '💳',
            waitForInput: false,
            output_variable: 'payment_reference_id',
            params: [
                { key: 'body_text', type: 'string' },
                { key: 'header', type: 'string' },
                { key: 'footer', type: 'string' },
                { key: 'currency', type: 'string' },
                { key: 'payment_type', type: 'select', constraints: { enum: ['payment_gateway', 'upi_intent'] } },
                { key: 'payment_gateway_type', type: 'select', constraints: { enum: ['razorpay', 'payu'] } },
                { key: 'payment_configuration_name', type: 'string' },
                { key: 'upi_vpa', type: 'string' },
                { key: 'merchant_name', type: 'string' },
            ],
        },

        // ── Templates ──────────────────────────────────────────────────────
        {
            type: 'action.send_template',
            category: 'action',
            label: 'Send Template',
            description: 'Sends an approved WhatsApp template message with dynamic variables mapped from the workflow context.',
            icon: '📨',
            waitForInput: false,
            output_variable: null,
            params: [
                { key: 'template_name', type: 'string' },
                { key: 'language', type: 'string' },
                { key: 'header_variable', type: 'string' },
                {
                    key: 'variables', type: 'array', items: [
                        { key: 'path', type: 'string' },
                    ]
                },
            ],
        },

        // ── Flows ──────────────────────────────────────────────────────────
        {
            type: 'action.send_flow',
            category: 'action',
            label: 'Send Flow',
            description: 'Sends a WhatsApp Flow form and waits for the user to complete it.',
            icon: '📋',
            waitForInput: true,
            output_variable: 'flow_response',
            params: [
                { key: 'flow_id', type: 'string' },
                { key: 'body', type: 'string' },
                { key: 'cta', type: 'string' },
                { key: 'header', type: 'string' },
                { key: 'footer', type: 'string' },
                { key: 'screen', type: 'string' },
                { key: 'flow_token', type: 'string' },
            ],
        },

        // ── RAG ────────────────────────────────────────────────────────────
        {
            type: 'action.rag_search',
            category: 'action',
            label: 'RAG Search',
            description: 'Runs a semantic search against a vector collection and stores results in context.',
            icon: '🔎',
            waitForInput: false,
            output_variable: 'rag_results',
            params: [
                { key: 'query', type: 'string' },
                { key: 'collection', type: 'string' },
                { key: 'limit', type: 'number', constraints: { min: 1, max: 30 } },
                { key: 'threshold', type: 'number', constraints: { min: 0, max: 1 } },
                { key: 'sendResults', type: 'boolean' },
                { key: 'resultsMessage', type: 'string' },
            ],
        },
        {
            type: 'action.rag_chat',
            category: 'action',
            label: 'RAG Chat',
            description: 'Generates an AI reply using RAG-augmented LLM and sends it to the user.',
            icon: '🤖',
            waitForInput: false,
            output_variable: null,
            params: [
                { key: 'query', type: 'string' },
                { key: 'collection', type: 'string' },
                { key: 'context_limit', type: 'number' },
                { key: 'temperature', type: 'number', constraints: { min: 0, max: 1 } },
                { key: 'model', type: 'string' },
            ],
        },
    ];

    getNodeDefinitions(): NodeDefinition[] {
        return NodeFactory.NODE_DEFINITIONS;
    }

    constructor(
        private readonly whatsappService: WhatsAppService,
        private readonly catalogService: WhatsAppCatalogService,
        private readonly cartService: CartService,
    ) {
        this.registerNodeTypes();
    }

    private registerNodeTypes(): void {
        //Triggers
        this.register('trigger.whatsapp', WhatsAppTriggerNode);
        this.register('trigger.whatsapp.intent', WhatsAppIntentTriggerNode);

        //Actions
        this.register('action.send_message', SendMessageNode);
        this.register('action.send_message_withmenu', SendMessageWithMenuNode);
        this.register('action.send_message_with_btns', SendMessageWithButtonsNode);
        this.register('action.wait_for_text', WaitForTextNode);

        // Filter
        this.register('action.collect_filter', CollectFilterNode);

        // Catalog
        this.register('action.send_catalog', SendCatalogNode);

        // RAG
        this.register('action.rag_search', RAGSearchNode);
        this.register('action.rag_chat', RagChatNode);

        // Payments
        this.register('action.send_payment_request', SendPaymentRequestNode);

        // Flows
        this.register('action.send_flow', SendFlowNode);

        // Templates
        this.register('action.send_template', SendTemplateNode);
    }

    private register(type: string, constructor: NodeConstructor): void {
        this.nodeRegistry.set(type, constructor);
    }

    createNode(nodeConfig: NodeConfig): BaseNode {
        const NodeClass = this.nodeRegistry.get(nodeConfig.type);

        if (!NodeClass) {
            throw new Error(`Unknown node type: ${nodeConfig.type}`);
        }

        const dependencies = this.getDependencies(nodeConfig.type);
        return new NodeClass(nodeConfig, ...dependencies);
    }

    private getDependencies(nodeType: string): any[] {
        if (nodeType.startsWith('trigger.whatsapp') || nodeType.includes('send_message') || nodeType === 'action.wait_for_text' || nodeType === 'action.collect_filter' || nodeType === 'action.rag_search' || nodeType === 'action.rag_chat' || nodeType === 'action.send_payment_request' || nodeType === 'action.send_flow' || nodeType === 'action.send_template') {
            return [this.whatsappService];
        }
        if (nodeType === 'action.send_catalog') {
            return [this.whatsappService, this.catalogService];
        }
        if (nodeType.includes('cart')) {
            return [this.whatsappService, this.cartService];
        }
        return [];
    }

    hasNodeType(type: string): boolean {
        return this.nodeRegistry.has(type);
    }
}