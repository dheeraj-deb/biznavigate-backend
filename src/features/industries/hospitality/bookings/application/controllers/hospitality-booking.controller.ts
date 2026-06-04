import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../../common/guards/jwt-auth.guard';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { HospitalityBookingQueryDto } from '../dto/hospitality-booking-query.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { BookingService } from '../services/booking.service';

@Controller('hospitality-bookings')
@UseGuards(JwtAuthGuard)
export class HospitalityBookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.business_id, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: HospitalityBookingQueryDto) {
    return this.bookingService.findAll(req.user.business_id, query);
  }

  @Get(':bookingId')
  findById(@Req() req: any, @Param('bookingId') bookingId: string) {
    return this.bookingService.getBookingById(bookingId, req.user.business_id);
  }

  @Patch(':bookingId')
  update(@Req() req: any, @Param('bookingId') bookingId: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.updateBooking(bookingId, req.user.business_id, dto);
  }

  @Patch(':bookingId/cancel')
  cancel(@Req() req: any, @Param('bookingId') bookingId: string) {
    return this.bookingService.cancelBooking(bookingId, req.user.business_id);
  }
}
