import { Injectable } from "@nestjs/common";
import { NodeConfig } from "../interfaces";
import { BaseNode } from "../nodes/base/base-node";
import { WhatsAppService } from "src/features/engagement/whatsapp/application/whatsapp.service";
import { WhatsAppCatalogService } from "src/features/engagement/whatsapp/application/catalog/whatsapp-catalog.service";
import { CartService } from "src/features/commerce/cart/application/services/cart.service";
import { WhatsAppIntentTriggerNode } from "../nodes/triggers/whatsapp-intent-trigger-node";
import { WhatsAppTriggerNode } from "../nodes/triggers/whatsapp-trigger-node";
import { ScheduleTriggerNode } from "../nodes/triggers/schedule-trigger-node";
import { EventTriggerNode } from "../nodes/triggers/event-trigger-node";
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
import { ChangeLeadStatusNode } from "../nodes/actions/change-lead-status-node";
import { MoveLeadStageNode } from "../nodes/actions/move-lead-stage-node";
import { CallAiActionNode } from "../nodes/actions/call-ai-action-node";
import { LeadCommandService } from "../../../crm/lead/application/services/lead-command.service";
import { AiActionRouterService } from "../../ai-actions/ai-action-router.service";
import { AI_ACTION_NAMES } from "../../ai-actions/dto/ai-action.dto";

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

