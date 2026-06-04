import { BadRequestException } from '@nestjs/common';

/**
 * Allowed lead status values. Mirrors pipeline_stages.slug so dashboards keep
 * working unchanged. The full pipeline picture lives in pipeline_stages; this
 * is the cached, denormalised slug used by reporting SQL.
 */
export const LEAD_STATUSES = [
  'new',
  'contacted',
  'active',
  'qualified',
  'quoted',
  'booked',
  'won',
  'converted',
  'lost',
  'cancelled',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function assertValidLeadStatus(status: string): asserts status is LeadStatus {
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) {
    throw new BadRequestException(
      `Invalid lead status "${status}". Allowed: ${LEAD_STATUSES.join(', ')}`,
    );
  }
}
