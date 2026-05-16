export interface BookingMethodsConfig {
  availability_response: {
    mode: 'interactive' | 'flow' | 'text' | 'website_link';
  };
  ai_chat: {
    enabled: boolean;
    collect_guest_details: boolean;
    require_confirmation: boolean;
  };
  interactive: {
    enabled: boolean;
    send_entry_buttons: boolean;
    send_room_or_service_list: boolean;
  };
  catalog: {
    enabled: boolean;
    send_product_messages: boolean;
  };
  templates: {
    enabled: boolean;
    confirmation_template_name: string;
    reminder_template_name: string;
    language: string;
  };
  human_handoff: {
    enabled: boolean;
    on_unavailable: boolean;
    on_low_confidence: boolean;
    on_payment_issue: boolean;
  };
}

export const DEFAULT_BOOKING_METHODS: BookingMethodsConfig = {
  availability_response: {
    mode: 'interactive',
  },
  ai_chat: {
    enabled: true,
    collect_guest_details: true,
    require_confirmation: true,
  },
  interactive: {
    enabled: true,
    send_entry_buttons: true,
    send_room_or_service_list: true,
  },
  catalog: {
    enabled: false,
    send_product_messages: false,
  },
  templates: {
    enabled: false,
    confirmation_template_name: '',
    reminder_template_name: '',
    language: 'en',
  },
  human_handoff: {
    enabled: true,
    on_unavailable: true,
    on_low_confidence: true,
    on_payment_issue: true,
  },
};

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asAvailabilityMode(value: unknown): BookingMethodsConfig['availability_response']['mode'] {
  return value === 'flow' || value === 'text' || value === 'interactive' || value === 'website_link'
    ? value
    : 'interactive';
}

export function normalizeBookingMethodsConfig(input: unknown): BookingMethodsConfig {
  const raw = input && typeof input === 'object' ? (input as Record<string, any>) : {};
  const defaults = DEFAULT_BOOKING_METHODS;

  return {
    availability_response: {
      mode: asAvailabilityMode(raw.availability_response?.mode),
    },
    ai_chat: {
      enabled: asBoolean(raw.ai_chat?.enabled, defaults.ai_chat.enabled),
      collect_guest_details: asBoolean(raw.ai_chat?.collect_guest_details, defaults.ai_chat.collect_guest_details),
      require_confirmation: asBoolean(raw.ai_chat?.require_confirmation, defaults.ai_chat.require_confirmation),
    },
    interactive: {
      enabled: asBoolean(raw.interactive?.enabled, defaults.interactive.enabled),
      send_entry_buttons: asBoolean(raw.interactive?.send_entry_buttons, defaults.interactive.send_entry_buttons),
      send_room_or_service_list: asBoolean(
        raw.interactive?.send_room_or_service_list,
        defaults.interactive.send_room_or_service_list,
      ),
    },
    catalog: {
      enabled: asBoolean(raw.catalog?.enabled, defaults.catalog.enabled),
      send_product_messages: asBoolean(raw.catalog?.send_product_messages, defaults.catalog.send_product_messages),
    },
    templates: {
      enabled: asBoolean(raw.templates?.enabled, defaults.templates.enabled),
      confirmation_template_name: asString(
        raw.templates?.confirmation_template_name,
        defaults.templates.confirmation_template_name,
      ),
      reminder_template_name: asString(raw.templates?.reminder_template_name, defaults.templates.reminder_template_name),
      language: asString(raw.templates?.language, defaults.templates.language) || defaults.templates.language,
    },
    human_handoff: {
      enabled: asBoolean(raw.human_handoff?.enabled, defaults.human_handoff.enabled),
      on_unavailable: asBoolean(raw.human_handoff?.on_unavailable, defaults.human_handoff.on_unavailable),
      on_low_confidence: asBoolean(raw.human_handoff?.on_low_confidence, defaults.human_handoff.on_low_confidence),
      on_payment_issue: asBoolean(raw.human_handoff?.on_payment_issue, defaults.human_handoff.on_payment_issue),
    },
  };
}

export function summarizeBookingMethodsForAgent(config: BookingMethodsConfig): string {
  const enabled: string[] = [];
  const disabled: string[] = [];

  if (config.ai_chat.enabled) enabled.push('AI chat booking');
  else disabled.push('AI chat booking');

  if (config.interactive.enabled) enabled.push('WhatsApp reply buttons and list messages');
  else disabled.push('WhatsApp reply buttons and list messages');

  if (config.catalog.enabled) enabled.push('WhatsApp catalog/product messages');
  else disabled.push('WhatsApp catalog/product messages');

  if (config.availability_response.mode === 'website_link') enabled.push('website booking link response');

  if (config.templates.enabled) enabled.push('approved WhatsApp booking templates');
  else disabled.push('approved WhatsApp booking templates');

  if (config.human_handoff.enabled) enabled.push('human handoff fallback');
  else disabled.push('human handoff fallback');

  return [
    `Availability results should be sent as ${config.availability_response.mode}.`,
    `Enabled booking methods: ${enabled.join(', ') || 'none'}.`,
    `Disabled booking methods: ${disabled.join(', ') || 'none'}.`,
    config.ai_chat.require_confirmation
      ? 'Before final booking/order creation, confirm important customer details.'
      : 'Do not add an extra confirmation step when all required details are present.',
    config.human_handoff.enabled && config.human_handoff.on_unavailable
      ? 'If availability is not found or the customer needs exceptions, offer human handoff.'
      : 'Do not automatically hand off just because availability is not found.',
  ].join(' ');
}
