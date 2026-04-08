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
  @ApiOperation({ summary: 'List bookings. Filter by status or leadId.' })
  @ApiQuery({ name: 'status', required: false, description: 'pending | confirmed | cancelled | completed' })
  @ApiQuery({ name: 'leadId', required: false, description: 'Filter by lead UUID' })
  getBookings(
    @Request() req,
    @Query('status') status?: string,
    @Query('leadId') leadId?: string,
  ) {
    return this.bookingService.getBookings(req.user.business_id, status, leadId);
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get a single booking with guests' })
  getBooking(@Request() req, @Param('bookingId') bookingId: string) {
    return this.bookingService.getBookingById(bookingId, req.user.business_id);
  }

  @Patch(':bookingId/cancel')
  @ApiOperation({ summary: 'Cancel a booking and release the slots' })
  cancelBooking(@Request() req, @Param('bookingId') bookingId: string) {
    return this.bookingService.cancelBooking(bookingId, req.user.business_id);
  }
}
