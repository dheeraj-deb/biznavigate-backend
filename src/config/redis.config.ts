import { ConfigService } from '@nestjs/config';

export interface RedisConnectionOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: object;
}

/**
 * Creates a Redis connection options object from environment variables.
 * Used by both CacheModule and BullMQ to ensure a single source of truth.
 */
export function createRedisConfig(configService: ConfigService): RedisConnectionOptions {
  const host = configService.get<string>('REDIS_HOST', 'localhost');
  const port = configService.get<number>('REDIS_PORT', 6379);
  const password = configService.get<string>('REDIS_PASSWORD');
  const db = configService.get<number>('REDIS_DB', 0);
  const tlsEnabled = configService.get<boolean>('REDIS_TLS', false);

  return {
    host,
    port,
    ...(password ? { password } : {}),
    ...(db ? { db } : {}),
    ...(tlsEnabled ? { tls: {} } : {}),
  };
}
