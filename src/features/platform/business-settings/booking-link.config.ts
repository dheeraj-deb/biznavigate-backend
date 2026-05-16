export type BookingLinkExperience =
  | 'hospitality'
  | 'events'
  | 'services'
  | 'healthcare'
  | 'education'
  | 'products'
  | 'generic';

export type BookingLinkPaymentMode = 'manual' | 'advance' | 'full';
export type BookingLinkAdvanceType = 'fixed' | 'percentage';

export interface BookingLinkConfig {
  enabled: boolean;
  slug: string;
  experience_type: BookingLinkExperience;
  payment_mode: BookingLinkPaymentMode;
  advance_type: BookingLinkAdvanceType;
  advance_amount: number;
  theme: {
    primary_color: string;
    show_logo: boolean;
    show_banner: boolean;
  };
  policies: {
    cancellation: string;
    refund: string;
    terms: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    address: string;
  };
  required_fields: {
    name: boolean;
    phone: boolean;
    email: boolean;
    address: boolean;
    notes: boolean;
  };
}

export const DEFAULT_BOOKING_LINK: BookingLinkConfig = {
  enabled: false,
  slug: '',
  experience_type: 'generic',
  payment_mode: 'manual',
  advance_type: 'fixed',
  advance_amount: 0,
  theme: {
    primary_color: '#0066FF',
    show_logo: true,
    show_banner: true,
  },
  policies: {
    cancellation: '',
    refund: '',
    terms: '',
  },
  contact: {
    phone: '',
    whatsapp: '',
    address: '',
  },
  required_fields: {
    name: true,
    phone: true,
    email: false,
    address: false,
    notes: false,
  },
};

export function slugifyBookingLink(value: string): string {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function asExperience(value: unknown): BookingLinkExperience {
  return ['hospitality', 'events', 'services', 'healthcare', 'education', 'products', 'generic'].includes(String(value))
    ? (value as BookingLinkExperience)
    : 'generic';
}

function asPaymentMode(value: unknown): BookingLinkPaymentMode {
  return value === 'advance' || value === 'full' || value === 'manual' ? value : 'manual';
}

function asAdvanceType(value: unknown): BookingLinkAdvanceType {
  return value === 'percentage' || value === 'fixed' ? value : 'fixed';
}

export function normalizeBookingLinkConfig(input: unknown, slug = ''): BookingLinkConfig {
  const raw = input && typeof input === 'object' ? (input as Record<string, any>) : {};
  const defaults = DEFAULT_BOOKING_LINK;

  return {
    enabled: asBoolean(raw.enabled, defaults.enabled),
    slug: slugifyBookingLink(asString(raw.slug, slug)),
    experience_type: asExperience(raw.experience_type),
    payment_mode: asPaymentMode(raw.payment_mode),
    advance_type: asAdvanceType(raw.advance_type),
    advance_amount: asNumber(raw.advance_amount, defaults.advance_amount),
    theme: {
      primary_color: asString(raw.theme?.primary_color, defaults.theme.primary_color) || defaults.theme.primary_color,
      show_logo: asBoolean(raw.theme?.show_logo, defaults.theme.show_logo),
      show_banner: asBoolean(raw.theme?.show_banner, defaults.theme.show_banner),
    },
    policies: {
      cancellation: asString(raw.policies?.cancellation, defaults.policies.cancellation),
      refund: asString(raw.policies?.refund, defaults.policies.refund),
      terms: asString(raw.policies?.terms, defaults.policies.terms),
    },
    contact: {
      phone: asString(raw.contact?.phone, defaults.contact.phone),
      whatsapp: asString(raw.contact?.whatsapp, defaults.contact.whatsapp),
      address: asString(raw.contact?.address, defaults.contact.address),
    },
    required_fields: {
      name: asBoolean(raw.required_fields?.name, defaults.required_fields.name),
      phone: asBoolean(raw.required_fields?.phone, defaults.required_fields.phone),
      email: asBoolean(raw.required_fields?.email, defaults.required_fields.email),
      address: asBoolean(raw.required_fields?.address, defaults.required_fields.address),
      notes: asBoolean(raw.required_fields?.notes, defaults.required_fields.notes),
    },
  };
}

export function inferExperienceType(businessType?: string | null): BookingLinkExperience {
  switch (String(businessType ?? '').toLowerCase()) {
    case 'hospitality':
      return 'hospitality';
    case 'events':
      return 'events';
    case 'healthcare':
      return 'healthcare';
    case 'education':
      return 'education';
    case 'products':
    case 'retail':
      return 'products';
    case 'professional_services':
      return 'services';
    default:
      return 'generic';
  }
}
