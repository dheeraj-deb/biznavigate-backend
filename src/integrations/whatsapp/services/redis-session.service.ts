import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConversationSession } from '../interfaces/session.interface';

@Injectable()
export class RedisSessionService implements OnModuleDestroy {
  private redis: Redis;
  private readonly SESSION_PREFIX = 'whatsapp:session:';
  private readonly DEFAULT_TTL = 24 * 60 * 60; // 24 hours in seconds
  private readonly logger = new Logger(RedisSessionService.name);
  private isConnected = false;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 5000,
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error.message);
      this.isConnected = false;
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
      this.isConnected = true;
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
      this.isConnected = false;
    });

    // Attempt initial connection
    this.connectWithRetry();
  }

  private async connectWithRetry(retries = 3): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      this.logger.warn(`Redis connection failed. Retries left: ${retries - 1}`);
      if (retries > 1) {
        setTimeout(() => this.connectWithRetry(retries - 1), 2000);
      } else {
        this.logger.error('Redis connection failed after all retries. Service will work in fallback mode.');
      }
    }
  }

  async getSession(phoneNumber: string): Promise<ConversationSession | null> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, returning null session');
      return null;
    }

    try {
      const key = this.getSessionKey(phoneNumber);
      const sessionData = await this.redis.get(key);
      
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
      session.expiresAt = new Date(session.expiresAt);
      session.context.lastMessageTimestamp = new Date(session.context.lastMessageTimestamp);

      return session;
    } catch (error) {
      this.logger.error('Failed to get session from Redis:', error.message);
      return null;
    }
  }

  async setSession(phoneNumber: string, session: ConversationSession): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping session storage');
      return;
    }

    try {
      const key = this.getSessionKey(phoneNumber);
      const sessionData = JSON.stringify(session);
      
      await this.redis.setex(key, this.DEFAULT_TTL, sessionData);
    } catch (error) {
      this.logger.error('Failed to set session in Redis:', error.message);
      // Don't throw error to prevent breaking the conversation flow
    }
  }

  async persistSession(session: ConversationSession): Promise<void> {
    await this.setSession(session.phoneNumber, session);
  }

  async extendSession(phoneNumber: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const key = this.getSessionKey(phoneNumber);
      await this.redis.expire(key, this.DEFAULT_TTL);
    } catch (error) {
      this.logger.error('Failed to extend session TTL:', error.message);
    }
  }

  async deleteSession(phoneNumber: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const key = this.getSessionKey(phoneNumber);
      await this.redis.del(key);
    } catch (error) {
      this.logger.error('Failed to delete session:', error.message);
    }
  }

  private getSessionKey(phoneNumber: string): string {
    return `${this.SESSION_PREFIX}${phoneNumber}`;
  }

  getRedisClient(): Redis {
    return this.redis;
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.redis.disconnect();
    }
  }
}
