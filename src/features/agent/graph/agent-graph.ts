import { StateGraph, END } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { AIMessage } from '@langchain/core/messages';
import { AgentState, AgentStateType } from './agent-state';
import { makeTriageNode } from '../nodes/triage.node';
import { makeToolCallerNode } from '../nodes/tool-caller.node';
import { makeResponderNode } from '../nodes/responder.node';
import { buildToolsForVertical, ToolDeps } from '../tools';
import { PrismaService } from '../../../prisma/prisma.service';

export type AgentGraphDeps = {
  openaiApiKey: string;
  databaseUrl: string;
  prisma: PrismaService;
} & ToolDeps;

// Intents that require tool calls; others go straight to the responder
const TOOL_INTENTS = new Set([
  'browse', 'booking', 'cancellation', 'status', 'payment', 'handoff', 'complaint', 'support',
]);

function routeAfterTriage(state: AgentStateType): string {
  if (TOOL_INTENTS.has(state.intent)) return 'tool_caller';
  return 'responder';
}

function shouldContinueAfterTools(state: AgentStateType): string {
  const last = state.messages.at(-1);
  if (last instanceof AIMessage) {
    const content = typeof last.content === 'string' ? last.content : '';
    if (content.startsWith('HANDOFF:') || content.startsWith('FLOW:')) return 'responder';
    if (last.tool_calls?.length) return 'tool_caller';
  }
  return 'responder';
}

export async function buildAgentGraph(deps: AgentGraphDeps) {
  // Build a universal tool set that covers all verticals.
  // The tool-caller prompt + system prompt adapt based on businessType at runtime.
  // This means one compiled graph handles every business on the platform.
  const tools = buildToolsForVertical('default', deps);

  const triage = makeTriageNode(deps.openaiApiKey, deps.prisma);
  const toolCaller = makeToolCallerNode(deps.openaiApiKey, tools);
  const responder = makeResponderNode(deps.openaiApiKey, tools);

  const checkpointer = new PostgresSaver(
    new (await import('pg')).Pool({
      connectionString: deps.databaseUrl,
      ssl: { rejectUnauthorized: false },
    }),
  );
  await checkpointer.setup();

  const graph = new StateGraph(AgentState)
    .addNode('triage', triage)
    .addNode('tool_caller', toolCaller)
    .addNode('responder', responder)
    .addEdge('__start__', 'triage')
    .addConditionalEdges('triage', routeAfterTriage, {
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
