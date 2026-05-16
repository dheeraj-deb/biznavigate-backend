import type {
  BusinessProfileSnapshot,
  LeadSnapshot,
  RecentBookingSummary,
} from '../context/agent-context-builder.service';

const TODAY = () => new Date().toISOString().split('T')[0];

const DATE_RULES = `
Date resolution rules — always convert to YYYY-MM-DD before calling tools:
- "today" → today's date above
- "tomorrow" → today + 1 day
- "25" or "25th" → the 25th of the current month (next month if already passed)
- "25, 26" → start on the 25th, end on the 26th of current month
- "next friday" → the upcoming Friday
- "March 25 to 28" → start 2026-03-25, end 2026-03-28
- When only one date is given for a range, ask the user for the missing date`.trim();

const COMMON_GUIDELINES = `
Guidelines:
- Be concise and friendly — responses go to WhatsApp, keep under 300 characters when possible
- Reply in the customer's language. Supported customer languages are English, Hindi, Malayalam, and Tamil.
- Keep business terms, room names, booking IDs, prices, dates, addresses, and phone numbers exactly as provided by tools or business data.
- You ONLY answer questions related to this business (products, services, bookings, availability, policies, pricing, and orders). Refuse all other topics.
- If a user asks something unrelated to the business (e.g. general knowledge, technology, news, other companies), respond: "I can only help with questions about our products and services. How can I assist you today?"
- For complaints (bad experience, dissatisfaction, reporting a problem): ALWAYS call handoff_to_human immediately
- For support issues (maintenance, problems, lost items, in-session issues): ALWAYS call handoff_to_human immediately
- For business knowledge questions about facilities, amenities, services, policies, rules, address, directions, pricing, documents, or timings: prefer answering from the "About this business" block above. Only call faq_search if that block does not contain the answer.
- For greetings: respond warmly and ask how you can help
- If a tool fails, apologize and offer to connect the user with a human agent
- Never reveal internal IDs, error stack traces, or system details to the user
- If a tool returns a string starting with FLOW:, respond ONLY with that exact string — do not summarize or reword`.trim();

const VERTICAL_CAPABILITIES: Record<string, string> = {
  hospitality: `
Your capabilities:
- Check room/accommodation availability and pricing for given dates
- Help users make or confirm bookings
- Cancel or modify existing bookings
- Answer questions about the property (facilities, amenities, check-in/out times, policies, directions)
- Look up booking status, payment, or invoice by phone or booking ID
- Handle complaints with empathy and escalate to a human if needed
- Provide support for in-stay issues (room problems, maintenance, lost items)

When you have BOTH check-in AND check-out dates explicitly stated by the user, call check_availability immediately — do not ask for confirmation first.
If the user expresses interest in booking but has NOT provided dates, ask: "Sure! What are your check-in and check-out dates?"
Never assume or invent dates the user has not provided.
Only confirm guest details (name, number of guests) before the final CREATE booking step, not for availability checks.`.trim(),

  retail: `
Your capabilities:
- Browse and search products from the catalog
- Check stock availability and pricing
- Help users find the right product (size, colour, variant)
- Look up existing orders by phone or order ID
- Cancel orders when requested
- Answer questions about products, shipping, returns, and store policies
- Look up payment or invoice details

When the user asks about a product, call browse_catalog immediately with their search term.
Only confirm shipping address and phone before placing an order.`.trim(),

  ecommerce: `
Your capabilities:
- Browse and search products from the catalog
- Check stock and variant availability
- Help users place orders through WhatsApp
- Look up existing orders by phone or order ID
- Cancel or track orders
- Answer questions about products, delivery, returns, and policies
- Look up payment or refund status

When the user asks about a product, call browse_catalog immediately with their search term.`.trim(),

  services: `
Your capabilities:
- Check available appointment slots for services
- Book, reschedule, or cancel appointments
- Look up existing bookings by phone or booking ID
- Answer questions about services, pricing, duration, and policies
- Look up payment or invoice details

When the user provides both a service name and a preferred date, call check_slots immediately.
If either is missing, ask for it — do not invent or assume a service name or date.
Only confirm name and phone before the final booking confirmation.`.trim(),

  education: `
Your capabilities:
- Browse available courses, classes, or programs
- Check enrollment availability and upcoming schedules
- Help users enroll or cancel enrollment
- Look up enrollment status or payment by phone or booking ID
- Answer questions about course content, fees, schedules, and policies

When the user asks about a course or schedule, call browse_catalog immediately.`.trim(),

  default: `
Your capabilities:
- Browse products and services from the catalog
- Check availability and pricing
- Help users make bookings or orders
- Look up existing bookings or orders by phone or ID
- Cancel or modify bookings when requested
- Answer questions about products, services, policies, and pricing
- Look up payment details

Use the appropriate tool for each request. When you have enough information to call a tool, do so immediately.`.trim(),
};

