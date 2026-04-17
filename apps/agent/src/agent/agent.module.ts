import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { PrismaModule } from '@biznavigate/prisma';
import { CatalogCoreModule } from '@biznavigate/catalog';

@Module({
  imports: [ConfigModule, PrismaModule, CatalogCoreModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
