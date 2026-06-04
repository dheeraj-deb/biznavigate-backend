import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { KafkaConsumerService } from '../../kafka/kafka-consumer.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Workflow } from './core/workflow';
import { WorkflowParameters, WorkflowProcessingContext } from './interfaces';
import { NodeFactory } from './factories/node-factory';
import { ConversationService } from '../../crm/conversation/conversation.service';
import { CreateWorkflowDto, InitiateWorkflowDto, UpdateWorkflowDto } from './dto/save-workflow.dto';
import { WorkflowAnalyzerService } from './workflow-analyzer.service';
import { WorkflowDefinitionValidator } from './validation/workflow-definition.validator';
import { evaluateTrigger } from './triggers/trigger-evaluator';
import { MessageWindowService } from '../../crm/conversation/messaging-window/message-window.service';
import { WorkflowSchedulerService } from './schedule/workflow-scheduler.service';
import { ScheduleTriggerParams } from './triggers/trigger-schemas';
import { WorkflowDefinition, WorkflowDefinitionDocument } from './schema/workflow-definition.schema';
import { BusinessWorkflow, BusinessWorkflowDocument } from './schema/business-workflow.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from './schema/workflow-execution.schema';

// Action node types that produce a free-form WhatsApp message. Sends from these
// require an open 24-hour customer-service window. Templates (action.send_template)
// and approved interactive flows (action.send_flow) are intentionally excluded
// because they're allowed outside the window.
const FREE_FORM_WHATSAPP_SEND_TYPES = new Set([
  'action.send_message',
  'action.send_message_withmenu',
  'action.send_message_with_btns',
  'action.wait_for_text',
  'action.collect_filter',
  'action.send_catalog',
  'action.send_payment_request',
  'action.rag_chat',
]);

