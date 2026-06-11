import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';

export interface HospitalityDateRange {
  checkIn: string;
  checkOut: string;
  nights: number;
  dates: string[];
}

export interface HospitalityAvailabilitySummary {
  item: any;
  dateRange: HospitalityDateRange;
  requestedUnits: number;
  totalUnits: number;
  available: boolean;
  availableSlots: number;
  pricePerNight: number;
  totalAmount: number;
  daily: Array<{
    date: string;
    total_slots: number;
    booked_slots: number;
    available_slots: number;
    is_blocked: boolean;
    price: number;
  }>;
}

@Injectable()
export class HospitalityAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAvailability(params: {
    businessId: string;
    itemId: string;
    checkIn: string;
    checkOut: string;
    requestedUnits?: number | string | null;
  }): Promise<HospitalityAvailabilitySummary> {
    const dateRange = this.normalizeDateRange(params.checkIn, params.checkOut);
    const requestedUnits = this.positiveInt(params.requestedUnits, 1, 'room_count');
    const item = await this.getBookableItem(params.businessId, params.itemId);
    const totalUnits = this.resolveTotalUnits(item);

    if (totalUnits < 1) {
      throw new BadRequestException('Total room units must be configured before accepting bookings');
    }

    const rows = await this.prisma.item_availability.findMany({
      where: {
        item_id: params.itemId,
        business_id: params.businessId,
        date: {
          gte: new Date(`${dateRange.checkIn}T00:00:00.000Z`),
          lt: new Date(`${dateRange.checkOut}T00:00:00.000Z`),
        },
      },
      orderBy: { date: 'asc' },
    });
    const rowByDate = new Map(rows.map((row) => [this.toDateKey(row.date), row]));

    const daily = dateRange.dates.map((date) => {
      const row = rowByDate.get(date);
      const totalSlots = Math.max(Number(row?.total_slots ?? totalUnits) || 0, 0);
      const bookedSlots = Math.max(Number(row?.booked_slots ?? 0) || 0, 0);
      const isBlocked = Boolean(row?.is_blocked);
      const availableSlots = isBlocked ? 0 : Math.max(totalSlots - bookedSlots, 0);
      const price = Number(row?.price_override ?? item.base_price ?? 0);

      return {
        date,
        total_slots: totalSlots,
        booked_slots: bookedSlots,
        available_slots: availableSlots,
        is_blocked: isBlocked,
        price,
      };
    });

    const availableSlots = daily.length ? Math.min(...daily.map((day) => day.available_slots)) : 0;
    const totalAmount = daily.reduce((sum, day) => sum + day.price, 0) * requestedUnits;
    const pricePerNight = daily.length ? totalAmount / requestedUnits / daily.length : Number(item.base_price ?? 0);

    return {
      item,
      dateRange,
      requestedUnits,
      totalUnits,
      available: availableSlots >= requestedUnits,
      availableSlots,
      pricePerNight,
      totalAmount,
      daily,
    };
  }

  async reserveAvailability(
    tx: any,
    params: {
      businessId: string;
      itemId: string;
      dateRange: HospitalityDateRange;
      totalUnits: number;
      requestedUnits: number;
    },
  ): Promise<Array<{ date: Date }>> {
    const bookedRows = await tx.$queryRaw<Array<{ date: Date }>>`
      INSERT INTO item_availability (item_id, business_id, date, total_slots, booked_slots)
      SELECT ${params.itemId}::uuid, ${params.businessId}::uuid, d::date, ${params.totalUnits}::int, ${params.requestedUnits}::int
      FROM generate_series(${params.dateRange.checkIn}::date, (${params.dateRange.checkOut}::date - INTERVAL '1 day'), INTERVAL '1 day') AS d
      WHERE ${params.requestedUnits}::int <= ${params.totalUnits}::int
      ON CONFLICT (item_id, date) DO UPDATE
      SET booked_slots = item_availability.booked_slots + ${params.requestedUnits}::int,
          updated_at = NOW()
      WHERE item_availability.is_blocked = false
        AND item_availability.booked_slots + ${params.requestedUnits}::int <= item_availability.total_slots
      RETURNING date
    `;

    if (bookedRows.length !== params.dateRange.nights) {
      throw new ConflictException('Room is no longer available for the selected dates');
    }

    return bookedRows;
  }

  normalizeDateRange(checkIn: string, checkOut: string): HospitalityDateRange {
    const checkInDate = this.parseDateOnly(checkIn, 'check_in');
    const checkOutDate = this.parseDateOnly(checkOut, 'check_out');
    const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000);

    if (nights <= 0) {
      throw new BadRequestException('Check-out must be after check-in');
    }
    if (nights > 90) {
      throw new BadRequestException('Bookings longer than 90 nights need manual review');
    }

    const dates: string[] = [];
    const cursor = new Date(checkInDate);
    while (cursor < checkOutDate) {
      dates.push(this.toDateKey(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return {
      checkIn: this.toDateKey(checkInDate),
      checkOut: this.toDateKey(checkOutDate),
      nights,
      dates,
    };
  }

  positiveInt(value: unknown, fallback: number, fieldName: string): number {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
      throw new BadRequestException(`${fieldName} must be at least 1`);
    }
    return Math.trunc(parsed);
  }

  private async getBookableItem(businessId: string, itemId: string) {
    const item = await this.prisma.catalog_items.findFirst({
      where: {
        item_id: itemId,
        business_id: businessId,
        deleted_at: null,
        is_active: true,
        item_type: { in: ['accommodation', 'activity', 'service'] },
      },
      select: {
        item_id: true,
        item_type: true,
        name: true,
        base_price: true,
        stock_quantity: true,
        tenant_id: true,
        attributes: true,
        hospitality_detail: {
          select: {
            capacity: true,
            total_units: true,
            tax_percentage: true,
            extra_guest_charge: true,
          },
        },
      },
    });

    if (!item) throw new NotFoundException('Bookable catalog item not found');
    return item;
  }

  private resolveTotalUnits(item: any): number {
    const attrs = (item.attributes ?? {}) as Record<string, any>;
    const configuredRoomUnits = Array.isArray(attrs.rooms)
      ? attrs.rooms.reduce((sum, room) => sum + (this.toOptionalInt(room?.qty) ?? 0), 0)
      : 0;

    return this.toOptionalInt(item.hospitality_detail?.total_units)
      ?? this.toOptionalInt(attrs.total_units)
      ?? this.toOptionalInt(attrs.total_slots)
      ?? this.toOptionalInt(attrs.units)
      ?? this.toOptionalInt(item.stock_quantity)
      ?? (configuredRoomUnits > 0 ? configuredRoomUnits : undefined)
      // Backward compatibility for the current dashboard form, where capacity
      // has been used as "number of units" for resort services.
      ?? this.toOptionalInt(attrs.capacity)
      ?? 0;
  }

  private parseDateOnly(value: string, fieldName: string): Date {
    const parsed = new Date(value);
    if (!value || Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date`);
    }
    return new Date(`${parsed.toISOString().slice(0, 10)}T00:00:00.000Z`);
  }

  private toDateKey(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private toOptionalInt(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
  }
}
