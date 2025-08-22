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
    return transitions.some((transition) => {
      return !transition.guard || transition.guard(context);
    });
  }

  async executeTransition(
    currentStep: ConversationStep,
    event: ConversationEvent,
    context: ConversationContext
  ): Promise<ConversationStep | null> {
    const transitions = this.getValidTransitions(currentStep, event);
    for (const transition of transitions) {
      if (!transition.guard || transition.guard(context)) {
        if (transition.action) {
          await transition.action(context);
        }
        return transition.to;
      }
    }
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