// Optional gating + variable params shared by every trigger node. Evaluated by
// WorkflowsService.startWorkflow → trigger-evaluator.ts. Treated as arrays/
// objects by the validator — no required fields, so triggers without any of
// these set behave identically to before.
const COMMON_TRIGGER_PARAMS: NodeParamDefinition[] = [
    {
        key: 'conditions',
        type: 'array',
        items: [
            { key: 'field', type: 'select', constraints: { enum: ['lead.status', 'lead.tags', 'lead.source', 'message.text'] } },
            { key: 'operator', type: 'select', constraints: { enum: ['equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in'] } },
            { key: 'value', type: 'string' },
        ],
    },
    {
        key: 'business_hours',
        type: 'array', // single-object shape stored as a one-item array so the validator can recurse into items[]
        items: [
            { key: 'enabled', type: 'boolean' },
            { key: 'timezone', type: 'string' },
            {
                key: 'ranges',
                type: 'array',
                items: [
                    { key: 'day', type: 'number', constraints: { min: 0, max: 6 } },
                    { key: 'start', type: 'string' },
                    { key: 'end', type: 'string' },
                ],
            },
        ],
    },
    {
        key: 'vars',
        type: 'array',
        items: [
            { key: 'name', type: 'string' },
            { key: 'value', type: 'string' },
        ],
    },
];

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
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
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
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        // The schedule + event triggers fire from BullMQ / event bus rather than
        // the inbound message path. Their params are stored as nested objects
        // (`schedule`, `audience`, `target`, ...) — the validator's type system
        // only knows simple arrays/strings/numbers, so we mark these as opaque
        // 'string' params here and rely on the runtime (scheduler / event-bus)
        // for shape validation. See triggers/trigger-schemas.ts for the real
        // schema documentation.
        {
            type: 'trigger.schedule',
            category: 'trigger',
            label: 'Schedule',
            description: 'Run on a recurring schedule (daily, weekly, interval) or once at a specific time.',
            icon: '⏰',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.lead_status_changed',
            category: 'trigger',
            label: 'When lead status changes',
            description: 'Run when a lead transitions between statuses (e.g. new → booked).',
            icon: '🔁',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.booking_created',
            category: 'trigger',
            label: 'When a booking is created',
            description: 'Run when a hospitality booking row is created.',
            icon: '📥',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.booking_cancelled',
            category: 'trigger',
            label: 'When a booking is cancelled',
            description: 'Run when a hospitality booking is cancelled.',
            icon: '❌',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.booking_link_sent',
            category: 'trigger',
            label: 'When a booking link is sent',
            description: 'Run after a booking link is sent but booking is not completed.',
            icon: '🔗',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.room_available',
            category: 'trigger',
            label: 'When a room becomes available',
            description: 'Run when a room opens for previously unavailable dates.',
            icon: '🛏️',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.booking_followup_due',
            category: 'trigger',
            label: 'When booking follow-up is due',
            description: 'Run one reminder for an enquiry before a booking link is sent.',
            icon: '⏳',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.booking_checkin_reminder_due',
            category: 'trigger',
            label: 'When check-in reminder is due',
            description: 'Run one day before check-in for booked stays.',
            icon: '📅',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.booking_review_request_due',
            category: 'trigger',
            label: 'When review request is due',
            description: 'Run after checkout to request a review.',
            icon: '⭐',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.payment_captured',
            category: 'trigger',
            label: 'When a payment is captured',
            description: 'Run when a payment reaches captured status (paid).',
            icon: '💰',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.payment_received',
            category: 'trigger',
            label: 'When a payment is received',
            description: 'Run when an external payment received event is posted.',
            icon: '💰',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.payment_waiting',
            category: 'trigger',
            label: 'When payment is waiting',
            description: 'Run when an order/payment link is ready but payment is not completed.',
            icon: '💳',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.order_placed',
            category: 'trigger',
            label: 'When an order is placed',
            description: 'Run when an external order placed event is posted.',
            icon: '📦',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.order_status_changed',
            category: 'trigger',
            label: 'When order status changes',
            description: 'Run when an external order status changed event is posted.',
            icon: '🔁',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.inventory_price_changed',
            category: 'trigger',
            label: 'When inventory price changes',
            description: 'Run when an external inventory price changed event is posted.',
            icon: '🏷️',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.inventory_item_added',
            category: 'trigger',
            label: 'When inventory item is added',
            description: 'Run when an external inventory item added event is posted.',
            icon: '➕',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.inventory_restocked',
            category: 'trigger',
            label: 'When inventory is restocked',
            description: 'Run when an external inventory restocked event is posted.',
            icon: '📦',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.stock_held',
            category: 'trigger',
            label: 'When stock is held',
            description: 'Run after stock is reserved for a customer before release.',
            icon: '📌',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.slot_opened',
            category: 'trigger',
            label: 'When a slot opens',
            description: 'Run when an external slot opened event is posted.',
            icon: '📅',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
            ],
        },
        {
            type: 'trigger.event.credit_due',
            category: 'trigger',
            label: 'When credit payment is due',
            description: 'Run for credit customers with an upcoming or overdue balance.',
            icon: '🧾',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.dead_stock_offer',
            category: 'trigger',
            label: 'When dead-stock offer is created',
            description: 'Run a seller-selected offer campaign for relevant buyers.',
            icon: '🏷️',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.vehicle_details_shared',
            category: 'trigger',
            label: 'When vehicle details are shared',
            description: 'Run after a used-car lead receives details and stock has been checked.',
            icon: '🚗',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.vehicle_visit_slots_available',
            category: 'trigger',
            label: 'When vehicle visit slots are available',
            description: 'Run when showroom visit slots are ready to offer for a used car.',
            icon: '📅',
            waitForInput: false,
            output_variable: null,
            params: [...COMMON_TRIGGER_PARAMS],
        },
        {
            type: 'trigger.event.lead_inactive',
            category: 'trigger',
            label: 'When a lead goes inactive',
            description: 'Run N days after a lead\'s last activity. Inactive scanner fires this hourly.',
            icon: '💤',
            waitForInput: false,
            output_variable: null,
            params: [
                ...COMMON_TRIGGER_PARAMS,
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
                { key: 'variables', type: 'array' },
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

        // ── Business Operations ───────────────────────────────────────────
        {
            type: 'action.change_lead_status',
            category: 'action',
            label: 'Change Lead Status',
            description: 'Updates the lead status and emits the normal lead status changed workflow event.',
            icon: '🔁',
            waitForInput: false,
            output_variable: 'lead_status_result',
            params: [
                { key: 'status', type: 'string' },
                { key: 'actor', type: 'select', constraints: { enum: ['system', 'ai', 'human'] } },
                { key: 'lost_reason', type: 'string' },
                { key: 'quoted_amount', type: 'string' },
                { key: 'converted_value', type: 'string' },
            ],
        },
        {
            type: 'action.move_lead_stage',
            category: 'action',
            label: 'Move Lead Stage',
            description: 'Moves the lead to a pipeline stage by stage ID, or forward-advances by stage slug.',
            icon: '➡️',
            waitForInput: false,
            output_variable: 'lead_stage_result',
            params: [
                { key: 'stage_id', type: 'string' },
                { key: 'stage_slug', type: 'string' },
                { key: 'actor', type: 'select', constraints: { enum: ['system', 'ai', 'human'] } },
            ],
        },
        {
            type: 'action.call_ai_action',
            category: 'action',
            label: 'Call AI Action',
            description: 'Runs an approved business action such as creating a booking, inquiry, order, or handoff.',
            icon: '⚙️',
            waitForInput: false,
            output_variable: 'ai_action_result',
            params: [
                { key: 'action', type: 'select', constraints: { enum: [...AI_ACTION_NAMES] } },
                {
                    key: 'params', type: 'array', items: [
                        { key: 'key', type: 'string' },
                        { key: 'value', type: 'string' },
                    ]
                },
                { key: 'idempotency_key', type: 'string' },
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
        private readonly leadCommands: LeadCommandService,
        private readonly aiActions: AiActionRouterService,
    ) {
        this.registerNodeTypes();
    }

    private registerNodeTypes(): void {
        //Triggers
        this.register('trigger.whatsapp', WhatsAppTriggerNode);
        this.register('trigger.whatsapp.intent', WhatsAppIntentTriggerNode);
        this.register('trigger.schedule', ScheduleTriggerNode);
        this.register('trigger.event.lead_status_changed', EventTriggerNode);
        this.register('trigger.event.booking_created', EventTriggerNode);
        this.register('trigger.event.booking_cancelled', EventTriggerNode);
        this.register('trigger.event.booking_link_sent', EventTriggerNode);
        this.register('trigger.event.booking_followup_due', EventTriggerNode);
        this.register('trigger.event.booking_checkin_reminder_due', EventTriggerNode);
        this.register('trigger.event.booking_review_request_due', EventTriggerNode);
        this.register('trigger.event.room_available', EventTriggerNode);
        this.register('trigger.event.payment_captured', EventTriggerNode);
        this.register('trigger.event.payment_received', EventTriggerNode);
        this.register('trigger.event.payment_waiting', EventTriggerNode);
        this.register('trigger.event.order_placed', EventTriggerNode);
        this.register('trigger.event.order_status_changed', EventTriggerNode);
        this.register('trigger.event.inventory_price_changed', EventTriggerNode);
        this.register('trigger.event.inventory_item_added', EventTriggerNode);
        this.register('trigger.event.inventory_restocked', EventTriggerNode);
        this.register('trigger.event.stock_held', EventTriggerNode);
        this.register('trigger.event.slot_opened', EventTriggerNode);
        this.register('trigger.event.credit_due', EventTriggerNode);
        this.register('trigger.event.dead_stock_offer', EventTriggerNode);
        this.register('trigger.event.vehicle_details_shared', EventTriggerNode);
        this.register('trigger.event.vehicle_visit_slots_available', EventTriggerNode);
        this.register('trigger.event.lead_inactive', EventTriggerNode);

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

        // Business operations
        this.register('action.change_lead_status', ChangeLeadStatusNode);
        this.register('action.move_lead_stage', MoveLeadStageNode);
        this.register('action.call_ai_action', CallAiActionNode);
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
        if (nodeType === 'action.change_lead_status' || nodeType === 'action.move_lead_stage') {
            return [this.leadCommands];
        }
        if (nodeType === 'action.call_ai_action') {
            return [this.aiActions];
        }
        return [];
    }

    hasNodeType(type: string): boolean {
        return this.nodeRegistry.has(type);
    }
}
