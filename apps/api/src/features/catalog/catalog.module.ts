import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogCoreModule } from '@biznavigate/catalog';

@Module({
  imports: [CatalogCoreModule],
  controllers: [CatalogController],
})
export class CatalogModule {}
