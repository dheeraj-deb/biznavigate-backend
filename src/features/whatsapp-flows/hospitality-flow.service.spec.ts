import { ConflictException } from '@nestjs/common';
import { HospitalityBookingCommandService } from '../industries/hospitality/bookings/application/services/hospitality-booking-command.service';
import { HospitalityFlowService } from './hospitality-flow.service';

describe('HospitalityFlowService booking idempotency', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const tenantId = '00000000-0000-0000-0000-000000000002';
  const leadId = '00000000-0000-0000-0000-000000000003';
  const serviceId = '00000000-0000-0000-0000-000000000004';
  const orderId = '00000000-0000-0000-0000-000000000005';
  const bookingId = '00000000-0000-0000-0000-000000000006';

  const bookingData = {
    service_id: serviceId,
    check_in: '2026-06-01',
    check_out: '2026-06-03',
    guest_name: 'Dheeraj',
    phone: '919999999999',
    num_guests: 2,
    age: 30,
    address: 'Test address',
    pin_code: '673001',
    _flowContext: {
      leadId,
      customerPhone: '919999999999',
    },
  };

  function successParams(result: any) {
    return result.data.extension_message_response.params;
  }

  function buildPrismaMock(existingKey: any = null, bookedDateCount = 2) {
    const tx = {
      workflow_idempotency_keys: {
        create: jest.fn(),
        update: jest.fn(),
      },
      customers: {
        findFirst: jest.fn().mockResolvedValue({ customer_id: 'customer-1' }),
      },
      orders: {
        create: jest.fn().mockResolvedValue({
          order_id: orderId,
          total_amount: 2000,
        }),
      },
      order_items: {
        create: jest.fn(),
      },
      hospitality_bookings: {
        create: jest.fn().mockResolvedValue({
          hospitality_booking_id: bookingId,
        }),
      },
      hospitality_booking_items: {
        create: jest.fn(),
      },
      hospitality_booking_guests: {
        create: jest.fn(),
      },
      hospitality_booking_status_events: {
        create: jest.fn(),
      },
      hospitality_inquiries: {
        create: jest.fn(),
      },
      leads: {
        update: jest.fn(),
      },
      lead_events: {
        create: jest.fn(),
      },
      $queryRaw: jest.fn().mockResolvedValue(
        Array.from({ length: bookedDateCount }, (_, index) => ({
          date: new Date(`2026-06-0${index + 1}T00:00:00.000Z`),
        })),
      ),
    };

    const prisma = {
      catalog_items: {
        findFirst: jest.fn().mockResolvedValue({
          base_price: 1000,
          name: 'Deluxe Room',
          tenant_id: tenantId,
        }),
      },
      workflow_idempotency_keys: {
        findUnique: jest.fn().mockResolvedValue(existingKey),
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(async (callback: any) => callback(tx)),
      __tx: tx,
    };

    return prisma;
  }

  function buildBookingCommandService(prisma: any) {
    return new HospitalityBookingCommandService(
      prisma,
      { autoAdvance: jest.fn().mockResolvedValue({ moved: false }) } as any,
      { emit: jest.fn() } as any,
    );
  }

  it('creates one booking and records the completed idempotency response', async () => {
    const prisma = buildPrismaMock();
    const bookingCommandService = buildBookingCommandService(prisma as any);
    const service = new HospitalityFlowService(prisma as any, {} as any, bookingCommandService);

    const result = await service.handleDataExchange('BOOKING_DETAILS', bookingData, '', businessId);

    expect(prisma.workflow_idempotency_keys.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.workflow_idempotency_keys.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          business_id: businessId,
          tenant_id: tenantId,
          lead_id: leadId,
          purpose: 'create_hospitality_booking',
          status: 'started',
        }),
      }),
    );
    expect(prisma.__tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.orders.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.hospitality_bookings.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.workflow_idempotency_keys.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'completed',
          response: expect.objectContaining({
            booking_id: bookingId,
            legacy_order_id: orderId,
          }),
          locked_until: null,
        }),
      }),
    );
    expect(successParams(result)).toEqual(
      expect.objectContaining({
        booking_id: bookingId,
        legacy_order_id: orderId,
      }),
    );
  });

  it('returns the existing booking response when a completed key is seen again', async () => {
    const response = {
      booking_id: bookingId,
      legacy_order_id: orderId,
      idempotency_key: 'hospitality_booking:existing',
    };
    const prisma = buildPrismaMock({ status: 'completed', response });
    const bookingCommandService = buildBookingCommandService(prisma as any);
    const service = new HospitalityFlowService(prisma as any, {} as any, bookingCommandService);

    const result = await service.handleDataExchange('BOOKING_DETAILS', bookingData, '', businessId);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(successParams(result)).toEqual(response);
  });

  it('rejects an in-progress duplicate booking request', async () => {
    const prisma = buildPrismaMock({
      status: 'started',
      locked_until: new Date(Date.now() + 60_000),
    });
    const bookingCommandService = buildBookingCommandService(prisma as any);
    const service = new HospitalityFlowService(prisma as any, {} as any, bookingCommandService);

    await expect(
      service.handleDataExchange('BOOKING_DETAILS', bookingData, '', businessId),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('fails before creating booking rows when availability cannot be reserved for every night', async () => {
    const prisma = buildPrismaMock(null, 1);
    const bookingCommandService = buildBookingCommandService(prisma as any);
    const service = new HospitalityFlowService(prisma as any, {} as any, bookingCommandService);

    await expect(
      service.handleDataExchange('BOOKING_DETAILS', bookingData, '', businessId),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.__tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.orders.create).not.toHaveBeenCalled();
    expect(prisma.__tx.hospitality_bookings.create).not.toHaveBeenCalled();
    expect(prisma.__tx.workflow_idempotency_keys.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'completed' }),
      }),
    );
    expect(prisma.workflow_idempotency_keys.update).toHaveBeenCalledWith({
      where: expect.objectContaining({ idempotency_key: expect.stringMatching(/^hospitality_booking:/) }),
      data: expect.objectContaining({
        status: 'failed',
        locked_until: null,
        updated_at: expect.any(Date),
      }),
    });
  });
});

