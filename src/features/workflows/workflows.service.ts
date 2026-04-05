import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaConsumerService } from '../kafka/kafka-consumer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Workflow } from './core/workflow';
import { WorkflowNodeExecutionContext, WorkflowParameters, WorkflowProcessingContext } from './interfaces';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { WhatsAppCatalogService } from '../whatsapp/services/whatsapp-catalog.service';
import { NodeFactory } from './factories/node-factory';
import { ConversationService } from '../conversation/conversation.service';
import { CreateWorkflowDto, InitiateWorkflowDto, UpdateWorkflowDto } from './dto/save-workflow.dto';
import { WorkflowAnalyzerService } from './workflow-analyzer.service';
import { WorkflowDefinition, WorkflowDefinitionDocument } from './schema/workflow-definition.schema';
import { BusinessWorkflow, BusinessWorkflowDocument } from './schema/business-workflow.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from './schema/workflow-execution.schema';

@Injectable()
export class WorkflowsService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowsService.name);
  // Map of execution_id → drop timeout handle (cleared on resume)
  private readonly dropTimers = new Map<string, NodeJS.Timeout>();

  workflowDefinition = {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Test Workflow",
    active: true,
    nodes: [
      {
        id: "trigger_1",
        type: "trigger.whatsapp.intent",
        name: "Trigger",
        position: { x: 0, y: 0 },
        params: { intent: "GENERAL_INQUIRY" }
      },
      {
        id: "trigger_purchase",
        type: "trigger.whatsapp.intent",
        name: "Trigger",
        position: { x: 0, y: 0 },
        params: { intent: "PURCHASE_INTENT" }
      },
      {
        id: "trigger_support",
        type: "trigger.whatsapp.intent",
        name: "Trigger",
        position: { x: 0, y: 0 },
        params: { intent: "SUPPORT_INTENT" }
      },
      {
        id: "trigger_traking",
        type: "trigger.whatsapp.intent",
        name: "Trigger",
        position: { x: 0, y: 0 },
        params: { intent: "TRACKING_INTENT" }
      },
      {
        id: "greet_node",
        type: "action.send_message",
        name: "Send Greet",
        position: { x: 200, y: 0 },
        output_variable: null,
        params: { message: "Hello! ${contactName}! 👋 Welcome!" }
      },
      {
        id: "send_1",
        type: "action.send_message_withmenu",
        name: "Send Menu",
        position: { x: 200, y: 0 },
        output_variable: "menu_selection",
        params: {
          message: "Hello! ${contactName}, please choose an option:",
          menu: [
            { id: "option_1", label: "View Products" },
            { id: "option_2", label: "Contact Support" },
            { id: "option_3", label: "Leave Feedback" }
          ]
        }
      },
      {
        id: "filter_gender",
        type: "action.collect_filter",
        name: "Gender Filter",
        position: { x: 300, y: 0 },
        output_variable: "gender_filter_metadata",
        params: {
          filterDimension: "gender",
          message: "What are you looking for?",
          presentationType: "buttons",
          filterOptions: [
            { id: "men", label: "Men's", filterKey: "gender", filterValue: "male" },
            { id: "women", label: "Women's", filterKey: "gender", filterValue: "female" },
            { id: "kids", label: "Kids", filterKey: "gender", filterValue: "unisex" }
          ],
          optional: true,
          skipLabel: "Show All"
        }
      },
      {
        id: "filter_category",
        type: "action.collect_filter",
        name: "Category Filter",
        position: { x: 350, y: 0 },
        output_variable: "category_filter_metadata",
        params: {
          filterDimension: "category",
          message: "Select a category:",
          presentationType: "list",
          filterOptions: [
            { id: "shirts", label: "Shirts", filterKey: "category", filterValue: "shirts" },
            { id: "pants", label: "Pants", filterKey: "category", filterValue: "pants" },
            { id: "accessories", label: "Accessories", filterKey: "category", filterValue: "accessories" }
          ],
          optional: true,
          skipLabel: "All Categories"
        }
      },
      {
        id: "send_11",
        type: "action.send_message_withmenu",
        name: "Send Menu",
        position: { x: 200, y: 200 },
        output_variable: "menu_selection",
        params: {
          message: "Please choose a category:",
          menu: [
            { id: "option_1", label: "Shirts" },
            { id: "option_2", label: "Pants" },
            { id: "option_3", label: "Accessories" }
          ]
        }
      },
      {
        id: "send_12",
        type: "action.send_message_with_btns",
        name: "Send Menu",
        position: { x: 200, y: 400 },
        output_variable: "button_selection",
        params: {
          message: "What are you looking for today?",
          buttons: [
            { id: "option_1", title: "Men's" },
            { id: "option_2", title: "Women's" },
            { id: "option_3", title: "Kids" }
          ]
        }
      },
      {
        id: "send_2",
        type: "action.send_catalog",
        name: "Send Filtered Catalog",
        position: { x: 400, y: 0 },
        output_variable: "catalog_selection",
        params: {
          applyFilters: true,
          header: "Our Products",
          message: "Here are products matching your preferences:",
          limit: 20
        }
      },
      {
        id: "send_4",
        type: "action.wait_for_text",
        name: "Send Final Message",
        position: { x: 1000, y: 0 },
        params: { prompt: "Please send your address to confirm delivery." }
      },
      {
        id: "send_5",
        type: "action.send_message_with_btns",
        name: "Send Address Confirmation",
        position: { x: 1200, y: 0 },
        params: {
          message: "Do you want to confirm your address?",
          buttons: [
            { id: "option_1", title: "Yes, confirm" },
            { id: "option_2", title: "No, edit address" }
          ]
        }
      },
      {
        id: "send_6",
        type: "action.send_message",
        name: "Send Payment Placeholder",
        position: { x: 1400, y: 0 },
        params: { message: "Payment of $100 USD will be processed. (Payment node coming soon)" }
      },
      {
        id: "send_7",
        type: "action.send_message",
        name: "Send Payment Confirmation",
        position: { x: 1600, y: 0 },
        params: { message: "Your order has been processed successfully!" }
      }
    ],
    connections: {
      "trigger_1": { main: [{ to: "greet_node" }] },
      "greet_node": { main: [{ to: "send_1" }] },
      "send_1": {
        main: [
          { to: "filter_category", condition: { operator: "equals", value: "option_1", variable: "user_input" } },
          { to: "contact_support", condition: { operator: "equals", value: "option_2", variable: "user_input" } },
          { to: "leave_feedback", condition: { operator: "equals", value: "option_3", variable: "user_input" } }
        ]
      },
      "filter_category": { main: [{ to: "send_2" }] },
      "send_11": {
        main: [
          { to: "send_2", condition: { operator: "equals", value: "option_1", variable: "user_input" } },
          { to: "send_2", condition: { operator: "equals", value: "option_2", variable: "user_input" } },
          { to: "send_2", condition: { operator: "equals", value: "option_3", variable: "user_input" } }
        ]
      },
      "send_12": {
        main: [
          { to: "send_11", condition: { operator: "equals", value: "option_1", variable: "user_input" } },
          { to: "send_11", condition: { operator: "equals", value: "option_2", variable: "user_input" } },
          { to: "send_11", condition: { operator: "equals", value: "option_3", variable: "user_input" } }
        ]
      },
      "send_2": { main: [{ to: "send_4", condition: { operator: "exists", variable: "user_input" } }] },
      "send_4": { main: [{ to: "send_5", condition: { operator: "exists", variable: "user_input" } }] },
      "send_5": { main: [{ to: "send_6", condition: { operator: "equals", variable: "user_input", value: "option_1" } }] },
      "send_6": { main: [{ to: "send_7" }] },
      "send_7": { main: [] }
    }
  } satisfies WorkflowParameters;

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly prisma: PrismaService,
    private readonly workflow: Workflow,
    private readonly whatsappService: WhatsAppService,
    private readonly whatsappCatalogService: WhatsAppCatalogService,
    private readonly nodeFactory: NodeFactory,
    private readonly conversationService: ConversationService,
    @InjectModel(WorkflowDefinition.name) private readonly workflowDefinitionModel: Model<WorkflowDefinitionDocument>,
    @InjectModel(BusinessWorkflow.name) private readonly businessWorkflowModel: Model<BusinessWorkflowDocument>,
    @InjectModel(WorkflowExecution.name) private readonly workflowExecutionModel: Model<WorkflowExecutionDocument>,
    private readonly workflowAnalyzer: WorkflowAnalyzerService,
  ) {
  }

  async onModuleInit() {
    this.kafkaConsumer.registerMessageHandler('workflow-orchestration-global', {
      handleAiResponse: async (aiResult: WorkflowProcessingContext) => {
        await this.handleIncomingMessage(aiResult);
      },
    });
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
      { path: 'lead.first_name', label: 'Lead First Name', example: 'Dheeraj' },
      { path: 'lead.last_name', label: 'Lead Last Name', example: 'Kumar' },
      { path: 'lead.status', label: 'Lead Status', example: 'qualified' },
      { path: 'lead.score', label: 'Lead Score', example: '85' },
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

    const enrichedConnections = this.enrichConnectionsWithConditions(nodes, connections);

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

      return workflowDef;
    }

    const existingLink = await this.businessWorkflowModel.findOne({ business_id });

    if (existingLink) {
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
      return workflowDef;
    }

    const new_workflow_id = crypto.randomUUID();
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

    return workflowDef;
  }

  async updateWorkflow(dto: UpdateWorkflowDto) {
    const { workflow_id, workflow_name, nodes, connections, description, is_active } = dto;

    return this.workflowDefinitionModel.findOneAndUpdate(
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

  private clearDropTimer(execution_id: string) {
    const existing = this.dropTimers.get(execution_id);
    if (existing) {
      clearTimeout(existing);
      this.dropTimers.delete(execution_id);
    }
  }


  async startWorkflow(lead_id: string, chat_id: string, channel: 'whatsapp' | 'instagram', workflowInput: WorkflowProcessingContext) {
    let business_id = workflowInput.business_id;
    if (!business_id) {
      const lead = await this.prisma.leads.findUnique({ where: { lead_id } });
      business_id = lead?.business_id;
    }

    if (!business_id) {
      throw new Error(`Cannot start workflow: business_id not found for lead ${lead_id}`);
    }

    const intent = workflowInput.intent?.intent ?? '';
    const activeWorkflow = await this.getActiveWorkflowForBusiness(business_id, intent);
    if (!activeWorkflow) {
      this.logger.warn(`No active workflow found for business ${business_id} intent "${intent}"`);
      return;
    }

    console.log("activeWrokflow", activeWorkflow)

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
          first_name: true,
          last_name: true,
          phone: true,
          email: true,
          status: true,
          lead_score: true,
        },
      }),
    ]);

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
      lead_first_name: lead?.first_name ?? null,
      lead_last_name: lead?.last_name ?? null,
      lead_phone: lead?.phone ?? null,
      lead_email: lead?.email ?? null,
      lead_status: lead?.status ?? null,
      lead_score: lead?.lead_score ?? null,
      channel,
      intent: intent || null,
      workflow_id: activeWorkflow.workflowId,
    };

    workflowInput.context = {
      ...workflowInput.context,
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
    this.logger.log(`Created workflow execution: ${execution_id}`);

    console.log("workflow input")
    console.dir(workflowInput)

    const workflow = new Workflow(this.nodeFactory);
    workflow.init(activeWorkflow.definition);
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

      // 30-min inactivity → mark as dropped
      this.clearDropTimer(execution_id);
      this.dropTimers.set(execution_id, setTimeout(async () => {
        this.logger.warn(`Workflow ${execution_id} dropped after 30min inactivity`);
        await this.workflowExecutionModel.findOneAndUpdate(
          { execution_id },
          { $set: { status: 'dropped', waiting_for_input: false } },
        );
        if (conversation_id) {
          await this.conversationService.updateConversation(conversation_id, {
            status: 'dropped',
            current_node_id: state.currentNodeId,
          });
        }
        this.dropTimers.delete(execution_id);
      }, 30 * 60 * 1000));
    };

    workflow.onComplete = async (state) => {
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        { $set: { status: 'completed', waiting_for_input: false } },
      );
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'ended',
          current_node_id: state.currentNodeId,
        });
      }
    };

    workflow.onError = async (nodeId, error) => {
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        { $set: { status: 'failed', waiting_for_input: false } },
      );
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'failed',
          current_node_id: nodeId,
          failed_reason: error.message,
        });
      }
    };

    console.dir(workflowInput)

    await workflow.execute(workflowInput);

    return workflow.getExecutionState();

  }

  async resumeWorkflow(executionId: string, workflow_id: string, currentNodeId: string, savedContext: any, lead_id: string, chat_id: string, waitingForInput: boolean, newInput: WorkflowProcessingContext) {
    const workflowDef = await this.getWorkflowDefinition(workflow_id);
    const workflow = new Workflow(this.nodeFactory);
    workflow.init(workflowDef);

    console.log("new input", newInput);

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
    this.clearDropTimer(executionId);

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

      this.clearDropTimer(executionId);
      this.dropTimers.set(executionId, setTimeout(async () => {
        this.logger.warn(`Workflow ${executionId} dropped after 30min inactivity`);
        await this.workflowExecutionModel.findOneAndUpdate(
          { execution_id: executionId },
          { $set: { status: 'dropped', waiting_for_input: false } },
        );
        if (conversation_id) {
          await this.conversationService.updateConversation(conversation_id, {
            status: 'dropped',
            current_node_id: state.currentNodeId,
          });
        }
        this.dropTimers.delete(executionId);
      }, 30 * 60 * 1000));
    };

    workflow.onComplete = async (state) => {
      this.clearDropTimer(executionId);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id: executionId },
        { $set: { status: 'completed', waiting_for_input: false } },
      );
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'ended',
          current_node_id: state.currentNodeId,
        });
      }
    };

    workflow.onError = async (nodeId, error) => {
      this.clearDropTimer(executionId);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id: executionId },
        { $set: { status: 'failed', waiting_for_input: false } },
      );
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

  private async getActiveWorkflowForBusiness(businessId: string, intentName: string): Promise<{ workflowId: string; definition: WorkflowParameters } | null> {
    const link = await this.businessWorkflowModel.findOne({ business_id: businessId, is_active: true }).lean();
    if (!link) return null;

    const def = await this.workflowDefinitionModel.findOne({ workflow_id: link.workflow_id }).lean();
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
    this.logger.log(`startFromNode: created execution ${execution_id} at node ${nodeId}`);

    const workflow = new Workflow(this.nodeFactory);
    workflow.init(activeWorkflow.definition);
    const conversation_id = context.context?.conversation_id;

    workflow.onPause = async (state) => {
      await this.saveExecutionState({ execution_id, ...state, lead_id: leadId, chat_id: chatId });
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          current_node_id: state.currentNodeId,
          status: 'waiting',
        });
      }
      this.clearDropTimer(execution_id);
      this.dropTimers.set(execution_id, setTimeout(async () => {
        this.logger.warn(`Workflow ${execution_id} dropped after 30min inactivity`);
        await this.workflowExecutionModel.findOneAndUpdate(
          { execution_id },
          { $set: { status: 'dropped', waiting_for_input: false } },
        );
        if (conversation_id) {
          await this.conversationService.updateConversation(conversation_id, {
            status: 'dropped',
            current_node_id: state.currentNodeId,
          });
        }
        this.dropTimers.delete(execution_id);
      }, 30 * 60 * 1000));
    };

    workflow.onComplete = async (state) => {
      this.clearDropTimer(execution_id);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        { $set: { status: 'completed', waiting_for_input: false } },
      );
      if (conversation_id) {
        await this.conversationService.updateConversation(conversation_id, {
          status: 'ended',
          current_node_id: state.currentNodeId,
        });
      }
    };

    workflow.onError = async (nodeId: string, error: Error) => {
      this.clearDropTimer(execution_id);
      await this.workflowExecutionModel.findOneAndUpdate(
        { execution_id },
        { $set: { status: 'failed', waiting_for_input: false } },
      );
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

    console.log("incomingParams", incomingParams)

    const phoneNumberId = incomingParams.context.contact?.phoneNumberId;

    const hasWaitingWorkflow = await this.workflowExecutionModel.findOne({
      channel,
      chat_id: phoneNumberId,
      waiting_for_input: true,
      business_id: incomingParams.business_id,
      lead_id: incomingParams.lead_id,
    }).lean();

    if (hasWaitingWorkflow) {
      console.log('Resuming existing workflow execution for chat_id:', phoneNumberId);
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
      return;
    }

    this.startWorkflow(
      incomingParams.lead_id,
      phoneNumberId,
      channel,
      incomingParams,
    );
  }

  private async callRagChat(incomingParams: WorkflowProcessingContext): Promise<void> {
    const { conversation_id } = incomingParams.context;

    const messages = await this.conversationService.getConversationHistory(conversation_id, 10);
    const conversationHistory = messages.map(msg => ({
      role: msg.sender_type === 'lead' ? 'user' : 'assistant' as 'user' | 'assistant',
      content: msg.message_text,
    }));

    const nodeContext: WorkflowNodeExecutionContext = {
      ...incomingParams.context as any,
      user_input: incomingParams.user_input,
      business_id: incomingParams.business_id,
      lead_id: incomingParams.lead_id,
      tenant_id: incomingParams.tenant_id,
      intent: incomingParams.intent,
      entities: incomingParams.entities,
      structured_data: incomingParams.structured_data,
    };

    const ragNode = this.nodeFactory.createNode({
      id: 'rag_chat_fallback',
      type: 'action.rag_chat',
      name: 'RAG Chat',
      position: { x: 0, y: 0 },
      params: {
        context_limit: 10,
        sendResults: true,
        conversation_history: conversationHistory as any,
      },
    });

    await ragNode.execute(nodeContext);
  }

  /**
   * Enrich a WhatsApp Flow response with full DB data based on known IDs.
   * Supports: booking_id (service_bookings) and order_id (orders).
   */
  private async enrichFlowResponse(data: Record<string, any>): Promise<Record<string, any>> {
    // --- Service booking ---
    if (data.booking_id) {
      const booking = await this.prisma.service_bookings.findUnique({
        where: { booking_id: data.booking_id },
        include: { services: true, booking_guests: true },
      });
      if (booking) {
        const nights = Math.ceil(
          (booking.check_out_date.getTime() - booking.check_in_date.getTime()) / 86_400_000,
        );
        return {
          booking_id: booking.booking_id,
          booking_reference: booking.booking_reference,
          service_name: booking.services.name,
          service_type: booking.services.type,
          check_in_date: booking.check_in_date.toISOString().split('T')[0],
          check_out_date: booking.check_out_date.toISOString().split('T')[0],
          nights,
          total_price: Number(booking.total_price),
          booking_status: booking.status,
          payment_status: booking.payment_status,
          num_guests: booking.booking_guests?.num_guests ?? booking.slots_booked,
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
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
