import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConversationStateMachineService } from "./conversation-state-machine.service";
import { ConversationContextService } from "./conversation-context.service";
import { WhatsAppService } from "./whatsapp.service";
import { ZohoService } from "src/integrations/crm/zoho/zoho.service";
import { AdvancedSessionService } from "./advanced-session.service";
import {
  ConversationEvent,
  ConversationStep,
} from "../interfaces/converstation-state-machine.enum";
import { ConversationContext } from "../interfaces/session.interface";
import { SessionStoreService } from "./session-store.service";

@Injectable()
export class ConversationHandlerService {
  constructor(
    private stateMachineService: ConversationStateMachineService,
    private contextService: ConversationContextService,
    private sessionService: AdvancedSessionService,
    private sessionStoreService: SessionStoreService,
    @Inject(forwardRef(() => WhatsAppService))
    private whatsappService: WhatsAppService,
    private zohoService: ZohoService
  ) {}

  async handleMessage(
    phoneNumber: string,
    body: string
  ): Promise<string | void> {
    try {
      await this.contextService.initializeContext(phoneNumber);

      const session = await this.sessionStoreService.getSession(phoneNumber)!;

      const currentStep = session.currentStep;
      const context = session.context;

      if (!currentStep || currentStep === ConversationStep.GREETING) {
        await this.contextService.transitionToStep(ConversationStep.GREETING);

        const greetingMessage = await this.generateStepResponse(
          ConversationStep.GREETING,
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

    if (lowerInput.includes("help") || lowerInput.includes("support")) {
      return ConversationEvent.HELP_REQUESTED;
    }

    if (lowerInput.includes("restart") || lowerInput.includes("reset")) {
      return ConversationEvent.RESET_REQUESTED;
    }

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

      case ConversationStep.AWAITING_CATEGORY:
        if (lowerInput === "1") {
          return ConversationEvent.CATEGORY_SELECTED;
        }
        break;
      // add more cases for other steps as needed
    }
  }

  private async generateStepResponse(
    step: ConversationStep,
    context: ConversationContext
  ): Promise<string> {
    switch (step) {
      case ConversationStep.GREETING:
        return "Welcome! How can I assist you today? Reply with '1' to start.";

      case ConversationStep.AWAITING_CATEGORY:
        return "Please select a category by replying with '2'.";
      default:
        // console.log("Generating response for step:", step);
        return "I'm not sure how to help with that. Please try again.";
    }
  }
}
