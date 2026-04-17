import { Module } from '@nestjs/common';
import { PrismaModule } from '@biznavigate/prisma';
import { CatalogService } from './catalog.service';

@Module({
  imports: [PrismaModule],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogCoreModule {}
