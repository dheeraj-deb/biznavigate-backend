import {
  ConversationEvent,
  ConversationStep,
} from "../interfaces/converstation-state-machine.enum";

export interface StateTransition {
  from: ConversationStep[];
  to: ConversationStep;
  event: ConversationEvent;
  guard?: (context: any) => boolean;
  action?: (context: any) => Promise<void>;
}

export const CONVERSATION_TRANSITIONS: StateTransition[] = [
  {
    from: [ConversationStep.GREETING],
    to: ConversationStep.AWAITING_CATEGORY,
    event: ConversationEvent.START,
  },
  {
    from: [ConversationStep.AWAITING_CATEGORY],
    to: ConversationStep.AWAITING_PRODUCT,
    event: ConversationEvent.CATEGORY_SELECTED,
    guard: (context) => !!context.selectedCategory,
  },
  {
    from: [ConversationStep.AWAITING_PRODUCT],
    to: ConversationStep.AWAITING_QUANTITY,
    event: ConversationEvent.PRODUCT_SELECTED,
    guard: (context) => !!context.selectedProduct,
  },
  {
    from: [ConversationStep.AWAITING_QUANTITY],
    to: ConversationStep.CONFIRM_CART,
    event: ConversationEvent.QUANTITY_PROVIDED,
    guard: (context) => context.quantity > 0,
    action: async (context) => {
      context.cart.push({
        product: context.selectedProduct,
        quantity: context.quantity,
        price: context.selectedProduct.price * context.quantity,
      });
    },
  },
  {
    from: Object.values(ConversationStep),
    to: ConversationStep.SUPPORT,
    event: ConversationEvent.HELP_REQUESTED,
  },
  {
    from: Object.values(ConversationStep),
    to: ConversationStep.GREETING,
    event: ConversationEvent.RESET_REQUESTED,
    action: async (context) => {
      context.cart = [];
      context.userDetails = null;
      context.paymentMethord = null;
    },
  },
];
