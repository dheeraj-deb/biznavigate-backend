import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Cluster } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | Cluster;

  constructor(private readonly config: ConfigService) {
    const useCluster = this.config.get<string>('REDIS_CLUSTER') === 'true';
    if (useCluster) {
      const nodes = (this.config.get<string>('REDIS_NODES', 'localhost:6379'))
        .split(',')
        .map((n) => {
          const [host, port] = n.split(':');
          return { host, port: parseInt(port) };
        });
      this.client = new Redis.Cluster(nodes);
    } else {
      this.client = new Redis({
        host: this.config.get<string>('REDIS_HOST', '127.0.0.1'),
        port: this.config.get<number>('REDIS_PORT', 6379),
        password: this.config.get<string>('REDIS_PASSWORD') || undefined,
        db: this.config.get<number>('REDIS_DB', 0),
        maxRetriesPerRequest: 3,
      });
    }
    this.client.on('error', (err) =>
      this.logger.error(`Redis connection error: ${err?.message ?? err}`),
    );
  }

  getClient(): Redis | Cluster {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
