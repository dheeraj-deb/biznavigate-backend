
type NodeParamValueType = string | number | boolean | NodeParams | NodeParamValueType[];

export type NodeParams = {
    [key: string]: NodeParamValueType;
}

export interface WorkflowParameters {
    id?: string;
    name?: string;
    nodes: Node[];
    connections: NodeConnections;
    active: boolean;
    staticData?: NodeParamValueType | Record<string, any> | NodeParamValueType[];
}

export interface Node {
    id: string;
    type: string;
    name: string;
    position: {
        x: number;
        y: number;
    };
    output_variable?: string;
    disbled?: boolean;
    params: NodeParams;
}

export interface Nodes {
    [key: string]: Node;
}

export type ConditionOperator =
    | 'equals'
    | 'not_equals'
    | 'exists'
    | 'not_exists';

export interface NodeConnectionCondition {
    operator: ConditionOperator;
    variable: string;
    value?: any;
}

export interface NodeConnectionEdge {
    to: string;
    condition?: NodeConnectionCondition;
}

export interface NodeConnectionRoutes {
    main?: NodeConnectionEdge[];
    error?: NodeConnectionEdge[];
    fallback?: NodeConnectionEdge[];
}

export interface NodeConnections {
    [nodeId: string]: NodeConnectionRoutes;
}


export interface Workflow {
    id: string;
    name: string;
    description?: string;
    nodes: Node[];
    connections: NodeConnections;
}

export interface ExecutionContext {
    executionId: string;
    workflowId: string;
    node: Node;
    data: Record<string, any>;
    variables: Record<string, any>;
}

export interface NodeExecutionResult {
    nextHandle?: string;
    data?: Record<string, any>;
}

export interface NodeExecutor {
    type: string;
    execute(context: ExecutionContext): Promise<NodeExecutionResult>;
}

export interface WorkflowExecutionState {
    workflowId: string;
    userId: string;
    channel: 'whatsapp' | 'instagram';
    currentNodeId: string;
    context: Record<string, any>;
    waitingForInput: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface WhatsappIncomingParameters {
    messageId: string;
    phoneNumberId?: string;
    from: string;
    messageType: string;
    messageText: string;
    timestamp: number;
}


export interface CartInfo {
    cart_id: string;
    total_items: number;
    total_amount: number;
    items: any[];
}

export interface WorkflowProcessingContext {
    lead_id: string;
    business_id: string;
    tenant_id: string | null;
    processing_id: string;
    user_input: string;
    intent: IntentResult;

    entities: EntityExtractionResult;

    structured_data: StructuredDataResult;

    suggested_actions: string[];

    suggested_response: string | null;

    processing_time_ms: number;

    context: MessageProcessingContext;

    cart_info?: CartInfo;
}

/* ---------- Intent ---------- */

export interface IntentResult {
    intent: string;
    confidence: number;
    suggested_actions: string[];
    method: IntentDetectionMethod;
    processing_time_ms: number;
    cached: boolean;
}

export type IntentDetectionMethod =
    | "rule_based"
    | "ml_model"
    | "llm"
    | "llm_fallback"
    | "hybrid"
    | string;


export interface EntityExtractionResult {
    ORG?: string[];
    PRODUCT?: string[];
    PERSON?: string[];
    LOCATION?: string[];
    DATE?: string[];
    TIME?: string[];
    EMAIL?: string[];
    PHONE?: string[];

    [entityType: string]: string[] | undefined;
}


export interface StructuredDataResult {
    type: string;
    entities: Record<string, string[]>;
}


export interface MessageProcessingContext {
    message_id: string;
    conversation_id: string;
    channel: CommunicationChannel;

    contactName: string | null;

    phoneNumberId: string;

    from: string;

    business_name: string;

    business_id: string;

    lead_info: LeadInfo;

    message_type: MessageType;

}


export interface LeadInfo {
    lead_id: string;
    first_name: string | null;
    last_name: string | null;
    status: LeadStatus;
    lead_score: number;
}


export type CommunicationChannel =
    | "whatsapp"
    | "instagram"
    | "facebook"
    | "web"
    | "email"
    | string;

export type MessageType =
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "button"
    | "interactive"
    | string;

export type LeadStatus =
    | "new"
    | "contacted"
    | "qualified"
    | "converted"
    | "lost"
    | string;


export interface NodeConfig<TParams = any> {
    id: string;
    type: string;
    name: string;
    position: { x: number; y: number };
    params: TParams;
    disabled?: boolean;
    outputVariable?: string;
}


export interface FilterData {
    filterKey: string;
    filterValue: any;
    selected: string;
}

export interface WorkflowNodeExecutionContext {
    message_id: string;
    conversation_id: string;
    channel: CommunicationChannel
    contactName: string | null;
    phoneNumberId: string;
    from: string;
    business_name: string;
    lead_info: LeadInfo;
    message_type: MessageType;
    user_input: string;
    business_id: string;
    tenant_id: string | null;
    lead_id: string;
    intent?: IntentResult;
    entities?: EntityExtractionResult;
    structured_data?: StructuredDataResult;
    cart_info?: CartInfo;
    filters?: Record<string, FilterData>;
    [key: string]: any;
}

export interface FilterOption {
  id: string;           // "men", "women", "kids"
  label: string;        // "Men's Clothing"
  filterKey: string;    // "gender" - product field to filter
  filterValue: any;     // "male" - value to match in products
}

interface CollectFilterParams {
  filterDimension: string;      // "gender", "category", "price_range"
  message: string;              // "Select gender preference:"
  presentationType: 'buttons' | 'list' | 'menu';
  filterOptions: FilterOption[];
  multiSelect?: boolean;        // Allow multiple selections
  optional?: boolean;           // User can skip this filter
  skipLabel?: string;          // "Show All" button
}
