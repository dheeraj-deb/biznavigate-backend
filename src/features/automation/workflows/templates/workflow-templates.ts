/**
 * Static catalog of starter workflow templates surfaced in the wizard.
 *
 * Each template is a complete (nodes + connections) blueprint a business can
 * clone in one click. Node IDs use stable string keys so we can post the same
 * shape backend → wizard → backend on clone without re-keying.
 *
 * Template strings use `${var}` placeholders (e.g. `${contact.name}`) — these are
 * resolved by the runtime; the wizard's variable picker exposes the same set.
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'engagement' | 'commerce' | 'support' | 'reactivation';
  /** Suggested business types this template fits best. Empty → all verticals. */
  business_types: string[];
  nodes: any[];
  connections: Record<string, { main: Array<{ node: string; condition?: any }> }>;
}

const TRIGGER_ANY: any = {
  id: 'trigger_1',
  type: 'trigger.whatsapp',
  name: 'When a WhatsApp message arrives',
  position: { x: 0, y: 0 },
  params: {},
};

function intentTrigger(intent: string, label: string): any {
  return {
    id: 'trigger_1',
    type: 'trigger.whatsapp.intent',
    name: label,
    position: { x: 0, y: 0 },
    params: { intent },
  };
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'welcome_new_lead',
    name: 'Welcome new lead',
    description: 'Greet a customer the first time they message and ask how you can help.',
    icon: '👋',
    category: 'engagement',
    business_types: [],
    nodes: [
      TRIGGER_ANY,
      {
        id: 'send_welcome',
        type: 'action.send_message',
        name: 'Welcome message',
        position: { x: 0, y: 1 },
        params: {
          message:
            "Hi ${contact.name}! 👋 Thanks for reaching out. How can we help you today?",
        },
      },
    ],
    connections: {
      trigger_1: { main: [{ node: 'send_welcome' }] },
    },
  },
  {
    id: 'booking_followup',
    name: 'Booking follow-up',
    description:
      'When a customer asks about their booking, look it up and ask if they need anything else.',
    icon: '📅',
    category: 'support',
    business_types: ['hospitality', 'services', 'healthcare', 'education'],
    nodes: [
      intentTrigger('status', 'When customer asks about a booking'),
      {
        id: 'ask_next',
        type: 'action.send_message_with_btns',
        name: 'Offer next steps',
        position: { x: 0, y: 1 },
        params: {
          message:
            "Hi ${contact.name}, we'll pull up your booking. Is there anything else you need?",
          buttons: [
            { id: 'yes_help', title: 'Yes, I need help' },
            { id: 'no_thanks', title: 'No, thanks' },
          ],
        },
      },
    ],
    connections: {
      trigger_1: { main: [{ node: 'ask_next' }] },
    },
  },
  {
    id: 'catalog_on_inquiry',
    name: 'Send catalog on product inquiry',
    description:
      'When a customer asks to see products, send your WhatsApp catalog right away.',
    icon: '🛍️',
    category: 'commerce',
    business_types: ['retail', 'ecommerce'],
    nodes: [
      intentTrigger('browse', 'When customer wants to browse'),
      {
        id: 'send_catalog_1',
        type: 'action.send_catalog',
        name: 'Send catalog',
        position: { x: 0, y: 1 },
        params: {
          header: 'Our catalog',
          message: 'Here is what we currently have available — tap any item to learn more.',
          limit: 10,
          applyFilters: false,
        },
      },
    ],
    connections: {
      trigger_1: { main: [{ node: 'send_catalog_1' }] },
    },
  },
  {
    id: 'reactivate_inactive_lead',
    name: 'Reactivate inactive lead',
    description:
      'When an old contact messages again, send a friendly check-in and a menu of options.',
    icon: '🔄',
    category: 'reactivation',
    business_types: [],
    nodes: [
      TRIGGER_ANY,
      {
        id: 'reactivate_menu',
        type: 'action.send_message_withmenu',
        name: 'Menu of options',
        position: { x: 0, y: 1 },
        params: {
          message:
            'Welcome back ${contact.name}! Pick what you would like to do next:',
          menu: [
            { id: 'book', label: 'Make a booking', description: 'Reserve your spot' },
            { id: 'browse', label: 'Browse products', description: 'See what we offer' },
            { id: 'support', label: 'Talk to a person', description: 'Get help from our team' },
          ],
        },
      },
    ],
    connections: {
      trigger_1: { main: [{ node: 'reactivate_menu' }] },
    },
  },
  {
    id: 'instant_handoff',
    name: 'Send to human agent',
    description:
      'When a customer asks for support, acknowledge and hand off the conversation to your team.',
    icon: '🙋',
    category: 'support',
    business_types: [],
    nodes: [
      intentTrigger('support', 'When customer needs human help'),
      {
        id: 'ack_handoff',
        type: 'action.send_message',
        name: 'Acknowledge',
        position: { x: 0, y: 1 },
        params: {
          message:
            "Thanks for reaching out, ${contact.name}. Connecting you with someone from our team now.",
        },
      },
    ],
    connections: {
      trigger_1: { main: [{ node: 'ack_handoff' }] },
    },
  },
];

export function findTemplate(templateId: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
}
