import { ContactResolutionService } from './contact-resolution.service';

describe('ContactResolutionService', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const tenantId = '00000000-0000-0000-0000-000000000002';
  const leadId = '00000000-0000-0000-0000-000000000003';

  function buildPrismaMock({
    account = {
      business_id: businessId,
      businesses: { tenant_id: tenantId },
    },
    customer = { customer_id: 'customer-1' },
    lead = { lead_id: leadId, name: 'Dheeraj', status: 'new', phone: '919999999999' },
  }: any = {}) {
    return {
      social_accounts: {
        findFirst: jest.fn().mockResolvedValue(account),
      },
      customers: {
        findFirst: jest.fn().mockResolvedValue(customer),
        create: jest.fn().mockResolvedValue({ customer_id: 'customer-created' }),
      },
      leads: {
        findFirst: jest.fn().mockResolvedValue(lead),
        create: jest.fn().mockResolvedValue({ lead_id: leadId, name: 'Dheeraj', status: 'new', phone: '919999999999' }),
      },
    };
  }

  it('resolves account, existing customer, and existing lead scoped to business', async () => {
    const prisma = buildPrismaMock();
    const service = new ContactResolutionService(prisma as any);

    const result = await service.resolveForInboundMessage({
      phone_number_id: 'phone-number-id',
      from: '919999999999',
      contacts: [{ wa_id: '919999999999', profile: { name: 'Dheeraj' } }],
    });

    expect(prisma.social_accounts.findFirst).toHaveBeenCalledWith({
      where: { platform: 'whatsapp', page_id: 'phone-number-id', is_active: true },
      include: { businesses: true },
    });
    expect(prisma.customers.findFirst).toHaveBeenCalledWith({
      where: { business_id: businessId, platform_user_id: '919999999999' },
      select: { customer_id: true },
    });
    expect(prisma.leads.findFirst).toHaveBeenCalledWith({
      where: { business_id: businessId, platform_id: '919999999999', deleted_at: null },
    });
    expect(prisma.customers.create).not.toHaveBeenCalled();
    expect(prisma.leads.create).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      contact_name: 'Dheeraj',
      lead: expect.objectContaining({ lead_id: leadId }),
    }));
  });

  it('creates missing customer and lead using account business and tenant', async () => {
    const prisma = buildPrismaMock({ customer: null, lead: null });
    const service = new ContactResolutionService(prisma as any);

    const result = await service.resolveForInboundMessage({
      phone_number_id: 'phone-number-id',
      from: '919999999999',
      contacts: [{ wa_id: '919999999999', profile: { name: 'Dheeraj' } }],
    });

    expect(prisma.customers.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        business_id: businessId,
        tenant_id: tenantId,
        name: 'Dheeraj',
        platform_user_id: '919999999999',
      }),
    });
    expect(prisma.leads.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        business_id: businessId,
        tenant_id: tenantId,
        channel: 'whatsapp',
        platform_id: '919999999999',
        name: 'Dheeraj',
      }),
    });
    expect(result?.lead.lead_id).toBe(leadId);
  });

  it('returns null when no active account exists', async () => {
    const prisma = buildPrismaMock({ account: null });
    const service = new ContactResolutionService(prisma as any);

    const result = await service.resolveForInboundMessage({
      phone_number_id: 'missing-phone-number-id',
      from: '919999999999',
      contacts: [],
    });

    expect(result).toBeNull();
    expect(prisma.customers.findFirst).not.toHaveBeenCalled();
    expect(prisma.leads.findFirst).not.toHaveBeenCalled();
  });
});
