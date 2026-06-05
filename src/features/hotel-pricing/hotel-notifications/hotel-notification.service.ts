import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';

interface PricingEvent {
  recommendationId: string;
  orgId: string;
  hotelId: string;
  hotelName: string;
  suggestedPrice: number;
  demandScore: number;
  competitorAvgPrice: number;
  daysUntilCheckin: number;
  checkinDate: string;
}

@Injectable()
export class HotelNotificationService {
  private readonly logger = new Logger(HotelNotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('hotel.pricing.low_occupancy')
  async onLowOccupancy(event: PricingEvent) {
    this.logger.warn(`Low occupancy alert: ${event.hotelName} — demand ${event.demandScore}`);
    await this.prisma.hotel_pricing_notifications.create({
      data: {
        org_id: event.orgId,
        hotel_id: event.hotelId,
        type: 'low_occupancy',
        title: `Low Demand Alert — ${event.hotelName}`,
        body: `Demand score is ${event.demandScore} with ${event.daysUntilCheckin} days until check-in on ${event.checkinDate}. ` +
          `Suggested price ₹${event.suggestedPrice} vs competitor avg ₹${event.competitorAvgPrice}. ` +
          `Consider promotions or OTA rate drops to improve occupancy.`,
        metadata: {
          suggested_price: event.suggestedPrice,
          demand_score: event.demandScore,
          competitor_avg: event.competitorAvgPrice,
          days_until_checkin: event.daysUntilCheckin,
          recommendation_id: event.recommendationId,
        },
      },
    });
  }

  @OnEvent('hotel.pricing.demand_spike')
  async onDemandSpike(event: PricingEvent) {
    this.logger.log(`Demand spike: ${event.hotelName} — demand ${event.demandScore}`);
    await this.prisma.hotel_pricing_notifications.create({
      data: {
        org_id: event.orgId,
        hotel_id: event.hotelId,
        type: 'demand_spike',
        title: `High Demand Opportunity — ${event.hotelName}`,
        body: `Demand score is ${event.demandScore} for check-in on ${event.checkinDate}. ` +
          `Suggested price ₹${event.suggestedPrice} vs competitor avg ₹${event.competitorAvgPrice}. ` +
          `Strong opportunity to maximise revenue — consider raising rates.`,
        metadata: {
          suggested_price: event.suggestedPrice,
          demand_score: event.demandScore,
          competitor_avg: event.competitorAvgPrice,
          days_until_checkin: event.daysUntilCheckin,
          recommendation_id: event.recommendationId,
        },
      },
    });
  }

  // ─── REST: list + mark read ────────────────────────────────────────────────

  async getNotifications(orgId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.hotel_pricing_notifications.findMany({
        where: { org_id: orgId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.hotel_pricing_notifications.count({ where: { org_id: orgId } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(orgId: string): Promise<{ count: number }> {
    const count = await this.prisma.hotel_pricing_notifications.count({
      where: { org_id: orgId, read_at: null },
    });
    return { count };
  }

  async markRead(orgId: string, notificationId: string) {
    return this.prisma.hotel_pricing_notifications.updateMany({
      where: { id: notificationId, org_id: orgId },
      data: { read_at: new Date() },
    });
  }

  async markAllRead(orgId: string) {
    return this.prisma.hotel_pricing_notifications.updateMany({
      where: { org_id: orgId, read_at: null },
      data: { read_at: new Date() },
    });
  }
}
