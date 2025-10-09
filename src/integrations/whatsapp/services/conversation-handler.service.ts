import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConversationStateMachineService } from "./conversation-state-machine.service";
import { WhatsAppService } from "./whatsapp.service";
import { ZohoService } from "src/integrations/crm/zoho/zoho.service";
import {
  ConversationEvent,
  ConversationStep,
} from "../interfaces/conversation-state-machine.enum";
import { ConversationContext, ConversationSession } from "../interfaces/session.interface";
import { SessionService } from "./session.service";
import { PrismaService } from "src/prisma/prisma.service";
import { WhatsAppResponseWithTemplate } from "../interfaces/whatsapp-response-template.interface";
import { ZohoSyncService } from "src/integrations/crm/zoho/zoho-sync.service";
import { RedisSessionService } from "./redis-session.service";
import { getRedis } from "src/utils/redis";
import { ProductMatcherService, ParsedProduct } from "./product-matcher.service";
import { ProductCatalogService } from "./product-catalog.service";
import { IntentDetectionService, UserIntent } from "./intent-detection.service";
import { InventorySyncService } from "src/features/products/application/services/inventory-sync.service";

@Injectable()
export class ConversationHandlerService implements OnModuleInit {
  private readonly logger = new Logger(ConversationHandlerService.name);
  private readonly CACHE_TTL = 5 * 60; // 5 minutes in seconds for Redis
  private readonly USER_EXISTS_CACHE_PREFIX = 'user_exists:';
  private readonly RATE_LIMIT_PREFIX = 'rate_limit:';
  private readonly MAX_MESSAGES_PER_MINUTE = 20; // Rate limit per user
  private readonly SESSION_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

  constructor(
    private stateMachineService: ConversationStateMachineService,
    private sessionService: RedisSessionService,
    private zohoService: ZohoService,
    private prisma: PrismaService,
    private zohoSync: ZohoSyncService,
    private productMatcher: ProductMatcherService,
    private catalogService: ProductCatalogService,
    private intentDetection: IntentDetectionService,
    private inventorySync: InventorySyncService
  ) {}

  async handleMessage(
    distributorPhoneNumber: string,
    userPhoneNumber: string,
    body: string,
    payload?: any
  ): Promise<WhatsAppResponseWithTemplate | void> {
    try {
      this.logger.log(`Processing message from ${userPhoneNumber}: ${body.substring(0, 50)}...`);

      // Rate limiting check
      const isRateLimited = await this.checkRateLimit(userPhoneNumber);
      if (isRateLimited) {
        this.logger.warn(`Rate limit exceeded for user: ${userPhoneNumber}`);
        return {
          message: "You're sending messages too quickly. Please wait a moment before trying again."
        };
      }

      // Get or create session
      let session = await this.sessionService.getSession(userPhoneNumber);

      if (!session) {
        // Create new session for new conversation
        session = await this.createNewSession(userPhoneNumber, distributorPhoneNumber);
      }

      const currentStep = session.currentStep;
      let context = { ...session.context };

      // Ensure context is properly initialized
      if (!context.productList) context.productList = [];
      if (!context.userDetails) context.userDetails = {};
      if (!context.messageCount) context.messageCount = 0;
      if (!context.errorCount) context.errorCount = 0;

      // Increment message count
      context.messageCount++;
      context.lastMessageTimestamp = new Date();

      // Determine user status if not already set
      if (context.isNewUser === undefined) {
        context.isNewUser = await this.checkIfUserExists(userPhoneNumber);
        this.logger.log(`User ${userPhoneNumber} - isNewUser: ${context.isNewUser}`);
      }

      // Handle initial greeting flow or restart
      if (this.isInitialFlow(currentStep, body)) {
        return await this.handleInitialFlow(userPhoneNumber, context);
      }

      // TEMPORARY DEBUG: Force session reset if user sends "reset" or "restart"
      if (body.toLowerCase().includes('reset') || body.toLowerCase().includes('restart')) {
        this.logger.log(`[DEBUG] Manual session reset requested by ${userPhoneNumber}`);
        await this.sessionService.deleteSession(userPhoneNumber);
        return await this.handleInitialFlow(userPhoneNumber, context);
      }

      // Handle catalog commands (these don't change state)
      const catalogResponse = await this.handleCatalogCommands(body, context);
      if (catalogResponse) {
        // Update session with catalog context changes
        session.context = context;
        await this.sessionService.setSession(userPhoneNumber, session);
        return catalogResponse;
      }

      // Parse user input and get event
      const event = await this.parseUserInput(body, currentStep, context);
      this.logger.log(`\n========== MESSAGE PROCESSING ==========`);
      this.logger.log(`Step: ${currentStep}`);
      this.logger.log(`Input: "${body}"`);
      this.logger.log(`Event: ${event}`);
      this.logger.log(`========================================\n`);

      if (!event) {
        context.errorCount++;
        context.lastUserInput = body; // Store the last input for contextual responses
        this.logger.warn(`No valid event for input: "${body}" in step: ${currentStep}`);
        session.context = context;
        await this.sessionService.setSession(userPhoneNumber, session);
        return await this.generateStepResponse(currentStep, context);
      }

      // Update context based on event BEFORE checking transition guard
      await this.updateContextForEvent(event, context, body);

      this.logger.log(`\n========== CONTEXT STATE ==========`);
      this.logger.log(`ProductList: ${JSON.stringify(context.productList?.map(p => ({ name: p.name, qty: p.quantity, id: p.productId })) || [])}`);
      this.logger.log(`OriginalParsed: ${context.originalParsedProducts?.length || 0} items`);
      this.logger.log(`Unmatched: ${context.unmatchedProducts?.length || 0} items`);
      this.logger.log(`===================================\n`);

      // Check if transition is allowed
      const canTransition = await this.stateMachineService.canTransition(currentStep, event, context);
      if (!canTransition) {
        this.logger.warn(`❌ Transition not allowed: ${currentStep} -> ${event}`);
        session.context = context;
        await this.sessionService.setSession(userPhoneNumber, session);
        return await this.generateStepResponse(currentStep, context);
      }

      // Execute transition
      const newStep = await this.stateMachineService.executeTransition(currentStep, event, context);
      this.logger.log(`\n========== TRANSITION ==========`);
      this.logger.log(`${currentStep} --[${event}]--> ${newStep}`);
      this.logger.log(`================================\n`);

      if (!newStep) {
        this.logger.warn(`No transition found: ${currentStep} -> ${event}`);
        return await this.generateStepResponse(currentStep, context);
      }

      // Update session with new step and context
      session.currentStep = newStep;
      session.context = context;
      session.updatedAt = new Date();
      await this.sessionService.setSession(userPhoneNumber, session);

      // Generate response for new step
      return await this.generateStepResponse(newStep, context);

    } catch (error) {
      this.logger.error(`Error handling message from ${userPhoneNumber}:`, error);
      return this.generateErrorResponse();
    }
  }

