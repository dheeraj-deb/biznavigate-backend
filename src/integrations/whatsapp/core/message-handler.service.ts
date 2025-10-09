import { Injectable, Logger } from '@nestjs/common';
import { MessageContext, MessageResponse } from './message-context';
import { MiddlewarePipeline } from './middleware/middleware-pipeline';
import { MessageMiddleware } from './middleware/message-middleware.interface';

/**
 * Main message handler service using middleware pipeline
 */
@Injectable()
export class MessageHandlerService {
  private readonly logger = new Logger(MessageHandlerService.name);
  private readonly pipeline: MiddlewarePipeline;

  constructor(pipeline: MiddlewarePipeline) {
    this.pipeline = pipeline;
  }

  /**
   * Register middleware
   */
  use(middleware: MessageMiddleware, order: number): void {
    this.pipeline.use(middleware, order);
  }

  /**
   * Handle incoming message
   */
  async handle(params: {
    from: string;
    to: string;
    body: string;
    rawPayload?: any;
  }): Promise<MessageResponse | void> {
    // Create message context
    const context = new MessageContext(params);

    try {
      // Execute middleware pipeline
      await this.pipeline.execute(context);

      // Return response if set
      if (context.response) {
        return context.response;
      }

      // No handler processed the message
      this.logger.warn(`No handler processed message from ${context.from}`);
      return {
        message: "I didn't understand that. Type 'help' for available commands.",
      };
    } catch (error) {
      this.logger.error('Message handling failed:', error);

      // Return generic error response
      return {
        message: 'Sorry, something went wrong. Please try again later.',
      };
    }
  }
}
