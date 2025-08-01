// conversation-state-machine.enum.ts
export enum ConversationStep {
  GREETING = "greeting",
  AWAITING_CATEGORY = "awaiting_category",
  AWAITING_PRODUCT = "awaiting_product",
  AWAITING_QUANTITY = "awaiting_quantity",
  CONFIRM_CART = "confirm_cart",
  COLLECT_DETAILS = "collect_details",
  PAYMENT = "payment",
  CONFIRMATION = "confirmation",
  SUPPORT = "support",
  ERROR = "error",
}

export enum ConversationEvent {
  START = "start",
  CATEGORY_SELECTED = "category_selected",
  PRODUCT_SELECTED = "product_selected",
  QUANTITY_PROVIDED = "quantity_provided",
  CART_CONFIRMED = "cart_confirmed",
  DETAILS_PROVIDED = "details_provided",
  PAYMENT_COMPLETED = "payment_completed",
  ORDER_CONFIRMED = "order_confirmed",
  HELP_REQUESTED = "help_requested",
  RESET_REQUESTED = "reset_requested",
  ERROR_OCCURRED = "error_occurred",
}
