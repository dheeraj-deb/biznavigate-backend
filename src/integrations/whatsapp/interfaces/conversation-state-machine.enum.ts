// conversation-state-machine.enum.ts
export enum ConversationStep {
  GREETING = "greeting",
  REGISTRATION = "registration",
  PLACE_ORDER_REQUEST = "place_order_request",
  AWAITING_PRODUCT_LIST = "awaiting_product_list",
  PRODUCT_SEARCH_RESULTS = "product_search_results",
  ORDER_REVIEW = "order_review",
  ORDER_CONFIRMATION = "order_confirmation",
  INVOICE_GENERATION = "invoice_generation",
  ERROR = "error",
}

export enum ConversationEvent {
  START = "start",
  REGISTRATION_COMPLETED = "registration_completed",
  ORDER_PLACED = "order_placed",
  PRODUCT_LIST_PROVIDED = "product_list_provided",
  PRODUCT_SEARCH_PERFORMED = "product_search_performed",
  ORDER_REVIEWED = "order_reviewed",
  REVIEW_CONFIRMED = "review_confirmed",
  REVIEW_EDIT = "review_edit",
  REVIEW_CANCEL = "review_cancel",
  ORDER_CONFIRMED = "order_confirmed",
  ORDER_REJECTED = "order_rejected",
  ORDER_CONFIRMATION_COMPLETED = "order_confirmation_completed",
}