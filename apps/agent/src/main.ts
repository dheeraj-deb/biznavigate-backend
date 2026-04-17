import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AgentAppModule } from './agent-app.module';

const logger = new Logger('AgentBootstrap');

async function bootstrap() {
  // createApplicationContext — no HTTP server, pure worker process
  const app = await NestFactory.createApplicationContext(AgentAppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  logger.log('Agent worker started. Listening for BullMQ jobs...');

  // Give in-flight LLM calls up to 30s to complete before forcing exit.
  const shutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Starting graceful shutdown...`);
    try {
      // NestJS close() triggers OnModuleDestroy lifecycle hooks.
      // BullMQ @Processor workers honour this via closeWorker() internally.
      await app.close();
      logger.log('Graceful shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal error during agent bootstrap', err);
  process.exit(1);
});
