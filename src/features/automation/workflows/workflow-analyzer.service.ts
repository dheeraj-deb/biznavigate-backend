import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { WhatsAppTemplatesService } from '../../engagement/whatsapp-templates/whatsapp-templates.service';
import { AnalyzerInput, AnalyzerNode, AnalyzerResult } from './workflow-analyzer.types';

// ── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_KEYS: string[] = [
  // Contact
  'contact.name',
  'contact.from',
  'contact.phoneNumberId',
  // Business
  'business.id',
  'business.name',
  'business.type',
  'business.email',
  'business.phone',
  'business.website',
  'business.city',
  'business.address',
  'business.country',
  // Lead
  'lead.id',
  'lead.name',
  'lead.status',
  'lead.phone',
  'lead.email',
  // Runtime
  'user_input',
  'intent.intent',
  // Flat aliases (backward compat)
  'contactName',
  'from',
  'business_name',
];

// Known dot-notation sub-fields for nodes that produce structured outputs.
// These expand what the agent can reference in template variable mappings.
const KNOWN_SUBFIELDS: Record<string, string[]> = {
  'action.collect_filter': [
    'filter_metadata',
    'filter_metadata.filterKey',
    'filter_metadata.filterValue',
    'filter_metadata.selected',
  ],
  'action.rag_search': ['rag_results'],
};

const MAX_ITERATIONS = 30;

