import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AIProductMatcherService } from './services/ai-product-matcher.service';
import { VectorDatabaseService } from './services/vector-database.service';
import { ProductSyncService } from './services/product-sync.service';
import { AIProductController } from './controllers/ai-product.controller';
import { ProductSyncController } from './controllers/product-sync.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 seconds timeout for AI services
      maxRedirects: 3,
    }),
    ConfigModule
  ],
  controllers: [AIProductController, ProductSyncController],
  providers: [
    AIProductMatcherService,
    VectorDatabaseService,
    ProductSyncService,
    PrismaService
  ],
  exports: [
    AIProductMatcherService,
    VectorDatabaseService,
    ProductSyncService
  ]
})
export class AIModule {}