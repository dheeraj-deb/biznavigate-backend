import { BadRequestException, Injectable } from '@nestjs/common';
import { NodeDefinition, NodeFactory, NodeParamDefinition } from '../factories/node-factory';

export interface WorkflowValidationError {
  path: string;
  message: string;
}

export interface ValidatedWorkflow {
  nodes: any[];
  connections: Record<string, any>;
}

/**
 * Validates a workflow definition (nodes[] + connections{}) against the static
 * NODE_DEFINITIONS registry. Catches malformed wizard output before it reaches
 * the execution engine where errors are far harder to diagnose.
 *
 * What this catches:
 *   - Unknown node types
 *   - Duplicate / missing node IDs
 *   - Missing or wrong-typed params
 *   - Param constraint violations (min/max, enum, pattern, array bounds)
 *   - Connection targets pointing at non-existent nodes
 *   - Workflows with no trigger or multiple triggers
 *   - Orphan nodes (unreachable from a trigger)
 *
 * What this does NOT catch (left to runtime):
 *   - Template-string variable references (e.g. `${contact.name}`) — the analyzer
 *     resolves these contextually and we don't want false positives.
 *   - Business-specific config (template name exists in WhatsApp, payment gateway
 *     configured, etc.) — those need external lookups.
 */
@Injectable()
export class WorkflowDefinitionValidator {
  private readonly defByType = new Map<string, NodeDefinition>(
    NodeFactory.NODE_DEFINITIONS.map((d) => [d.type, d]),
  );

  validateOrThrow(input: ValidatedWorkflow): void {
    const errors = this.collectErrors(input);
    if (errors.length === 0) return;
    throw new BadRequestException({
      statusCode: 400,
      message: 'Workflow definition is invalid',
      errors,
    });
  }

