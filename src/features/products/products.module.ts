import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SemanticSearchService } from './application/services/semantic-search.service';
import { InventorySyncService } from './application/services/inventory-sync.service';
import { ProductSearchController } from './infrastructure/controllers/product-search.controller';
import { InventorySyncController } from './infrastructure/inventory-sync.controller';

@Module({
  controllers: [
    ProductSearchController,
    InventorySyncController
  ],
  providers: [
    SemanticSearchService,
    InventorySyncService,
    PrismaService
  ],
  exports: [
    SemanticSearchService,
    InventorySyncService
  ]
})
export class ProductsModule {}