import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CatalogModule } from '../commerce/catalog/catalog.module';
import { BookingsModule } from '../industries/hospitality/bookings/bookings.module';
import { LeadModule } from '../crm/lead/lead.module';
import { BusinessesModule } from '../platform/business/business.module';
import { PublicBookingController } from './public-booking.controller';
import { PublicBookingService } from './public-booking.service';

@Module({
  imports: [PrismaModule, CatalogModule, BookingsModule, LeadModule, BusinessesModule],
  controllers: [PublicBookingController],
  providers: [PublicBookingService],
  exports: [PublicBookingService],
})
export class PublicBookingModule {}