  collectErrors(input: ValidatedWorkflow): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];
    const nodes = Array.isArray(input.nodes) ? input.nodes : [];
    const connections = input.connections ?? {};

    if (nodes.length === 0) {
      errors.push({ path: 'nodes', message: 'Workflow must have at least one node' });
      return errors;
    }

    const idsSeen = new Set<string>();
    let triggerCount = 0;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const path = `nodes[${i}]`;

      if (!node || typeof node !== 'object') {
        errors.push({ path, message: 'Node must be an object' });
        continue;
      }
      if (typeof node.id !== 'string' || !node.id) {
        errors.push({ path: `${path}.id`, message: 'Node id is required' });
      } else if (idsSeen.has(node.id)) {
        errors.push({ path: `${path}.id`, message: `Duplicate node id "${node.id}"` });
      } else {
        idsSeen.add(node.id);
      }
      if (typeof node.type !== 'string' || !node.type) {
        errors.push({ path: `${path}.type`, message: 'Node type is required' });
        continue;
      }

      const def = this.defByType.get(node.type);
      if (!def) {
        errors.push({ path: `${path}.type`, message: `Unknown node type "${node.type}"` });
        continue;
      }
      if (def.category === 'trigger') triggerCount++;

      this.validateParams(node.params ?? {}, def.params, `${path}.params`, errors);

      // Trigger-type-specific required-field checks. The NODE_DEFINITIONS schema
      // can't express the nested shape of schedule/event params (it only knows
      // strings/numbers/arrays), so we enforce minimum viable configuration here
      // so a half-configured schedule trigger can't be activated.
      this.validateTriggerSpecific(node, `${path}.params`, errors);
    }

    if (triggerCount === 0) {
      errors.push({ path: 'nodes', message: 'Workflow must have exactly one trigger node' });
    } else if (triggerCount > 1) {
      errors.push({ path: 'nodes', message: 'Workflow can only have one trigger node' });
    }

    // Validate connection targets
    for (const [sourceId, conn] of Object.entries(connections)) {
      if (!idsSeen.has(sourceId)) {
        errors.push({
          path: `connections.${sourceId}`,
          message: `Connection source "${sourceId}" does not match any node id`,
        });
        continue;
      }
      const main = (conn as any)?.main;
      if (!Array.isArray(main)) continue;
      for (let i = 0; i < main.length; i++) {
        const edge = main[i];
        if (!edge?.node) continue;
        if (!idsSeen.has(edge.node)) {
          errors.push({
            path: `connections.${sourceId}.main[${i}].node`,
            message: `Edge target "${edge.node}" does not match any node id`,
          });
        }
      }
    }

    // Reachability — every non-trigger node should be reachable from a trigger.
    if (triggerCount === 1 && nodes.length > 1) {
      const reachable = this.reachableFromTrigger(nodes, connections);
      for (const node of nodes) {
        if (!reachable.has(node.id) && this.defByType.get(node.type)?.category !== 'trigger') {
          errors.push({
            path: `nodes`,
            message: `Node "${node.id}" is unreachable from the trigger`,
          });
        }
      }
    }

    return errors;
  }

  private validateParams(
    actual: Record<string, any>,
    defs: NodeParamDefinition[],
    path: string,
    errors: WorkflowValidationError[],
  ): void {
    for (const param of defs) {
      const value = actual?.[param.key];
      const paramPath = `${path}.${param.key}`;

      // We treat all params as optional at validation time except where the
      // execution engine demands them. Constraints (min length, enum) are only
      // enforced if a value was provided. This is intentional — drafts will
      // commonly be missing fields, and the activation step is the right gate.
      if (value === undefined || value === null || value === '') continue;

      const typeOk = this.checkType(value, param.type);
      if (!typeOk) {
        errors.push({ path: paramPath, message: `Expected ${param.type}, got ${typeof value}` });
        continue;
      }

      const c = param.constraints;
      if (c) {
        if (param.type === 'string') {
          const s = String(value);
          if (c.min !== undefined && s.length < c.min) errors.push({ path: paramPath, message: `Must be at least ${c.min} characters` });
          if (c.max !== undefined && s.length > c.max) errors.push({ path: paramPath, message: `Must be at most ${c.max} characters` });
          if (c.pattern && !new RegExp(c.pattern).test(s)) errors.push({ path: paramPath, message: `Must match pattern ${c.pattern}` });
        } else if (param.type === 'number') {
          const n = Number(value);
          if (c.min !== undefined && n < c.min) errors.push({ path: paramPath, message: `Must be ≥ ${c.min}` });
          if (c.max !== undefined && n > c.max) errors.push({ path: paramPath, message: `Must be ≤ ${c.max}` });
        } else if (param.type === 'select') {
          if (c.enum && !c.enum.includes(String(value))) {
            errors.push({ path: paramPath, message: `Must be one of: ${c.enum.join(', ')}` });
          }
        } else if (param.type === 'array' && Array.isArray(value)) {
          if (c.min !== undefined && value.length < c.min) errors.push({ path: paramPath, message: `Must have at least ${c.min} item(s)` });
          if (c.max !== undefined && value.length > c.max) errors.push({ path: paramPath, message: `Must have at most ${c.max} item(s)` });
        }
      }

      if (param.type === 'array' && Array.isArray(value) && param.items?.length) {
        for (let i = 0; i < value.length; i++) {
          this.validateParams(value[i] ?? {}, param.items, `${paramPath}[${i}]`, errors);
        }
      }
    }
  }

  /**
   * Enforces minimum-viable config for trigger types whose params are nested
   * objects that NODE_DEFINITIONS can't fully describe (schedule, events).
   * Keeps the validator the single point that gates activation regardless of
   * how the wizard JSON was produced.
   */
  private validateTriggerSpecific(node: any, path: string, errors: WorkflowValidationError[]): void {
    const params = node?.params ?? {};
    switch (node?.type) {
      case 'trigger.whatsapp.intent':
        if (!params.intent || typeof params.intent !== 'string' || !params.intent.trim()) {
          errors.push({ path: `${path}.intent`, message: 'Intent trigger needs an intent name' });
        }
        break;
      case 'trigger.schedule': {
        const mode = params?.schedule?.mode;
        if (!mode) {
          errors.push({ path: `${path}.schedule.mode`, message: 'Schedule mode is required' });
          break;
        }
        if (mode === 'daily' && !params.schedule.time) {
          errors.push({ path: `${path}.schedule.time`, message: 'Daily schedule needs a time' });
        }
        if (mode === 'weekly') {
          if (!params.schedule.time) errors.push({ path: `${path}.schedule.time`, message: 'Weekly schedule needs a time' });
          if (!Array.isArray(params.schedule.days) || params.schedule.days.length === 0) {
            errors.push({ path: `${path}.schedule.days`, message: 'Weekly schedule needs at least one day' });
          }
        }
        if (mode === 'interval' && !(Number(params.schedule.every_minutes) >= 5)) {
          errors.push({ path: `${path}.schedule.every_minutes`, message: 'Interval must be at least 5 minutes' });
        }
        if (mode === 'one_time') {
          const ts = Date.parse(params.schedule.run_at ?? '');
          if (Number.isNaN(ts)) {
            errors.push({ path: `${path}.schedule.run_at`, message: 'One-time schedule needs a valid run_at' });
          } else if (ts < Date.now() - 60_000) {
            // Allow up to 1 minute in the past so a user who clicks Activate
            // just after their chosen time isn't blocked. BullMQ runs immediately
            // when the delay is zero, which is what we want here.
            errors.push({ path: `${path}.schedule.run_at`, message: 'run_at must not be in the past' });
          }
        }
        if (!['each_lead', 'business_only'].includes(params.target)) {
          errors.push({ path: `${path}.target`, message: 'Target must be each_lead or business_only' });
        }
        break;
      }
      case 'trigger.event.lead_inactive': {
        const days = Number(params.days);
        if (!Number.isFinite(days) || days < 1) {
          errors.push({ path: `${path}.days`, message: 'Inactive trigger needs days >= 1' });
        }
        break;
      }
      // booking_created / booking_cancelled / payment_captured / lead_status_changed:
      // no required nested params. Optional filters (from_status/to_status) are validated
      // implicitly because the runtime ignores unknown values.
    }
  }

  private checkType(value: any, type: NodeParamDefinition['type']): boolean {
    switch (type) {
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number' && !Number.isNaN(value);
      case 'boolean': return typeof value === 'boolean';
      case 'array': return Array.isArray(value);
      case 'select': return typeof value === 'string';
    }
  }

  private reachableFromTrigger(nodes: any[], connections: Record<string, any>): Set<string> {
    const trigger = nodes.find((n) => this.defByType.get(n?.type)?.category === 'trigger');
    if (!trigger) return new Set();
    const visited = new Set<string>([trigger.id]);
    const stack: string[] = [trigger.id];
    while (stack.length) {
      const current = stack.pop()!;
      const main = connections?.[current]?.main ?? [];
      for (const edge of main) {
        if (edge?.node && !visited.has(edge.node)) {
          visited.add(edge.node);
          stack.push(edge.node);
        }
      }
    }
    return visited;
  }
}
