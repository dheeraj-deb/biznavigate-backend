import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import type {
  BusinessProfileSnapshot,
  LeadSnapshot,
  RecentBookingSummary,
} from '../context/agent-context-builder.service';

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  intent: Annotation<string>(),
  businessId: Annotation<string>(),
  businessType: Annotation<string>(),
  bookingMethodsSummary: Annotation<string | undefined>(),
  customerLanguage: Annotation<string>(),
  leadId: Annotation<string | undefined>(),
  phone: Annotation<string>(),
  businessProfile: Annotation<BusinessProfileSnapshot>(),
  lead: Annotation<LeadSnapshot | null>(),
  recentBookings: Annotation<RecentBookingSummary[]>(),
  toolRetries: Annotation<number>({ reducer: (_, update: number) => update, default: () => 0 }),
  turnCount: Annotation<number>({ reducer: (_, update: number) => update, default: () => 0 }),
  // Set to true when the tool_caller asked a clarifying question instead of calling a tool.
  // Signals the router to skip the responder and go straight to END.
  clarifyingQuestion: Annotation<boolean>({ reducer: (_, update: boolean) => update, default: () => false }),
});

export type AgentStateType = typeof AgentState.State;
