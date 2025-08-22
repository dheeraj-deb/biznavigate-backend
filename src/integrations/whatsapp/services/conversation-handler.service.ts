import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConversationStateMachineService } from "./conversation-state-machine.service";
import { ConversationContextService } from "./conversation-context.service";
import { WhatsAppService } from "./whatsapp.service";
import { ZohoService } from "src/integrations/crm/zoho/zoho.service";
import {
  ConversationEvent,
  ConversationStep,
} from "../interfaces/conversation-state-machine.enum";
import { ConversationContext } from "../interfaces/session.interface";
import { SessionService } from "./session.service";
import { PrismaService } from "src/prisma/prisma.service";
import { WhatsAppResponseWithTemplate } from "../interfaces/whatsapp-response-template.interface";
import { ZohoSyncService } from "src/integrations/crm/zoho/zoho-sync.service";

@Injectable()
export class ConversationHandlerService {
  constructor(
    private stateMachineService: ConversationStateMachineService,
    private contextService: ConversationContextService,
    private sessionService: SessionService,
    @Inject(forwardRef(() => WhatsAppService))
    private whatsappService: WhatsAppService,
    private zohoService: ZohoService,
    private prisma: PrismaService,
    private zohoSync: ZohoSyncService
  ) {}

  async handleMessage(
    distributorPhoneNumber: string,
    userPhoneNumber: string,
    body: string
  ): Promise<WhatsAppResponseWithTemplate | void> {
    try {
      await this.contextService.initializeContext(userPhoneNumber);

      const session = await this.sessionService.getSession(userPhoneNumber)!;

      const currentStep = session.currentStep;
      let context = session.context;
      context.distributorPhoneNumber = distributorPhoneNumber.split(":")[1];
      if (!currentStep || currentStep === ConversationStep.GREETING) {
        await this.contextService.transitionToStep(ConversationStep.GREETING);
        const existingUser = false;
        let STEP = null;
        if (existingUser) {
          STEP = ConversationStep.GREETING;
        } else {
          STEP = ConversationStep.REGISTRATION;
        }
        const greetingMessage = await this.generateStepResponse(
          STEP,
          session.context
        );

        const newStep = await this.stateMachineService.executeTransition(
          currentStep,
          ConversationEvent.START,
          context
        );

        if (newStep) {
          await this.contextService.transitionToStep(newStep);
        }

        console.log("Greeting message:", greetingMessage);

        return greetingMessage;
      }

      const event = await this.parseUserInput(body, currentStep, context);

      const canTransition = await this.stateMachineService.canTransition(
        currentStep,
        event,
        context
      );

      // console.log("canTransition:", canTransition);

      if (!canTransition) {
        // return this.handleInvalidInput
      }

      const newStep = await this.stateMachineService.executeTransition(
        currentStep,
        event,
        context
      );

      // console.log("currentStep:", currentStep);
      if (newStep) {
        await this.contextService.transitionToStep(newStep);
      }

      return await this.generateStepResponse(currentStep, context);

      //   return this.handleUnexpectedError()
    } catch (error) {
      console.error("Error handling message:", error);
      // Handle error appropriately, e.g., log it, notify user, etc.
      throw error;
    }
  }

  private async parseUserInput(
    input: string,
    currentStep: ConversationStep,
    context: ConversationContext
  ): Promise<ConversationEvent> {
    const lowerInput = input.toLowerCase().trim();

    // if (lowerInput.includes("help") || lowerInput.includes("support")) {
    //   return ConversationEvent.HELP_REQUESTED;
    // }

    // if (lowerInput.includes("restart") || lowerInput.includes("reset")) {
    //   return ConversationEvent.RESET_REQUESTED;
    // }

    switch (currentStep) {
      case ConversationStep.GREETING:
        if (
          lowerInput.includes("hi") ||
          lowerInput.includes("hello") ||
          lowerInput === "1"
        ) {
          return ConversationEvent.START;
        }
        break;

      case ConversationStep.REGISTRATION:
        if (lowerInput === "1") {
          return ConversationEvent.REGISTRATION_COMPLETED;
        }
        break;
      // add more cases for other steps as needed
    }
  }

  private async generateStepResponse(
    step: ConversationStep,
    context: ConversationContext
  ): Promise<WhatsAppResponseWithTemplate> {
    switch (step) {
      case ConversationStep.GREETING:
        return {
          message: "Welcome! How can I assist you today?",
        };
      case ConversationStep.REGISTRATION:
        const registrationTemplate =
          await this.prisma.whatsapp_templates.findFirst({
            where: { key: "client_registration" },
          });

        const distributorCredential =
          await this.prisma.zoho_user_credential.findFirst({
            where: {
              whatsapp_number: context.distributorPhoneNumber,
            },
          });

        await this.zohoSync.syncZohoProduct(context.distributorPhoneNumber);

        const variable = JSON.stringify(registrationTemplate.variables).replace(
          "{{code}}",
          distributorCredential?.client_id.toString()
        );

        const data = {
          contentVariables: variable,
          contentSid: registrationTemplate.sid,
          message: "Please provide your details to register.",
        };
        return data;
      case ConversationStep.AWAITING_ORDER:
        const awaitingOrderTemplate =
          await this.prisma.whatsapp_templates.findFirst({
            where: { key: "awaiting_order" },
          });

        const orderDetails = context.distributorPhoneNumber;

        const orderVariable = JSON.stringify(
          awaitingOrderTemplate.variables
        ).replace("{{order_id}}", orderDetails?.id.toString());

        const orderData = {
          contentVariables: orderVariable,
          contentSid: awaitingOrderTemplate.sid,
          message: "Your order is being processed.",
        };
        return orderData;
      default:
        // console.log("Generating response for step:", step);
        return {
          message: "I'm not sure how to help with that. Please try again.",
        };
    }
  }
}
