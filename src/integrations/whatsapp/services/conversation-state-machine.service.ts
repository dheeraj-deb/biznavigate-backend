import { Injectable } from "@nestjs/common";
import {
  CONVERSATION_TRANSITIONS,
  StateTransition,
} from "../config/state-machine.config";
import {
  ConversationEvent,
  ConversationStep,
} from "../interfaces/conversation-state-machine.enum";
import { ConversationContext } from "../interfaces/session.interface";

@Injectable()
export class ConversationStateMachineService {
  private transitions: Map<string, StateTransition[]> = new Map();

  constructor() {
    this.initializeTransitions();
  }

  private initializeTransitions(): void {
    CONVERSATION_TRANSITIONS.forEach((transition) => {
      transition.from.forEach((from) => {
        const key = `${from}:${transition.event}`;
        if (!this.transitions.has(key)) {
          this.transitions.set(key, []);
        }
        this.transitions.get(key)!.push(transition);
      });
    });
  }


  async canTransition(
    currentStep: ConversationStep,
    event: ConversationEvent,
    context: ConversationContext
  ): Promise<boolean> {
    const transitions = this.getValidTransitions(currentStep, event);
    console.log(`[DEBUG] Found ${transitions.length} transitions for ${currentStep} -> ${event}`);

    const result = transitions.some((transition) => {
      const guardResult = !transition.guard || transition.guard(context);
      console.log(`[DEBUG] Guard check - guard exists: ${!!transition.guard}, result: ${guardResult}`);
      if (transition.guard) {
        console.log(`[DEBUG] Context productList:`, context.productList);
        console.log(`[DEBUG] Guard condition: !!context.productList && context.productList.length > 0`);
        console.log(`[DEBUG] !!context.productList:`, !!context.productList);
        console.log(`[DEBUG] context.productList.length:`, context.productList?.length);
      }
      return guardResult;
    });

    console.log(`[DEBUG] Final canTransition result: ${result}`);
    return result;
  }

  async executeTransition(
    currentStep: ConversationStep,
    event: ConversationEvent,
    context: ConversationContext
  ): Promise<ConversationStep | null> {
    console.log("\n========== EXECUTE TRANSITION ==========");
    console.log("Current Step:", currentStep);
    console.log("Event:", event);
    console.log("Context productList:", context.productList);
    console.log("Context originalParsedProducts:", context.originalParsedProducts);
    console.log("Context unmatchedProducts:", context.unmatchedProducts);
    console.log("========================================\n");

    const transitions = this.getValidTransitions(currentStep, event);
    console.log(`Found ${transitions.length} possible transitions`);

    for (let i = 0; i < transitions.length; i++) {
      const transition = transitions[i];
      console.log(`\nEvaluating transition ${i + 1}/${transitions.length}: ${currentStep} -> ${transition.to}`);

      if (!transition.guard) {
        console.log("  No guard - transition allowed");
        if (transition.action) {
          await transition.action(context);
        }
        console.log(`  ✓ Transitioning to: ${transition.to}`);
        return transition.to;
      }

      const guardResult = transition.guard(context);
      console.log(`  Guard result: ${guardResult}`);

      if (guardResult) {
        if (transition.action) {
          await transition.action(context);
        }
        console.log(`  ✓ Transitioning to: ${transition.to}`);
        return transition.to;
      }
    }

    console.log("\n❌ No valid transition found - staying at current step\n");
    return null;
  }

  private getValidTransitions(
    currentStep: ConversationStep,
    event: ConversationEvent
  ): StateTransition[] {
    const key = `${currentStep}:${event}`;
    return this.transitions.get(key) || [];
  }

  getAvailableEvents(currentStep: ConversationStep): ConversationEvent[] {
    const events: ConversationEvent[] = [];
    this.transitions.forEach((transitions, key) => {
      const [state, event] = key.split(":");
      if (
        state === currentStep &&
        !events.includes(event as ConversationEvent)
      ) {
        events.push(event as ConversationEvent);
      }
    });
    return events;
  }
}
