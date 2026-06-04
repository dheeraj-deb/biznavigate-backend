import { StateGraph, END, MemorySaver } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import { AgentState, AgentStateType } from './agent-state';
import { makeTriageNode } from '../nodes/triage.node';
import { makeToolCallerNode } from '../nodes/tool-caller.node';
import { makeResponderNode } from '../nodes/responder.node';
import { buildToolsForVertical, ToolDeps } from '../tools';
import { PrismaService } from '../../../../prisma/prisma.service';
import { languageLabel } from '../utils/language-detector';
import { AgentModelConfig } from './llm-factory';

export type AgentGraphDeps = {
  modelConfig: AgentModelConfig;
  prisma: PrismaService;
} & ToolDeps;

// Intents that require tool calls; others go straight to the responder
const TOOL_INTENTS = new Set([
  'browse', 'booking', 'cancellation', 'status', 'faq', 'payment', 'handoff', 'complaint', 'support',
]);

function routeAfterTriage(state: AgentStateType): string {
  if (state.intent === 'other') return 'out_of_scope';
  if (TOOL_INTENTS.has(state.intent)) return 'tool_caller';
  return 'responder';
}

function shouldContinueAfterTools(state: AgentStateType): string {
  // If the tool_caller asked a clarifying question, send it directly to the user.
  if (state.clarifyingQuestion) return 'end';

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

  const triage = makeTriageNode(deps.modelConfig);
  const toolCaller = makeToolCallerNode(deps.modelConfig, tools);
  const responder = makeResponderNode(deps.modelConfig, tools);
  const outOfScope = async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    const language = languageLabel(state.customerLanguage);
    const contentByLanguage: Record<string, string> = {
      English: 'I can only help with questions about our products and services. How can I assist you today?',
      Hindi: 'मैं केवल हमारे products और services से जुड़े सवालों में मदद कर सकता हूँ। मैं आपकी कैसे मदद करूँ?',
      Malayalam: 'ഞങ്ങളുടെ products, services എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾക്ക് മാത്രമേ എനിക്ക് സഹായിക്കാനാകൂ. എങ്ങനെ സഹായിക്കാം?',
      Tamil: 'எங்கள் products மற்றும் services பற்றிய கேள்விகளுக்கு மட்டுமே நான் உதவ முடியும். எப்படி உதவலாம்?',
    };

    return {
      messages: [new AIMessage(contentByLanguage[language] ?? contentByLanguage.English)],
    };
  };

  // MemorySaver avoids pg.Pool which contaminates PgCat transaction-mode backends
  // with prepared statements (PGCAT_XXXX), breaking all other Prisma queries.
  const checkpointer = new MemorySaver();

  const graph = new StateGraph(AgentState)
    .addNode('triage', triage)
    .addNode('tool_caller', toolCaller)
    .addNode('responder', responder)
    .addNode('out_of_scope', outOfScope)
    .addEdge('__start__', 'triage')
    .addConditionalEdges('triage', routeAfterTriage, {
      tool_caller: 'tool_caller',
      responder: 'responder',
      out_of_scope: 'out_of_scope',
    })
    .addEdge('out_of_scope', END)
    .addConditionalEdges('tool_caller', shouldContinueAfterTools, {
      tool_caller: 'tool_caller',
      responder: 'responder',
      end: END,
    })
    .addEdge('responder', END);

  return graph.compile({ checkpointer });
}
