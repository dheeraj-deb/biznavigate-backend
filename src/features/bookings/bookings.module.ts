import { Module } from '@nestjs/common';
import { BookingController } from './application/controllers/booking.controller';
import { BookingService } from './application/services/booking.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, PrismaService],
  exports: [BookingService],
})
export class BookingsModule {}
