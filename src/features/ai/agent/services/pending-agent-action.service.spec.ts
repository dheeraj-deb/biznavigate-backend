import { PendingAgentActionService } from './pending-agent-action.service';

describe('PendingAgentActionService', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const bookingId = '00000000-0000-0000-0000-000000000002';
  const conversationId = 'conv-1';

  it('uses BookingService for hospitality cancellation so availability is rolled back', async () => {
    const action = {
      actionId: 'pending_cancel_1',
      action: 'cancel_booking' as const,
      businessId,
      tenantId: null,
      leadId: null,
      conversationId,
      phone: '+911234567890',
      displayText: 'Cancel booking BK-1',
      payload: { resolvedBookingId: bookingId },
      createdAt: new Date().toISOString(),
    };
    const cache = {
      get: jest.fn().mockResolvedValue(action),
      del: jest.fn().mockResolvedValue(undefined),
    };
    const prisma = {
      hospitality_bookings: {
        findFirst: jest.fn().mockResolvedValue({
          hospitality_booking_id: bookingId,
          booking_number: 'BK-1',
          status: 'confirmed',
          legacy_order: null,
        }),
      },
      orders: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const bookingService = {
      cancelBooking: jest.fn().mockResolvedValue({ hospitality_booking_id: bookingId, status: 'cancelled' }),
    };
    const service = new PendingAgentActionService(prisma as any, bookingService as any, cache as any);

    const result = await service.resolvePending(conversationId, 'confirm');

    expect(result.status).toBe('completed');
    expect(bookingService.cancelBooking).toHaveBeenCalledWith(bookingId, businessId, 'ai');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
