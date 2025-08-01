import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ZohoService } from './zoho.service';

@Module({
  imports: [HttpModule],
  providers: [ZohoService],
  exports: [ZohoService],
})
export class ZohoModule {}
