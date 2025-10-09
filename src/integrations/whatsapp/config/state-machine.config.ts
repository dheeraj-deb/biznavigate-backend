import {
  ConversationEvent,
  ConversationStep,
} from "../interfaces/conversation-state-machine.enum";

export interface StateTransition {
  from: ConversationStep[];
  to: ConversationStep;
  event: ConversationEvent;
  guard?: (context: any) => boolean;
  action?: (context: any) => Promise<void>;
}

export const CONVERSATION_TRANSITIONS: StateTransition[] = [
  // ============================================
  // INITIAL GREETING FLOW
  // ============================================
  {
    from: [ConversationStep.GREETING],
    to: ConversationStep.REGISTRATION,
    event: ConversationEvent.START,
    guard: (context) => context.isNewUser === true,
  },
  {
    from: [ConversationStep.GREETING],
    to: ConversationStep.PLACE_ORDER_REQUEST,
    event: ConversationEvent.START,
    guard: (context) => context.isNewUser === false,
  },

  // ============================================
  // REGISTRATION FLOW
  // ============================================
  {
    from: [ConversationStep.REGISTRATION],
    to: ConversationStep.PLACE_ORDER_REQUEST,
    event: ConversationEvent.REGISTRATION_COMPLETED,
  },

  // ============================================
  // ORDER PLACEMENT FLOW
  // ============================================
  // Scenario 1: User provides valid products with matches -> Go to ORDER_REVIEW
  {
    from: [ConversationStep.PLACE_ORDER_REQUEST],
    to: ConversationStep.ORDER_REVIEW,
    event: ConversationEvent.ORDER_PLACED,
    guard: (context) => {
      const hasValidProducts = context.productList &&
                               context.productList.length > 0 &&
                               context.productList.some(p => p.productId);
      console.log(`[GUARD] ORDER_PLACED -> ORDER_REVIEW: hasValidProducts=${hasValidProducts}`);
      return hasValidProducts;
    },
  },
  // Scenario 2: User provides product input but no matches found -> Show search results
  {
    from: [ConversationStep.PLACE_ORDER_REQUEST],
    to: ConversationStep.PRODUCT_SEARCH_RESULTS,
    event: ConversationEvent.ORDER_PLACED,
    guard: (context) => {
      const hasOriginalInput = context.originalParsedProducts && context.originalParsedProducts.length > 0;
      const hasNoValidMatches = !context.productList || context.productList.length === 0 ||
                                !context.productList.some(p => p.productId);
      const result = hasOriginalInput && hasNoValidMatches;
      console.log(`[GUARD] ORDER_PLACED -> PRODUCT_SEARCH_RESULTS:`);
      console.log(`  - originalParsedProducts:`, context.originalParsedProducts);
      console.log(`  - productList:`, context.productList);
      console.log(`  - hasOriginalInput: ${hasOriginalInput}`);
      console.log(`  - hasNoValidMatches: ${hasNoValidMatches}`);
      console.log(`  - RESULT: ${result}`);
      return result;
    },
  },
  // Scenario 3: No valid product input detected -> Ask for product list
  {
    from: [ConversationStep.PLACE_ORDER_REQUEST],
    to: ConversationStep.AWAITING_PRODUCT_LIST,
    event: ConversationEvent.ORDER_PLACED,
    guard: (context) => {
      const noInput = (!context.originalParsedProducts || context.originalParsedProducts.length === 0) &&
                      (!context.productList || context.productList.length === 0);
      console.log(`[GUARD] ORDER_PLACED -> AWAITING_PRODUCT_LIST: noInput=${noInput}`);
      return noInput;
    },
  },

  // ============================================
  // AWAITING PRODUCT LIST FLOW
  // ============================================
  {
    from: [ConversationStep.AWAITING_PRODUCT_LIST],
    to: ConversationStep.ORDER_REVIEW,
    event: ConversationEvent.PRODUCT_LIST_PROVIDED,
    guard: (context) => {
      const hasValidProducts = context.productList &&
                               context.productList.length > 0 &&
                               context.productList.some(p => p.productId);
      console.log(`[GUARD] PRODUCT_LIST_PROVIDED -> ORDER_REVIEW: hasValidProducts=${hasValidProducts}`);
      return hasValidProducts;
    },
  },
  {
    from: [ConversationStep.AWAITING_PRODUCT_LIST],
    to: ConversationStep.PRODUCT_SEARCH_RESULTS,
    event: ConversationEvent.PRODUCT_LIST_PROVIDED,
    guard: (context) => {
      const hasOriginalInput = context.originalParsedProducts && context.originalParsedProducts.length > 0;
      const hasNoMatches = !context.productList || context.productList.length === 0 ||
                          !context.productList.some(p => p.productId);
      const result = hasOriginalInput && hasNoMatches;
      console.log(`[GUARD] PRODUCT_LIST_PROVIDED -> PRODUCT_SEARCH_RESULTS: result=${result}`);
      return result;
    },
  },

  // ============================================
  // PRODUCT SEARCH RESULTS FLOW
  // ============================================
  {
    from: [ConversationStep.PRODUCT_SEARCH_RESULTS],
    to: ConversationStep.ORDER_REVIEW,
    event: ConversationEvent.PRODUCT_SEARCH_PERFORMED,
    guard: (context) => {
      const hasValidProducts = context.productList &&
                               context.productList.length > 0 &&
                               context.productList.some(p => p.productId);
      console.log(`[GUARD] PRODUCT_SEARCH_PERFORMED -> ORDER_REVIEW: hasValidProducts=${hasValidProducts}`);
      return hasValidProducts;
    },
  },
  {
    from: [ConversationStep.PRODUCT_SEARCH_RESULTS],
    to: ConversationStep.PRODUCT_SEARCH_RESULTS,
    event: ConversationEvent.PRODUCT_SEARCH_PERFORMED,
    guard: (context) => {
      const hasOriginalInput = context.originalParsedProducts && context.originalParsedProducts.length > 0;
      const hasNoMatches = !context.productList || context.productList.length === 0 ||
                          !context.productList.some(p => p.productId);
      const result = hasOriginalInput && hasNoMatches;
      console.log(`[GUARD] PRODUCT_SEARCH_PERFORMED -> PRODUCT_SEARCH_RESULTS (stay): result=${result}`);
      return result;
    },
  },
  {
    from: [ConversationStep.PRODUCT_SEARCH_RESULTS],
    to: ConversationStep.AWAITING_PRODUCT_LIST,
    event: ConversationEvent.PRODUCT_SEARCH_PERFORMED,
    guard: (context) => {
      const noInput = (!context.originalParsedProducts || context.originalParsedProducts.length === 0) &&
                      (!context.productList || context.productList.length === 0);
      console.log(`[GUARD] PRODUCT_SEARCH_PERFORMED -> AWAITING_PRODUCT_LIST: noInput=${noInput}`);
      return noInput;
    },
  },

  // ============================================
  // ORDER REVIEW FLOW
  // ============================================
  {
    from: [ConversationStep.ORDER_REVIEW],
    to: ConversationStep.ORDER_CONFIRMATION,
    event: ConversationEvent.REVIEW_CONFIRMED,
  },
  {
    from: [ConversationStep.ORDER_REVIEW],
    to: ConversationStep.AWAITING_PRODUCT_LIST,
    event: ConversationEvent.REVIEW_EDIT,
  },
  {
    from: [ConversationStep.ORDER_REVIEW],
    to: ConversationStep.PLACE_ORDER_REQUEST,
    event: ConversationEvent.REVIEW_CANCEL,
  },

  // ============================================
  // ORDER CONFIRMATION FLOW
  // ============================================
  {
    from: [ConversationStep.ORDER_CONFIRMATION],
    to: ConversationStep.INVOICE_GENERATION,
    event: ConversationEvent.ORDER_CONFIRMED,
  },
  {
    from: [ConversationStep.ORDER_CONFIRMATION],
    to: ConversationStep.AWAITING_PRODUCT_LIST,
    event: ConversationEvent.ORDER_REJECTED,
  },

  // ============================================
  // INVOICE GENERATION & COMPLETION
  // ============================================
  {
    from: [ConversationStep.INVOICE_GENERATION],
    to: ConversationStep.PLACE_ORDER_REQUEST,
    event: ConversationEvent.ORDER_CONFIRMATION_COMPLETED,
  },
];
