import { Module } from '@nestjs/common';
import { CatalogController } from './application/controllers/catalog.controller';
import { CatalogService } from './application/services/catalog.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { BillingModule } from '../../platform/billing/billing.module';

@Module({
  imports: [PrismaModule, BillingModule],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
