import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = configService.get('app.nodeEnv');
    
    super({
      log: nodeEnv === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Transaction wrapper with logging
  async executeTransaction<T>(
    fn: (prisma: PrismaService) => Promise<T>,
    maxWait?: number,
    timeout?: number,
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await this.$transaction(
        async (prisma) => fn(prisma as PrismaService),
        {
          maxWait: maxWait || 5000,
          timeout: timeout || 10000,
        }
      );
      
      const duration = Date.now() - startTime;
      this.logger.debug(`Transaction completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Transaction failed after ${duration}ms:`, error);
      throw error;
    }
  }
}
