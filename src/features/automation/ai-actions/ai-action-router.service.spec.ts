import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AiActionRouterService } from './ai-action-router.service';

describe('AiActionRouterService', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const tenantId = '00000000-0000-0000-0000-000000000002';
  const leadId = '00000000-0000-0000-0000-000000000003';

  function buildPrismaMock(existingKey: any = null) {
    return {
      businesses: {
        findUnique: jest.fn().mockResolvedValue({ business_id: businessId, tenant_id: tenantId }),
      },
      leads: {
        findFirst: jest.fn().mockResolvedValue({ lead_id: leadId }),
      },
      workflow_idempotency_keys: {
        findUnique: jest.fn().mockResolvedValue(existingKey),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
    };
  }

  function buildRouter(prisma = buildPrismaMock(), handlerResult: Record<string, any> = { ok: true }) {
    const auditLogService = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    const checkRoomAvailability = {
      action: 'check_room_availability',
      execute: jest.fn().mockResolvedValue(handlerResult),
    };
    const createHospitalityBooking = {
      action: 'create_hospitality_booking',
      execute: jest.fn().mockResolvedValue(handlerResult),
    };
    const createHospitalityInquiry = {
      action: 'create_hospitality_inquiry',
      execute: jest.fn().mockResolvedValue(handlerResult),
    };
    const createProductInquiry = {
      action: 'create_product_inquiry',
      execute: jest.fn().mockResolvedValue(handlerResult),
    };
    const createProductOrder = {
      action: 'create_product_order',
      execute: jest.fn().mockResolvedValue(handlerResult),
    };
    const handoffToHuman = {
      action: 'handoff_to_human',
      execute: jest.fn().mockResolvedValue(handlerResult),
    };

    return {
      router: new AiActionRouterService(
        prisma as any,
        auditLogService as any,
        checkRoomAvailability as any,
        createHospitalityBooking as any,
        createHospitalityInquiry as any,
        createProductInquiry as any,
        createProductOrder as any,
        handoffToHuman as any,
      ),
      prisma,
      auditLogService,
      checkRoomAvailability,
      createHospitalityBooking,
      createHospitalityInquiry,
      createProductInquiry,
      createProductOrder,
      handoffToHuman,
    };
  }

  it('reserves an idempotency key, dispatches to the deterministic handler, stores response, and audits', async () => {
    const prisma = buildPrismaMock();
    const { router, createProductInquiry, auditLogService } = buildRouter(prisma, {
      product_inquiry_id: 'inq-1',
      status: 'open',
    });

    const result = await router.execute({
      action: 'create_product_inquiry',
      business_id: businessId,
      tenant_id: tenantId,
      lead_id: leadId,
      idempotency_key: 'ai_action:test',
      params: { item_id: 'item-1', quantity: 1 },
    });

    expect(prisma.businesses.findUnique).toHaveBeenCalledWith({
      where: { business_id: businessId },
      select: { business_id: true, tenant_id: true },
    });
    expect(prisma.leads.findFirst).toHaveBeenCalledWith({
      where: { lead_id: leadId, business_id: businessId, tenant_id: tenantId },
      select: { lead_id: true },
    });
    expect(prisma.workflow_idempotency_keys.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        idempotency_key: 'ai_action:test',
        purpose: 'ai_action:create_product_inquiry',
        status: 'started',
      }),
    });
    expect(createProductInquiry.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotency_key: 'ai_action:test',
      }),
    );
    expect(prisma.workflow_idempotency_keys.update).toHaveBeenCalledWith({
      where: { idempotency_key: 'ai_action:test' },
      data: expect.objectContaining({
        status: 'completed',
        response: expect.objectContaining({
          action: 'create_product_inquiry',
          status: 'completed',
          result: { product_inquiry_id: 'inq-1', status: 'open' },
        }),
        locked_until: null,
      }),
    });
    expect(auditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        business_id: businessId,
        action: 'create_product_inquiry',
        entity_type: 'ai_action',
        entity_id: 'ai_action:test',
      }),
    );
    expect(result).toEqual({
      action: 'create_product_inquiry',
      status: 'completed',
      result: { product_inquiry_id: 'inq-1', status: 'open' },
      idempotency_key: 'ai_action:test',
    });
  });

  it('returns the stored response for a completed idempotency key', async () => {
    const stored = {
      action: 'handoff_to_human',
      status: 'completed',
      result: { status: 'handed_off' },
      idempotency_key: 'ai_action:existing',
    };
    const prisma = buildPrismaMock({ status: 'completed', response: stored });
    const { router, handoffToHuman } = buildRouter(prisma);

    const result = await router.execute({
      action: 'handoff_to_human',
      business_id: businessId,
      tenant_id: tenantId,
      lead_id: leadId,
      idempotency_key: 'ai_action:existing',
      params: { reason: 'Needs help' },
    });

    expect(handoffToHuman.execute).not.toHaveBeenCalled();
    expect(result).toEqual(stored);
  });

  it('rejects an in-progress duplicate action', async () => {
    const prisma = buildPrismaMock({
      status: 'started',
      locked_until: new Date(Date.now() + 60_000),
    });
    const { router } = buildRouter(prisma);

    await expect(router.execute({
      action: 'create_hospitality_inquiry',
      business_id: businessId,
      tenant_id: tenantId,
      lead_id: leadId,
      idempotency_key: 'ai_action:busy',
      params: {},
    })).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects tenant mismatch before dispatching', async () => {
    const prisma = buildPrismaMock();
    const { router, checkRoomAvailability } = buildRouter(prisma);

    await expect(router.execute({
      action: 'check_room_availability',
      business_id: businessId,
      tenant_id: '00000000-0000-0000-0000-999999999999',
      params: { item_id: 'item-1', check_in: '2026-06-01', check_out: '2026-06-02' },
    })).rejects.toBeInstanceOf(BadRequestException);

    expect(checkRoomAvailability.execute).not.toHaveBeenCalled();
  });

  it('rejects cross-business lead before dispatching', async () => {
    const prisma = buildPrismaMock();
    prisma.leads.findFirst.mockResolvedValue(null);
    const { router, createHospitalityInquiry } = buildRouter(prisma);

    await expect(router.execute({
      action: 'create_hospitality_inquiry',
      business_id: businessId,
      tenant_id: tenantId,
      lead_id: leadId,
      params: {},
    })).rejects.toBeInstanceOf(NotFoundException);

    expect(createHospitalityInquiry.execute).not.toHaveBeenCalled();
  });
});
