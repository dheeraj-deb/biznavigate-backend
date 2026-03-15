import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class StockReservationService {
  private readonly logger = new Logger(StockReservationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async cleanupExpiredReservations(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.cart_reservations.updateMany({
      where: { status: 'active', expires_at: { lt: now } },
      data: { status: 'released' },
    });
    return result.count;
  }

  async cleanupExpiredCartHolds(): Promise<{ count: number; restoredProductIds: string[] }> {
    const now = new Date();
    const expired = await this.prisma.cart_reservations.findMany({
      where: { status: 'active', expires_at: { lt: now } },
      select: { product_id: true },
    });

    if (!expired.length) return { count: 0, restoredProductIds: [] };

    await this.prisma.cart_reservations.updateMany({
      where: { status: 'active', expires_at: { lt: now } },
      data: { status: 'released' },
    });

    const restoredProductIds = [...new Set(expired.map((r) => r.product_id))];
    this.logger.log(`Released ${expired.length} expired cart holds`);

    return { count: expired.length, restoredProductIds };
  }

  async releaseExpiredReservations(): Promise<void> {
    await this.cleanupExpiredReservations();
  }
}
