import { Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { StructuredTool } from '@langchain/core/tools';
import { AgentStateType } from '../graph/agent-state';
import { SYSTEM_PROMPT } from '../prompts/system.prompt';

const logger = new Logger('ResponderNode');

export function makeResponderNode(openaiApiKey: string, _tools: StructuredTool[]) {
  const llm = new ChatOpenAI({ model: 'gpt-4o', apiKey: openaiApiKey, temperature: 0.3 });

  return async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    // If the last message is a FLOW: or HANDOFF: signal added by tool_caller, pass it through unchanged
    const last = state.messages.at(-1);
    if (last instanceof AIMessage && (String(last.content).startsWith('FLOW:') || String(last.content).startsWith('HANDOFF:'))) {
      logger.log(`${String(last.content).startsWith('FLOW:') ? 'FLOW' : 'HANDOFF'} passthrough — skipping LLM call`);
      return {};
    }

    logger.log(`Generating response (businessId=${state.businessId})`);
    const response = await llm.invoke([
      new SystemMessage(SYSTEM_PROMPT(state.businessId)),
      ...state.messages,
    ]);
    logger.log(`Response: ${String(response.content).slice(0, 300)}`);
    return { messages: [response] };
  };
}
