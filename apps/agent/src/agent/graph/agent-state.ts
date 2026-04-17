import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  intent: Annotation<string>(),
  businessId: Annotation<string>(),
  leadId: Annotation<string | undefined>(),
  phone: Annotation<string>(),
  toolRetries: Annotation<number>({ reducer: (_, update: number) => update, default: () => 0 }),
});

export type AgentStateType = typeof AgentState.State;
