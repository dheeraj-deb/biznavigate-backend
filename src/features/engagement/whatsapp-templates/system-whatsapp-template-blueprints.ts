import { CreateTemplateDto } from './dto/create-template.dto';
import { ButtonType, TemplateCategory } from './enums/template.enum';

export type TemplateBlueprintGroup = 'A' | 'B' | 'C' | 'D';

export interface SystemWhatsAppTemplateBlueprint extends CreateTemplateDto {
  key: string;
  businessGroups: TemplateBlueprintGroup[];
  businessTypes?: string[];
  policyUse: 'transactional' | 'marketing';
}

const utility = TemplateCategory.UTILITY;
const marketing = TemplateCategory.MARKETING;

export const SYSTEM_WHATSAPP_TEMPLATE_BLUEPRINTS: SystemWhatsAppTemplateBlueprint[] = [
  {
    key: 'group_a_exit_interest_check',
    businessGroups: ['A'],
    policyUse: 'marketing',
    name: 'bn_group_a_interest_check',
    category: marketing,
    language: 'en',
    components: {
      body: 'Hi {{1}}, just checking if you are still interested. Reply YES and our team will help you with the next step.',
      bodyExamples: ['Rahul'],
      variableDescriptions: ['Customer or lead name'],
      buttons: [
        { type: ButtonType.QUICK_REPLY, text: 'Yes, interested', payload: 'exit_yes_interested' },
        { type: ButtonType.QUICK_REPLY, text: 'Not now', payload: 'exit_not_interested' },
      ],
    },
  },
  {
    key: 'booking_confirmation',
    businessGroups: ['B'],
    policyUse: 'transactional',
    name: 'bn_booking_confirmation',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, your booking is confirmed. Booking reference: {{2}}. We will share any important updates here.',
      bodyExamples: ['Rahul', 'BK-1024'],
      variableDescriptions: ['Guest name', 'Booking reference ID'],
    },
  },
  {
    key: 'booking_link_followup',
    businessGroups: ['B'],
    policyUse: 'transactional',
    name: 'bn_booking_link_followup',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, your room is still available for {{2}}. Please complete your booking here: {{3}}',
      bodyExamples: ['Rahul', '12 Jun to 14 Jun', 'https://example.com/book/abc'],
      variableDescriptions: ['Guest name', 'Stay dates', 'Booking link'],
    },
  },
  {
    key: 'room_available_alert',
    businessGroups: ['B'],
    policyUse: 'transactional',
    name: 'bn_room_available_alert',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, a room is now available for {{2}}. You can book it here: {{3}}',
      bodyExamples: ['Rahul', '12 Jun to 14 Jun', 'https://example.com/book/abc'],
      variableDescriptions: ['Guest name', 'Requested stay dates', 'Booking link'],
    },
  },
  {
    key: 'booking_enquiry_followup',
    businessGroups: ['B'],
    policyUse: 'marketing',
    name: 'bn_booking_enquiry_followup',
    category: marketing,
    language: 'en',
    components: {
      body: 'Hi {{1}}, are you still planning your stay? Reply YES and our team will help you confirm availability.',
      bodyExamples: ['Rahul'],
      variableDescriptions: ['Guest name'],
      buttons: [
        { type: ButtonType.QUICK_REPLY, text: 'Yes', payload: 'booking_yes' },
        { type: ButtonType.QUICK_REPLY, text: 'Not now', payload: 'booking_not_now' },
      ],
    },
  },
  {
    key: 'checkin_reminder',
    businessGroups: ['B'],
    policyUse: 'transactional',
    name: 'bn_checkin_reminder',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, reminder for your stay on {{2}}. We are ready to welcome you.',
      bodyExamples: ['Rahul', '12 Jun'],
      variableDescriptions: ['Guest name', 'Check-in date'],
    },
  },
  {
    key: 'review_request',
    businessGroups: ['B'],
    policyUse: 'transactional',
    name: 'bn_review_request',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, thank you for staying with us. Please share your review here: {{2}}',
      bodyExamples: ['Rahul', 'https://example.com/review'],
      variableDescriptions: ['Guest name', 'Review link'],
    },
  },
  {
    key: 'order_confirmation',
    businessGroups: ['C'],
    policyUse: 'transactional',
    name: 'bn_order_confirmation',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, your order {{2}} is confirmed. We will update you on delivery.',
      bodyExamples: ['Rahul', 'ORD-1024'],
      variableDescriptions: ['Customer name', 'Order number'],
    },
  },
  {
    key: 'stock_held_reminder',
    businessGroups: ['C'],
    policyUse: 'transactional',
    name: 'bn_stock_held_reminder',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, we have kept {{2}} for you. It will be released in {{3}} minutes. Confirm here: {{4}}',
      bodyExamples: ['Rahul', 'Blue shirt', '30', 'https://example.com/pay/abc'],
      variableDescriptions: ['Customer name', 'Product name', 'Hold duration in minutes', 'Payment or confirmation link'],
    },
  },
  {
    key: 'payment_waiting',
    businessGroups: ['C'],
    policyUse: 'transactional',
    name: 'bn_payment_waiting',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, your order for {{2}} is ready. Please complete payment here: {{3}}',
      bodyExamples: ['Rahul', 'Blue shirt', 'https://example.com/pay/abc'],
      variableDescriptions: ['Customer name', 'Product name', 'Payment link'],
    },
  },
  {
    key: 'restock_alert',
    businessGroups: ['C'],
    policyUse: 'marketing',
    name: 'bn_restock_alert',
    category: marketing,
    language: 'en',
    components: {
      body: 'Hi {{1}}, {{2}} is back in stock now. Reply YES if you want us to keep one for you.',
      bodyExamples: ['Rahul', 'Blue shirt'],
      variableDescriptions: ['Customer name', 'Product name'],
      buttons: [
        { type: ButtonType.QUICK_REPLY, text: 'Yes', payload: 'restock_yes' },
        { type: ButtonType.QUICK_REPLY, text: 'Not now', payload: 'restock_not_now' },
      ],
    },
  },
  {
    key: 'credit_due',
    businessGroups: ['C'],
    policyUse: 'transactional',
    name: 'bn_credit_due',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, your credit due is {{2}}. Please pay by {{3}}. Reply if you need bill details.',
      bodyExamples: ['Rahul', 'INR 2,500', '20 Jun'],
      variableDescriptions: ['Customer name', 'Due amount', 'Due date'],
    },
  },
  {
    key: 'dead_stock_offer',
    businessGroups: ['C'],
    policyUse: 'marketing',
    name: 'bn_dead_stock_offer',
    category: marketing,
    language: 'en',
    components: {
      body: 'Hi {{1}}, we have a limited offer on {{2}}. Offer price: {{3}}. Reply YES to order.',
      bodyExamples: ['Rahul', 'summer shirts', 'INR 799'],
      variableDescriptions: ['Customer name', 'Product category', 'Offer price'],
      buttons: [
        { type: ButtonType.QUICK_REPLY, text: 'Yes', payload: 'offer_yes' },
        { type: ButtonType.QUICK_REPLY, text: 'Not now', payload: 'offer_not_now' },
      ],
    },
  },
  {
    key: 'used_car_details_followup',
    businessGroups: ['A'],
    businessTypes: ['used_cars'],
    policyUse: 'marketing',
    name: 'bn_used_car_details_followup',
    category: marketing,
    language: 'en',
    components: {
      body: 'Hi {{1}}, just checking if you are still interested in {{2}}. We can keep a visit slot for you today or tomorrow.',
      bodyExamples: ['Rahul', 'Honda City 2019'],
      variableDescriptions: ['Customer name', 'Car name/model'],
    },
  },
  {
    key: 'used_car_visit_slots',
    businessGroups: ['A'],
    businessTypes: ['used_cars'],
    policyUse: 'transactional',
    name: 'bn_used_car_visit_slots',
    category: utility,
    language: 'en',
    components: {
      body: 'Hi {{1}}, visit slots are available for {{2}}: {{3}} or {{4}}. Reply with your preferred slot.',
      bodyExamples: ['Rahul', 'Honda City 2019', 'Today 5 PM', 'Tomorrow 11 AM'],
      variableDescriptions: ['Customer name', 'Car name/model', 'First available slot', 'Second available slot'],
    },
  },
];

export function getSystemWhatsAppTemplatesForBusiness(
  businessGroup: TemplateBlueprintGroup,
  businessType?: string | null,
): SystemWhatsAppTemplateBlueprint[] {
  return SYSTEM_WHATSAPP_TEMPLATE_BLUEPRINTS.filter((template) => {
    if (!template.businessGroups.includes(businessGroup)) return false;
    return !template.businessTypes?.length || template.businessTypes.includes(String(businessType ?? ''));
  });
}
