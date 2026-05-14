import { AIMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';

function getToolCallId(message: ToolMessage): string | undefined {
  return (message as any).tool_call_id ?? (message as any).toolCallId;
}

function toolCallIds(message: AIMessage): string[] {
  return (message.tool_calls ?? [])
    .map((toolCall: any) => toolCall.id)
    .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);
}

/**
 * OpenAI-compatible chat APIs reject orphan ToolMessages. LangGraph memory can
 * occasionally retain a tool result without the paired assistant tool_call when
 * a turn is interrupted/cancelled or when old checkpoints are reused.
 */
export function sanitizeMessagesForModel(messages: BaseMessage[]): BaseMessage[] {
  const sanitized: BaseMessage[] = [];
  let pendingAiMessage: AIMessage | null = null;
  let pendingToolIds = new Set<string>();
  let pendingToolMessages: ToolMessage[] = [];

  const flushPendingToolGroup = () => {
    if (pendingAiMessage && pendingToolMessages.length > 0 && pendingToolIds.size === 0) {
      sanitized.push(pendingAiMessage, ...pendingToolMessages);
    }
    pendingAiMessage = null;
    pendingToolIds = new Set<string>();
    pendingToolMessages = [];
  };

  for (const message of messages) {
    if (pendingAiMessage) {
      if (message instanceof ToolMessage) {
        const id = getToolCallId(message);
        if (id && pendingToolIds.has(id)) {
          pendingToolMessages.push(message);
          pendingToolIds.delete(id);
        }
        continue;
      }

      flushPendingToolGroup();
    }

    if (message instanceof AIMessage && message.tool_calls?.length) {
      const ids = toolCallIds(message);
      if (ids.length > 0) {
        pendingAiMessage = message;
        pendingToolIds = new Set(ids);
        pendingToolMessages = [];
      }
      continue;
    }

    if (message instanceof ToolMessage) continue;

    sanitized.push(message);
  }

  flushPendingToolGroup();
  return sanitized;
}