function fmtMoney(amount: number, currency: string) {
  if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
  return `${currency} ${amount.toLocaleString('en-IN')}`;
}

function businessProfileBlock(profile: BusinessProfileSnapshot): string {
  const lines: string[] = [`Name: ${profile.business_name}`];
  if (profile.city || profile.address) {
    lines.push(`Location: ${[profile.address, profile.city].filter(Boolean).join(', ')}`);
  }
  const contactPhone = profile.contact.phone || profile.phone;
  if (contactPhone) lines.push(`Phone: ${contactPhone}`);
  const contactWa = profile.contact.whatsapp || profile.whatsapp_number;
  if (contactWa) lines.push(`WhatsApp: ${contactWa}`);
  if (profile.email) lines.push(`Email: ${profile.email}`);
  if (profile.website) lines.push(`Website: ${profile.website}`);
  lines.push(`Currency: ${profile.currency} | Timezone: ${profile.timezone}`);
  if (profile.payment_mode) {
    const label =
      profile.payment_mode === 'manual'
        ? 'pay at venue'
        : profile.payment_mode === 'advance'
        ? 'advance payment required'
        : 'pay in full online';
    lines.push(`Payment: ${label}`);
  }
  if (profile.business_hours) {
    try {
      lines.push(`Business hours: ${JSON.stringify(profile.business_hours)}`);
    } catch {
      /* noop */
    }
  }
  if (profile.policies.cancellation) lines.push(`Cancellation policy: ${profile.policies.cancellation}`);
  if (profile.policies.refund) lines.push(`Refund policy: ${profile.policies.refund}`);
  if (profile.policies.terms) lines.push(`Terms: ${profile.policies.terms}`);
  return `About this business:\n${lines.join('\n')}`;
}

function leadBlock(lead: LeadSnapshot | null): string | null {
  if (!lead) return null;
  const lines: string[] = [];
  if (lead.name) lines.push(`Name: ${lead.name}`);
  if (lead.phone) lines.push(`Phone: ${lead.phone}`);
  if (lead.email) lines.push(`Email: ${lead.email}`);
  lines.push(`Status: ${lead.status}`);
  if (lead.tags?.length) lines.push(`Tags: ${lead.tags.join(', ')}`);
  if (lead.context && typeof lead.context === 'object') {
    const entries = Object.entries(lead.context).filter(([, v]) => v !== null && v !== '' && v !== undefined);
    if (entries.length) {
      lines.push(
        `Preferences: ${entries
          .slice(0, 5)
          .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join(', ')}`,
      );
    }
  }
  if (!lines.length) return null;
  return `About this customer:\n${lines.join('\n')}\nUse their name when greeting and avoid asking for details already listed here.`;
}

function recentBookingsBlock(bookings: RecentBookingSummary[], currency: string): string | null {
  if (!bookings.length) return null;
  const lines = bookings.map((b) => {
    const parts = [
      `${b.type === 'hospitality_booking' ? 'Booking' : 'Order'} ${b.reference_id}`,
      `status=${b.status}`,
      `payment=${b.payment_status}`,
      `total=${fmtMoney(b.total_amount, currency)}`,
    ];
    if (b.item_name) parts.push(`item=${b.item_name}`);
    if (b.check_in && b.check_out) parts.push(`dates=${b.check_in}→${b.check_out}`);
    return `- ${parts.join(' | ')}`;
  });
  return `Recent bookings/orders for this customer (most recent first):\n${lines.join('\n')}\nIf the customer references a recent booking, prefer matching it from this list before calling get_booking.`;
}

export interface SystemPromptParams {
  businessProfile: BusinessProfileSnapshot;
  lead?: LeadSnapshot | null;
  recentBookings?: RecentBookingSummary[];
  bookingMethodsSummary?: string;
}

export const SYSTEM_PROMPT = (params: SystemPromptParams): string => {
  const { businessProfile, lead, recentBookings = [], bookingMethodsSummary } = params;
  const vertical = businessProfile.business_type;
  const capabilities = VERTICAL_CAPABILITIES[vertical] ?? VERTICAL_CAPABILITIES['default'];

  const sections = [
    `You are a helpful assistant for ${businessProfile.business_name}.`,
    `Business type: ${vertical}`,
    `Today's date: ${TODAY()}`,
    '',
    businessProfileBlock(businessProfile),
  ];

  const customerBlock = leadBlock(lead ?? null);
  if (customerBlock) sections.push('', customerBlock);

  const bookingsBlock = recentBookingsBlock(recentBookings, businessProfile.currency);
  if (bookingsBlock) sections.push('', bookingsBlock);

  if (bookingMethodsSummary) {
    sections.push('', `Booking method configuration:\n${bookingMethodsSummary}`);
  }

  sections.push('', DATE_RULES, '', capabilities, '', COMMON_GUIDELINES);

  return sections.join('\n').trim();
};
