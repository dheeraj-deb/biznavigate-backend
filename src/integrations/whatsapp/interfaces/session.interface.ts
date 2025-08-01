import { ConversationStep } from "./converstation-state-machine.enum";

export interface ConversationContext {
  cart: { product: any; quantity: number; price: number }[];
  userDetails: any;
  paymentMethod: string | null;
  lastMessageTimestamp: Date;
  messageCount: number;
  errorCount: number;
}

export interface ConverstationSession {
  sessionId: string;
  userId: string;
  phoneNumber: string;
  currentStep: ConversationStep;
  context: ConversationContext;
  metadata: SessionMetadata;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface SessionMetadata {
  platform: "whatsapp";
  deviceInfo?: string;
  location?: Location;
  language: string;
  timezone: string;
}
