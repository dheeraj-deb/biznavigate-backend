import { Injectable, Scope } from "@nestjs/common";
import { ConverstationSession } from "../interfaces/session.interface";
import { SessionStoreService } from "./session-store.service";
import { ConversationLoggerService } from "./conversation-logger.service";
import { v4 as uuidv4 } from "uuid";
import { ConversationStep } from "../interfaces/converstation-state-machine.enum";

@Injectable({ scope: Scope.REQUEST })
export class ConversationContextService {
  private session: ConverstationSession | null = null;
  private isInitialized: boolean = false;

  constructor(
    private sessionStore: SessionStoreService,
    private conversationLogger: ConversationLoggerService
  ) {}

  async initializeContext(phoneNumber: string): Promise<void> {
    if (this.isInitialized) return;
    this.session = await this.sessionStore.getSession(phoneNumber);
    if (!this.session) {
      this.session = this.createNewSession(phoneNumber);
      await this.sessionStore.setSession(phoneNumber, this.session);
    } else {
      await this.sessionStore.extendSession(phoneNumber);
    }

    this.isInitialized = true;
  }

  private createNewSession(phoneNumber: string): ConverstationSession {
    return {
      sessionId: this.generateSessionId(),
      userId: this.generateUserId(phoneNumber),
      phoneNumber,
      currentStep: ConversationStep.GREETING,
      context: {
        cart: [],
        userDetails: null,
        paymentMethod: null,
        lastMessageTimestamp: new Date(),
        messageCount: 0,
        errorCount: 0,
      },
      metadata: {
        platform: "whatsapp",
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // UTC
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async updateContext(updates: Partial<ConverstationSession>): Promise<void> {
    if (!this.session) {
      throw new Error("Context not initialized.");
    }

    this.session.context = {
      ...this.session.context,
      ...updates,
    };
    await this.sessionStore.updateSession(
      this.session.phoneNumber,
      this.session
    );
  }

  async transitionToStep(newStep: ConversationStep): Promise<void> {
    if (!this.session) {
      throw new Error("Context not initialized.");
    }

    const oldStep = this.session.currentStep;
    this.session.currentStep = newStep;
    this.session.updatedAt = new Date();

    // console.log("Transitioning from", oldStep, "to", newStep);

    await this.sessionStore.updateSession(
      this.session.phoneNumber,
      this.session
    );

    // console.log("SESSION UPDATED:", this.session , newStep);

    this.conversationLogger.logStateTransition(
      this.session.sessionId,
      oldStep,
      newStep
    );
  }

  private generateSessionId(): string {
    return uuidv4(); // Returns a string like '7a0e5428-...'
  }

  private generateUserId(phoneNumber: string): string {
    // Option 1: Use phone number directly (beware of privacy/persistence)
    return phoneNumber;
  }
}
