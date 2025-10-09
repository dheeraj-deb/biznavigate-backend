import { Injectable, Logger } from '@nestjs/common';
import { MessageContext } from '../message-context';
import { MessageMiddleware, MiddlewareOrder } from './message-middleware.interface';
import { getRedis } from 'src/utils/redis';

/**
 * Advanced rate limiting middleware with multiple strategies
 */
@Injectable()
export class RateLimitMiddleware implements MessageMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  // Configuration
  private readonly limits = {
    perUser: {
      requests: 30,
      window: 60, // seconds
      burst: 5, // allow burst
    },
    perOrganization: {
      requests: 1000,
      window: 60,
    },
    global: {
      requests: 10000,
      window: 60,
    },
  };

  async process(context: MessageContext, next: () => Promise<void>): Promise<void> {
    const redis = getRedis();
    const userKey = `rate_limit:user:${context.from}`;
    const now = Date.now();

    try {
      // Token bucket algorithm
      const bucket = await this.getOrCreateBucket(redis, userKey);

      if (bucket.tokens <= 0 && now < bucket.resetAt) {
        const waitTime = Math.ceil((bucket.resetAt - now) / 1000);

        this.logger.warn(
          `Rate limit exceeded for ${context.from}. Reset in ${waitTime}s`
        );

        context.setResponse({
          message: `⏳ You're sending messages too quickly.\n\nPlease wait ${waitTime} seconds before trying again.\n\nThis helps us provide better service to everyone! 😊`,
        });

        return; // Stop pipeline
      }

      // Consume token
      await this.consumeToken(redis, userKey, bucket);

      // Store rate limit info in context
      context.setMetadata('rateLimitRemaining', bucket.tokens - 1);
      context.setMetadata('rateLimitReset', bucket.resetAt);

      await next();
    } catch (error) {
      this.logger.error('Rate limiting check failed:', error);
      // Fail open - allow message on error
      await next();
    }
  }

  private async getOrCreateBucket(
    redis: any,
    key: string
  ): Promise<{ tokens: number; resetAt: number }> {
    const data = await redis.get(key);

    if (!data) {
      const resetAt = Date.now() + this.limits.perUser.window * 1000;
      return {
        tokens: this.limits.perUser.requests,
        resetAt,
      };
    }

    return JSON.parse(data);
  }

  private async consumeToken(redis: any, key: string, bucket: any): Promise<void> {
    const now = Date.now();

    // Reset bucket if window expired
    if (now >= bucket.resetAt) {
      bucket.tokens = this.limits.perUser.requests;
      bucket.resetAt = now + this.limits.perUser.window * 1000;
    }

    bucket.tokens = Math.max(0, bucket.tokens - 1);

    await redis.setex(
      key,
      this.limits.perUser.window * 2,
      JSON.stringify(bucket)
    );
  }
}

export const RATE_LIMIT_MIDDLEWARE_ORDER = MiddlewareOrder.RATE_LIMITING;
