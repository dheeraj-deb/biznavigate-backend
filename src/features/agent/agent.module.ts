import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { AcknowledgmentService } from './services/acknowledgment.service';
import { CatalogModule } from '../catalog/catalog.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [ConfigModule, CatalogModule, PrismaModule, RagModule],
  providers: [AgentService, AcknowledgmentService],
  exports: [AgentService, AcknowledgmentService],
})
export class AgentModule {}