  private isInitialFlow(currentStep: ConversationStep, body: string): boolean {
    const lowerBody = body.toLowerCase().trim();

    // Use word boundary matching to avoid false positives (e.g., "shirt" contains "hi")
    const greetingWords = ['hi', 'hello', 'start', 'hey'];
    const words = lowerBody.split(/\s+/);
    const isGreeting = greetingWords.some(greeting => words.includes(greeting));

    // Allow restart from any step with greeting words, or if no current step
    // Note: Removed '1' from greeting detection as it's used for legitimate responses
    return !currentStep || currentStep === ConversationStep.GREETING || isGreeting;
  }

  private async handleInitialFlow(
    userPhoneNumber: string,
    context: ConversationContext
  ): Promise<WhatsAppResponseWithTemplate> {

    // Determine next step based on user status
    const nextStep = context.isNewUser ? ConversationStep.REGISTRATION : ConversationStep.PLACE_ORDER_REQUEST;

    // Execute transition from GREETING
    const transitionStep = await this.stateMachineService.executeTransition(
      ConversationStep.GREETING,
      ConversationEvent.START,
      context
    );

    const finalStep = transitionStep || nextStep;

    // Update session
    const session = await this.sessionService.getSession(userPhoneNumber);
    if (session) {
      session.currentStep = finalStep;
      session.context = context;
      session.updatedAt = new Date();
      await this.sessionService.setSession(userPhoneNumber, session);
    }

    this.logger.log(`Initial flow - User: ${userPhoneNumber}, isNewUser: ${context.isNewUser}, nextStep: ${finalStep}`);

    return await this.generateStepResponse(finalStep, context);
  }

  private async parseUserInput(
    input: string,
    currentStep: ConversationStep,
    context: ConversationContext
  ): Promise<ConversationEvent | null> {
    const lowerInput = input.toLowerCase().trim();

    switch (currentStep) {
      case ConversationStep.GREETING:
        if (lowerInput.includes("hi") || lowerInput.includes("hello") || lowerInput === "1") {
          return ConversationEvent.START;
        }
        break;

      case ConversationStep.REGISTRATION:
        if (lowerInput === "1" || lowerInput.includes("register") || lowerInput.includes("done")) {
          return ConversationEvent.REGISTRATION_COMPLETED;
        }
        break;

      case ConversationStep.PLACE_ORDER_REQUEST:
        // Use AI to detect intent
        const intentResult = await this.intentDetection.detectIntent(input, {
          currentStep: currentStep,
          previousMessages: []
        });

        this.logger.log(`[AI INTENT] Detected: ${intentResult.intent} (confidence: ${intentResult.confidence})`);
        if (intentResult.reasoning) {
          this.logger.log(`[AI INTENT] Reasoning: ${intentResult.reasoning}`);
        }
        if (intentResult.extractedEntities.products?.length > 0) {
          this.logger.log(`[AI INTENT] Extracted products:`, intentResult.extractedEntities.products);
        }

        // Store intent in context for later use
        context.lastDetectedIntent = intentResult;

        // Handle based on detected intent
        if (intentResult.intent === UserIntent.PLACE_ORDER && intentResult.confidence > 0.7) {
          this.logger.log(`[DEBUG] AI detected ORDER intent with high confidence - treating as ORDER_PLACED`);
          return ConversationEvent.ORDER_PLACED;
        } else if (intentResult.intent === UserIntent.SEARCH_PRODUCT && intentResult.confidence > 0.7) {
          this.logger.log(`[DEBUG] AI detected SEARCH intent with high confidence - staying in PLACE_ORDER_REQUEST`);
          // Don't transition - stay in PLACE_ORDER_REQUEST
          return null;
        } else if (intentResult.intent === UserIntent.BROWSE_CATALOG) {
          // This will be handled by handleCatalogCommands
          return null;
        }

        // Fallback to rule-based detection for better reliability
        this.logger.log(`[DEBUG] Using rule-based detection as fallback`);

        // Check for explicit order keywords
        if (lowerInput === "1" || lowerInput.includes("order") || lowerInput.includes("place")) {
          return ConversationEvent.ORDER_PLACED;
        }

        // Check for product x quantity format (e.g., "shirt x 1", "cement x 100")
        const isProductFormatOrder = this.isProductListFormat(input);
        if (isProductFormatOrder) {
          this.logger.log(`[DEBUG] Detected product list format - treating as ORDER_PLACED`);
          return ConversationEvent.ORDER_PLACED;
        }

        // Check if input has quantity (numbers) and looks like product input
        const hasQuantity = /\d+/.test(input);
        if (hasQuantity && this.isLikelyProductInput(input)) {
          this.logger.log(`[DEBUG] Detected product with quantity - treating as ORDER_PLACED`);
          return ConversationEvent.ORDER_PLACED;
        }

        // If it's just a product name without quantity, user might be searching
        this.logger.log(`[DEBUG] No quantity detected - staying in PLACE_ORDER_REQUEST`);
        return null;

      case ConversationStep.AWAITING_PRODUCT_LIST:
        // Check if input contains product list format or product names
        const isProductFormat = this.isProductListFormat(input);
        const isLikelyProduct = this.isLikelyProductInput(input);
        this.logger.log(`[DEBUG] Product parsing - isProductFormat: ${isProductFormat}, isLikelyProduct: ${isLikelyProduct}`);

        if (isProductFormat || isLikelyProduct) {
          return ConversationEvent.PRODUCT_LIST_PROVIDED;
        }
        break;

      case ConversationStep.PRODUCT_SEARCH_RESULTS:
        // From search results, user can try new search, browse catalog, or provide product list
        if (lowerInput === "catalog" || lowerInput === "browse") {
          return ConversationEvent.PRODUCT_SEARCH_PERFORMED;
        }
        if (lowerInput.startsWith("search ")) {
          return ConversationEvent.PRODUCT_SEARCH_PERFORMED;
        }
        // If user provides product list format, treat as new product input
        const isNewProductFormat = this.isProductListFormat(input);
        const isNewLikelyProduct = this.isLikelyProductInput(input);
        if (isNewProductFormat || isNewLikelyProduct) {
          return ConversationEvent.PRODUCT_SEARCH_PERFORMED;
        }
        break;

      case ConversationStep.ORDER_REVIEW:
        this.logger.log(`[DEBUG] ORDER_REVIEW step - input: "${lowerInput}"`);
        if (lowerInput === "1" || lowerInput.includes("place") || lowerInput.includes("confirm")) {
          this.logger.log(`[DEBUG] Returning REVIEW_CONFIRMED event`);
          return ConversationEvent.REVIEW_CONFIRMED;
        } else if (lowerInput === "2" || lowerInput.includes("edit") || lowerInput.includes("modify")) {
          this.logger.log(`[DEBUG] Returning REVIEW_EDIT event`);
          return ConversationEvent.REVIEW_EDIT;
        } else if (lowerInput === "3" || lowerInput.includes("cancel")) {
          this.logger.log(`[DEBUG] Returning REVIEW_CANCEL event`);
          return ConversationEvent.REVIEW_CANCEL;
        }
        this.logger.log(`[DEBUG] No matching event found for ORDER_REVIEW step`);
        break;

      case ConversationStep.ORDER_CONFIRMATION:
        this.logger.log(`[DEBUG] ORDER_CONFIRMATION step - input: "${lowerInput}"`);
        if (lowerInput === "1" || lowerInput.includes("yes") || lowerInput.includes("confirm")) {
          this.logger.log(`[DEBUG] Returning ORDER_CONFIRMED event`);
          return ConversationEvent.ORDER_CONFIRMED;
        } else if (lowerInput === "2" || lowerInput.includes("no") || lowerInput.includes("cancel")) {
          this.logger.log(`[DEBUG] Returning ORDER_REJECTED event`);
          return ConversationEvent.ORDER_REJECTED;
        }
        this.logger.log(`[DEBUG] No matching event found for ORDER_CONFIRMATION step`);
        break;

      case ConversationStep.INVOICE_GENERATION:
        if (lowerInput === "1" || lowerInput.includes("ok") || lowerInput.includes("thanks")) {
          return ConversationEvent.ORDER_CONFIRMATION_COMPLETED;
        }
        break;
    }

    return null;
  }

