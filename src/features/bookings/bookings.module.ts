import { Module } from '@nestjs/common';
import { BookingController } from './application/controllers/booking.controller';
import { BookingService } from './application/services/booking.service';
@Module({
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingsModule {}
