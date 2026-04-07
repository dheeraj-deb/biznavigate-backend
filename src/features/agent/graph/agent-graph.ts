import { StateGraph, END } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { AIMessage } from '@langchain/core/messages';
import { AgentState, AgentStateType } from './agent-state';
import { makeIntentDetectorNode } from '../nodes/intent-detector.node';
import { makeToolCallerNode } from '../nodes/tool-caller.node';
import { makeResponderNode } from '../nodes/responder.node';
import { buildTools, ToolDeps } from '../tools';

export type AgentGraphDeps = {
  openaiApiKey: string;
} & ToolDeps;

// Intents that need tool calls vs. intents the LLM can answer directly
const TOOL_INTENTS = new Set(['booking', 'cancellation', 'status', 'payment', 'handoff', 'complaint', 'support']);

function routeAfterIntent(state: AgentStateType): string {
  if (TOOL_INTENTS.has(state.intent)) return 'tool_caller';
  // greeting, faq, complaint, support, handoff, other → responder handles directly
  return 'responder';
}

function shouldContinueAfterTools(state: AgentStateType): string {
  const last = state.messages.at(-1);
  // If the last message is a HANDOFF or FLOW signal, go directly to END via responder (which will pass it through)
  if (last instanceof AIMessage) {
    const content = typeof last.content === 'string' ? last.content : '';
    if (content.startsWith('HANDOFF:') || content.startsWith('FLOW:')) return 'responder';
    // If the LLM returned tool_calls, loop back to execute them
    if (last.tool_calls?.length) return 'tool_caller';
    // No tool calls — if we still have retries left, loop back (tool_caller handles the nudge)
    if (!last.tool_calls?.length && state.toolRetries < 1) return 'tool_caller';
  }
  return 'responder';
}

export async function buildAgentGraph(deps: AgentGraphDeps & { databaseUrl: string }) {
  const tools = buildTools(deps);
  const intentDetector = makeIntentDetectorNode(deps.openaiApiKey);
  const toolCaller = makeToolCallerNode(deps.openaiApiKey, tools);
  const responder = makeResponderNode(deps.openaiApiKey, tools);

  const checkpointer = new PostgresSaver(
    new (await import('pg')).Pool({
      connectionString: deps.databaseUrl,
      ssl: { rejectUnauthorized: false },
    }),
  );
  await checkpointer.setup(); // creates langgraph checkpoint tables if they don't exist

  const graph = new StateGraph(AgentState)
    .addNode('intent_detector', intentDetector)
    .addNode('tool_caller', toolCaller)
    .addNode('responder', responder)
    .addEdge('__start__', 'intent_detector')
    .addConditionalEdges('intent_detector', routeAfterIntent, {
      tool_caller: 'tool_caller',
      responder: 'responder',
    })
    .addConditionalEdges('tool_caller', shouldContinueAfterTools, {
      tool_caller: 'tool_caller',
      responder: 'responder',
    })
    .addEdge('responder', END);

  return graph.compile({ checkpointer });
}
