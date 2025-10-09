import { Injectable, Logger } from '@nestjs/common';
import { MessageContext } from '../message-context';
import { MessageMiddleware, MiddlewareOrder } from './message-middleware.interface';

/**
 * Global error handler middleware
 */
@Injectable()
export class ErrorHandlerMiddleware implements MessageMiddleware {
  private readonly logger = new Logger(ErrorHandlerMiddleware.name);

  async process(context: MessageContext, next: () => Promise<void>): Promise<void> {
    try {
      await next();

      // If error exists but not handled
      if (context.error && !context.isHandled) {
        this.handleError(context);
      }
    } catch (error) {
      this.logger.error(`Unhandled error in pipeline for ${context.from}:`, error);
      context.setError(error);
      this.handleError(context);
    }
  }

  private handleError(context: MessageContext): void {
    const error = context.error;

    // Categorize error
    if (this.isRateLimitError(error)) {
      return; // Already handled by rate limit middleware
    }

    if (this.isValidationError(error)) {
      context.setResponse({
        message: "❌ Invalid input. Please check your message and try again.\n\nType 'help' for assistance.",
      });
      return;
    }

    if (this.isExternalServiceError(error)) {
      context.setResponse({
        message: "⚠️ We're experiencing technical difficulties.\n\nPlease try again in a few moments.\n\nIf the issue persists, contact support.",
      });
      return;
    }

    // Generic error
    context.setResponse({
      message: "😔 Oops! Something went wrong.\n\nOur team has been notified. Please try again later.\n\nType 'help' if you need assistance.",
    });

    // TODO: Send alert to monitoring system (Sentry, CloudWatch, etc.)
    this.logger.error('Sending error alert to monitoring system:', error);
  }

  private isRateLimitError(error: any): boolean {
    return error?.message?.includes('rate limit');
  }

  private isValidationError(error: any): boolean {
    return error?.name === 'ValidationError' || error?.message?.includes('validation');
  }

  private isExternalServiceError(error: any): boolean {
    return (
      error?.code === 'ECONNREFUSED' ||
      error?.message?.includes('timeout') ||
      error?.message?.includes('External service')
    );
  }
}

export const ERROR_HANDLER_MIDDLEWARE_ORDER = MiddlewareOrder.ERROR_HANDLING;
