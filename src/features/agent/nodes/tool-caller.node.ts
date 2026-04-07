import { Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { StructuredTool } from '@langchain/core/tools';
import { AgentStateType } from '../graph/agent-state';
import { SYSTEM_PROMPT } from '../prompts/system.prompt';

const logger = new Logger('ToolCallerNode');

export function makeToolCallerNode(openaiApiKey: string, tools: StructuredTool[]) {
  const llm = new ChatOpenAI({ model: 'gpt-4o', apiKey: openaiApiKey, temperature: 0 })
    .bindTools(tools);

  return async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    const last = state.messages.at(-1);

    // Execute any pending tool calls from the previous LLM turn
    if (last instanceof AIMessage) {
      const aiMsg = last;
      if (aiMsg.tool_calls?.length) {
        logger.log(`Executing ${aiMsg.tool_calls.length} tool call(s): ${aiMsg.tool_calls.map(tc => `${tc.name}(${JSON.stringify(tc.args)})`).join(', ')}`);
        const toolResults = await Promise.all(
          aiMsg.tool_calls.map(async (tc) => {
            const tool = tools.find((t) => t.name === tc.name);
            const result = tool
              ? await tool.invoke(tc.args).catch((e) => `Error: ${e.message}`)
              : `Unknown tool: ${tc.name}`;
            logger.log(`Tool [${tc.name}] → ${String(result).slice(0, 200)}`);
            return new ToolMessage({ content: String(result), tool_call_id: tc.id });
          }),
        );

        // If any tool returned a FLOW: or HANDOFF: signal, pass it through directly as the final reply
        const signalResult = toolResults.find(
          (tr) => String(tr.content).startsWith('FLOW:') || String(tr.content).startsWith('HANDOFF:'),
        );
        if (signalResult) {
          const signal = String(signalResult.content).startsWith('FLOW:') ? 'FLOW' : 'HANDOFF';
          logger.log(`${signal} signal detected — short-circuiting`);
          return { messages: [...toolResults, new AIMessage(String(signalResult.content))] };
        }

        return { messages: toolResults };
      }
    }

    logger.log(`Calling LLM for tool selection (intent=${state.intent} businessId=${state.businessId} retries=${state.toolRetries})`);

    const today = new Date().toISOString().split('T')[0]; // e.g. 2026-04-03
    const toolCallerDirective = `${SYSTEM_PROMPT(state.businessId)}

IMPORTANT — TOOL EXECUTION RULES:
- Today's date is ${today}. Use this to resolve relative or partial dates (e.g. "26 to 27" means the 26th and 27th of the current month/year).
- You MUST call a tool now. Do NOT respond with plain text.
- If the user is reporting a complaint, problem, maintenance issue, or in-stay support request: call the handoff tool immediately with the reason. Do NOT reply with text.
- If the user explicitly wants a human agent: call the handoff tool immediately.
- If the conversation contains check-in and check-out dates, call check_availability immediately using those dates. Do not say "let me check" — just call the tool.
- Pass dates exactly as the user stated them (e.g. "26", "April 27", "tomorrow"). The tool resolves them automatically.
- If the user confirmed or said "yes" to dates already mentioned, call check_availability with those dates right now.
- Only ask a question if you are genuinely missing required information (e.g. no dates provided at all).`;

    const response = await llm.invoke([
      new SystemMessage(toolCallerDirective),
      ...state.messages,
    ]);

    const hasToolCalls = !!(response.tool_calls?.length);
    logger.log(`LLM tool selection → ${hasToolCalls ? response.tool_calls.map(tc => tc.name).join(', ') : 'no tool calls'}`);

    // If the LLM narrated instead of calling a tool, retry once with an explicit nudge
    if (!hasToolCalls && state.toolRetries < 1) {
      logger.warn('LLM did not call a tool — retrying with explicit nudge');
      const nudge = `You responded with plain text instead of calling a tool. You MUST call a tool now. Do not explain anything — call the appropriate tool immediately with the dates from the conversation.`;
      const retryResponse = await llm.invoke([
        new SystemMessage(toolCallerDirective),
        ...state.messages,
        response,
        new (await import('@langchain/core/messages')).HumanMessage(nudge),
      ]);
      logger.log(`Retry tool selection → ${retryResponse.tool_calls?.length ? retryResponse.tool_calls.map(tc => tc.name).join(', ') : 'still no tool calls'}`);
      return { messages: [retryResponse], toolRetries: state.toolRetries + 1 };
    }

    return { messages: [response] };
  };
}
