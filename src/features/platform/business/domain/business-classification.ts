import { BUSINESS_TYPES } from '../application/dto/create-business.dto';

export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type BusinessGroup = 'A' | 'B' | 'C' | 'D';
export type CommunicationMode = 'WORKFLOW';

export const BUSINESS_TYPE_TO_GROUP: Record<BusinessType, BusinessGroup> = {
  real_estate: 'A',
  used_cars: 'A',
  hospitality: 'B',
  events: 'B',
  products: 'C',
  retail: 'C',
  healthcare: 'D',
  professional_services: 'D',
  crm_automation: 'D',
  education: 'D',
};

export function resolveBusinessGroupFromType(
  businessType: string | null | undefined,
): BusinessGroup | null {
  if (!businessType) return null;
  if ((BUSINESS_TYPES as readonly string[]).includes(businessType)) {
    return BUSINESS_TYPE_TO_GROUP[businessType as BusinessType];
  }
  return null;
}

export function buildBusinessAutomationDefaults(businessType?: string | null) {
  const businessGroup = resolveBusinessGroupFromType(businessType);
  return {
    ...(businessGroup ? { business_group: businessGroup } : {}),
    communication_mode: 'WORKFLOW' as const,
  };
}
