import { Module } from '@nestjs/common';
import { ZohoModule } from './zoho/zoho.module';

@Module({
  imports: [ZohoModule],
  exports: [ZohoModule],
})
export class CrmModule {}
