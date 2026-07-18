import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';

describe('CatalogService tenant safety', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const itemId = '00000000-0000-0000-0000-000000000002';

  function buildService(prisma: any) {
    return new CatalogService(prisma, { emit: jest.fn() } as any);
  }

  it('does not read an item outside the current business scope', async () => {
    const prisma = {
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const service = buildService(prisma as any);

    await expect(service.getItemById(itemId, businessId)).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.catalog_items.findFirst).toHaveBeenCalledWith({
      where: { item_id: itemId, business_id: businessId, deleted_at: null },
      include: {
        variants: { where: { is_active: true }, orderBy: { price: 'asc' } },
        product_detail: true,
        hospitality_detail: true,
      },
    });
  });

  it('does not update an item outside the current business scope', async () => {
    const prisma = {
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn(),
    };
    const service = buildService(prisma as any);

    await expect(service.updateItem(itemId, businessId, { name: 'New name' } as any))
      .rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.catalog_items.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { item_id: itemId, business_id: businessId, deleted_at: null },
      }),
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('scopes list reads by business_id', async () => {
    const prisma = {
      catalog_items: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const service = buildService(prisma as any);

    await service.getItems({ businessId, page: 1, limit: 20 } as any);

    expect(prisma.catalog_items.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          business_id: businessId,
          is_active: true,
          deleted_at: null,
        }),
      }),
    );
    expect(prisma.catalog_items.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        business_id: businessId,
        is_active: true,
        deleted_at: null,
      }),
    });
  });

  it('filters agent accommodation availability queries by named property or room', async () => {
    const prisma = {
      catalog_items: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const service = buildService(prisma as any);

    await service.queryForAgent({
      businessId,
      item_type: 'accommodation',
      search: 'Beach Resort',
      check_in: '2026-06-10',
      check_out: '2026-06-11',
    } as any);

    expect(prisma.catalog_items.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          business_id: businessId,
          item_type: 'accommodation',
          OR: expect.arrayContaining([
            { name: { contains: 'Beach Resort', mode: 'insensitive' } },
          ]),
        }),
      }),
    );
  });

  it('rejects lowering a resort date below already booked rooms', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      item_availability: {
        findUnique: jest.fn().mockResolvedValue({ booked_slots: 2 }),
      },
    };
    const prisma = {
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue(accommodationItem()),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = buildService(prisma as any);

    await expect(service.setAvailability(itemId, businessId, {
      dates: ['2026-06-10'],
      total_slots: 1,
    } as any)).rejects.toBeInstanceOf(BadRequestException);

    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.item_availability.findUnique).toHaveBeenCalled();
  });

  it('rejects blocking a date with booked resort rooms', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      item_availability: {
        findUnique: jest.fn().mockResolvedValue({ booked_slots: 1 }),
      },
    };
    const prisma = {
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue(accommodationItem()),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = buildService(prisma as any);

    await expect(service.blockDate(itemId, businessId, {
      date: '2026-06-10',
    } as any)).rejects.toBeInstanceOf(BadRequestException);

    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.item_availability.findUnique).toHaveBeenCalled();
  });

  it('rejects reducing resort capacity below active booked or held inventory', async () => {
    const prisma = {
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue(accommodationItem()),
      },
      $queryRaw: jest.fn().mockResolvedValue([{ max_booked: 3 }]),
      $transaction: jest.fn(),
    };
    const service = buildService(prisma as any);

    await expect(service.updateItem(itemId, businessId, {
      stock_quantity: 2,
      attributes: { total_units: 2 },
    } as any)).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  function accommodationItem() {
    return {
      item_id: itemId,
      business_id: businessId,
      item_type: 'accommodation',
      name: 'Lake View Room',
      base_price: 2500,
      stock_quantity: 5,
      attributes: { total_units: 5, capacity: 2 },
      variants: [],
      product_detail: null,
      hospitality_detail: {
        service_type: 'room',
        capacity: 2,
        total_units: 5,
        max_adults: 2,
        bed_type: null,
        check_in_time: null,
        check_out_time: null,
        amenities: null,
        cancellation_policy: null,
        tax_percentage: null,
        extra_guest_charge: null,
        metadata: null,
      },
      vehicle_detail: null,
    };
  }
});
