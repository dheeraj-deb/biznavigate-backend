import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { InventoryModule } from '../inventory/inventory.module';
import { BookingsModule } from '../bookings/bookings.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ConfigModule, InventoryModule, BookingsModule, PrismaModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
