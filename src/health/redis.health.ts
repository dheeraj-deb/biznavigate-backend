import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { createRedisConfig } from '../config/redis.config';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const redisConfig = createRedisConfig(this.configService);
    const client = new Redis({ ...redisConfig, lazyConnect: true, connectTimeout: 3000 });

    try {
      await client.connect();
      await client.ping();
      await client.quit();
      return this.getStatus(key, true);
    } catch (error) {
      try { await client.quit(); } catch { /* ignore */ }
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}
