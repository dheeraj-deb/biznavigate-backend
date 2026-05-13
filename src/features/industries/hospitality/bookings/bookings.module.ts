import { Module } from '@nestjs/common';
import { BookingController } from './application/controllers/booking.controller';
import { HospitalityBookingController } from './application/controllers/hospitality-booking.controller';
import { BookingService } from './application/services/booking.service';
import { HospitalityBookingCommandService } from './application/services/hospitality-booking-command.service';
import { PrismaModule } from '../../../../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [BookingController, HospitalityBookingController],
  providers: [BookingService, HospitalityBookingCommandService],
  exports: [BookingService, HospitalityBookingCommandService],
})
export class BookingsModule {}
