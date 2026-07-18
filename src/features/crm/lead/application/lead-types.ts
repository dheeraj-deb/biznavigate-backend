export const LeadTypes = {
  RESORT_ENQUIRY: 'resort_enquiry',
  RESORT_AVAILABILITY: 'resort_availability',
  RESORT_NO_AVAILABILITY: 'resort_no_availability',
  RESORT_BOOKING_REQUEST: 'resort_booking_request',
  RESORT_BOOKING_PENDING: 'resort_booking_pending',
  RESORT_BOOKED: 'resort_booked',
  RESORT_CANCELLED: 'resort_cancelled',

  PRODUCT_ENQUIRY: 'product_enquiry',
  PRODUCT_ORDER_PENDING: 'product_order_pending',
  PRODUCT_ORDERED: 'product_ordered',
  PRODUCT_CANCELLED: 'product_cancelled',
  STOCK_ALERT_SUBSCRIBER: 'stock_alert_subscriber',

  PRICE_ALERT_SUBSCRIBER: 'price_alert_subscriber',
  MATCH_ALERT_SUBSCRIBER: 'match_alert_subscriber',
  SLOT_ALERT_SUBSCRIBER: 'slot_alert_subscriber',
  ACTIVITY_UPDATE_SUBSCRIBER: 'activity_update_subscriber',
  BATCH_UPDATE_SUBSCRIBER: 'batch_update_subscriber',
  NEGOTIATING: 'negotiating',
  FOLLOW_UP_SCHEDULED: 'follow_up_scheduled',
  LOST: 'lost',
} as const;

export type LeadType = typeof LeadTypes[keyof typeof LeadTypes];

export function leadTypeForPublicItem(itemType?: string | null): LeadType | null {
  if (itemType === 'accommodation') return LeadTypes.RESORT_BOOKING_REQUEST;
  if (itemType === 'physical_product') return LeadTypes.PRODUCT_ENQUIRY;
  return null;
}
