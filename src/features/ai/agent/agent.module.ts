import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { AcknowledgmentService } from './services/acknowledgment.service';
import { PendingAgentActionService } from './services/pending-agent-action.service';
import { AgentContextBuilder } from './context/agent-context-builder.service';
import { CatalogModule } from '../../commerce/catalog/catalog.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { RagModule } from '../rag/rag.module';
import { BookingsModule } from '../../industries/hospitality/bookings/bookings.module';
@Module({
  imports: [ConfigModule, CatalogModule, PrismaModule, RagModule, BookingsModule],
  providers: [AgentService, AcknowledgmentService, PendingAgentActionService, AgentContextBuilder],
  exports: [AgentService, AcknowledgmentService, PendingAgentActionService],
})
export class AgentModule {}