  private isProductListFormat(input: string): boolean {
    const lines = input.split('\n').filter(line => line.trim());

    // Check if at least one line matches "Product x Quantity" format
    return lines.some(line => {
      const match = line.trim().match(/^(.+?)\s*x\s*(\d+)$/i);
      return match && match[1].trim() && parseInt(match[2]) > 0;
    });
  }

  private isLikelyProductInput(input: string): boolean {
    // Check if input looks like a product format:
    // 1. Contains "x" pattern (product x quantity)
    // 2. Contains numbers (likely quantities)
    // 3. Contains common quantity words
    // 4. In product selection states, treat any non-command input as potential product

    const lowerInput = input.toLowerCase().trim();

    // Skip obvious non-product commands
    const nonProductCommands = ['catalog', 'categories', 'quick', 'featured', 'next', 'prev', 'help', 'hi', 'hello', 'yes', 'no', '1', '2'];
    if (nonProductCommands.includes(lowerInput)) {
      return false;
    }

    // Check for obvious product patterns
    if (/\bx\s*\d+/.test(lowerInput) || // "x 100" pattern
        /\d+\s*x\b/.test(lowerInput) || // "100 x" pattern
        /\d+\s+(bags?|boxes?|packets?|pieces?|units?)/.test(lowerInput) || // "100 bags"
        /\d+/.test(input)) { // Contains numbers
      return true;
    }

    // If input has reasonable length and isn't a command, likely a product name
    return input.trim().length > 2 && input.trim().length < 100;
  }

  private async updateContextForEvent(
    event: ConversationEvent,
    context: ConversationContext,
    body: string
  ): Promise<void> {
    this.logger.log(`[UPDATE CONTEXT] Event: ${event}, Body: "${body.substring(0, 50)}..."`);

    switch (event) {
      case ConversationEvent.ORDER_PLACED:
        // Clear previous context
        context.productList = [];
        context.originalParsedProducts = [];
        context.unmatchedProducts = [];
        context.orderTotal = 0;

        // Check if this ORDER_PLACED event contains product list data
        const isProductFormatFromOrder = this.isProductListFormat(body);
        const isLikelyProductFromOrder = this.isLikelyProductInput(body);

        if (isProductFormatFromOrder || isLikelyProductFromOrder) {
          this.logger.log(`[UPDATE CONTEXT] Processing product list from ORDER_PLACED`);
          await this.processProductList(context, body);
        } else {
          this.logger.log(`[UPDATE CONTEXT] No product list in ORDER_PLACED - user will be asked to provide one`);
        }
        break;

      case ConversationEvent.PRODUCT_LIST_PROVIDED:
        // Clear previous context
        context.productList = [];
        context.originalParsedProducts = [];
        context.unmatchedProducts = [];
        context.orderTotal = 0;

        this.logger.log(`[UPDATE CONTEXT] Processing PRODUCT_LIST_PROVIDED`);
        await this.processProductList(context, body);
        break;

      case ConversationEvent.REGISTRATION_COMPLETED:
        context.userDetails = { registered: true, timestamp: new Date() };
        this.logger.log(`[UPDATE CONTEXT] User registered`);
        break;

      case ConversationEvent.PRODUCT_SEARCH_PERFORMED:
        // Clear previous context for new search
        context.productList = [];
        context.originalParsedProducts = [];
        context.unmatchedProducts = [];
        context.orderTotal = 0;

        // If user provided new product input, process it
        const isNewProductFormatEvent = this.isProductListFormat(body);
        const isNewLikelyProductEvent = this.isLikelyProductInput(body);

        if (isNewProductFormatEvent || isNewLikelyProductEvent) {
          this.logger.log(`[UPDATE CONTEXT] Processing new product search`);
          await this.processProductList(context, body);
        } else {
          this.logger.log(`[UPDATE CONTEXT] No product input for search - user sent command or invalid input`);
        }
        break;

      case ConversationEvent.ORDER_CONFIRMED:
        this.logger.log(`[UPDATE CONTEXT] Order confirmed - creating sales order in Zoho`);
        // Create sales order in Zoho
        await this.createZohoSalesOrder(context);
        break;

      case ConversationEvent.ORDER_REJECTED:
        // Clear product list so user can start over
        context.productList = [];
        context.originalParsedProducts = [];
        context.unmatchedProducts = [];
        context.orderTotal = 0;
        this.logger.log(`[UPDATE CONTEXT] Order rejected - context cleared`);
        break;
    }
  }

