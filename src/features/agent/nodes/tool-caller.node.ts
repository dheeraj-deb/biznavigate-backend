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

        // If any tool returned a FLOW: signal, pass it through directly as the final reply
        const flowResult = toolResults.find((tr) => String(tr.content).startsWith('FLOW:'));
        if (flowResult) {
          logger.log(`FLOW signal detected — short-circuiting to workflow engine`);
          return { messages: [...toolResults, new AIMessage(String(flowResult.content))] };
        }

        return { messages: toolResults };
      }
    }

    logger.log(`Calling LLM for tool selection (intent=${state.intent} businessId=${state.businessId})`);
    // Ask the LLM what tool to call next.
    // Prepend a strong directive so the LLM calls a tool immediately instead of narrating.
    const toolCallerDirective = `${SYSTEM_PROMPT(state.businessId)}

IMPORTANT — TOOL EXECUTION RULES:
- You MUST call a tool now. Do NOT respond with plain text.
- If the conversation contains check-in and check-out dates, call check_availability immediately using those dates. Do not say "let me check" — just call the tool.
- "27,28" means check-in March 27, check-out March 28. "25 to 28" means check-in 25th, check-out 28th.
- If the user confirmed or said "yes" to dates already mentioned, call check_availability with those dates right now.
- Only ask a question if you are genuinely missing required information (e.g. no dates provided at all).`;

    const response = await llm.invoke([
      new SystemMessage(toolCallerDirective),
      ...state.messages,
    ]);
    logger.log(`LLM tool selection → ${response.tool_calls?.length ? response.tool_calls.map(tc => tc.name).join(', ') : 'no tool calls (unexpected)'}`);
    return { messages: [response] };
  };
}
