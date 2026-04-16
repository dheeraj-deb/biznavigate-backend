import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

/**
 * Bookings module superseded by CatalogModule + orders table.
 * All methods throw NotImplementedException.
 */
@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(_businessId: string, _dto: CreateBookingDto): Promise<any> {
    throw new NotImplementedException('Bookings are managed through the catalog orders system');
  }

  async getBookings(_businessId: string, _status?: string, _leadId?: string): Promise<any[]> {
    throw new NotImplementedException('Bookings are managed through the catalog orders system');
  }

  async getBookingById(_bookingId: string, _businessId: string): Promise<any> {
    throw new NotImplementedException('Bookings are managed through the catalog orders system');
  }

  async cancelBooking(_bookingId: string, _businessId: string): Promise<any> {
    throw new NotImplementedException('Bookings are managed through the catalog orders system');
  }
}
