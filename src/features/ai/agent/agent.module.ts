import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { AcknowledgmentService } from './services/acknowledgment.service';
import { AgentContextBuilder } from './context/agent-context-builder.service';
import { CatalogModule } from '../../commerce/catalog/catalog.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { RagModule } from '../rag/rag.module';
@Module({
  imports: [ConfigModule, CatalogModule, PrismaModule, RagModule],
  providers: [AgentService, AcknowledgmentService, AgentContextBuilder],
  exports: [AgentService, AcknowledgmentService],
})
export class AgentModule {}
