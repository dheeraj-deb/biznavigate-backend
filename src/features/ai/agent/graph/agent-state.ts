import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  intent: Annotation<string>(),
  businessId: Annotation<string>(),
  businessType: Annotation<string>(), // e.g. 'hospitality', 'retail', 'ecommerce', 'services'
  customerLanguage: Annotation<string>(),
  leadId: Annotation<string | undefined>(),
  phone: Annotation<string>(),
  toolRetries: Annotation<number>({ reducer: (_, update: number) => update, default: () => 0 }),
  turnCount: Annotation<number>({ reducer: (_, update: number) => update, default: () => 0 }),
  // Set to true when the tool_caller asked a clarifying question instead of calling a tool.
  // Signals the router to skip the responder and go straight to END.
  clarifyingQuestion: Annotation<boolean>({ reducer: (_, update: boolean) => update, default: () => false }),
});

export type AgentStateType = typeof AgentState.State;
