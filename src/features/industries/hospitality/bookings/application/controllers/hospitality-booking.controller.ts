import { Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../../common/guards/jwt-auth.guard';
import { HospitalityBookingQueryDto } from '../dto/hospitality-booking-query.dto';
import { BookingService } from '../services/booking.service';

@Controller('hospitality-bookings')
@UseGuards(JwtAuthGuard)
export class HospitalityBookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  findAll(@Req() req: any, @Query() query: HospitalityBookingQueryDto) {
    return this.bookingService.findAll(req.user.business_id, query);
  }

  @Get(':bookingId')
  findById(@Req() req: any, @Param('bookingId') bookingId: string) {
    return this.bookingService.getBookingById(bookingId, req.user.business_id);
  }

  @Patch(':bookingId/cancel')
  cancel(@Req() req: any, @Param('bookingId') bookingId: string) {
    return this.bookingService.cancelBooking(bookingId, req.user.business_id);
  }
}