describe('HospitalityFlowService availability filtering', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';

  function buildService(items: any[], availabilityByItem: Record<string, any[]>) {
    const prisma = {
      catalog_items: {
        findMany: jest.fn().mockResolvedValue(items),
      },
    };
    const catalogService = {
      getAvailability: jest.fn((itemId: string) => Promise.resolve(availabilityByItem[itemId] ?? [])),
    };
    const service = new HospitalityFlowService(prisma as any, catalogService as any, {} as any);
    return { service, prisma, catalogService };
  }

  const availableRow = { available_slots: 1, is_blocked: false, price: null };
  const fullRow = { available_slots: 0, is_blocked: false, price: null };

  it('filters accommodation items by named property before checking availability', async () => {
    const { service, prisma } = buildService(
      [{ item_id: 'beach-room', name: 'Beach Resort Deluxe', base_price: 2500, image_urls: [] }],
      { 'beach-room': [availableRow] },
    );

    const result = await service.checkAvailability(
      { check_in: '2026-06-10', check_out: '2026-06-11', property_name: 'Beach Resort' },
      '',
      businessId,
    );

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
    expect(result.screen).toBe('AVAILABILITY_RESULT');
    expect(result.data.available_services).toHaveLength(1);
    expect(result.data.available_services[0].id).toBe('beach-room');
  });

  it('hides fully booked items and returns only available rooms/properties', async () => {
    const { service } = buildService(
      [
        { item_id: 'aslam-room', name: 'Aslam Resort Deluxe', base_price: 2000, image_urls: [] },
        { item_id: 'beach-room', name: 'Beach Resort Standard', base_price: 2500, image_urls: [] },
      ],
      {
        'aslam-room': [fullRow],
        'beach-room': [availableRow],
      },
    );

    const result = await service.checkAvailability(
      { check_in: '2026-06-10', check_out: '2026-06-11' },
      '',
      businessId,
    );

    expect(result.screen).toBe('AVAILABILITY_RESULT');
    expect(result.data.available_services.map((item: any) => item.id)).toEqual(['beach-room']);
  });
});