  private async processProductList(context: ConversationContext, body: string): Promise<void> {
    // Use external product matcher service with error handling
    try {
      const organizationId = await this.getOrganizationId(context.distributorPhoneNumber);
      this.logger.log(`[PRODUCT_MATCH] Organization ID: ${organizationId}`);
      this.logger.log(`[PRODUCT_MATCH] Input text: "${body}"`);

      const parsedProducts = await this.productMatcher.parseAndMatchProducts(body, organizationId);
      this.logger.log(`[PRODUCT_MATCH] Parsed products count: ${parsedProducts.length}`);
      this.logger.log(`[PRODUCT_MATCH] Full parsed products:`, JSON.stringify(parsedProducts, null, 2));

      // Convert to simple product list with matched products - ONLY include products with valid matches AND availability
      context.productList = parsedProducts
        .filter(p => p.bestMatch && p.bestMatch.id && p.bestMatch.available) // Only include products with actual matches AND available stock
        .map(p => ({
          name: p.bestMatch.name,
          quantity: p.quantity,
          price: p.bestMatch.sellingPrice,
          productId: p.bestMatch.id,
          available: p.bestMatch.available,
          confidence: p.bestMatch.confidence
        }));

      // Store all original parsed products (including unmatched) for search results
      context.originalParsedProducts = parsedProducts;

      context.orderTotal = await this.calculateOrderTotal(context.productList);
      this.logger.log(`[PRODUCT_MATCH] ✅ Matched products: ${context.productList.length} items`);
      this.logger.log(`[PRODUCT_MATCH] Order total: ₹${context.orderTotal}`);
      this.logger.log(`[PRODUCT_MATCH] Final productList:`, JSON.stringify(context.productList.map(p => ({
        name: p.name,
        qty: p.quantity,
        id: p.productId,
        available: p.available,
        confidence: p.confidence
      })), null, 2));

      // Store unmatched items for later handling (includes products found but unavailable)
      const unmatchedProducts = parsedProducts.filter(p => {
        // Include if no match found OR low confidence OR found but unavailable
        return !p.bestMatch ||
               p.bestMatch.confidence < 0.7 ||
               (p.bestMatch && p.bestMatch.id && !p.bestMatch.available);
      });

      if (unmatchedProducts.length > 0) {
        context.unmatchedProducts = unmatchedProducts;
        this.logger.log(`[DEBUG] ${unmatchedProducts.length} products could not be matched or are unavailable:`, unmatchedProducts.map(p => `${p.name} (${p.bestMatch ? 'found but unavailable' : 'not found'})`));
      } else {
        context.unmatchedProducts = [];
      }
    } catch (error) {
      this.logger.error('[DEBUG] Product matching service failed, using fallback parsing:', error);
      // Fallback to simple parsing without external service
      const fallbackProducts = this.parseProductList(body);
      context.productList = fallbackProducts;
      this.logger.log(`[DEBUG] Fallback parsing result:`, context.productList);

      // IMPORTANT: Set originalParsedProducts for fallback too so guards work correctly
      context.originalParsedProducts = fallbackProducts.map(p => ({
        name: p.name,
        quantity: p.quantity,
        bestMatch: null // No match in fallback mode
      }));

      context.unmatchedProducts = fallbackProducts.map(p => ({
        name: p.name,
        quantity: p.quantity,
        bestMatch: null
      }));

      context.orderTotal = 0; // Will be calculated later or manually
      context.productMatchingError = true;
    }
  }

