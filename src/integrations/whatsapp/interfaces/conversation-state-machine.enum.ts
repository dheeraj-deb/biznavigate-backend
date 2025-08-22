// conversation-state-machine.enum.ts
export enum ConversationStep {
  GREETING = "greeting",
  REGISTRATION = "registration",
  AWAITING_ORDER = "awaiting_order",
  ORDER_CONFIRMATION = "order_confirmation",
  OFFER_PROMOTION = "offer_promotion",
  OUT_OF_STOCK_SUGGESTIONS = "out_of_stock_suggestions",
  PAYMENT_SELECTION = "payment_selection",
  COLLECT_DETAILS = "collect_details",
  CREDIT_APPROVED = "credit_approved",
  CREDIT_DENIED = "credit_denied",
  PAYMENT_REMINDER = "payment_reminder",
  PRODUCT_ANNOUNCEMENT = "product_announcement",
  ORDER_STATUS_UPDATE = "order_status_update",
  ERROR = "error",
}

export enum ConversationEvent {
  START = "start",
  REGISTRATION_COMPLETED = "registration_completed",
  PRODUCT_SELECTED = "product_selected",
  ORDER_CONFIRORMATION_COMPLETED = "order_confirmation_completed",
}
