import {
  Controller, Get, Post, Patch,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking — atomic, prevents double-booking' })
  createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.business_id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings for the business' })
  @ApiQuery({ name: 'status', required: false, description: 'pending | confirmed | cancelled | completed' })
  getBookings(@Request() req, @Query('status') status?: string) {
    return this.bookingService.getBookings(req.user.business_id, status);
  }

  @Patch(':bookingId/cancel')
  @ApiOperation({ summary: 'Cancel a booking and release the slots' })
  cancelBooking(@Request() req, @Param('bookingId') bookingId: string) {
    return this.bookingService.cancelBooking(bookingId, req.user.business_id);
  }
}
