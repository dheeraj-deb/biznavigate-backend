import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { BookingService } from './booking.service';

@Injectable()
export class HospitalityBookingHoldCleanupService {
  private readonly logger = new Logger(HospitalityBookingHoldCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingService: BookingService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'hospitality-booking-hold-cleanup' })
  async cleanupExpiredPublicBookingHolds(): Promise<number> {
    const now = new Date();
    const expired = await this.prisma.hospitality_bookings.findMany({
      where: {
        status: 'pending',
        payment_status: { in: ['pending', 'unpaid'] },
        source: 'public_booking_link',
        legacy_order: {
          is: {
            payment_expires_at: { lt: now },
            status: { not: 'cancelled' },
          },
        },
      },
      select: {
        hospitality_booking_id: true,
        business_id: true,
        booking_number: true,
      },
      orderBy: { created_at: 'asc' },
      take: 100,
    });

    for (const booking of expired) {
      try {
        await this.bookingService.cancelBooking(
          booking.hospitality_booking_id,
          booking.business_id,
          'system',
        );
      } catch (error: any) {
        this.logger.warn(
          `Could not expire booking ${booking.booking_number ?? booking.hospitality_booking_id}: ${error.message}`,
        );
      }
    }

    if (expired.length) {
      this.logger.log(`Expired ${expired.length} pending public resort booking hold(s)`);
    }
    return expired.length;
  }
}
