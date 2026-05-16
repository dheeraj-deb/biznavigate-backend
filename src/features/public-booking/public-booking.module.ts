import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CatalogModule } from '../commerce/catalog/catalog.module';
import { BookingsModule } from '../industries/hospitality/bookings/bookings.module';
import { PublicBookingController } from './public-booking.controller';
import { PublicBookingService } from './public-booking.service';

@Module({
  imports: [PrismaModule, CatalogModule, BookingsModule],
  controllers: [PublicBookingController],
  providers: [PublicBookingService],
  exports: [PublicBookingService],
})
export class PublicBookingModule {}
