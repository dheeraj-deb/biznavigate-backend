export type ConversationMode = 'text' | 'interactive' | 'web';
export type ConversationFlow = 'sales' | 'booking' | 'ordering' | 'support';

export interface ConversationCapabilities {
  buttons?: boolean;
  lists?: boolean;
  ctas?: boolean;
  maxButtons?: number;
  maxListItems?: number;
  webBaseUrl?: string;
  [key: string]: unknown;
}

export interface ConversationRules {
  tone?: string;
  escalation?: {
    enabled?: boolean;
    keywords?: string[];
    message?: string;
  };
  allowedComponents?: string[];
  [key: string]: unknown;
}

export interface ResolvedConversationConfig {
  tenantId: string;
  wabaId: string;
  mode: ConversationMode;
  flow: ConversationFlow;
  capabilities: ConversationCapabilities;
  rules: ConversationRules;
}

export interface BusinessContextCatalogItem {
  name: string;
  item_type: string;
  category?: string | null;
  base_price?: number | null;
  currency?: string | null;
  stock_quantity?: number | null;
}

export interface BusinessContextSnapshot {
  businessId: string;
  name: string;
  type: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  catalogItems: BusinessContextCatalogItem[];
}

export interface ContactSession {
  conversationId: string;
  contactPhone: string;
  contactName?: string;
  leadId?: string;
  activeFlow?: ConversationFlow;
  metadata?: Record<string, unknown>;
}

export interface MessageHistoryItem {
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp?: Date | string;
}

export interface ContextPacket {
  config: ResolvedConversationConfig;
  session: ContactSession;
  history: MessageHistoryItem[];
  systemPrompt: string;
  business?: BusinessContextSnapshot | null;
}

export interface AgentIntentSignal {
  intent?: string;
  switch_flow?: boolean;
  target_flow?: ConversationFlow;
}

export interface AgentOption {
  id: string;
  label: string;
  description?: string;
}

export interface AgentItem {
  id: string;
  title: string;
  description?: string;
}

export interface AgentStructuredResponse {
  type: 'text' | 'buttons' | 'list' | 'link';
  message: string;
  options?: AgentOption[];
  items?: AgentItem[];
  metadata?: Record<string, unknown>;
  intent?: string;
  switch_flow?: boolean;
  target_flow?: ConversationFlow;
}

export type MappedConversationResponse =
  | { kind: 'text'; text: string }
  | { kind: 'buttons'; body: string; buttons: AgentOption[] }
  | { kind: 'list'; body: string; buttonText: string; sections: Array<{ title: string; rows: AgentItem[] }> }
  | { kind: 'link'; text: string; url: string; label: string };

export interface ConversationOrchestratorInput {
  tenantId: string;
  wabaId: string;
  phoneNumberId: string;
  customerPhone: string;
  userMessage: string;
  session: ContactSession;
  history: MessageHistoryItem[];
}
