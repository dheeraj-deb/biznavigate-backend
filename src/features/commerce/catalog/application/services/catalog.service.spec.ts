import { NotFoundException } from '@nestjs/common';
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
});
