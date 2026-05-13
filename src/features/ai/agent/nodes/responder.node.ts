import { Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { StructuredTool } from '@langchain/core/tools';
import { AgentStateType } from '../graph/agent-state';
import { SYSTEM_PROMPT } from '../prompts/system.prompt';

const logger = new Logger('ResponderNode');

// Summarize the conversation every N turns to cap context window growth.
// Mirrors agents-js ChatContext._summarize pattern.
const SUMMARIZE_EVERY = 20;

export function makeResponderNode(openaiApiKey: string, _tools: StructuredTool[]) {
  const llm = new ChatOpenAI({ model: 'gpt-4o', apiKey: openaiApiKey, temperature: 0.3 });
  const summaryLlm = new ChatOpenAI({ model: 'gpt-4o-mini', apiKey: openaiApiKey, temperature: 0 });

  return async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    // Pass FLOW:/HANDOFF: signals through unchanged — debounce processor handles them
    const last = state.messages.at(-1);
    if (
      last instanceof AIMessage &&
      (String(last.content).startsWith('FLOW:') || String(last.content).startsWith('HANDOFF:'))
    ) {
      logger.log(`${String(last.content).startsWith('FLOW:') ? 'FLOW' : 'HANDOFF'} passthrough — skipping LLM call`);
      return {};
    }

    const newTurnCount = (state.turnCount ?? 0) + 1;
    let messages = state.messages;

    // Summarize old turns to prevent unbounded context growth
    if (newTurnCount % SUMMARIZE_EVERY === 0 && messages.length > SUMMARIZE_EVERY) {
      logger.log(`Turn ${newTurnCount}: summarizing ${messages.length - 6} old messages to cap context`);
      const toSummarize = messages.slice(0, -6);
      const recent = messages.slice(-6);
      const summaryResp = await summaryLlm.invoke([
        new SystemMessage(
          'Summarize this conversation briefly, preserving key facts: names, booking dates, confirmed items, amounts, and any decisions made.',
        ),
        ...toSummarize,
      ]);
      messages = [summaryResp, ...recent];
    }

    logger.log(`Generating response (businessId=${state.businessId} businessType=${state.businessType} turn=${newTurnCount})`);
    const response = await llm.invoke([
      new SystemMessage(SYSTEM_PROMPT(state.businessId, state.businessType)),
      ...messages,
    ]);
    logger.log(`Response: ${String(response.content).slice(0, 300)}`);
    return { messages: [response], turnCount: newTurnCount };
  };
}
