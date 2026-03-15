import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Shared REDIS_CLIENT provider for the hotel-pricing feature.
 * Import this array into any sub-module that injects 'REDIS_CLIENT'.
 */
export const RedisClientProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      lazyConnect: true,
    });
  },
};
