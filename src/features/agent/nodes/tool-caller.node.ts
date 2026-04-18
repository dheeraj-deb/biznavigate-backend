import { Logger } from '@nestjs/common';
import { AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { StructuredTool } from '@langchain/core/tools';
import { AgentStateType } from '../graph/agent-state';
import { SYSTEM_PROMPT } from '../prompts/system.prompt';
import { LLMFallbackAdapter } from '../graph/llm-factory';

const logger = new Logger('ToolCallerNode');

export function makeToolCallerNode(openaiApiKey: string, tools: StructuredTool[]) {
  // Primary: gpt-4o. Fallback: gpt-4o-mini if primary is unavailable.
  const adapter = new LLMFallbackAdapter([
    { model: 'gpt-4o', apiKey: openaiApiKey, temperature: 0 },
    { model: 'gpt-4o-mini', apiKey: openaiApiKey, temperature: 0 },
  ]).bindTools(tools);

  return async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    const last = state.messages.at(-1);

    // Execute any pending tool calls from the previous LLM turn
    if (last instanceof AIMessage && last.tool_calls?.length) {
      logger.log(
        `Executing ${last.tool_calls.length} tool call(s): ${last.tool_calls.map((tc) => `${tc.name}(${JSON.stringify(tc.args)})`).join(', ')}`,
      );
      const toolResults = await Promise.all(
        last.tool_calls.map(async (tc) => {
          const tool = tools.find((t) => t.name === tc.name);
          const result = tool
            ? await tool.invoke(tc.args).catch((e: Error) => `Error: ${e.message}`)
            : `Unknown tool: ${tc.name}`;
          logger.log(`Tool [${tc.name}] → ${String(result).slice(0, 200)}`);
          return new ToolMessage({ content: String(result), tool_call_id: tc.id });
        }),
      );

      // If any tool returned a FLOW: or HANDOFF: signal, short-circuit to END via responder
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

    // Ask the LLM which tool to call next
    logger.log(`Calling LLM for tool selection (intent=${state.intent} businessId=${state.businessId})`);

    const today = new Date().toISOString().split('T')[0];
    const toolCallerDirective = `${SYSTEM_PROMPT(state.businessId, state.businessType)}

IMPORTANT — TOOL EXECUTION RULES:
- Today's date is ${today}. Use this to resolve relative or partial dates.
- You MUST call a tool now. Do NOT respond with plain text.
- If the user is reporting a complaint, problem, or needs support: call handoff_to_human immediately.
- If the user explicitly wants a human agent: call handoff_to_human immediately.
- If you have enough information to call a tool, do it now — do not say "let me check".
- Only ask a question if you are genuinely missing required information.`;

    const response = await adapter.invoke([
      new SystemMessage(toolCallerDirective),
      ...state.messages,
    ]);

    logger.log(
      `LLM tool selection → ${response.tool_calls?.length ? response.tool_calls.map((tc: any) => tc.name).join(', ') : 'no tool calls'}`,
    );

    return { messages: [response] };
  };
}
