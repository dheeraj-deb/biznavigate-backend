import { Injectable, Logger } from '@nestjs/common';
import { MessageContext } from '../message-context';
import { MessageMiddleware, MiddlewareOrder } from './message-middleware.interface';
import { ConversationHandlerService } from '../../services/conversation-handler.service';

/**
 * Conversation flow middleware - handles the main conversation logic
 * This integrates with the existing conversation handler
 */
@Injectable()
export class ConversationFlowMiddleware implements MessageMiddleware {
  private readonly logger = new Logger(ConversationFlowMiddleware.name);

  constructor(
    private readonly conversationHandler: ConversationHandlerService
  ) {}

  async process(context: MessageContext, next: () => Promise<void>): Promise<void> {
    try {
      // Skip if already handled by another middleware
      if (context.isHandled) {
        await next();
        return;
      }

      // Extract distributor and user phones
      const distributorPhone = context.to.replace('whatsapp:', '');
      const userPhone = context.from.replace('whatsapp:', '');

      // Handle message through conversation handler
      const response = await this.conversationHandler.handleMessage(
        distributorPhone,
        userPhone,
        context.body,
        context.rawPayload
      );

      if (response) {
        context.setResponse(response);
      }

      await next();
    } catch (error) {
      this.logger.error('Conversation flow failed:', error);
      context.setError(error);
      await next(); // Continue to error handler
    }
  }
}

export const CONVERSATION_FLOW_MIDDLEWARE_ORDER = MiddlewareOrder.BUSINESS_LOGIC;
