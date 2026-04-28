import {
  Controller, Get, Post, Patch,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto } from '../dto/create-booking.dto';@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()  createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.business_id, dto);
  }

  @Get()  getBookings(
    @Request() req,
    @Query('status') status?: string,
    @Query('leadId') leadId?: string,
  ) {
    return this.bookingService.getBookings(req.user.business_id, status, leadId);
  }

  @Get(':bookingId')  getBooking(@Request() req, @Param('bookingId') bookingId: string) {
    return this.bookingService.getBookingById(bookingId, req.user.business_id);
  }

  @Patch(':bookingId/cancel')  cancelBooking(@Request() req, @Param('bookingId') bookingId: string) {
    return this.bookingService.cancelBooking(bookingId, req.user.business_id);
  }
}
