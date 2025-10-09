import { Injectable, Logger } from '@nestjs/common';
import { MessageContext } from '../message-context';
import { MessageMiddleware, MiddlewareOrder } from './message-middleware.interface';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Logging middleware for message tracking
 */
@Injectable()
export class LoggingMiddleware implements MessageMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async process(context: MessageContext, next: () => Promise<void>): Promise<void> {
    const startTime = Date.now();

    const bodyPreview = context.body ? context.body.substring(0, 50) : '(empty)';
    this.logger.log(
      `[${context.id}] Incoming message from ${context.from}: ${bodyPreview}...`
    );

    try {
      await next();

      const duration = Date.now() - startTime;
      this.logger.log(
        `[${context.id}] Processed in ${duration}ms - Handled: ${context.isHandled}`
      );

      // Log to database (async, don't await)
      this.logToDatabase(context, duration).catch((err) =>
        this.logger.error('Failed to log to database:', err)
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[${context.id}] Failed after ${duration}ms:`,
        error
      );
      throw error;
    }
  }

  private async logToDatabase(context: MessageContext, duration: number): Promise<void> {
    try {
      await this.prisma.whatsappMessage.create({
        data: {
          messageSid: context.rawPayload?.MessageSid,
          to: context.to,
          from: context.from,
          body: context.body,
          direction: 'inbound',
          receivedAt: context.timestamp,
          providerResponse: {
            contextId: context.id,
            duration,
            handled: context.isHandled,
            error: context.error?.message,
          },
        },
      });
    } catch (error) {
      this.logger.warn('Database logging failed:', error);
    }
  }
}

export const LOGGING_MIDDLEWARE_ORDER = MiddlewareOrder.LOGGING;
