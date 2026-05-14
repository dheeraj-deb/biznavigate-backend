import { Logger } from '@nestjs/common';
import { AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { StructuredTool } from '@langchain/core/tools';
import { AgentStateType } from '../graph/agent-state';
import { SYSTEM_PROMPT } from '../prompts/system.prompt';
import { AgentModelConfig, LLMFallbackAdapter } from '../graph/llm-factory';
import { languageLabel } from '../utils/language-detector';
import { sanitizeMessagesForModel } from '../utils/message-sanitizer';

const logger = new Logger('ToolCallerNode');

export function makeToolCallerNode(modelConfig: AgentModelConfig, tools: StructuredTool[]) {
  const adapter = new LLMFallbackAdapter([
    {
      model: modelConfig.primaryModel,
      apiKey: modelConfig.apiKey,
      baseUrl: modelConfig.baseUrl,
      temperature: 0,
    },
    {
      model: modelConfig.toolFallbackModel,
      apiKey: modelConfig.apiKey,
      baseUrl: modelConfig.baseUrl,
      temperature: 0,
    },
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
    const customerLanguage = languageLabel(state.customerLanguage);
    const toolCallerDirective = `${SYSTEM_PROMPT(state.businessId, state.businessType)}

IMPORTANT — TOOL EXECUTION RULES:
- Today's date is ${today}. Use this to resolve relative or partial dates.
- Customer language is ${customerLanguage}. Any plain text question or reply must be in ${customerLanguage}.
- If the user is reporting a complaint, problem, or needs support: call handoff_to_human immediately.
- If the user explicitly wants a human agent: call handoff_to_human immediately.
- If the user asks a general business question about facilities, services, policies, directions, pricing, timings, documents, amenities, rules, address, location, or FAQs: call faq_search.
- If you have enough information to call a tool, call it now — do not say "let me check".
- If required information is missing (e.g. check-in/check-out dates for availability, product name for browsing), do NOT invent or guess values. Instead, respond with a plain text question asking the user for the missing information.
- NEVER fabricate dates, names, or any data the user has not provided.`;

    const response = await adapter.invoke([
      new SystemMessage(toolCallerDirective),
      ...sanitizeMessagesForModel(state.messages),
    ]);

    const hasCalls = response.tool_calls?.length > 0;
    logger.log(
      `LLM tool selection → ${hasCalls ? response.tool_calls.map((tc: any) => tc.name).join(', ') : 'clarifying question'}`,
    );

    // If the LLM returned a plain text question (no tool calls), mark it so the
    // router skips the responder and sends the question directly to the user.
    return { messages: [response], clarifyingQuestion: !hasCalls };
  };
}
