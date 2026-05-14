import { Injectable, Logger } from '@nestjs/common';

/**
 * Webhook Deduplication Service
 * Prevents duplicate webhook processing using in-memory cache
 * This catches duplicates BEFORE database queries
 */
@Injectable()
export class WebhookDeduplicationService {
  private readonly logger = new Logger(WebhookDeduplicationService.name);
  private readonly processedWebhooks = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000 * 2; // 2 minutes

  constructor() {
    // Periodic cleanup of old entries
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  /**
   * Check if webhook has already been processed
   * Returns true if duplicate, false if new
   */
  isDuplicate(webhookId: string): boolean {
    const now = Date.now();
    const processedAt = this.processedWebhooks.get(webhookId);

    if (processedAt) {
      const age = now - processedAt;
      if (age < this.CACHE_TTL) {
        this.logger.warn(`🚫 Duplicate webhook detected: ${webhookId} (age: ${age}ms)`);
        return true;
      }
    }

    return false;
  }

  /**
   * Mark webhook as processed
   */
  markAsProcessed(webhookId: string): void {
    this.processedWebhooks.set(webhookId, Date.now());
  }

  /**
   * Check if message has been processed
   */
  isMessageDuplicate(messageId: string): boolean {
    const key = `msg_${messageId}`;
    return this.isDuplicate(key);
  }

  /**
   * Mark message as processed
   */
  markMessageAsProcessed(messageId: string): void {
    const key = `msg_${messageId}`;
    this.markAsProcessed(key);
  }

  /**
   * Cleanup old entries from cache
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, processedAt] of this.processedWebhooks.entries()) {
      if (now - processedAt > this.CACHE_TTL) {
        this.processedWebhooks.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`🧹 Cleaned up ${removed} old webhook entries`);
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      cachedWebhooks: this.processedWebhooks.size,
      cacheTTL: this.CACHE_TTL,
    };
  }
}
