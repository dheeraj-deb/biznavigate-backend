import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@biznavigate/prisma';
import { AGENT_QUEUE_NAME } from '@biznavigate/common';
import { AgentWorkerModule } from './agent/agent-worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    PrismaModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),

    BullModule.registerQueue({ name: AGENT_QUEUE_NAME }),

    // ── Agent LangGraph worker ────────────────────────────────────────────────
    // Add LeadCoreModule / OrdersCoreModule / InventoryCoreModule here
    // when agent tools are wired to use them directly.
    AgentWorkerModule,
  ],
})
export class AgentAppModule {}
