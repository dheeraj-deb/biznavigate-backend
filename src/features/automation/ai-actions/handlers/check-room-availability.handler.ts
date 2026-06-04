import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ExecuteAiActionDto } from '../dto/ai-action.dto';
import { AiActionHandler } from './ai-action-handler';

@Injectable()
export class CheckRoomAvailabilityHandler implements AiActionHandler {
  readonly action = 'check_room_availability' as const;

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: ExecuteAiActionDto) {
    const itemId = dto.params.item_id;
    const checkIn = dto.params.check_in;
    const checkOut = dto.params.check_out;

    if (!itemId || !checkIn || !checkOut) {
      throw new BadRequestException('item_id, check_in, and check_out are required');
    }

    const item = await this.prisma.catalog_items.findFirst({
      where: {
        item_id: itemId,
        business_id: dto.business_id,
        deleted_at: null,
        item_type: { in: ['accommodation', 'activity', 'service'] },
      },
      select: {
        item_id: true,
        name: true,
        base_price: true,
      },
    });

    if (!item) throw new NotFoundException('Bookable catalog item not found');

    const rows = await this.prisma.item_availability.findMany({
      where: {
        item_id: itemId,
        business_id: dto.business_id,
        date: {
          gte: new Date(checkIn),
          lt: new Date(checkOut),
        },
      },
      orderBy: { date: 'asc' },
    });

    const nights = Math.max(
      Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000),
      1,
    );
    const availableSlots = rows.map((row) => row.is_blocked ? 0 : row.total_slots - row.booked_slots);
    const minAvailableSlots = rows.length === nights && availableSlots.length > 0
      ? Math.min(...availableSlots)
      : 0;
    const pricePerNight = rows.find((row) => row.price_override != null)?.price_override ?? item.base_price;

    return {
      item_id: item.item_id,
      item_name: item.name,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      available: minAvailableSlots > 0,
      available_slots: minAvailableSlots,
      price_per_night: Number(pricePerNight ?? 0),
      total_amount: Number(pricePerNight ?? 0) * nights,
    };
  }
}
