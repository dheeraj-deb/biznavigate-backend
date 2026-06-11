import { BadRequestException } from '@nestjs/common';
import { HospitalityAvailabilityService } from './hospitality-availability.service';

describe('HospitalityAvailabilityService', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const itemId = '00000000-0000-0000-0000-000000000002';

  function buildService(rows: any[] = [], itemOverrides: Record<string, any> = {}) {
    const prisma = {
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue({
          item_id: itemId,
          item_type: 'accommodation',
          name: 'Deluxe Room',
          base_price: 1000,
          stock_quantity: null,
          tenant_id: '00000000-0000-0000-0000-000000000003',
          attributes: {},
          hospitality_detail: { total_units: 5, capacity: 2, tax_percentage: null, extra_guest_charge: null },
          ...itemOverrides,
        }),
      },
      item_availability: {
        findMany: jest.fn().mockResolvedValue(rows),
      },
    };

    return { service: new HospitalityAvailabilityService(prisma as any), prisma };
  }

  it('treats missing sparse-calendar rows as available at configured total units', async () => {
    const { service } = buildService([
      {
        date: new Date('2026-06-02T00:00:00.000Z'),
        total_slots: 5,
        booked_slots: 2,
        is_blocked: false,
        price_override: null,
      },
    ]);

    const result = await service.checkAvailability({
      businessId,
      itemId,
      checkIn: '2026-06-01',
      checkOut: '2026-06-03',
      requestedUnits: 2,
    });

    expect(result.available).toBe(true);
    expect(result.availableSlots).toBe(3);
    expect(result.daily).toEqual([
      expect.objectContaining({ date: '2026-06-01', available_slots: 5 }),
      expect.objectContaining({ date: '2026-06-02', available_slots: 3 }),
    ]);
  });

  it('marks the range unavailable when any requested date is blocked', async () => {
    const { service } = buildService([
      {
        date: new Date('2026-06-01T00:00:00.000Z'),
        total_slots: 5,
        booked_slots: 0,
        is_blocked: true,
        price_override: null,
      },
    ]);

    const result = await service.checkAvailability({
      businessId,
      itemId,
      checkIn: '2026-06-01',
      checkOut: '2026-06-02',
      requestedUnits: 1,
    });

    expect(result.available).toBe(false);
    expect(result.availableSlots).toBe(0);
  });

  it('rejects check-out dates that are not after check-in', async () => {
    const { service } = buildService();

    await expect(service.checkAvailability({
      businessId,
      itemId,
      checkIn: '2026-06-02',
      checkOut: '2026-06-02',
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});