  private parseProductList(input: string): { name: string; quantity: number; price?: number }[] {
    const lines = input.split('\n').filter(line => line.trim());
    const productList: { name: string; quantity: number; price?: number }[] = [];

    for (const line of lines) {
      // Try "Product x Quantity" format first
      let match = line.trim().match(/^(.+?)\s*x\s*(\d+)$/i);
      if (match) {
        const productName = match[1].trim();
        const quantity = parseInt(match[2], 10);
        if (productName && quantity > 0) {
          productList.push({ name: productName, quantity });
        }
        continue;
      }

      // Try "Quantity Product" format
      match = line.trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        const quantity = parseInt(match[1], 10);
        const productName = match[2].trim();
        if (productName && quantity > 0) {
          productList.push({ name: productName, quantity });
        }
        continue;
      }

      // Try to extract product name and default quantity for any non-empty line
      // If the line doesn't match standard patterns but has content, treat it as product
      const cleanLine = line.trim();
      if (cleanLine.length > 0) {
        const quantityMatch = line.match(/(\d+)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
        // Remove numbers from the name to get clean product name
        const cleanName = line.replace(/\d+/g, '').trim();
        if (cleanName.length > 0) {
          productList.push({ name: cleanName, quantity });
        }
      }
    }

    // If no structured format found but looks like product input, treat whole input as single product
    if (productList.length === 0 && this.isLikelyProductInput(input)) {
      const quantityMatch = input.match(/(\d+)/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
      // Clean the product name by removing numbers
      const cleanName = input.replace(/\d+/g, '').trim();
      if (cleanName.length > 0) {
        productList.push({ name: cleanName, quantity });
      }
    }

    return productList;
  }

  private async calculateOrderTotal(productList: { name: string; quantity: number; price?: number; productId?: string }[]): Promise<number> {
    let total = 0;

    for (const item of productList) {
      if (item.price) {
        total += item.price * item.quantity;
      } else {
        // Price should already be set by product matcher service
        this.logger.warn(`No price found for item: ${item.name}`);
      }
    }

    return total;
  }

  private async generateStepResponse(
    step: ConversationStep,
    context: ConversationContext
  ): Promise<WhatsAppResponseWithTemplate> {
    switch (step) {
      case ConversationStep.GREETING:
        return {
          message: "Welcome! How can I assist you today?",
        };

      case ConversationStep.REGISTRATION:
        return await this.generateRegistrationResponse(context);

      case ConversationStep.PLACE_ORDER_REQUEST:
        // Check if AI detected search intent
        if (context.lastDetectedIntent?.intent === UserIntent.SEARCH_PRODUCT) {
          const productName = context.lastDetectedIntent.extractedEntities.productName || context.lastUserInput;
          return {
            message: `I see you're looking for "${productName}".\n\n🔍 *To search:* Type 'search ${productName}'\n🛒 *To order:* Send with quantity like "${productName} x 100"\n\n📋 Type 'catalog' to browse all products\n\nWhat would you like to do?`,
          };
        }

        // Check if this is a retry after user sent product name without quantity
        if (context.lastUserInput && !context.lastUserInput.match(/\d+/)) {
          return {
            message: `I see you're looking for "${context.lastUserInput}".\n\n🔍 *To search:* Type 'search ${context.lastUserInput}'\n🛒 *To order:* Send with quantity like "${context.lastUserInput} x 100"\n\n📋 Type 'catalog' to browse all products\n\nWhat would you like to do?`,
          };
        }
        return {
          message: "🛒 Ready to take your order!\n\nPlease send me your product list. You can format it like:\n• Cement x 100\n• Steel rod x 50\n\nOr simply write: \"100 bags cement, 50 steel rods\"\n\n📋 Type 'catalog' to browse our products\n🔍 Type 'search [product]' to find specific items\n\nWhat would you like to order?",
        };

      case ConversationStep.AWAITING_PRODUCT_LIST:
        if (context.errorCount > 0) {
          return {
            message: "I didn't quite understand that format. Please try again:\n\n📝 Examples:\n• Cement x 100\n• 50 bags of cement\n• Cement bags 100\n\nWhat products do you need?",
          };
        }
        return {
          message: "Please send me your product list in any of these formats:\n\n📝 Examples:\n• Cement x 100\n• 50 bags cement\n• Steel rod x 25\n\nJust tell me what you need!",
        };

      case ConversationStep.PRODUCT_SEARCH_RESULTS:
        return this.generateSearchResultsResponse(context);

      case ConversationStep.ORDER_REVIEW:
        return this.generateOrderReviewResponse(context);

      case ConversationStep.ORDER_CONFIRMATION:
        return this.generateOrderConfirmationResponse(context);

      case ConversationStep.INVOICE_GENERATION:
        return this.generateInvoiceResponse(context);

      default:
        return {
          message: "I'm not sure how to help with that. Please try again.",
        };
    }
  }

  private async generateRegistrationResponse(context: ConversationContext): Promise<WhatsAppResponseWithTemplate> {
    try {
      const registrationTemplate = await this.prisma.whatsapp_templates.findFirst({
        where: { key: "client_registration" },
      });

      const distributorCredential = await this.prisma.zoho_user_credential.findFirst({
        where: {
          whatsapp_number: context.distributorPhoneNumber,
        },
      });

      if (registrationTemplate && distributorCredential) {
        const variable = JSON.stringify(registrationTemplate.variables).replace(
          "{{code}}",
          distributorCredential.client_id.toString()
        );

        return {
          contentVariables: variable,
          contentSid: registrationTemplate.sid,
          message: "Please provide your details to register.",
        };
      }
    } catch (error) {
      this.logger.error("Error generating registration response:", error);
    }

    return {
      message: "Please register to continue. Contact support for assistance.",
    };
  }

  private generateSearchResultsResponse(context: ConversationContext): WhatsAppResponseWithTemplate {
    // Get all attempted product names from originalParsedProducts
    const attemptedProducts = context.originalParsedProducts || [];
    const unmatchedProducts = context.unmatchedProducts || [];

    let message = `🔍 *Product Search Results*\n\n`;

    // Show what products were searched for
    if (attemptedProducts.length > 0) {
      message += "📦 *You searched for:*\n";
      attemptedProducts.forEach(product => {
        const status = product.bestMatch
          ? (product.bestMatch.available
              ? `✅ Found: ${product.bestMatch.name}`
              : `⚠️ Found but out of stock: ${product.bestMatch.name}`)
          : `❌ Not found`;
        message += `• ${product.name} x ${product.quantity} - ${status}\n`;
      });
      message += "\n";
    }

    // Show unmatched or unavailable items
    if (unmatchedProducts.length > 0) {
      message += "❗ *Could not process these items:*\n";
      unmatchedProducts.forEach(product => {
        const reason = product.bestMatch
          ? (product.bestMatch.available ? "Low confidence match" : "Out of stock")
          : "Product not found";
        message += `• ${product.name} x ${product.quantity} - ${reason}\n`;
      });
      message += "\n";
    }

    message += "💡 *What you can do next:*\n\n";
    message += "🔍 *Search Options:*\n";
    message += "• Type 'catalog' - Browse all available products\n";
    message += "• Type 'search [product]' - Search specific items\n";
    message += "• Type 'categories' - Browse by category\n\n";

    message += "🛒 *Try Again:*\n";
    message += "• Send a corrected product list\n";
    message += "• Use exact product names from catalog\n";
    message += "• Format: 'Product Name x Quantity'\n\n";

    message += "📞 *Need Help?*\n";
    message += "Type 'help' for assistance or contact support";

    return { message };
  }

  private async generateOrderReviewResponse(context: ConversationContext): Promise<WhatsAppResponseWithTemplate> {
    let message = `🛒 *Review Your Order*\n\n`;
    message += `📦 *Products Selected:*\n`;

    // Get organization ID from distributor phone for stock lookup
    const organizationId = await this.getOrganizationId(context.distributorPhoneNumber);

    // Show each product with price and available stock
    for (const item of context.productList || []) {
      const itemPrice = item.price || 0;
      const itemTotal = itemPrice * item.quantity;
      message += `• ${item.name}\n`;
      message += `  Quantity: ${item.quantity}\n`;
      message += `  Unit Price: ₹${itemPrice}\n`;
      message += `  Subtotal: ₹${itemTotal}\n`;

      // Get stock information if available
      if (item.productId && organizationId) {
        try {
          const stock = await this.inventorySync.getStock(
            item.productId,
            organizationId,
            'MAIN'
          );
          message += `  Available Stock: ${stock} units\n`;
        } catch (error) {
          this.logger.warn(`Failed to get stock for ${item.name}:`, error);
        }
      }
      message += `\n`;
    }

    // Calculate and show total
    const total = context.orderTotal || await this.calculateOrderTotal(context.productList);
    message += `💰 *Total Amount: ₹${total}*\n\n`;

    // Add warning if any products are low in stock
    const hasLowStock = false; // You can implement stock checking logic here
    if (hasLowStock) {
      message += `⚠️ *Note:* Some products have limited stock\n\n`;
    }

    // Action buttons
    message += `Choose an action:\n`;
    message += `1️⃣ *Place Order* - Confirm and proceed\n`;
    message += `2️⃣ *Edit Order* - Modify quantities or products\n`;
    message += `3️⃣ *Cancel* - Go back to start\n\n`;
    message += `Reply with 1, 2, or 3`;

    return { message };
  }

  private generateOrderConfirmationResponse(context: ConversationContext): WhatsAppResponseWithTemplate {
    const orderSummary = this.generateOrderSummary(context.productList);

    let message = `📋 *Order Summary*\n\n${orderSummary}\n\n`;

    if (context.productMatchingError) {
      message += `⚠️ *Note:* Some products may need price verification\n\n`;
    }

    if (context.unmatchedProducts && context.unmatchedProducts.length > 0) {
      message += `❓ *Unmatched items:*\n`;
      context.unmatchedProducts.forEach(product => {
        message += `• ${product.name} (${product.quantity})\n`;
      });
      message += `\nThese items will be reviewed manually.\n\n`;
    }

    message += `💰 Total: ₹${context.orderTotal || 'Calculating...'}\n\n✅ Please confirm:\n1️⃣ Yes, place this order\n2️⃣ No, let me modify\n\nReply with 1 or 2`;

    return { message };
  }

  private generateInvoiceResponse(context: ConversationContext): WhatsAppResponseWithTemplate {
    const orderSummary = this.generateOrderSummary(context.productList);

    let message = `🎉 *Order Confirmed!*\n\n📋 Order Details:\n${orderSummary}\n\n💰 Total Amount: ₹${context.orderTotal || 0}\n\n`;

    // Add Zoho sales order details if available
    if (context.zohoSalesOrderId) {
      message += `✅ Sales Order Created!\n`;
      message += `📝 Order Number: ${context.zohoSalesOrderNumber || 'N/A'}\n`;
      message += `🔖 Order ID: ${context.zohoSalesOrderId}\n\n`;
    } else if (context.zohoSalesOrderError) {
      message += `⚠️ Note: ${context.zohoSalesOrderError}\n`;
      message += `Your order has been recorded and will be processed manually.\n\n`;
    }

    message += `📧 Invoice will be sent shortly\n`;
    message += `🚚 You'll be notified about delivery\n\n`;
    message += `Type 'hi' to place another order!\n\n`;
    message += `Thank you for your business! 😊`;

    return { message };
  }

  private generateOrderSummary(productList: { name: string; quantity: number; price?: number }[]): string {
    return productList.map(item => 
      `${item.name} x ${item.quantity}${item.price ? ` - $${item.price * item.quantity}` : ''}`
    ).join('\n');
  }

  private generateErrorResponse(): WhatsAppResponseWithTemplate {
    return {
      message: "Sorry, something went wrong. Please try again later.",
    };
  }

  // Optimized user existence check with Redis caching
  private async checkIfUserExists(phoneNumber: string): Promise<boolean> {
    try {
      const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '');
      const cacheKey = `${this.USER_EXISTS_CACHE_PREFIX}${cleanPhoneNumber}`;
      
      // Check Redis cache first
      try {
        const redis = getRedis();
        const cached = await redis.get(cacheKey);
        if (cached !== null) {
          const exists = cached === 'true';
          this.logger.debug(`User check (cached): ${cleanPhoneNumber} - exists: ${exists}`);
          return exists;
        }
      } catch (redisError) {
        this.logger.warn("Redis cache read failed, falling back to database:", redisError);
      }
      
      // Database check with multiple format attempts
      let userCount = 0;
      
      // Try exact match first
      userCount = await this.prisma.shops.count({
        where: { mobile_num: cleanPhoneNumber }
      });
      
      // If no exact match, try with + prefix
      if (userCount === 0) {
        userCount = await this.prisma.shops.count({
          where: { mobile_num: `+${cleanPhoneNumber}` }
        });
      }
      
      // If still no match, try contains
      if (userCount === 0) {
        userCount = await this.prisma.shops.count({
          where: { 
            mobile_num: { contains: cleanPhoneNumber }
          }
        });
      }
      
      const exists = userCount > 0;
      
      // Cache the result in Redis
      try {
        const redis = getRedis();
        await redis.setex(cacheKey, this.CACHE_TTL, exists.toString());
      } catch (redisError) {
        this.logger.warn("Redis cache write failed:", redisError);
      }
      
      this.logger.debug(`User check (DB): ${cleanPhoneNumber} - count: ${userCount}, exists: ${exists}`);
      return exists;
    } catch (error) {
      this.logger.error("Error checking if user exists:", error);
      return false; // Default to new user if there's an error
    }
  }

