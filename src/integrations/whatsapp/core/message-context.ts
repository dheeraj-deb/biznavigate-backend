import { v4 as uuidv4 } from 'uuid';

/**
 * Message Context - carries all information about incoming message through middleware pipeline
 */
export class MessageContext {
  readonly id: string;
  readonly timestamp: Date;
  readonly from: string;
  readonly to: string;
  readonly body: string;
  readonly rawPayload: any;

  // Session and user info
  sessionId?: string;
  userId?: string;
  organizationId?: string;

  // Metadata
  metadata: Map<string, any> = new Map();

  // Response
  response?: MessageResponse;

  // Flow control
  isHandled: boolean = false;
  error?: Error;

  constructor(params: {
    from: string;
    to: string;
    body: string;
    rawPayload?: any;
  }) {
    this.id = uuidv4();
    this.timestamp = new Date();
    this.from = params.from;
    this.to = params.to;
    this.body = params.body;
    this.rawPayload = params.rawPayload;
  }

  setMetadata(key: string, value: any): void {
    this.metadata.set(key, value);
  }

  getMetadata<T>(key: string): T | undefined {
    return this.metadata.get(key);
  }

  setResponse(response: MessageResponse): void {
    this.response = response;
    this.isHandled = true;
  }

  setError(error: Error): void {
    this.error = error;
  }
}

export interface MessageResponse {
  message?: string;
  contentSid?: string;
  contentVariables?: string;
  mediaUrl?: string[];
  delay?: number; // Delay before sending (ms)
}
