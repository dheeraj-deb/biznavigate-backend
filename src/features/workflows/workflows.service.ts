import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from '../kafka/kafka-consumer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Workflow } from './core/workflow';
import { WorkflowParameters, WorkflowProcessingContext } from './interfaces';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { WhatsAppCatalogService } from '../whatsapp/services/whatsapp-catalog.service';
import { NodeFactory } from './factories/node-factory';

@Injectable()
export class WorkflowsService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowsService.name);

  workflowDefinition = {
    id: "00000000-0000-0000-0000-000000000001", // Valid UUID for test workflow
    name: "Test Workflow",
    active: true,
    nodes: [
      {
        id: "trigger_1",
        type: "trigger.whatsapp.intent",
        name: "Trigger",
        position: { x: 0, y: 0 },
        params: {
          intent: "GENERAL_INQUIRY"
        }
      },
      {
        id: "trigger_purchase",
        type: "trigger.whatsapp.intent",
        name: "Trigger",
        position: { x: 0, y: 0 },
        params: {
          intent: "PURCHASE_INTENT"
        }
      },
      {
        id: "trigger_support",
        type: "trigger.whatsapp.intent",
        name: "Trigger",
        position: { x: 0, y: 0 },
        params: {
          intent: "SUPPORT_INTENT"
        }
      },
      {
        id: "trigger_traking",
        type: "trigger.whatsapp.intent",
        name: "Trigger",
        position: { x: 0, y: 0 },
        params: {
          intent: "TRACKING_INTENT"
        }
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
        id: "send_3",
        type: "action.send_message_with_btns",
        name: "Send Post-Selection Message",
        position: { x: 800, y: 0 },
        output_variable: "button_selection",
        params: {
          message: "Thank you for your selection!",
          buttons: [
            { id: "option_1", title: "Confirm Selection" },
            { id: "option_2", title: "Cancel Selection" },
            { id: "option_3", title: "View More Products" }
          ]
        }
      },
      {
        id: "send_4",
        type: "action.wait_for_text",
        name: "Send Final Message",
        position: { x: 1000, y: 0 },
        params: {
          prompt: "Please send your address to confirm delivery."
        }
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
        params: {
          message: "Payment of $100 USD will be processed. (Payment node coming soon)"
        }
      },
      {
        id: "send_7",
        type: "action.send_message",
        name: "Send Payment Confirmation",
        position: { x: 1600, y: 0 },
        params: {
          message: "Your order has been processed successfully!"
        }
      }
    ],
    connections: {
      "trigger_1": {
        main: [
          {
            to: "send_1",
          }
        ]
      },
      "send_1": {
        main: [
          {
            to: "filter_category",
            condition: {
              operator: "equals",
              value: "option_1",
              variable: "user_input"
            }
          },
          {
            to: "contact_support",
            condition: {
              operator: "equals",
              value: "option_2",
              variable: "user_input"
            }
          },
          {
            to: "leave_feedback",
            condition: {
              operator: "equals",
              value: "option_3",
              variable: "user_input"
            }
          }
        ]
      },
      // "filter_gender": {
      //   main: [
      //     {
      //       to: "filter_category"
      //     }
      //   ]
      // },
      "filter_category": {
        main: [
          {
            to: "send_2"
          }
        ]
      },
      "send_11": {
        main: [
          {
            to: "send_2",
            condition: {
              operator: "equals",
              value: "option_1",
              variable: "user_input"
            }
          },
          {
            to: "send_2",
            condition: {
              operator: "equals",
              value: "option_2",
              variable: "user_input"
            }
          },
          {
            to: "send_2",
            condition: {
              operator: "equals",
              value: "option_3",
              variable: "user_input"
            }
          }
        ]
      },
      "send_12": {
        main: [
          {
            to: "send_11",
            condition: {
              operator: "equals",
              value: "option_1",
              variable: "user_input"
            }
          },
          {
            to: "send_11",
            condition: {
              operator: "equals",
              value: "option_2",
              variable: "user_input"
            }
          },
          {
            to: "send_11",
            condition: {
              operator: "equals",
              value: "option_3",
              variable: "user_input"
            }
          }
        ]
      },
      "send_2": {
        main: [
          {
            to: "send_3",
            condition: {
              operator: "exists",
              variable: "user_input"
            }
          }
        ]
      },
      send_3: {
        main: [

          {
            to: "send_4",
            condition: {
              operator: "equals",
              variable: "user_input",
              value: "option_1"
            }
          },

          {
            to: "send_2",
            condition: {
              operator: "equals",
              variable: "user_input",
              value: "option_2"
            }
          },

          {
            to: "send_1",
            condition: {
              operator: "equals",
              variable: "user_input",
              value: "option_3"
            }
          }

        ]
      },
      send_4: {
        main: [
          {
            to: "send_5",
            condition: {
              operator: "exists",
              variable: "user_input"
            }
          }
        ]
      },
      send_5: {
        main: [
          {
            to: "send_6",
            condition: {
              operator: "equals",
              variable: "user_input",
              value: "option_1"
            }
          }
        ]
      },

      send_6: {
        main: [
          { to: "send_7" }
        ]
      },

      send_7: {
        main: []
      }
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

  ) {
  }

  async onModuleInit() {
    this.kafkaConsumer.registerMessageHandler('workflow-orchestration-global', {
      handleAiResponse: async (aiResult: WorkflowProcessingContext) => {
        console.log('Received AI result for orchestration:', aiResult);
        await this.handleIncomingMessage(aiResult);
      },
    });
  }


  async startWorkflow(lead_id: string, workflowId: string, chat_id: string, channel: 'whatsapp' | 'instagram', workflowInput: WorkflowProcessingContext) {
    let business_id = workflowInput.business_id;
    if (!business_id) {
      const lead = await this.prisma.leads.findUnique({ where: { lead_id } });
      business_id = lead?.business_id;
    }

    if (!business_id) {
      throw new Error(`Cannot start workflow: business_id not found for lead ${lead_id}`);
    }

    const workflowExecution = await this.prisma.workflow_executions.create({
      data: {
        workflow_id: workflowId,
        business_id: business_id,
        lead_id: lead_id,
        channel: channel,
        chat_id: chat_id,
        status: 'running',
        waiting_for_input: false,
        current_node_id: null,
        context: workflowInput as any,
      },
    });

    const execution_id = workflowExecution.execution_id;
    this.logger.log(`Created workflow execution: ${execution_id}`);

    const workflow = new Workflow(this.nodeFactory);
    workflow.init(await this.getWorkflowDefinition(workflowId));


    workflow.onPause = async (state) => {
      await this.saveExecutionState({
        execution_id,
        ...state,
        lead_id,
        chat_id
      });
    };

    await workflow.execute(workflowInput);

    return workflow.getExecutionState();

  }

  private async resumeWorkflow(executionId: string, workflow_id: string, currentNodeId: string, savedContext: any, lead_id: string, chat_id: string, waitingForInput: boolean, newInput: WorkflowProcessingContext) {
    const workflow = new Workflow(this.nodeFactory);
    workflow.init(this.getWorkflowDefinition(workflow_id));

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

    workflow.restoreState({
      currentNodeId,
      context: {
        ...savedContext,
        user_input: actualInput,
        cart_info: newInput.cart_info,
        intent: newInput.intent,
        entities: newInput.entities,
      },
      waitingForInput: waitingForInput,
    })

    workflow.onPause = async (state) => {
      await this.saveExecutionState({
        execution_id: executionId,
        ...state,
        lead_id,
        chat_id
      });
    };

    workflow.resume(actualInput);

    if (!workflow.getExecutionState().waitingForInput) {
      await this.prisma.workflow_executions.update({
        where: { execution_id: executionId },
        data: { waiting_for_input: false },
      });
    }

    return workflow.getExecutionState();

  }

  private async saveExecutionState({ execution_id, currentNodeId, context, waitingForInput }) {
    try {
      const response = await this.prisma.workflow_executions.update({
        where: { execution_id: execution_id },
        data: {
          current_node_id: currentNodeId,
          context,
          waiting_for_input: waitingForInput,
          status: waitingForInput ? 'paused' : 'running',
          updated_at: new Date()
        }
      })
      console.log('Workflow execution state saved:', response);
    } catch (error) {
      this.logger.error('Failed to save workflow execution state:', error);
    }
  }

  private getWorkflowDefinition(workflowId: string): WorkflowParameters | null {
    return this.workflowDefinition;
  }


  async handleIncomingMessage(incomingParams: WorkflowProcessingContext) {
    const channel = 'whatsapp';

    const { phoneNumberId, from } = incomingParams.context;

    const hasWaitingWorkflow = await this.prisma.workflow_executions.findFirst({
      where: {
        channel: channel,
        chat_id: phoneNumberId,
        waiting_for_input: true,
        business_id: incomingParams.business_id,
        lead_id: incomingParams.lead_id,
      },
    })

    console.log("hasWaitingWorkflow", hasWaitingWorkflow);

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
    } else {
      const { intent } = incomingParams.intent;
      const { lead_id, business_id } = incomingParams;
      const startNode = this.workflowDefinition.nodes.find(node => node.type === `trigger.${channel}.intent` && node.params.intent === intent);

      console.log('Starting new workflow for intent:', intent);

      this.startWorkflow(
        lead_id,
        this.workflowDefinition.id,
        phoneNumberId,
        channel,
        incomingParams
      );
    }

  }

}
