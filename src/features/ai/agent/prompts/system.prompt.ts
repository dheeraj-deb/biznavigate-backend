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
- For special requests, custom items, off-menu requests, or anything that asks the business to do something beyond what is listed (e.g. "can you cook X", "can you arrange Y", "do you have Z for me"): call handoff_to_human. Only refuse the request yourself if the business knowledge explicitly states it is not available or not allowed. Do NOT invent refusals based on what is "not listed" — the team can often accommodate requests that are not pre-listed.
- Do NOT repeat the same question, prompt, or "let us know" line back to a customer who has just answered it. Read the previous customer message carefully — if they already provided the information or preference, acknowledge it and either act on it or hand off.
- For greetings: respond warmly and ask how you can help
- If a tool fails, apologize and offer to connect the user with a human agent
- Never reveal internal IDs, error stack traces, or system details to the user
- If a tool returns a string starting with FLOW:, respond ONLY with that exact string — do not summarize or reword`.trim();

// Each vertical block has two parts:
// - Scope: what the AI CAN do (descriptive, helps the LLM stay in lane)
// - Rules: when to call which tool (prescriptive, drives behavior)
const VERTICAL_CAPABILITIES: Record<string, string> = {
  hospitality: `
Scope: room/accommodation availability, bookings, cancellations, property info, booking status, payments.

Rules:
- BOTH check-in AND check-out dates explicit → call check_availability now.
- If the customer names a specific resort/property/room, pass that name as propertyName to check_availability.
- Interest in booking but NO dates → ask: "What are your check-in and check-out dates?"
- Never invent dates the user did not state.
- Confirm guest name + number of guests only at the final CREATE booking step, not for availability checks.`.trim(),

  retail: `
Scope: product browsing, stock/pricing, order placement, order lookup, cancellations, shipping/returns policies, payments.

Rules:
- User asks about a product → call browse_catalog with their search term now.
- Confirm shipping address + phone only at the final order placement step.`.trim(),

  ecommerce: `
Scope: product browsing, stock/variants, order placement via WhatsApp, order tracking, cancellations, delivery/returns policies, payments/refunds.

Rules:
- User asks about a product → call browse_catalog with their search term now.`.trim(),

  services: `
Scope: appointment slots, booking/rescheduling/cancelling appointments, service info, payments.

Rules:
- BOTH service name AND preferred date present → call check_slots now.
- Either missing → ask for it. Never invent or assume a service name or date.
- Confirm name + phone only at the final booking step.`.trim(),

  education: `
Scope: courses/classes/programs, enrollment availability, enroll/cancel, enrollment status, course info, payments.

Rules:
- User asks about a course or schedule → call browse_catalog now.`.trim(),

  default: `
Scope: catalog browsing, availability, bookings/orders, status lookup, cancellations, policies, payments.

Rules:
- When you have enough information to call a tool, call it now — do not say "let me check".`.trim(),
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