  // Method to invalidate user cache when a new user is registered
  async invalidateUserCache(phoneNumber: string): Promise<void> {
    try {
      const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '');
      const cacheKey = `${this.USER_EXISTS_CACHE_PREFIX}${cleanPhoneNumber}`;

      const redis = getRedis();
      await redis.del(cacheKey);
      this.logger.log(`Invalidated user cache for: ${cleanPhoneNumber}`);
    } catch (error) {
      this.logger.warn("Failed to invalidate user cache:", error);
    }
  }

  private async createNewSession(userPhoneNumber: string, distributorPhoneNumber: string) {
    const sessionId = `session_${userPhoneNumber}_${Date.now()}`;
    const cleanDistributorNumber = distributorPhoneNumber.replace('whatsapp:', '');
    const cleanUserNumber = userPhoneNumber.replace('whatsapp:', '');

    const session = {
      sessionId,
      userId: cleanUserNumber,
      phoneNumber: userPhoneNumber,
      currentStep: ConversationStep.GREETING,
      context: {
        distributorPhoneNumber: cleanDistributorNumber,
        phoneNumber: userPhoneNumber,
        productList: [],
        userDetails: {},
        lastMessageTimestamp: new Date(),
        messageCount: 0,
        errorCount: 0,
        isNewUser: undefined, // Will be determined later
      },
      metadata: {
        platform: "whatsapp" as const,
        language: "en",
        timezone: "UTC"
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    await this.sessionService.setSession(userPhoneNumber, session);
    this.logger.log(`Created new session for user: ${userPhoneNumber}`);

    return session;
  }

  /**
   * Handle catalog-related commands
   */
  private async handleCatalogCommands(
    body: string,
    context: ConversationContext
  ): Promise<WhatsAppResponseWithTemplate | null> {
    const lowerBody = body.toLowerCase().trim();

    // Get organization ID by matching WhatsApp number with zoho_user_credential
    let organizationId: string;

    try {
      const distributorPhone = context.distributorPhoneNumber;
      this.logger.log(`[DEBUG] Looking up organizationId for WhatsApp number: ${distributorPhone}`);

      const credential = await this.prisma.zoho_user_credential.findFirst({
        where: {
          whatsapp_number: distributorPhone
        },
        select: {
          organization_id: true,
          whatsapp_number: true
        }
      });

      if (credential && credential.organization_id) {
        organizationId = credential.organization_id;
        this.logger.log(`[DEBUG] Found organizationId from zoho_user_credential: ${organizationId}`);
      } else {
        this.logger.warn(`[DEBUG] No zoho_user_credential found for WhatsApp number: ${distributorPhone}`);
        organizationId = 'default-org';
      }
    } catch (error) {
      this.logger.error(`Error fetching organizationId from zoho_user_credential:`, error);
      organizationId = 'default-org';
    }

    this.logger.log(`[DEBUG] Using organizationId for catalog: ${organizationId}`);

    try {
      // Quick catalog command
      if (lowerBody === 'catalog' || lowerBody === 'products' || lowerBody === 'menu') {
        this.logger.log(`Generating catalog for user`);

        const result = await this.catalogService.generateCatalogMessage({
          organizationId,
          includeStockInfo: true,
          includePrice: true,
          maxProducts: 10
        });

        // Store pagination context for next/prev commands
        context.catalogPage = result.currentPage;
        context.catalogTotalPages = result.totalPages;

        return { message: result.message };
      }

      // Quick catalog (top products)
      if (lowerBody === 'quick' || lowerBody === 'top products' || lowerBody === 'quick catalog') {
        this.logger.log(`Generating quick catalog for user`);

        const message = await this.catalogService.generateQuickCatalog(organizationId);
        return { message };
      }

      // Categories command
      if (lowerBody === 'categories' || lowerBody === 'category' || lowerBody === 'browse') {
        this.logger.log(`Generating categories for user`);

        const message = await this.catalogService.generateCategoriesMessage(organizationId);
        return { message };
      }

      // Search command
      if (lowerBody.startsWith('search ')) {
        const searchQuery = lowerBody.replace('search ', '').trim();
        if (searchQuery.length > 0) {
          this.logger.log(`Searching products: "${searchQuery}"`);

          const result = await this.catalogService.searchCatalog(organizationId, searchQuery, {
            maxProducts: 15
          });

          return { message: result.message };
        }
      }

      // Pagination commands
      if (lowerBody === 'next' || lowerBody === 'next page') {
        const currentPage = context.catalogPage || 1;
        const totalPages = context.catalogTotalPages || 1;

        if (currentPage < totalPages) {
          const result = await this.catalogService.generateCatalogMessage({
            organizationId,
            page: currentPage + 1,
            includeStockInfo: true,
            includePrice: true,
            maxProducts: 10
          });

          context.catalogPage = result.currentPage;
          return { message: result.message };
        } else {
          return { message: "📄 You're already on the last page.\n\nType 'catalog' to go back to page 1." };
        }
      }

      if (lowerBody === 'prev' || lowerBody === 'previous' || lowerBody === 'back') {
        const currentPage = context.catalogPage || 1;

        if (currentPage > 1) {
          const result = await this.catalogService.generateCatalogMessage({
            organizationId,
            page: currentPage - 1,
            includeStockInfo: true,
            includePrice: true,
            maxProducts: 10
          });

          context.catalogPage = result.currentPage;
          return { message: result.message };
        } else {
          return { message: "📄 You're already on the first page.\n\nType 'next' to go to the next page." };
        }
      }

      // Featured/bestseller command
      if (lowerBody === 'featured' || lowerBody === 'bestseller' || lowerBody === 'popular') {
        this.logger.log(`Generating featured products for user`);

        const result = await this.catalogService.getFeaturedCatalog(organizationId, {
          maxProducts: 12
        });

        return { message: result.message };
      }

      // Help command for catalog
      if (lowerBody === 'help catalog' || lowerBody === 'catalog help') {
        return {
          message: `📋 *Catalog Commands Help*\n\n🛒 *Browse Products:*\n• Type 'catalog' - View all products\n• Type 'quick' - Top 5 products\n• Type 'categories' - Browse by category\n• Type 'featured' - Popular products\n\n🔍 *Search:*\n• Type 'search [keyword]' - Find products\n• Example: 'search cement'\n\n📄 *Navigation:*\n• Type 'next' - Next page\n• Type 'prev' - Previous page\n\n🛍️ *Place Order:*\n• Type product name + quantity\n• Example: 'Cement x 100'\n• Or: '100 bags cement'`
        };
      }

      return null; // No catalog command matched

    } catch (error) {
      this.logger.error('Error handling catalog command:', error);
      return {
        message: "❌ Sorry, I couldn't load the catalog right now. Please try again later."
      };
    }
  }

  // Helper method to get organization ID from distributor phone number
  private async getOrganizationId(distributorPhoneNumber: string): Promise<string> {
    try {
      const cleanPhone = distributorPhoneNumber.replace('whatsapp:', '').replace('+', '');
      this.logger.log(`[ORG_ID] Looking up organization for phone: ${distributorPhoneNumber}`);
      this.logger.log(`[ORG_ID] Clean phone number: ${cleanPhone}`);

      // Primary: get from Zoho credentials table by matching whatsapp_number
      // Try multiple formats to handle variations
      const credential = await this.prisma.zoho_user_credential.findFirst({
        where: {
          OR: [
            { whatsapp_number: distributorPhoneNumber },
            { whatsapp_number: distributorPhoneNumber.replace('whatsapp:', '') },
            { whatsapp_number: { contains: cleanPhone } }
          ]
        },
        select: {
          organization_id: true,
          whatsapp_number: true
        }
      });

      if (credential?.organization_id) {
        this.logger.log(`[ORG_ID] ✅ Found organizationId: ${credential.organization_id} (matched: ${credential.whatsapp_number})`);
        return credential.organization_id;
      }

      this.logger.warn(`[ORG_ID] ❌ No credential found for phone: ${distributorPhoneNumber}`);

      // Fallback: get from business_user table if available
      const businessUser = await this.prisma.business_user.findFirst({
        where: {
          contactPhone: distributorPhoneNumber
        },
        select: {
          customerId: true
        }
      });

      if (businessUser?.customerId) {
        this.logger.log(`[DEBUG] Found organizationId from business_user: ${businessUser.customerId}`);
        return businessUser.customerId;
      }

      this.logger.warn(`[DEBUG] No organization found for phone: ${distributorPhoneNumber}, using default`);
      return 'default-org';
    } catch (error) {
      this.logger.error('Error getting organization ID:', error);
      return 'default-org';
    }
  }

  // Rate limiting to handle high concurrency
  private async checkRateLimit(userPhoneNumber: string): Promise<boolean> {
    try {
      const redis = getRedis();
      const rateLimitKey = `${this.RATE_LIMIT_PREFIX}${userPhoneNumber}`;

      const currentCount = await redis.incr(rateLimitKey);

      if (currentCount === 1) {
        // Set expiry for new key
        await redis.expire(rateLimitKey, 60); // 1 minute window
      }

      return currentCount > this.MAX_MESSAGES_PER_MINUTE;
    } catch (error) {
      this.logger.error('Rate limiting check failed:', error);
      return false; // Allow message on Redis failure
    }
  }

  // Cleanup expired sessions to prevent memory leaks
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const redis = getRedis();
      const sessionKeys = await redis.keys('whatsapp:session:*');

      let cleanedCount = 0;

      for (const key of sessionKeys) {
        try {
          const sessionData = await redis.get(key);
          if (sessionData) {
            const session = JSON.parse(sessionData);
            const expiresAt = new Date(session.expiresAt);

            if (expiresAt < new Date()) {
              await redis.del(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          // If session is corrupted, delete it
          await redis.del(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.log(`Cleaned up ${cleanedCount} expired sessions`);
      }
    } catch (error) {
      this.logger.error('Session cleanup failed:', error);
    }
  }

  /**
   * Create Zoho Sales Order from confirmed order
   */
  private async createZohoSalesOrder(context: ConversationContext): Promise<void> {
    try {
      this.logger.log(`[ZOHO] ========== START SALES ORDER CREATION ==========`);
      this.logger.log(`[ZOHO] Products count: ${context.productList.length}`);
      this.logger.log(`[ZOHO] Products:`, JSON.stringify(context.productList, null, 2));

      // Get distributor credentials and organization ID
      const distributorPhone = context.distributorPhoneNumber;
      this.logger.log(`[ZOHO] Looking up credentials for distributor: ${distributorPhone}`);

      const credential = await this.prisma.zoho_user_credential.findFirst({
        where: {
          whatsapp_number: distributorPhone
        },
        select: {
          client_id: true,
          client_secret: true,
          organization_id: true,
          access_token: true,
          refresh_token: true
        }
      });

      if (!credential) {
        this.logger.error(`[ZOHO] ❌ No credentials found for distributor: ${distributorPhone}`);
        context.zohoSalesOrderError = 'Distributor credentials not found';
        return;
      }

      this.logger.log(`[ZOHO] ✅ Credentials found - Organization ID: ${credential.organization_id}`);

      // Get fresh access token
      this.logger.log(`[ZOHO] Refreshing access token...`);
      const tokenData = await this.zohoService.getAccessToken(
        credential.client_id,
        credential.client_secret,
        '',
        'refresh_token',
        credential.refresh_token
      );
      this.logger.log(`[ZOHO] ✅ Access token refreshed`);

      // Get or create customer contact in Zoho
      this.logger.log(`[ZOHO] Getting or creating customer contact...`);
      const customerId = await this.getOrCreateZohoCustomer(
        context,
        credential.organization_id,
        tokenData.access_token
      );

      if (!customerId) {
        this.logger.error(`[ZOHO] ❌ Failed to get/create customer for user`);
        this.logger.error(`[ZOHO] User phone: ${context.phoneNumber}`);
        context.zohoSalesOrderError = 'Customer not found';
        return;
      }

      this.logger.log(`[ZOHO] ✅ Customer ID: ${customerId}`);

      // Prepare line items
      const lineItems = context.productList.map(product => ({
        item_id: product.productId, // Zoho item ID
        name: product.name,
        description: `Order via WhatsApp`,
        rate: product.price || 0,
        quantity: product.quantity,
        unit: 'qty'
      }));

      // Create sales order payload
      const salesOrderData = {
        customer_id: customerId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        line_items: lineItems,
        notes: `Order placed via WhatsApp by ${context.userDetails?.name || 'Customer'}`,
        // Add any custom fields if needed
      };

      this.logger.log(`[ZOHO] Sales order payload:`, JSON.stringify(salesOrderData, null, 2));

      // Create sales order in Zoho
      const result = await this.zohoService.createSalesOrder(
        salesOrderData,
        credential.organization_id,
        tokenData.access_token
      );

      this.logger.log(`[ZOHO] Sales order created successfully: ${result.salesorder?.salesorder_id}`);

      // Store sales order details in context
      context.zohoSalesOrderId = result.salesorder?.salesorder_id;
      context.zohoSalesOrderNumber = result.salesorder?.salesorder_number;
      context.zohoSalesOrderStatus = 'created';

    } catch (error) {
      this.logger.error(`[ZOHO] Error creating sales order:`, error);
      context.zohoSalesOrderError = error.message || 'Failed to create sales order';
    }
  }

  /**
   * Get or create customer contact in Zoho
   */
  private async getOrCreateZohoCustomer(
    context: ConversationContext,
    organizationId: string,
    accessToken: string
  ): Promise<string | null> {
    try {
      const userPhone = context.userDetails?.phone || context.phoneNumber;
      this.logger.log(`[ZOHO CUSTOMER] Looking up customer with phone: ${userPhone}`);

      // Try to find existing customer in database
      const cleanPhone = userPhone?.replace('whatsapp:', '').replace('+', '');
      this.logger.log(`[ZOHO CUSTOMER] Searching shops table with clean phone: ${cleanPhone}`);

      const existingShop = await this.prisma.shops.findFirst({
        where: {
          mobile_num: {
            contains: cleanPhone
          }
        },
        select: {
          id: true,
          zoho_contact_id: true,
          shop_name: true,
          mobile_num: true,
          address: true
        }
      });

      this.logger.log(`[ZOHO CUSTOMER] Shop found:`, existingShop ? 'Yes' : 'No');
      if (existingShop) {
        this.logger.log(`[ZOHO CUSTOMER] Shop details:`, JSON.stringify(existingShop, null, 2));
      }

      if (existingShop?.zoho_contact_id) {
        this.logger.log(`[ZOHO CUSTOMER] ✅ Using existing Zoho contact: ${existingShop.zoho_contact_id}`);
        return existingShop.zoho_contact_id;
      }

      // Create new contact in Zoho
      this.logger.log(`[ZOHO CUSTOMER] No existing Zoho contact - attempting to create new one...`);

      // Get default currency
      this.logger.log(`[ZOHO CUSTOMER] Fetching currencies...`);
      const currencies = await this.zohoService.getCurrencies(organizationId, accessToken);
      const defaultCurrency = currencies.find(c => c.is_base_currency) || currencies[0];
      this.logger.log(`[ZOHO CUSTOMER] Default currency:`, defaultCurrency);

      const contactData = {
        contact_name: existingShop?.shop_name || context.userDetails?.name || 'WhatsApp Customer',
        company_name: existingShop?.shop_name || 'Customer',
        contact_type: 'customer',
        currency_id: defaultCurrency?.currency_id,
        billing_address: {
          address: existingShop?.address || 'Not provided',
          city: '',
          state: '',
          zip: '',
          country: 'India'
        },
        shipping_address: {
          address: existingShop?.address || 'Not provided',
          city: '',
          state: '',
          zip: '',
          country: 'India'
        }
      };

      this.logger.log(`[ZOHO CUSTOMER] Contact data to create:`, JSON.stringify(contactData, null, 2));
      this.logger.log(`[ZOHO CUSTOMER] Calling Zoho API to create contact...`);

      const result = await this.zohoService.createContact(
        contactData,
        organizationId,
        accessToken
      );

      this.logger.log(`[ZOHO CUSTOMER] Create contact API response:`, JSON.stringify(result, null, 2));

      if (result && 'contact' in result && result.contact) {
        const zohoContactId = result.contact.contact_id;

        // Update shop record with Zoho contact ID
        if (existingShop) {
          this.logger.log(`[ZOHO CUSTOMER] Updating shop record with Zoho contact ID: ${zohoContactId}`);
          await this.prisma.shops.update({
            where: { id: existingShop.id },
            data: { zoho_contact_id: zohoContactId }
          });
        }

        this.logger.log(`[ZOHO CUSTOMER] ✅ Created new customer: ${zohoContactId}`);
        return zohoContactId;
      }

      this.logger.error(`[ZOHO CUSTOMER] ❌ Failed to create contact - unexpected response format`);
      return null;

    } catch (error) {
      this.logger.error(`[ZOHO CUSTOMER] ❌ Error getting/creating customer:`, error);
      this.logger.error(`[ZOHO CUSTOMER] Error stack:`, error.stack);
      return null;
    }
  }

  // Initialize cleanup interval
  onModuleInit() {
    // Run cleanup every 30 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.SESSION_CLEANUP_INTERVAL);
  }
}