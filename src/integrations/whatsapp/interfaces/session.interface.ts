import { ConversationStep } from "./conversation-state-machine.enum";
import { IntentDetectionResult } from "../services/intent-detection.service";

export interface ConversationContext {
  distributorPhoneNumber?: string;
  phoneNumber?: string;
  productList: {
    name: string;
    quantity: number;
    price?: number;
    productId?: string;
    available?: boolean;
    confidence?: number;
  }[];
  userDetails: any;
  lastMessageTimestamp: Date;
  messageCount: number;
  errorCount: number;
  isNewUser: boolean;
  orderTotal?: number;
  unmatchedProducts?: any[];
  originalParsedProducts?: any[];
  productMatchingError?: boolean;
  catalogPage?: number;
  catalogTotalPages?: number;
  lastUserInput?: string;
  lastDetectedIntent?: IntentDetectionResult;
  // Zoho Sales Order fields
  zohoSalesOrderId?: string;
  zohoSalesOrderNumber?: string;
  zohoSalesOrderStatus?: string;
  zohoSalesOrderError?: string;
}

export interface ConversationSession {
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