// ── Tool schema ───────────────────────────────────────────────────────────────

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_template_details',
      description:
        'Fetches a WhatsApp template from the database by name. ' +
        'Returns the body text with {{1}}, {{2}} placeholders, bodyExamples array ' +
        '(bodyExamples[0] is the sample value for {{1}}, etc.), and header info.',
      parameters: {
        type: 'object',
        properties: {
          template_name: {
            type: 'string',
            description: 'Exact template name (lowercase, underscores)',
          },
          language: {
            type: 'string',
            description: 'Language code, e.g. "en" or "en_US"',
          },
        },
        required: ['template_name', 'language'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_available_context_at_node',
      description:
        'Returns the list of context variable paths that are available when a specific node executes. ' +
        'Only these paths (or "$Literal" values) are valid for template variable mappings.',
      parameters: {
        type: 'object',
        properties: {
          node_id: {
            type: 'string',
            description: 'The workflow node ID',
          },
        },
        required: ['node_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_node_variable_mapping',
      description:
        'Writes the variable mapping for an action.send_template node. ' +
        'variables[0] maps to {{1}}, variables[1] to {{2}}, etc. ' +
        'Use context paths like "contactName", "lead.name", or "metadata.payload.booking_link". ' +
        'Use "$Text" prefix for hard-coded literal values. ' +
        'Set header_variable to empty string if the template has no text header variable.',
      parameters: {
        type: 'object',
        properties: {
          node_id: {
            type: 'string',
            description: 'ID of the action.send_template node',
          },
          variables: {
            type: 'array',
            items: { type: 'string' },
            description: 'Ordered context paths for {{1}}, {{2}}, ... body variables',
          },
          header_variable: {
            type: 'string',
            description:
              'Context path for header {{1}}, or empty string if not applicable',
          },
        },
        required: ['node_id', 'variables'],
      },
    },
  },
];

// ── Agent state ───────────────────────────────────────────────────────────────

interface AgentState {
  nodeMap: Map<string, AnalyzerNode>;
  contextAtNode: Map<string, Set<string>>;
  business_id: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class WorkflowAnalyzerService {
  private readonly logger = new Logger(WorkflowAnalyzerService.name);
  private readonly openai = new OpenAI();

  constructor(private readonly templatesService: WhatsAppTemplatesService) { }


  async analyze(input: AnalyzerInput): Promise<AnalyzerResult> {
    const { business_id, nodes, connections } = input;

    const templateNodes = nodes.filter((n) => n.type === 'action.send_template');
    if (templateNodes.length === 0) {
      return { nodes, connections };
    }

    const mutableNodes: AnalyzerNode[] = JSON.parse(JSON.stringify(nodes));
    const nodeMap = new Map(mutableNodes.map((n) => [n.id, n]));
    const contextAtNode = this.buildContextMap(mutableNodes, connections);

    const state: AgentState = { nodeMap, contextAtNode, business_id };

    const templateNodeSummaries = templateNodes.map((n) => ({
      node_id: n.id,
      node_name: n.name,
      template_name: n.params?.template_name ?? '',
      language: n.params?.language ?? 'en',
    }));

    const nodeGraph = mutableNodes.map((n) => ({
      id: n.id,
      type: n.type,
      name: n.name,
      output_variable: n.output_variable ?? null,
    }));

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(),
      },
      {
        role: 'user',
        content:
          `Analyze this workflow and map variables for all action.send_template nodes.\n\n` +
          `Template nodes to process:\n${JSON.stringify(templateNodeSummaries, null, 2)}\n\n` +
          `Full node list (for graph context):\n${JSON.stringify(nodeGraph, null, 2)}`,
      },
    ];

    // ── Agentic loop ──────────────────────────────────────────────────────────
    let iteration = 0;
    while (iteration < MAX_ITERATIONS) {
      iteration++;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        tools: TOOLS,
        tool_choice: 'auto',
        messages,
      });

      const choice = response.choices[0];
      console.log("choice==>")
      console.dir(choice, { depth: null });
      messages.push({ role: 'assistant', content: choice.message.content ?? null, tool_calls: choice.message.tool_calls });

      if (choice.finish_reason === 'stop') {
        this.logger.log(`WorkflowAnalyzer: completed in ${iteration} iteration(s)`);
        break;
      }

      if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        const toolResults: OpenAI.ChatCompletionToolMessageParam[] = [];

        for (const toolCall of choice.message.tool_calls) {
          // Only handle function-type tool calls
          if (toolCall.type !== 'function') continue;

          let result: string;
          try {
            const args = JSON.parse(toolCall.function.arguments);
            result = await this.dispatchTool(state, toolCall.function.name, args);
          } catch (err) {
            result = `ERROR: ${err.message}`;
            this.logger.warn(`Tool ${toolCall.function.name} error: ${err.message}`);
          }

          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result,
          });
        }

        messages.push(...toolResults);
      }
    }

    return {
      nodes: Array.from(nodeMap.values()),
      connections,
    };
  }


  private buildContextMap(
    nodes: AnalyzerNode[],
    connections: Record<string, any>,
  ): Map<string, Set<string>> {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const contextAtNode = new Map<string, Set<string>>();
    const visited = new Set<string>();

    // BFS queue: [nodeId, contextSoFar]
    const queue: Array<[string, Set<string>]> = [];

    for (const node of nodes) {
      if (node.type.startsWith('trigger.')) {
        queue.push([node.id, new Set(SYSTEM_KEYS)]);
      }
    }

    console.dir(queue, { depth: null })

    // Fallback: if no trigger found, start every node with system context
    if (queue.length === 0) {
      for (const node of nodes) {
        queue.push([node.id, new Set(SYSTEM_KEYS)]);
      }
    }

    while (queue.length > 0) {
      const [nodeId, ctx] = queue.shift()!;
      console.log("queuw", queue)
      console.log("ctx", nodeId, ctx)
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      // Union into contextAtNode
      if (!contextAtNode.has(nodeId)) {
        contextAtNode.set(nodeId, new Set(ctx));
      } else {
        for (const k of ctx) contextAtNode.get(nodeId)!.add(k);
      }

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      // Build context available to children
      const childCtx = new Set(ctx);
      if (node.output_variable) {
        console.log("output vaiable", node.output_variable)
        childCtx.add(node.output_variable);
      }
      console.log("childctx", childCtx)
      const subfields = KNOWN_SUBFIELDS[node.type] ?? [];
      for (const f of subfields) childCtx.add(f);

      // Traverse main connections
      const conn = connections[nodeId];
      if (conn) {
        const edges: any[] = conn.main ?? conn.routes ?? [];
        for (const edge of edges) {
          if (edge?.to) queue.push([edge.to, new Set(childCtx)]);
        }
        // Also follow default edge
        if (conn.default?.to) queue.push([conn.default.to, new Set(childCtx)]);
      }
    }

    console.log("contextAtNode", contextAtNode);

    return contextAtNode;
  }

  // ── Tool dispatch ─────────────────────────────────────────────────────────

  private async dispatchTool(
    state: AgentState,
    toolName: string,
    args: Record<string, any>,
  ): Promise<string> {
    switch (toolName) {
      case 'get_template_details':
        return this.toolGetTemplateDetails(state, args.template_name, args.language);
      case 'get_available_context_at_node':
        return this.toolGetAvailableContextAtNode(state, args.node_id);
      case 'set_node_variable_mapping':
        return this.toolSetNodeVariableMapping(
          state,
          args.node_id,
          args.variables ?? [],
          args.header_variable,
        );
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  }

  // ── Tool implementations ──────────────────────────────────────────────────

  private async toolGetTemplateDetails(
    state: AgentState,
    template_name: string,
    language: string,
  ): Promise<string> {
    try {
      const template = await this.templatesService.findByName(
        state.business_id,
        template_name,
      );

      const body: string = template.components?.body ?? '';
      const bodyVarMatches = body.match(/\{\{(\d+)\}\}/g) ?? [];
      const variableCount = new Set(
        bodyVarMatches.map((m) => m.replace(/[{}]/g, '')),
      ).size;

      const header = template.components?.header;
      const hasHeaderVariable =
        header?.type === 'TEXT' && header?.text?.includes('{{1}}');

      return JSON.stringify({
        name: template.name,
        language: template.language,
        status: template.status,
        body,
        bodyExamples: template.components?.bodyExamples ?? [],
        variableDescriptions: template.components?.variableDescriptions ?? [],
        variableCount,
        header: header
          ? {
            type: header.type,
            text: header.text ?? null,
            example: header.example ?? null,
            hasVariable: hasHeaderVariable,
          }
          : null,
        footer: template.components?.footer ?? null,
      });
    } catch (err) {
      return JSON.stringify({
        error: `Template "${template_name}" not found: ${err.message}`,
      });
    }
  }

  private toolGetAvailableContextAtNode(
    state: AgentState,
    node_id: string,
  ): string {
    const ctx = state.contextAtNode.get(node_id);
    if (!ctx) {
      return JSON.stringify({
        warning:
          'Node not reachable from any trigger. Showing system context only.',
        available_paths: [...SYSTEM_KEYS].sort(),
      });
    }
    return JSON.stringify({
      node_id,
      available_paths: [...ctx].sort(),
    });
  }

  private toolSetNodeVariableMapping(
    state: AgentState,
    node_id: string,
    variables: string[],
    header_variable?: string,
  ): string {
    const node = state.nodeMap.get(node_id);
    if (!node) {
      return JSON.stringify({ error: `Node "${node_id}" not found` });
    }
    if (node.type !== 'action.send_template') {
      return JSON.stringify({
        error: `Node "${node_id}" is type "${node.type}", not action.send_template`,
      });
    }

    node.params = node.params ?? {};
    node.params.variables = variables;
    node.params.header_variable = header_variable ?? '';

    this.logger.debug(
      `Mapped template node "${node.name}" (${node_id}): variables=${JSON.stringify(variables)}, header_variable="${header_variable ?? ''}"`,
    );

    return JSON.stringify({ success: true, node_id, variables, header_variable: header_variable ?? '' });
  }

  // ── System prompt ─────────────────────────────────────────────────────────

  private buildSystemPrompt(): string {
    return `You are a workflow variable mapping agent for a WhatsApp automation platform.

Your job is to analyze workflow node graphs and automatically fill in the variable mappings for "action.send_template" nodes. A template node sends an approved WhatsApp message where body placeholders {{1}}, {{2}}, etc. are substituted from a runtime context object.

## Runtime Context

When a workflow executes, there is a context object. Variables are referenced by dot-notation paths. The following are ALWAYS available:

Contact:
- contact.name — contact's display name (e.g. "John")
- contact.from — customer's WhatsApp number (e.g. "919539192684")
- contact.phoneNumberId — WhatsApp Business phone number ID

Business:
- business.id — business UUID
- business.name — business name (e.g. "Grand Hotel")
- business.type — type of business (e.g. "hotel", "restaurant", "retail")
- business.email — business email address
- business.phone — business phone number
- business.website — business website URL
- business.city — business city (e.g. "Wayanad")
- business.address — business street address
- business.country — business country

Lead:
- lead.id — lead UUID
- lead.name — lead's full name
- lead.status — lead status (e.g. "active")
- lead.phone, lead.email — lead contact details

Runtime:
- user_input — last raw text the user sent
- intent.intent — detected intent (e.g. "BOOKING")

Flat aliases (also available for backward compatibility):
- contactName (same as contact.name)
- from (same as contact.from)
- business_name (same as business.name)

## Node Output Variables

After a node executes, its output becomes available in context for all downstream nodes:
- action.send_message_withmenu → menu_selection
- action.send_message_with_btns → button_selection
- action.wait_for_text → user_input (overwrites the system user_input)
- action.send_catalog → catalog_selection
- action.send_payment_request → payment_reference_id
- action.rag_search → rag_results
- action.collect_filter → filter_metadata, filter_metadata.filterKey, filter_metadata.filterValue, filter_metadata.selected

## Variable Path Rules

1. Dot-notation resolves into context: "metadata.payload.booking_link" → context.metadata.payload.booking_link
2. Use "$" prefix for literal strings: "$Confirmed" → the text "Confirmed" (not a context lookup)
3. variables[] is position-ordered: variables[0] → {{1}}, variables[1] → {{2}}, etc.
4. If a template has no body variables, set variables to []
5. header_variable: set only if the template header is TEXT type with a {{1}} placeholder; otherwise set to empty string ""

## Your Process

For each action.send_template node:

1. Call get_template_details(template_name, language)
   - **variableDescriptions[N-1]** is the most reliable source — use it first if present (e.g., "Guest name" → contact.name)
   - Read bodyExamples[N-1] for the sample value Meta approved (helpful when description is absent)
   - Read the surrounding body text to understand what each {{N}} represents
   - Check if header has a {{1}} variable

2. Call get_available_context_at_node(node_id)
   - See exactly which context paths are available at that node's position in the graph

3. Infer the best mapping — priority order: variableDescriptions → bodyExamples → body text:
   - If bodyExamples[0] looks like a person's name → use "contact.name" or "lead.name"
   - If the body says "Booking Link" or contains a URL → use "metadata.payload.booking_link" when available
   - Check-in / check-out dates → use "metadata.payload.check_in" / "metadata.payload.check_out" when available
   - Stay dates/date range → use "metadata.payload.dates" when available
   - Number of guests → use "metadata.payload.guests" when available
   - If the body says "business {{1}}" or "at {{1}}" near a business name → use "business.name"
   - If the body references a city or location → use "business.city"
   - If no good match exists → use "$" + the bodyExample value as a literal fallback

4. Call set_node_variable_mapping(node_id, variables, header_variable)

Process ALL action.send_template nodes. Once you have called set_node_variable_mapping for every template node, stop.`;
  }
}
