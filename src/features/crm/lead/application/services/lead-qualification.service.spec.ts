import { LeadTypes } from '../lead-types';
import { LeadQualificationService } from './lead-qualification.service';

describe('LeadQualificationService', () => {
  const leadId = '00000000-0000-0000-0000-000000000001';

  function buildService(events: Array<{ type: string; data?: any }>) {
    const prisma = {
      lead_events: {
        findMany: jest.fn().mockResolvedValue(events),
      },
      leads: {
        update: jest.fn(),
      },
    };
    return {
      prisma,
      service: new LeadQualificationService(prisma as any),
    };
  }

  it('scores resort booking events as hot intent', async () => {
    const { prisma, service } = buildService([
      { type: 'hospitality_inquiry_created' },
      { type: 'booking_pending' },
      { type: 'booked' },
    ]);

    await (service as any).computeAndPersist(leadId);

    expect(prisma.leads.update).toHaveBeenCalledWith({
      where: { lead_id: leadId },
      data: { qualification_score: 100 },
    });
  });

  it('clamps cancelled lead scores to zero and reports lost level', async () => {
    const { prisma, service } = buildService([
      { type: 'booked' },
      { type: 'booking_cancelled' },
      { type: 'status_changed', data: { to: 'lost' } },
    ]);

    await (service as any).computeAndPersist(leadId);

    expect(prisma.leads.update).toHaveBeenCalledWith({
      where: { lead_id: leadId },
      data: { qualification_score: 0 },
    });
    expect(service.getLevel(80, LeadTypes.RESORT_CANCELLED)).toBe('lost');
  });
});
