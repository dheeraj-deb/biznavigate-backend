import { MessageContext } from '../message-context';

/**
 * Middleware interface for processing messages in a pipeline
 */
export interface MessageMiddleware {
  /**
   * Process the message context
   * @param context Message context
   * @param next Call next middleware in pipeline
   */
  process(context: MessageContext, next: () => Promise<void>): Promise<void>;
}

/**
 * Middleware execution order
 */
export enum MiddlewareOrder {
  FIRST = 0,
  RATE_LIMITING = 100,
  AUTHENTICATION = 200,
  SESSION_MANAGEMENT = 300,
  LOGGING = 400,
  VALIDATION = 500,
  BUSINESS_LOGIC = 1000,
  RESPONSE = 2000,
  ERROR_HANDLING = 9999,
}
