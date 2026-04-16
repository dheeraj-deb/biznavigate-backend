import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { CatalogModule } from '../catalog/catalog.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ConfigModule, CatalogModule, PrismaModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