@Injectable()
export class WorkflowsService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowsService.name);
  private readonly WORKFLOW_DROP_DELAY_MS = 30 * 60 * 1000;
  private readonly workflowStepStartedAt = new Map<string, number>();

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly prisma: PrismaService,
    private readonly nodeFactory: NodeFactory,
    private readonly conversationService: ConversationService,
    @InjectModel(WorkflowDefinition.name) private readonly workflowDefinitionModel: Model<WorkflowDefinitionDocument>,
    @InjectModel(BusinessWorkflow.name) private readonly businessWorkflowModel: Model<BusinessWorkflowDocument>,
    @InjectModel(WorkflowExecution.name) private readonly workflowExecutionModel: Model<WorkflowExecutionDocument>,
    private readonly workflowAnalyzer: WorkflowAnalyzerService,
    private readonly definitionValidator: WorkflowDefinitionValidator,
    private readonly scheduler: WorkflowSchedulerService,
    private readonly messageWindow: MessageWindowService,
    @InjectQueue('workflow-timeouts') private readonly workflowTimeoutQueue: Queue,
  ) {
  }

  async onModuleInit() {
    this.kafkaConsumer.registerMessageHandler('workflow-orchestration-global', {
      handleAiResponse: async (aiResult: WorkflowProcessingContext) => {
        await this.handleIncomingMessage(aiResult);
      },
    });

    await this.dropStaleBusinessWorkflowIndexes();
  }

  // One-time cleanup: a previous schema had an `intent_name` field with a unique
  // (business_id, intent_name) index. The field is gone but the index lingers in
  // existing Mongo deployments, so every insert writes intent_name: null and the
  // second insert per business collides. Drop it if present.
  private async dropStaleBusinessWorkflowIndexes() {
    const STALE = 'business_id_1_intent_name_1';
    try {
      const indexes = await this.businessWorkflowModel.collection.indexes();
      if (indexes.some((i) => i.name === STALE)) {
        await this.businessWorkflowModel.collection.dropIndex(STALE);
        this.logger.log(`Dropped stale index ${STALE} on business_workflows`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not drop stale index ${STALE}: ${err?.message ?? err}`);
    }
  }

  getNodeDefinitions() {
    return this.nodeFactory.getNodeDefinitions();
  }

  /**
   * Returns all variables a user can reference in node params.
   *
   * system   — always available from WorkflowNodeExecutionContext
   * node     — output variables produced by specific node types
   *            (pass nodeTypes[] to filter to only nodes used in the workflow)
   */
  getAvailableVariables(nodeTypes: string[] = []) {
    const system = [
      // Contact
      { path: 'contact.name', label: 'Contact Name', example: 'Dheeraj' },
      { path: 'contact.from', label: 'Customer Phone', example: '919539192684' },
      { path: 'contact.phoneNumberId', label: 'WhatsApp Phone Number ID', example: '123456789' },
      // Business
      { path: 'business.name', label: 'Business Name', example: 'Grand Hotel' },
      { path: 'business.type', label: 'Business Type', example: 'hotel' },
      { path: 'business.email', label: 'Business Email', example: 'info@grandhotel.com' },
      { path: 'business.phone', label: 'Business Phone', example: '+919876543210' },
      { path: 'business.website', label: 'Business Website', example: 'https://grandhotel.com' },
      { path: 'business.city', label: 'Business City', example: 'Wayanad' },
      { path: 'business.address', label: 'Business Address', example: '123 Main St, Kalpetta' },
      { path: 'business.country', label: 'Business Country', example: 'India' },
      // Lead
      { path: 'lead.id', label: 'Lead ID', example: 'uuid...' },
      { path: 'lead.name', label: 'Lead Name', example: 'Dheeraj Kumar' },
      { path: 'lead.status', label: 'Lead Status', example: 'active' },
      { path: 'lead.phone', label: 'Lead Phone', example: '919539192684' },
      { path: 'lead.email', label: 'Lead Email', example: 'user@example.com' },
      // Runtime
      { path: 'user_input', label: 'Last User Message', example: 'Hello' },
      { path: 'intent.intent', label: 'Detected Intent', example: 'BOOKING' },
      // Flat aliases (for backward compat with node template strings)
      { path: 'contactName', label: 'Contact Name (alias)', example: 'Dheeraj' },
      { path: 'from', label: 'Customer Phone (alias)', example: '919539192684' },
      { path: 'business_name', label: 'Business Name (alias)', example: 'Grand Hotel' },
    ];

    // Each node type's output variable and the sub-fields it typically exposes
    const nodeOutputs: Record<string, { path: string; label: string; example: string }[]> = {
      'action.send_message_withmenu': [
        { path: 'menu_selection', label: 'Menu Selection (ID)', example: 'option_1' },
      ],
      'action.send_message_with_btns': [
        { path: 'button_selection', label: 'Button Selection (ID)', example: 'btn_yes' },
      ],
      'action.wait_for_text': [
        { path: 'user_input', label: 'User Text Reply', example: 'Any text' },
      ],
      'action.collect_filter': [
        { path: 'filter_metadata.filterKey', label: 'Filter Key', example: 'gender' },
        { path: 'filter_metadata.filterValue', label: 'Filter Value', example: 'male' },
        { path: 'filter_metadata.selected', label: 'Selected Option ID', example: 'men' },
      ],
      'action.send_catalog': [
        { path: 'catalog_selection', label: 'Selected Product ID', example: 'prod_abc' },
      ],
      'action.send_flow': [
        { path: 'flow_response', label: 'Flow Response (raw)', example: '{}' },
        { path: 'flow_response.booking_id', label: 'Booking ID', example: 'BK-001' },
        { path: 'flow_response.guest_name', label: 'Guest Name', example: 'Dheeraj' },
        { path: 'flow_response.label_checkin', label: 'Check-in Label', example: 'Check-in: 2026-03-18' },
        { path: 'flow_response.label_checkout', label: 'Check-out Label', example: 'Check-out: 2026-03-20' },
        { path: 'flow_response.label_nights', label: 'Nights Label', example: 'Nights: 2' },
        { path: 'flow_response.label_total', label: 'Total Label', example: 'Total: ₹5000' },
      ],
      'action.send_payment_request': [
        { path: 'payment_reference_id', label: 'Payment Reference ID', example: 'pay_xyz' },
      ],
      'action.rag_search': [
        { path: 'rag_results', label: 'RAG Search Results', example: '[{...}]' },
      ],
      'action.change_lead_status': [
        { path: 'lead_status_result.status', label: 'Updated Lead Status', example: 'booked' },
        { path: 'lead_status_result.stage_id', label: 'Updated Stage ID', example: 'uuid...' },
      ],
      'action.move_lead_stage': [
        { path: 'lead_stage_result.moved', label: 'Lead Stage Moved', example: 'true' },
        { path: 'lead_stage_result.stage_slug', label: 'Target Stage Slug', example: 'booked' },
      ],
      'action.call_ai_action': [
        { path: 'ai_action_result.action', label: 'AI Action Name', example: 'create_hospitality_booking' },
        { path: 'ai_action_result.status', label: 'AI Action Status', example: 'completed' },
        { path: 'ai_action_result.result.booking_id', label: 'Created Booking ID', example: 'uuid...' },
        { path: 'ai_action_result.result.status', label: 'Action Result Status', example: 'open' },
      ],
    };

    const nodeVariables =
      nodeTypes.length > 0
        ? nodeTypes.flatMap((t) => nodeOutputs[t] ?? [])
        : Object.values(nodeOutputs).flat();

    // deduplicate by path
    const seen = new Set<string>();
    const unique = nodeVariables.filter((v) => {
      if (seen.has(v.path)) return false;
      seen.add(v.path);
      return true;
    });

    return { system, node_outputs: unique };
  }

  async initiateWorkflow(dto: InitiateWorkflowDto) {
    const { workflow_name, business_id, description } = dto;

    const business = await this.prisma.businesses.findUnique({
      where: { business_id },
      select: { business_type: true, tenant_id: true },
    });
    if (!business) throw new NotFoundException(`Business ${business_id} not found`);

    const workflow_id = crypto.randomUUID();
    const workflow_key = `${workflow_name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

    await this.workflowDefinitionModel.create({
      workflow_id,
      workflow_name,
      business_type: business.business_type ?? 'general',
      description,
      version: '1.0.0',
      workflow_definition: { nodes: [], connections: {} },
      is_active: false,
    });

    await this.businessWorkflowModel.create({
      business_id,
      tenant_id: business.tenant_id,
      workflow_id,
      is_active: false,
    });

    return { workflow_id };
  }

  async createWorkflow(dto: CreateWorkflowDto) {
    const { workflow_id, workflow_name, business_id, nodes, connections, description, is_active } = dto;

    const business = await this.prisma.businesses.findUnique({
      where: { business_id },
      select: { business_type: true, tenant_id: true },
    });
    if (!business) throw new NotFoundException(`Business ${business_id} not found`);

    const business_type: string = business.business_type ?? 'general';

    // Validate before any analyzer/persist work. Drafts may be incomplete, so we
    // only HARD-fail when the caller is activating the workflow. Otherwise we log
    // the errors and let the user keep iterating.
    const enrichedConnections = this.enrichConnectionsWithConditions(nodes, connections);
    if (is_active) {
      this.definitionValidator.validateOrThrow({ nodes, connections: enrichedConnections });
    } else {
      const errors = this.definitionValidator.collectErrors({ nodes, connections: enrichedConnections });
      if (errors.length) {
        this.logger.warn(
          `Workflow saved as draft with ${errors.length} validation issue(s): ${errors
            .slice(0, 5)
            .map((e) => `${e.path}: ${e.message}`)
            .join('; ')}`,
        );
      }
    }

    // AI variable mapping — auto-maps template node variables before saving
    let analyzedNodes = nodes;
    let analyzedConnections = enrichedConnections;
    try {
      const analyzed = await this.workflowAnalyzer.analyze({
        business_id,
        nodes,
        connections: enrichedConnections,
      });
      analyzedNodes = analyzed.nodes;
      analyzedConnections = analyzed.connections;
    } catch (err) {
      this.logger.error(`WorkflowAnalyzer failed, saving with original nodes: ${err.message}`, err.stack);
    }

    if (workflow_id) {
      if (is_active) {
        await this.deactivateConflictingActiveWorkflows(business_id, workflow_id, analyzedNodes);
      }

      const workflowDef = await this.workflowDefinitionModel.findOneAndUpdate(
        { workflow_id },
        {
          $set: {
            workflow_name,
            business_type,
            description,
            workflow_definition: { nodes: analyzedNodes, connections: analyzedConnections },
            is_active: is_active ?? true,
          }
        },
        { returnDocument: 'after' },
      );

      await this.businessWorkflowModel.findOneAndUpdate(
        { workflow_id },
        { $set: { is_active: is_active ?? true } },
        { upsert: true, returnDocument: 'after' },
      );

      await this.syncSchedule(workflow_id, business_id, analyzedNodes, is_active ?? true);
      return workflowDef;
    }

    const existingLink = await this.businessWorkflowModel.findOne({ business_id });

    if (existingLink) {
      if (is_active) {
        await this.deactivateConflictingActiveWorkflows(business_id, existingLink.workflow_id, analyzedNodes);
      }

      const workflowDef = await this.workflowDefinitionModel.findOneAndUpdate(
        { workflow_id: existingLink.workflow_id },
        {
          $set: {
            workflow_name,
            description,
            workflow_definition: { nodes: analyzedNodes, connections: analyzedConnections },
            is_active: is_active ?? true,
          }
        },
        { returnDocument: 'after' },
      );
      await this.businessWorkflowModel.findOneAndUpdate(
        { _id: existingLink._id },
        { $set: { is_active: is_active ?? true } },
      );
      await this.syncSchedule(existingLink.workflow_id, business_id, analyzedNodes, is_active ?? true);
      return workflowDef;
    }

    const new_workflow_id = crypto.randomUUID();
    if (is_active) {
      await this.deactivateConflictingActiveWorkflows(business_id, new_workflow_id, analyzedNodes);
    }

    const workflowDef = await this.workflowDefinitionModel.create({
      workflow_id: new_workflow_id,
      workflow_name,
      business_type,
      description,
      version: '1.0.0',
      workflow_definition: { nodes: analyzedNodes, connections: analyzedConnections },
      is_active: is_active ?? true,
    });

    await this.businessWorkflowModel.create({
      business_id,
      tenant_id: business.tenant_id,
      workflow_id: new_workflow_id,
      is_active: is_active ?? true,
    });

    await this.syncSchedule(new_workflow_id, business_id, analyzedNodes, is_active ?? true);
    return workflowDef;
  }

  /**
   * After any persistence event for a workflow, make sure BullMQ matches the
   * current desired state. If the workflow is active and has a schedule
   * trigger, (re)register it. Otherwise tear down any previous schedule.
   */
  private async syncSchedule(
    workflow_id: string,
    business_id: string,
    nodes: any[],
    isActive: boolean,
  ): Promise<void> {
    const scheduleNode = (nodes ?? []).find((n) => n?.type === 'trigger.schedule');
    try {
      if (isActive && scheduleNode?.params) {
        await this.scheduler.schedule(workflow_id, business_id, scheduleNode.params as ScheduleTriggerParams);
      } else {
        await this.scheduler.unschedule(workflow_id);
      }
    } catch (err: any) {
      this.logger.error(`syncSchedule for ${workflow_id} failed: ${err.message}`, err.stack);
    }
  }

  async updateWorkflow(dto: UpdateWorkflowDto) {
    const { workflow_id, workflow_name, nodes, connections, description, is_active } = dto;
    let candidateNodes = nodes;
    let candidateConnections = connections;

    // If activating, validate against the definition that will be active after
    // this write (caller-supplied if present, otherwise the stored definition).
    if (is_active) {
      if (!candidateNodes || !candidateConnections) {
        const existing = await this.workflowDefinitionModel.findOne({ workflow_id }).lean();
        candidateNodes = candidateNodes ?? (existing?.workflow_definition?.nodes as any[]);
        candidateConnections = candidateConnections ?? (existing?.workflow_definition?.connections as Record<string, any>);
      }
      if (candidateNodes && candidateConnections) {
        this.definitionValidator.validateOrThrow({
          nodes: candidateNodes,
          connections: candidateConnections,
        });
      }
    }

    const link = await this.businessWorkflowModel.findOne({ workflow_id }).lean();
    if (is_active && link?.business_id) {
      await this.deactivateConflictingActiveWorkflows(link.business_id, workflow_id, nodes ?? candidateNodes ?? []);
    }

    const updated = await this.workflowDefinitionModel.findOneAndUpdate(
      { workflow_id },
      {
        $set: {
          ...(workflow_name && { workflow_name }),
          ...(description !== undefined && { description }),
          ...(nodes && connections && { workflow_definition: { nodes, connections } }),
          ...(is_active !== undefined && { is_active }),
        }
      },
      { returnDocument: 'after' },
    );

    // Keep BullMQ in sync with the new state. Look up the business via the
    // business_workflows link since UpdateWorkflowDto doesn't carry business_id.
    if (link?.business_id) {
      const effectiveNodes = nodes ?? (updated?.workflow_definition?.nodes as any[]) ?? [];
      const effectiveActive = is_active ?? !!updated?.is_active;
      await this.syncSchedule(workflow_id, link.business_id, effectiveNodes, effectiveActive);
    }

    return updated;
  }

  /**
   * Flip the active flag on both Mongo documents, validate before activating,
   * and keep the BullMQ schedule in sync. The list-page Activate/Deactivate
   * dropdown lands here. Returns the updated definition.
   */
  async setActive(workflow_id: string, is_active: boolean) {
    const def = await this.workflowDefinitionModel.findOne({ workflow_id }).lean();
    if (!def) throw new NotFoundException(`Workflow ${workflow_id} not found`);

    if (is_active) {
      this.definitionValidator.validateOrThrow({
        nodes: (def.workflow_definition?.nodes as any[]) ?? [],
        connections: (def.workflow_definition?.connections as Record<string, any>) ?? {},
      });
    }

    const link = await this.businessWorkflowModel.findOne({ workflow_id }).lean();
    if (is_active && link?.business_id) {
      await this.deactivateConflictingActiveWorkflows(
        link.business_id,
        workflow_id,
        (def.workflow_definition?.nodes as any[]) ?? [],
      );
    }

    await this.workflowDefinitionModel.updateOne({ workflow_id }, { $set: { is_active } });
    await this.businessWorkflowModel.updateOne({ workflow_id }, { $set: { is_active } });

    if (link?.business_id) {
      await this.syncSchedule(workflow_id, link.business_id, (def.workflow_definition?.nodes as any[]) ?? [], is_active);
    }
    return { workflow_id, is_active };
  }

  private async deactivateConflictingActiveWorkflows(
    businessId: string,
    workflowId: string,
    nodes: any[],
  ): Promise<void> {
    const signature = this.triggerSignature(nodes);
    if (!signature) return;

    const activeLinks = await this.businessWorkflowModel
      .find({ business_id: businessId, is_active: true, workflow_id: { $ne: workflowId } })
      .lean();
    if (!activeLinks.length) return;

    const workflowIds = activeLinks.map((link) => link.workflow_id);
    const defs = await this.workflowDefinitionModel
      .find({ workflow_id: { $in: workflowIds }, is_active: true })
      .lean();
    const conflictingIds = defs
      .filter((def) => this.triggerSignature((def.workflow_definition?.nodes as any[]) ?? []) === signature)
      .map((def) => def.workflow_id);

    if (!conflictingIds.length) return;

    await this.workflowDefinitionModel.updateMany(
      { workflow_id: { $in: conflictingIds } },
      { $set: { is_active: false, updated_at: new Date() } },
    );
    await this.businessWorkflowModel.updateMany(
      { business_id: businessId, workflow_id: { $in: conflictingIds } },
      { $set: { is_active: false, updated_at: new Date() } },
    );
    await Promise.all(conflictingIds.map((id) => this.syncSchedule(id, businessId, [], false)));
  }

  private triggerSignature(nodes: any[]): string | null {
    const trigger = (nodes ?? []).find((node) => typeof node?.type === 'string' && node.type.startsWith('trigger.'));
    if (!trigger) return null;
    const params = trigger.params ?? {};
    if (trigger.type === 'trigger.whatsapp.intent') {
      return `${trigger.type}:${String(params.intent ?? '').trim().toLowerCase()}`;
    }
    if (trigger.type === 'trigger.event.lead_status_changed') {
      return `${trigger.type}:${this.stableString({
        event: params.event ?? 'lead.status_changed',
        to_status: params.to_status ?? [],
        from_status: params.from_status ?? [],
      })}`;
    }
    if (trigger.type.startsWith('trigger.event.')) {
      return `${trigger.type}:${params.event ?? trigger.type}`;
    }
    if (trigger.type === 'trigger.schedule') {
      return `${trigger.type}:${this.stableString(params.schedule ?? params)}`;
    }
    return `${trigger.type}:${this.stableString(params)}`;
  }

  private stableString(value: any): string {
    if (Array.isArray(value)) return `[${value.map((item) => this.stableString(item)).join(',')}]`;
    if (value && typeof value === 'object') {
      return `{${Object.keys(value).sort().map((key) => `${key}:${this.stableString(value[key])}`).join(',')}}`;
    }
    return String(value ?? '');
  }

  /**
   * Paginated execution history for a workflow. Reads the Postgres durable
   * mirror first because it carries step-by-step audit data; falls back to
   * MongoDB when the Postgres mirror is empty (e.g. a past mirror write failed
   * for that workflow, or executions predate the durability layer).
   */
  async listExecutions(workflow_id: string, take: number) {
    const rows = await this.prisma.workflow_executions.findMany({
      where: { workflow_id },
      orderBy: { created_at: 'desc' },
      take,
      select: {
        execution_id: true,
        status: true,
        waiting_for_input: true,
        current_node_id: true,
        lead_id: true,
        channel: true,
        chat_id: true,
        created_at: true,
        updated_at: true,
        completed_at: true,
      },
    });
    if (rows.length > 0) return rows;

    // Mongo fallback — shape matches the Postgres select() so the dashboard
    // doesn't need to branch on source.
    const mongoRows = await this.workflowExecutionModel
      .find({ workflow_id })
      .sort({ _id: -1 })
      .limit(take)
      .lean();
    return mongoRows.map((m: any) => ({
      execution_id: m.execution_id,
      status: m.status ?? null,
      waiting_for_input: m.waiting_for_input ?? null,
      current_node_id: m.current_node_id ?? null,
      lead_id: m.lead_id ?? null,
      channel: m.channel ?? null,
      chat_id: m.chat_id ?? null,
      created_at: m.created_at ?? m._id?.getTimestamp?.() ?? null,
      updated_at: m.updated_at ?? null,
      completed_at: m.completed_at ?? null,
    }));
  }

  async getExecutionDetail(workflow_id: string, execution_id: string) {
    const execution = await this.prisma.workflow_executions.findFirst({
      where: { execution_id, workflow_id },
    });
    if (execution) {
      const steps = await this.prisma.workflow_execution_steps.findMany({
        where: { execution_id },
        orderBy: { started_at: 'asc' },
      });
      return { execution, steps };
    }

    // Mongo fallback — same shape minus the step trace, which only Postgres
    // captures today. The dashboard handles the empty steps array gracefully.
    const mongoExecution = await this.workflowExecutionModel
      .findOne({ workflow_id, execution_id })
      .lean();
    if (!mongoExecution) throw new NotFoundException(`Execution ${execution_id} not found`);
    return {
      execution: {
        execution_id: mongoExecution.execution_id,
        workflow_id: mongoExecution.workflow_id,
        business_id: mongoExecution.business_id,
        status: mongoExecution.status,
        waiting_for_input: mongoExecution.waiting_for_input,
        current_node_id: mongoExecution.current_node_id ?? null,
        lead_id: mongoExecution.lead_id ?? null,
        channel: mongoExecution.channel ?? null,
        chat_id: mongoExecution.chat_id ?? null,
        context: mongoExecution.context,
        system_context: mongoExecution.system_context,
        created_at: (mongoExecution as any).created_at ?? null,
        updated_at: (mongoExecution as any).updated_at ?? null,
        completed_at: null,
      },
      steps: [] as any[],
    };
  }

  /**
   * Permanently remove a workflow. Cleans up BullMQ schedules first so we don't
   * leave orphan recurring jobs firing for a workflow that no longer exists,
   * then drops both Mongo documents. Execution history (workflow_executions /
   * workflow_execution_steps) is left in place for audit.
   */
  async deleteWorkflow(workflow_id: string): Promise<{ deleted: boolean }> {
    try {
      await this.scheduler.unschedule(workflow_id);
    } catch (err: any) {
      this.logger.warn(`unschedule during delete failed for ${workflow_id}: ${err.message}`);
    }
    await this.workflowDefinitionModel.deleteOne({ workflow_id });
    await this.businessWorkflowModel.deleteOne({ workflow_id });
    this.logger.log(`Workflow ${workflow_id} deleted`);
    return { deleted: true };
  }

  /**
   * Flip a workflow to inactive. Called by the schedule runner after a one-time
   * schedule fires so it doesn't sit around in the active list, and could be
   * called by future cleanup paths (e.g. an admin bulk-deactivate).
   */
  async deactivateWorkflow(workflow_id: string): Promise<void> {
    try {
      await this.workflowDefinitionModel.updateOne(
        { workflow_id },
        { $set: { is_active: false } },
      );
      await this.businessWorkflowModel.updateOne(
        { workflow_id },
        { $set: { is_active: false } },
      );
      await this.scheduler.unschedule(workflow_id);
      this.logger.log(`Workflow ${workflow_id} deactivated`);
    } catch (err: any) {
      this.logger.warn(`Could not deactivate workflow ${workflow_id}: ${err.message}`);
    }
  }

  async getWorkflowsByBusiness(businessId: string) {
    const links = await this.businessWorkflowModel.find({ business_id: businessId }).sort({ created_at: -1 }).lean();
    const workflowIds = links.map((l) => l.workflow_id);
    const defs = await this.workflowDefinitionModel.find({ workflow_id: { $in: workflowIds } }).lean();
    const defMap = new Map(defs.map((d) => [d.workflow_id, d]));
    return links.map((l) => ({ ...l, workflow_definition: defMap.get(l.workflow_id) ?? null }));
  }

  async getWorkflow(workflowId: string) {
    const record = await this.workflowDefinitionModel.findOne({ workflow_id: workflowId }).lean();
    if (!record) throw new NotFoundException(`Workflow ${workflowId} not found`);
    return record;
  }

  private async cancelDropTimeout(execution_id: string) {
    const job = await this.workflowTimeoutQueue.getJob(`drop:${execution_id}`);
    if (job) await job.remove();
  }

  private async scheduleDropTimeout(execution_id: string, conversation_id: string | undefined, currentNodeId: string | null) {
    await this.cancelDropTimeout(execution_id);
    await this.workflowTimeoutQueue.add(
      'drop-inactive-workflow',
      { execution_id, conversation_id, currentNodeId },
      {
        jobId: `drop:${execution_id}`,
        delay: this.WORKFLOW_DROP_DELAY_MS,
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  private async ensureDurableWorkflowDefinition(
    workflowId: string,
    definition: WorkflowParameters,
    businessType: string | null | undefined,
    intentName: string | null | undefined,
  ): Promise<boolean> {
    if (!this.isUuid(workflowId)) {
      return false;
    }

    try {
      const workflowName = definition.name || 'Workflow';
      const intent = intentName || 'default';

      await this.prisma.workflow_definitions.upsert({
        where: { workflow_id: workflowId },
        create: {
          workflow_id: workflowId,
          workflow_key: `runtime_${workflowId}`,
          workflow_name: workflowName,
          version: '1.0.0',
          business_type: businessType || 'general',
          intent_name: intent,
          workflow_definition: definition as any,
          description: 'Runtime workflow definition mirror for durable execution logs',
          is_active: true,
        },
        update: {
          workflow_name: workflowName,
          workflow_definition: definition as any,
          business_type: businessType || 'general',
          intent_name: intent,
          is_active: true,
          updated_at: new Date(),
        },
      });

      return true;
    } catch (error) {
      this.logger.warn(`Could not mirror workflow definition ${workflowId} into Postgres: ${error.message}`);
      return false;
    }
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private async createDurableExecution(params: {
    execution_id: string;
    workflow_id: string;
    business_id: string;
    tenant_id?: string | null;
    lead_id: string;
    channel: string;
    chat_id: string;
    status: string;
    current_node_id?: string | null;
    context: any;
    system_context?: any;
    intent?: string | null;
    message_id?: string | null;
    conversation_id?: string | null;
  }): Promise<boolean> {
    try {
      await this.prisma.workflow_executions.create({
        data: {
          execution_id: params.execution_id,
          workflow_id: params.workflow_id,
          business_id: params.business_id,
          tenant_id: params.tenant_id ?? null,
          lead_id: params.lead_id,
          channel: params.channel,
          chat_id: params.chat_id,
          status: params.status,
          waiting_for_input: false,
          current_node_id: params.current_node_id ?? null,
          context: params.context,
          system_context: params.system_context ?? null,
          intent: params.intent ?? null,
          message_id: params.message_id ?? null,
          conversation_id: params.conversation_id ?? null,
        },
      });
      return true;
    } catch (error) {
      this.logger.warn(`Could not create durable workflow execution ${params.execution_id}: ${error.message}`);
      return false;
    }
  }

  private async updateDurableExecution(execution_id: string, data: Record<string, any>) {
    try {
      await this.prisma.workflow_executions.update({
        where: { execution_id },
        data,
      });
    } catch (error: any) {
      // P2025 = record-not-found. The durable mirror is best-effort: if the
      // create-side failed earlier (e.g. legacy unique constraint), there's no
      // row to update and the update naturally cascades into this error. Silently
      // swallow it — anything else is worth logging.
      if (error?.code === 'P2025') return;
      this.logger.warn(`Could not update durable workflow execution ${execution_id}: ${error.message}`);
    }
  }

  private createStepInputSnapshot(context: any) {
    return {
      message_id: context?.message_id ?? null,
      conversation_id: context?.conversation_id ?? null,
      user_input: context?.user_input ?? null,
      intent: context?.intent ?? null,
      entities: context?.entities ?? null,
      cart_info: context?.cart_info ?? null,
      filters: context?.filters ?? null,
    };
  }

  private attachDurableStepLogging(workflow: Workflow, params: {
    execution_id: string;
    workflow_id: string;
    business_id: string;
    tenant_id?: string | null;
  }) {
    workflow.onNodeStart = async (node, context) => {
      try {
        const step = await this.prisma.workflow_execution_steps.create({
          data: {
            execution_id: params.execution_id,
            workflow_id: params.workflow_id,
            business_id: params.business_id,
            tenant_id: params.tenant_id ?? null,
            node_id: node.id,
            node_type: node.type,
            node_name: node.name,
            status: 'running',
            input: this.createStepInputSnapshot(context),
          },
          select: { step_id: true },
        });

        this.workflowStepStartedAt.set(step.step_id, Date.now());
        return step.step_id;
      } catch (error) {
        this.logger.warn(`Could not create workflow step log for execution ${params.execution_id}: ${error.message}`);
      }
    };

    workflow.onNodeComplete = async (stepId, _node, result) => {
      if (!stepId) return;
      const startedAt = this.workflowStepStartedAt.get(stepId);
      this.workflowStepStartedAt.delete(stepId);

      await this.prisma.workflow_execution_steps.update({
        where: { step_id: stepId },
        data: {
          status: 'completed',
          output: result === undefined ? null : result,
          completed_at: new Date(),
          duration_ms: startedAt ? Date.now() - startedAt : null,
        },
      }).catch((error) => {
        this.logger.warn(`Could not complete workflow step log ${stepId}: ${error.message}`);
      });
    };

    workflow.onNodeError = async (stepId, _node, error) => {
      if (!stepId) return;
      const startedAt = this.workflowStepStartedAt.get(stepId);
      this.workflowStepStartedAt.delete(stepId);

      await this.prisma.workflow_execution_steps.update({
        where: { step_id: stepId },
        data: {
          status: 'failed',
          error_message: error.message,
          error_stack: error.stack,
          completed_at: new Date(),
          duration_ms: startedAt ? Date.now() - startedAt : null,
        },
      }).catch((updateError) => {
        this.logger.warn(`Could not fail workflow step log ${stepId}: ${updateError.message}`);
      });
    };
  }

  private buildIncomingIdempotencyKey(incomingParams: WorkflowProcessingContext): string {
    const messageId = incomingParams.context?.message_id || incomingParams.processing_id;
    return [
      'workflow-message',
      incomingParams.business_id,
      incomingParams.lead_id,
      messageId,
    ].join(':');
  }

  private async reserveIncomingMessage(incomingParams: WorkflowProcessingContext): Promise<{ reserved: boolean; key: string }> {
    const key = this.buildIncomingIdempotencyKey(incomingParams);

    try {
      await this.prisma.workflow_idempotency_keys.create({
        data: {
          idempotency_key: key,
          business_id: incomingParams.business_id,
          tenant_id: incomingParams.tenant_id ?? null,
          lead_id: incomingParams.lead_id,
          conversation_id: incomingParams.context?.conversation_id ?? null,
          message_id: incomingParams.context?.message_id || incomingParams.processing_id,
          purpose: 'incoming_message',
          status: 'started',
          locked_until: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      return { reserved: true, key };
    } catch (error) {
      if (error?.code === 'P2002') {
        this.logger.warn(`Duplicate workflow message ignored: ${key}`);
        return { reserved: false, key };
      }

      throw error;
    }
  }

  private async markIdempotencyKey(key: string, status: 'completed' | 'failed', response?: Record<string, any>) {
    try {
      await this.prisma.workflow_idempotency_keys.update({
        where: { idempotency_key: key },
        data: {
          status,
          response: response ?? null,
          locked_until: null,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Could not update workflow idempotency key ${key}: ${error.message}`);
    }
  }


  async startWorkflow(
    lead_id: string,
    chat_id: string,
    channel: 'whatsapp' | 'instagram',
    workflowInput: WorkflowProcessingContext,
    /**
     * Optional explicit workflow id. When set (used by scheduled and event
     * triggers), we skip the (business, intent) → active workflow resolver
     * because those triggers know exactly which workflow they fire.
     */
    workflowIdOverride?: string,
  ) {
    let business_id = workflowInput.business_id;
    if (!business_id) {
      const lead = await this.prisma.leads.findUnique({ where: { lead_id } });
      business_id = lead?.business_id;
    }

    if (!business_id) {
      throw new Error(`Cannot start workflow: business_id not found for lead ${lead_id}`);
    }

    const intent = workflowInput.intent?.intent ?? '';
    const activeWorkflow = workflowIdOverride
      ? await this.loadWorkflowById(workflowIdOverride)
      : await this.getActiveWorkflowForBusiness(business_id, intent);
    if (!activeWorkflow) {
      this.logger.warn(
        workflowIdOverride
          ? `Workflow ${workflowIdOverride} not found / inactive`
          : `No active workflow found for business ${business_id} intent "${intent}"`,
      );
      return;
    }

    // Fetch authoritative business + lead data from DB to build system context
    const [business, lead] = await Promise.all([
      this.prisma.businesses.findUnique({
        where: { business_id },
        select: {
          business_id: true,
          business_name: true,
          business_type: true,
          email: true,
          phone: true,
          website: true,
          city: true,
          address: true,
          country: true,
          whatsapp_number: true,
          tenant_id: true,
        },
      }),
      this.prisma.leads.findUnique({
        where: { lead_id },
        select: {
          lead_id: true,
          name: true,
          phone: true,
          email: true,
          status: true,
          tags: true,
          source: true,
        },
      }),
    ]);

    // Trigger gating — evaluate conditions/business-hours configured on the
    // trigger node. If they don't match, abort the workflow start. This is the
    // only place trigger-level params are honoured because matches() is never
    // called by the active-workflow lookup path.
    const triggerNode = (activeWorkflow.definition?.nodes ?? []).find((n: any) =>
      typeof n?.type === 'string' && n.type.startsWith('trigger.'),
    );
    if (triggerNode?.params) {
      const triggerParams = triggerNode.params as Record<string, any>;
      const settings = await (this.prisma.business_settings as any)
        .findUnique({ where: { business_id }, select: { timezone: true } })
        .catch(() => null);
      // business_hours is stored as a single-element array (the validator can recurse
      // into items[]), but the evaluator wants a flat object. Unwrap both shapes.
      const rawHours = Array.isArray(triggerParams.business_hours)
        ? triggerParams.business_hours[0]
        : triggerParams.business_hours;
      const triggerEval = evaluateTrigger({
        conditions: triggerParams.conditions ?? [],
        businessHours: rawHours?.enabled
          ? { ...rawHours, timezone: rawHours.timezone || settings?.timezone || 'Asia/Kolkata' }
          : undefined,
        context: {
          lead: lead ? { status: lead.status, tags: lead.tags as string[], source: lead.source } : null,
          message: { text: workflowInput.user_input ?? '' },
        },
      });
      if (!triggerEval.matched) {
        this.logger.log(
          `Workflow ${activeWorkflow.workflowId} skipped for lead ${lead_id} — trigger gate: ${triggerEval.reason}`,
        );
        return;
      }
    }

    // WhatsApp 24-hour-window gate. Synthetic runs (schedule + event triggers)
    // are dispatching unsolicited free-form messages to leads who may not have
    // contacted us in days. Meta only allows free-form text inside 24h of the
    // customer's last inbound message; outside that window we'd need an approved
    // template. For now we conservatively skip the entire run when the window
    // is closed and a free-form WhatsApp send is on the workflow path. Inbound
    // runs naturally pass because last_inbound_at was just updated.
    const isSyntheticRun = !!(workflowInput.context as any)?.metadata?.synthetic;
    if (isSyntheticRun && lead_id && channel === 'whatsapp') {
      const hasFreeFormSend = (activeWorkflow.definition?.nodes ?? []).some((n: any) =>
        FREE_FORM_WHATSAPP_SEND_TYPES.has(n?.type),
      );
      if (hasFreeFormSend) {
        const status = await this.messageWindow.getStatus({ business_id, lead_id });
        if (!status.open) {
          this.logger.log(
            `Workflow ${activeWorkflow.workflowId} skipped for lead ${lead_id} — outside 24h window (last_inbound_at=${status.lastInboundAt ?? 'never'})`,
          );
          return;
        }
      }
    }

    const system_context: Record<string, any> = {
      business_id: business?.business_id ?? business_id,
      business_name: business?.business_name ?? workflowInput.context?.business?.name ?? '',
      business_type: business?.business_type ?? null,
      business_email: business?.email ?? null,
      business_phone: business?.phone ?? null,
      business_website: business?.website ?? null,
      business_city: business?.city ?? null,
      business_address: business?.address ?? null,
      business_country: business?.country ?? null,
      business_whatsapp_number: business?.whatsapp_number ?? null,
      tenant_id: business?.tenant_id ?? workflowInput.tenant_id ?? null,
      lead_id: lead?.lead_id ?? lead_id,
      lead_name: lead?.name ?? null,
      lead_phone: lead?.phone ?? null,
      lead_email: lead?.email ?? null,
      lead_status: lead?.status ?? null,
      lead_tags: lead?.tags ?? [],
      lead_source: lead?.source ?? null,
      channel,
      intent: intent || null,
      workflow_id: activeWorkflow.workflowId,
      // Constant variables defined on the trigger flow into the same nodeContext
      // namespace under `trigger.var.*`, so node template strings can reference
      // them as ${trigger.var.foo}.
      trigger: {
        var: triggerVarsToObject((triggerNode?.params as any)?.vars),
      },
    };

    // For synthetic runs (schedule / event triggers) there's no inbound message
    // upstream populating `context.contact`. Synthesize one from the lead row so
    // downstream action nodes that reference ${contact.name} / ${contact.from}
    // work the same as inbound runs. We also need a phoneNumberId so the send
    // nodes have somewhere to dispatch — read it from the business's active
    // WhatsApp social account.
    const isSynthetic = !!(workflowInput.context as any)?.metadata?.synthetic;
    let syntheticContact: any = undefined;
    if (isSynthetic && lead) {
      const waAccount = await this.prisma.social_accounts.findFirst({
        where: { business_id, platform: 'whatsapp', is_active: true },
        select: { page_id: true },
      }).catch(() => null);
      syntheticContact = {
        name: lead.name ?? null,
        from: lead.phone ?? null,
        phoneNumberId: waAccount?.page_id ?? null,
      };
    }

    workflowInput.context = {
      ...workflowInput.context,
      // Channel needs to live on workflowInput.context (not just system_context)
      // because Workflow.buildNodeContext only spreads context.context into the
      // node-level execution context. Without this, action nodes that branch on
      // `context.channel === 'whatsapp'` skip their send path silently.
      channel,
      ...(syntheticContact ? { contact: syntheticContact } : {}),
      business: {
        id: system_context.business_id,
        name: system_context.business_name,
        type: system_context.business_type,
        email: system_context.business_email,
        phone: system_context.business_phone,
        website: system_context.business_website,
        city: system_context.business_city,
        address: system_context.business_address,
        country: system_context.business_country,
      },
    };

    const execution_id = crypto.randomUUID();
    const durableDefinitionReady = await this.ensureDurableWorkflowDefinition(
      activeWorkflow.workflowId,
      activeWorkflow.definition,
      business?.business_type,
      intent,
    );

    await this.workflowExecutionModel.create({
      execution_id,
      workflow_id: activeWorkflow.workflowId,
      business_id,
      lead_id,
      channel,
      chat_id,
      status: 'running',
      waiting_for_input: false,
      current_node_id: null,
      context: workflowInput,
      system_context,
    });
    let durableExecutionReady = false;
    if (durableDefinitionReady) {
      durableExecutionReady = await this.createDurableExecution({
        execution_id,
        workflow_id: activeWorkflow.workflowId,
        business_id,
        tenant_id: system_context.tenant_id,
        lead_id,
        channel,
        chat_id,
        status: 'running',
        current_node_id: null,
        context: workflowInput,
        system_context,
        intent,
        message_id: workflowInput.context?.message_id ?? workflowInput.processing_id,
        conversation_id: workflowInput.context?.conversation_id ?? null,
      });
    }
    this.logger.log(`Created workflow execution: ${execution_id}`);

    const workflow = new Workflow(this.nodeFactory);
    workflow.init(activeWorkflow.definition);
    if (durableExecutionReady) {
      this.attachDurableStepLogging(workflow, {
        execution_id,
        workflow_id: activeWorkflow.workflowId,
        business_id,
        tenant_id: system_context.tenant_id,
      });
    }
    const conversation_id = workflowInput.context?.conversation_id;

    workflow.onPause = async (state) => {
      await this.saveExecutionState({ execution_id, ...state, lead_id, chat_id });

      // Update conversation with current node
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          current_node_id: state.currentNodeId,
          status: 'waiting',
        });
      }

      await this.scheduleDropTimeout(execution_id, conversation_id, state.currentNodeId);
    };

    workflow.onComplete = async (state) => {
      await this.cancelDropTimeout(execution_id);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        { $set: { status: 'completed', waiting_for_input: false } },
      );
      await this.updateDurableExecution(execution_id, {
        status: 'completed',
        waiting_for_input: false,
        current_node_id: state.currentNodeId,
        context: state.context,
        completed_at: new Date(),
        updated_at: new Date(),
      });
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'ended',
          current_node_id: state.currentNodeId,
        });
      }
    };

    workflow.onError = async (nodeId, error) => {
      await this.cancelDropTimeout(execution_id);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        { $set: { status: 'failed', waiting_for_input: false } },
      );
      await this.updateDurableExecution(execution_id, {
        status: 'failed',
        waiting_for_input: false,
        current_node_id: nodeId,
        completed_at: new Date(),
        updated_at: new Date(),
      });
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'failed',
          current_node_id: nodeId,
          failed_reason: error.message,
        });
      }
    };

    await workflow.execute(workflowInput);

    return workflow.getExecutionState();

  }

  async resumeWorkflow(executionId: string, workflow_id: string, currentNodeId: string, savedContext: any, lead_id: string, chat_id: string, waitingForInput: boolean, newInput: WorkflowProcessingContext) {
    const workflowDef = await this.getWorkflowDefinition(workflow_id);
    const workflow = new Workflow(this.nodeFactory);
    workflow.init(workflowDef);
    const durableExecution = await this.prisma.workflow_executions.findUnique({
      where: { execution_id: executionId },
      select: { execution_id: true },
    }).catch(() => null);
    if (durableExecution) {
      this.attachDurableStepLogging(workflow, {
        execution_id: executionId,
        workflow_id,
        business_id: newInput.business_id,
        tenant_id: newInput.tenant_id,
      });
    }

    // Determine the actual user input based on message type
    let actualInput: any;
    if (newInput.cart_info) {
      // Catalog selection - pass the cart_info
      actualInput = newInput.cart_info;
    } else if (newInput.user_input !== undefined) {
      // Text or button input
      actualInput = newInput.user_input;
    } else {
      // Fallback to entire newInput
      actualInput = newInput;
    }

    // Enrich flow response with DB data when resuming from a send_flow node
    const waitingNode = workflowDef?.nodes?.find((n: any) => n.id === currentNodeId);
    if (waitingNode?.type === 'action.send_flow' && typeof actualInput === 'string') {
      try {
        const parsed = JSON.parse(actualInput);
        actualInput = await this.enrichFlowResponse(parsed);
        this.logger.log(`Flow response enriched for node ${currentNodeId}`);
      } catch {
        // not valid JSON or enrichment failed — leave as-is
      }
    }

    const conversation_id = newInput.context?.conversation_id;

    // User replied — cancel any pending drop timer
    await this.cancelDropTimeout(executionId);

    workflow.restoreState({
      currentNodeId,
      context: {
        ...savedContext,
        user_input: actualInput,
        ...(newInput.cart_info !== undefined && { cart_info: newInput.cart_info }),
        intent: newInput.intent,
        entities: newInput.entities,
      },
      waitingForInput: waitingForInput,
    });

    workflow.onPause = async (state) => {
      await this.saveExecutionState({ execution_id: executionId, ...state, lead_id, chat_id });

      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          current_node_id: state.currentNodeId,
          status: 'waiting',
        });
      }

      await this.scheduleDropTimeout(executionId, conversation_id, state.currentNodeId);
    };

    workflow.onComplete = async (state) => {
      await this.cancelDropTimeout(executionId);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id: executionId },
        { $set: { status: 'completed', waiting_for_input: false } },
      );
      await this.updateDurableExecution(executionId, {
        status: 'completed',
        waiting_for_input: false,
        current_node_id: state.currentNodeId,
        context: state.context,
        completed_at: new Date(),
        updated_at: new Date(),
      });
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'ended',
          current_node_id: state.currentNodeId,
        });
      }
    };

    workflow.onError = async (nodeId, error) => {
      await this.cancelDropTimeout(executionId);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id: executionId },
        { $set: { status: 'failed', waiting_for_input: false } },
      );
      await this.updateDurableExecution(executionId, {
        status: 'failed',
        waiting_for_input: false,
        current_node_id: nodeId,
        completed_at: new Date(),
        updated_at: new Date(),
      });
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'failed',
          current_node_id: nodeId,
          failed_reason: error.message,
        });
      }
    };

    workflow.resume(actualInput);

    return workflow.getExecutionState();

  }

  private enrichConnectionsWithConditions(nodes: any[], connections: Record<string, any>): Record<string, any> {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const result: Record<string, any> = {};

    for (const [sourceId, conn] of Object.entries(connections)) {
      const node = nodeMap.get(sourceId);
      const edges: any[] = conn?.main ?? [];

      if (!node?.waitForInput || edges.length === 0) {
        result[sourceId] = conn;
        continue;
      }

      const type: string = node.type ?? '';

      if (type === 'action.wait_for_text') {
        result[sourceId] = {
          main: edges.map((e) => ({
            ...e,
            condition: { operator: 'exists', variable: 'user_input' },
          })),
        };
        continue;
      }

      if (type === 'action.send_catalog') {
        result[sourceId] = {
          main: edges.map((e) => ({
            ...e,
            condition: { operator: 'exists', variable: 'cart_info' },
          })),
        };
        continue;
      }

      let optionIds: string[] = [];

      if (type === 'action.send_message_withmenu') {
        optionIds = (node.params?.menu ?? []).map((item: any) => item.id);
      } else if (type === 'action.send_message_with_btns') {
        optionIds = (node.params?.buttons ?? []).map((btn: any) => btn.id);
      } else if (type === 'action.collect_filter') {
        optionIds = (node.params?.filterOptions ?? []).map((opt: any) => opt.id);
      }

      if (optionIds.length > 0) {
        result[sourceId] = {
          main: edges.map((e, idx) => ({
            ...e,
            condition: { operator: 'equals', variable: 'user_input', value: optionIds[idx] },
          })),
        };
      } else {
        result[sourceId] = conn;
      }
    }

    return result;
  }

  private async saveExecutionState({ execution_id, currentNodeId, context, waitingForInput }) {
    try {
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        {
          $set: {
            current_node_id: currentNodeId,
            context,
            waiting_for_input: waitingForInput,
            status: waitingForInput ? 'paused' : 'running',
          }
        },
      );
      await this.updateDurableExecution(execution_id, {
        current_node_id: currentNodeId,
        context,
        waiting_for_input: waitingForInput,
        status: waitingForInput ? 'paused' : 'running',
        updated_at: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to save workflow execution state:', error);
    }
  }

  private async getWorkflowDefinition(workflowId: string): Promise<WorkflowParameters | null> {
    const record = await this.workflowDefinitionModel.findOne({ workflow_id: workflowId }).lean();
    if (record?.workflow_definition) {
      return record.workflow_definition as unknown as WorkflowParameters;
    }
    return null;
  }

  /**
   * Direct lookup used by schedule/event runners that already know which
   * workflow they want to fire. Returns null if the workflow is inactive or
   * missing so callers can no-op gracefully.
   */
  private async loadWorkflowById(workflow_id: string): Promise<{ workflowId: string; definition: WorkflowParameters } | null> {
    const def = await this.workflowDefinitionModel.findOne({ workflow_id, is_active: true }).lean();
    if (!def?.workflow_definition) return null;
    return {
      workflowId: def.workflow_id,
      definition: def.workflow_definition as WorkflowParameters,
    };
  }

  private async getActiveWorkflowForBusiness(businessId: string, intentName: string): Promise<{ workflowId: string; definition: WorkflowParameters } | null> {
    const links = await this.businessWorkflowModel.find({ business_id: businessId, is_active: true }).lean();
    if (!links.length) return null;

    const defs = await this.workflowDefinitionModel
      .find({ workflow_id: { $in: links.map((link) => link.workflow_id) }, is_active: true })
      .lean();
    const def = defs.find((candidate) => this.matchesInboundWhatsAppTrigger(candidate.workflow_definition, intentName));
    if (!def?.workflow_definition) return null;

    const raw = def.workflow_definition as any;

    if (Array.isArray(raw.nodes)) {
      raw.nodes = raw.nodes.map((node: any) => {
        if (node.type?.startsWith('trigger.') && !node.params?.intent) {
          return { ...node, params: { ...node.params } };
        }
        return node;
      });
    }

    return {
      workflowId: def.workflow_id,
      definition: raw as WorkflowParameters,
    };
  }

  private matchesInboundWhatsAppTrigger(definition: any, intentName: string): boolean {
    const trigger = (definition?.nodes ?? []).find((node: any) =>
      typeof node?.type === 'string' && node.type.startsWith('trigger.'),
    );
    if (!trigger) return false;
    if (trigger.type === 'trigger.whatsapp') return true;
    if (trigger.type !== 'trigger.whatsapp.intent') return false;

    const configuredIntent = String(trigger.params?.intent ?? '').trim().toLowerCase();
    const incomingIntent = String(intentName ?? '').trim().toLowerCase();
    return !!configuredIntent && configuredIntent === incomingIntent;
  }


  /**
   * Find the first `action.send_flow` node in the active workflow for a business.
   * Used by the agent to locate the correct node to start from.
   */
  async findSendFlowNodeId(businessId: string): Promise<string | null> {
    const workflow = await this.getActiveWorkflowForBusiness(businessId, '');
    const node = workflow?.definition.nodes.find((n: any) => n.type === 'action.send_flow');
    return node?.id ?? null;
  }

  /**
   * Start workflow execution at a specific node — used by the agent after confirming availability.
   * Creates a fresh execution record at `nodeId` and immediately runs from that node.
   */
  async startFromNode(
    businessId: string,
    nodeId: string,
    leadId: string,
    chatId: string,
    channel: 'whatsapp' | 'instagram',
    context: WorkflowProcessingContext,
  ): Promise<void> {
    const activeWorkflow = await this.getActiveWorkflowForBusiness(businessId, '');
    if (!activeWorkflow) {
      this.logger.warn(`startFromNode: no active workflow for business ${businessId}`);
      return;
    }

    const execution_id = crypto.randomUUID();
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: { business_type: true, tenant_id: true },
    });
    const tenantId = context.tenant_id ?? business?.tenant_id ?? null;
    const durableDefinitionReady = await this.ensureDurableWorkflowDefinition(
      activeWorkflow.workflowId,
      activeWorkflow.definition,
      business?.business_type,
      context.intent?.intent,
    );

    await this.workflowExecutionModel.create({
      execution_id,
      workflow_id: activeWorkflow.workflowId,
      business_id: businessId,
      lead_id: leadId,
      channel,
      chat_id: chatId,
      status: 'running',
      waiting_for_input: false,
      current_node_id: nodeId,
      context,
      system_context: {},
    });
    let durableExecutionReady = false;
    if (durableDefinitionReady) {
      durableExecutionReady = await this.createDurableExecution({
        execution_id,
        workflow_id: activeWorkflow.workflowId,
        business_id: businessId,
        tenant_id: tenantId,
        lead_id: leadId,
        channel,
        chat_id: chatId,
        status: 'running',
        current_node_id: nodeId,
        context,
        system_context: {},
        intent: context.intent?.intent ?? null,
        message_id: context.context?.message_id ?? context.processing_id,
        conversation_id: context.context?.conversation_id ?? null,
      });
    }
    this.logger.log(`startFromNode: created execution ${execution_id} at node ${nodeId}`);

    const workflow = new Workflow(this.nodeFactory);
    workflow.init(activeWorkflow.definition);
    if (durableExecutionReady) {
      this.attachDurableStepLogging(workflow, {
        execution_id,
        workflow_id: activeWorkflow.workflowId,
        business_id: businessId,
        tenant_id: tenantId,
      });
    }
    const conversation_id = context.context?.conversation_id;

    workflow.onPause = async (state) => {
      await this.saveExecutionState({ execution_id, ...state, lead_id: leadId, chat_id: chatId });
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          current_node_id: state.currentNodeId,
          status: 'waiting',
        });
      }
      await this.scheduleDropTimeout(execution_id, conversation_id, state.currentNodeId);
    };

    workflow.onComplete = async (state) => {
      await this.cancelDropTimeout(execution_id);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        { $set: { status: 'completed', waiting_for_input: false } },
      );
      await this.updateDurableExecution(execution_id, {
        status: 'completed',
        waiting_for_input: false,
        current_node_id: state.currentNodeId,
        context: state.context,
        completed_at: new Date(),
        updated_at: new Date(),
      });
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'ended',
          current_node_id: state.currentNodeId,
        });
      }
    };

    workflow.onError = async (nodeId: string, error: Error) => {
      await this.cancelDropTimeout(execution_id);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        { $set: { status: 'failed', waiting_for_input: false } },
      );
      await this.updateDurableExecution(execution_id, {
        status: 'failed',
        waiting_for_input: false,
        current_node_id: nodeId,
        completed_at: new Date(),
        updated_at: new Date(),
      });
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'failed',
          current_node_id: nodeId,
          failed_reason: error.message,
        });
      }
    };

    await workflow.executeFromNode(nodeId, context);
  }

  async handleIncomingMessage(incomingParams: WorkflowProcessingContext) {
    const channel = 'whatsapp';

    const phoneNumberId = incomingParams.context.contact?.phoneNumberId;
    const idempotency = await this.reserveIncomingMessage(incomingParams);
    if (!idempotency.reserved) {
      return;
    }

    try {
      const hasWaitingWorkflow = await this.workflowExecutionModel.findOne({
        channel,
        chat_id: phoneNumberId,
        waiting_for_input: true,
        business_id: incomingParams.business_id,
        lead_id: incomingParams.lead_id,
      }).lean();

      if (hasWaitingWorkflow) {
        this.logger.log(`Resuming workflow execution ${hasWaitingWorkflow.execution_id} for chat_id: ${phoneNumberId}`);
        await this.resumeWorkflow(
          hasWaitingWorkflow.execution_id,
          hasWaitingWorkflow.workflow_id,
          hasWaitingWorkflow.current_node_id,
          hasWaitingWorkflow.context,
          hasWaitingWorkflow.lead_id,
          hasWaitingWorkflow.chat_id,
          hasWaitingWorkflow.waiting_for_input,
          incomingParams
        );
        await this.markIdempotencyKey(idempotency.key, 'completed', {
          action: 'resumed_workflow',
          execution_id: hasWaitingWorkflow.execution_id,
        });
        return;
      }

      const state = await this.startWorkflow(
        incomingParams.lead_id,
        phoneNumberId,
        channel,
        incomingParams,
      );
      await this.markIdempotencyKey(idempotency.key, 'completed', {
        action: 'started_workflow',
        current_node_id: state?.currentNodeId ?? null,
        waiting_for_input: state?.waitingForInput ?? null,
      });
    } catch (error) {
      await this.markIdempotencyKey(idempotency.key, 'failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Enrich a WhatsApp Flow response with full DB data based on known IDs.
   * Supports: booking_id (order_id) and order_id (orders).
   */
  private async enrichFlowResponse(data: Record<string, any>): Promise<Record<string, any>> {
    // --- Accommodation booking (now stored as order) ---
    if (data.booking_id) {
      const order = await this.prisma.orders.findFirst({
        where: { order_id: data.booking_id },
        include: { order_items: true },
      });
      if (order) {
        const item = (order.order_items?.[0]?.snapshot as any) ?? {};
        return {
          booking_id: order.order_id,
          check_in_date: item.check_in ?? null,
          check_out_date: item.check_out ?? null,
          nights: item.nights ?? null,
          total_price: Number(order.total_amount),
          booking_status: order.delivery_status,
          payment_status: order.payment_status,
          customer_name: item.guest_name ?? null,
          customer_phone: item.phone ?? null,
          num_guests: item.num_guests ?? 1,
        };
      }
    }

    // --- E-commerce order ---
    if (data.order_id) {
      const order = await this.prisma.orders.findUnique({
        where: { order_id: data.order_id },
        include: { order_items: true },
      });
      if (order) {
        return {
          order_id: order.order_id,
          order_number: order.order_number,
          order_status: order.status,
          total_amount: Number(order.total_amount),
          payment_status: order.payment_status,
          items_count: order.order_items?.length ?? 0,
          order_items: order.order_items?.map(i => ({
            name: i.product_name,
            quantity: i.quantity,
            price: Number(i.total_price),
          })),
        };
      }
    }

    return data;
  }

}

// Trigger constants are stored as [{ name, value }] (row-editor shape) but read
// by the runtime as a flat object. Convert here so the rest of the service can
// stay typed-agnostic.
function triggerVarsToObject(vars: unknown): Record<string, string> {
  if (!Array.isArray(vars)) return {};
  const out: Record<string, string> = {};
  for (const row of vars) {
    if (row && typeof row === 'object' && typeof (row as any).name === 'string') {
      const name = (row as any).name.trim();
      if (name) out[name] = String((row as any).value ?? '');
    }
  }
  return out;
}
