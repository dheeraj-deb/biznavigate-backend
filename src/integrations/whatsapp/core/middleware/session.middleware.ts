import { Injectable, Logger } from '@nestjs/common';
import { MessageContext } from '../message-context';
import { MessageMiddleware, MiddlewareOrder } from './message-middleware.interface';
import { RedisSessionService } from '../../services/redis-session.service';
import { ConversationStep } from '../../interfaces/conversation-state-machine.enum';

/**
 * Session management middleware
 */
@Injectable()
export class SessionMiddleware implements MessageMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);

  constructor(private readonly sessionService: RedisSessionService) {}

  async process(context: MessageContext, next: () => Promise<void>): Promise<void> {
    try {
      // Get or create session
      let session = await this.sessionService.getSession(context.from);

      if (!session) {
        this.logger.log(`Creating new session for user: ${context.from}`);
        session = await this.createSession(context);
      }

      // Store session info in context
      context.sessionId = session.sessionId;
      context.userId = session.userId;
      context.organizationId = session.context?.distributorPhoneNumber;

      // Store entire session in metadata for handlers
      context.setMetadata('session', session);

      await next();

      // Update session after processing
      const updatedSession = context.getMetadata<any>('session');
      if (updatedSession) {
        updatedSession.updatedAt = new Date();
        await this.sessionService.setSession(context.from, updatedSession as any);
      }
    } catch (error) {
      this.logger.error('Session management failed:', error);
      context.setError(error);
      await next(); // Continue to error handler
    }
  }

  private async createSession(context: MessageContext) {
    const sessionId = `session_${context.from}_${Date.now()}`;

    const session = {
      sessionId,
      userId: context.from.replace('whatsapp:', ''),
      phoneNumber: context.from,
      currentStep: ConversationStep.GREETING,
      context: {
        distributorPhoneNumber: context.to.replace('whatsapp:', ''),
        productList: [],
        userDetails: {},
        lastMessageTimestamp: new Date(),
        messageCount: 0,
        errorCount: 0,
        isNewUser: false, // Will be determined later
      },
      metadata: {
        platform: 'whatsapp' as const,
        language: 'en',
        timezone: 'UTC',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    await this.sessionService.setSession(context.from, session);
    return session;
  }
}

export const SESSION_MIDDLEWARE_ORDER = MiddlewareOrder.SESSION_MANAGEMENT;
