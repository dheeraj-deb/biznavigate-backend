import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getRedis } from 'src/utils/redis';

export enum UserIntent {
  SEARCH_PRODUCT = 'search_product',          // User is looking for a product
  PLACE_ORDER = 'place_order',                // User wants to order with quantity
  BROWSE_CATALOG = 'browse_catalog',          // User wants to see catalog/menu
  ASK_HELP = 'ask_help',                      // User needs help/support
  GREETING = 'greeting',                      // User is greeting
  CONFIRM_ORDER = 'confirm_order',            // User confirming an order
  CANCEL_ORDER = 'cancel_order',              // User canceling an order
  CHECK_PRICE = 'check_price',                // User asking about price
  CHECK_AVAILABILITY = 'check_availability',  // User asking about stock
  COMPLAINT = 'complaint',                    // User has a complaint
  UNKNOWN = 'unknown'                         // Unable to determine intent
}

export interface IntentDetectionResult {
  intent: UserIntent;
  confidence: number;
  extractedEntities: {
    productName?: string;
    quantity?: number;
    keywords?: string[];
    products?: Array<{
      name: string;
      quantity: number;
      confidence: number;
    }>;
  };
  reasoning?: string;
}

@Injectable()
export class IntentDetectionService {
  private readonly logger = new Logger(IntentDetectionService.name);
  private readonly CACHE_TTL = 5 * 60; // 5 minutes
  private readonly CACHE_PREFIX = 'intent:';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  /**
   * Detect user intent using AI
   */
  async detectIntent(
    userMessage: string,
    context?: {
      previousMessages?: string[];
      currentStep?: string;
    }
  ): Promise<IntentDetectionResult> {
    try {
      // Check cache first
      const cacheKey = `${this.CACHE_PREFIX}${Buffer.from(userMessage).toString('base64')}`;
      const redis = getRedis();

      const cached = await redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Intent cache hit for: "${userMessage.substring(0, 30)}..."`);
        return JSON.parse(cached);
      }

      // Use AI to detect intent
      const result = await this.detectWithAI(userMessage, context);

      // Cache the result
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

      this.logger.log(`Detected intent: ${result.intent} (confidence: ${result.confidence}) for: "${userMessage}"`);
      return result;

    } catch (error) {
      this.logger.error('Intent detection failed:', error);
      // Fallback to rule-based detection
      return this.detectWithRules(userMessage);
    }
  }

  /**
   * AI-powered intent detection using Gemini
   */
  private async detectWithAI(
    userMessage: string,
    context?: {
      previousMessages?: string[];
      currentStep?: string;
    }
  ): Promise<IntentDetectionResult> {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!geminiApiKey) {
      this.logger.warn('Gemini API key not configured, using rule-based detection');
      return this.detectWithRules(userMessage);
    }

    const prompt = this.buildIntentDetectionPrompt(userMessage, context);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
          {
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 300,
              topP: 0.8,
              topK: 10
            }
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        )
      );

      const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!aiResponse) {
        throw new Error('Empty AI response');
      }

      // Parse AI response (expecting JSON)
      const parsed = this.parseAIResponse(aiResponse);
      return parsed;

    } catch (error) {
      this.logger.warn('AI intent detection failed, using rule-based fallback:', error.message);
      return this.detectWithRules(userMessage);
    }
  }

  /**
   * Build the prompt for AI intent detection
   */
  private buildIntentDetectionPrompt(
    userMessage: string,
    context?: {
      previousMessages?: string[];
      currentStep?: string;
    }
  ): string {
    return `You are an intent classifier and product extractor for a WhatsApp order automation bot in construction/industrial supplies business.

Analyze the user's message and determine their intent AND extract all products with quantities. Return ONLY a JSON object with this exact structure:
{
  "intent": "one of: search_product, place_order, browse_catalog, ask_help, greeting, confirm_order, cancel_order, check_price, check_availability, complaint, unknown",
  "confidence": 0.0-1.0,
  "extractedEntities": {
    "productName": "primary product name if single product mentioned",
    "quantity": number or null for primary product,
    "products": [
      {"name": "product name", "quantity": number, "confidence": 0.0-1.0}
    ],
    "keywords": ["relevant", "keywords"]
  },
  "reasoning": "brief explanation"
}

**Intent Definitions:**
- search_product: User mentions a product name WITHOUT quantity (e.g., "Shirts", "do you have cement")
- place_order: User mentions product WITH quantity (e.g., "Shirts x 100", "10 cement bags", "I need 5 steel rods")
- browse_catalog: User wants to see products (e.g., "show catalog", "what products")
- ask_help: User needs assistance (e.g., "help", "how to order")
- greeting: User is greeting (e.g., "hi", "hello")
- confirm_order: User confirming (e.g., "yes", "confirm", "1")
- cancel_order: User canceling (e.g., "no", "cancel", "2")
- check_price: User asking about price (e.g., "how much", "price of cement")
- check_availability: User asking about stock (e.g., "is it available", "in stock")
- complaint: User has issue (e.g., "not working", "problem")
- unknown: Cannot determine

**IMPORTANT - Product Extraction Rules:**
1. Extract ALL products mentioned with their quantities
2. Handle natural language variations:
   - "shirt x 1" → {name: "shirt", quantity: 1}
   - "10 shirts" → {name: "shirts", quantity: 10}
   - "I need 5 cement bags" → {name: "cement bags", quantity: 5}
   - "100 bags of cement" → {name: "cement", quantity: 100}
   - "cement" (no quantity) → {name: "cement", quantity: null}
3. If quantity is mentioned, intent should be "place_order"
4. If NO quantity mentioned, intent should be "search_product"

**Examples:**

Input: "shirt x 1"
Output: {"intent": "place_order", "confidence": 0.98, "extractedEntities": {"productName": "shirt", "quantity": 1, "products": [{"name": "shirt", "quantity": 1, "confidence": 0.95}], "keywords": ["shirt", "1"]}, "reasoning": "User specified product with quantity"}

Input: "10 shirts"
Output: {"intent": "place_order", "confidence": 0.98, "extractedEntities": {"productName": "shirts", "quantity": 10, "products": [{"name": "shirts", "quantity": 10, "confidence": 0.95}], "keywords": ["shirts", "10"]}, "reasoning": "User specified product with quantity"}

Input: "I need 5 cement bags and 20 steel rods"
Output: {"intent": "place_order", "confidence": 0.98, "extractedEntities": {"productName": "cement bags", "quantity": 5, "products": [{"name": "cement bags", "quantity": 5, "confidence": 0.95}, {"name": "steel rods", "quantity": 20, "confidence": 0.95}], "keywords": ["cement", "steel", "rods", "bags"]}, "reasoning": "User specified multiple products with quantities"}

Input: "Shirts"
Output: {"intent": "search_product", "confidence": 0.95, "extractedEntities": {"productName": "Shirts", "quantity": null, "products": [{"name": "Shirts", "quantity": null, "confidence": 0.9}], "keywords": ["shirts"]}, "reasoning": "User mentioned product name without quantity"}

Input: "100 bags cement, 50 steel rods"
Output: {"intent": "place_order", "confidence": 0.98, "extractedEntities": {"productName": "cement", "quantity": 100, "products": [{"name": "cement", "quantity": 100, "confidence": 0.95}, {"name": "steel rods", "quantity": 50, "confidence": 0.95}], "keywords": ["cement", "steel", "rods", "bags"]}, "reasoning": "User specified multiple products with quantities"}

Input: "Do you have cement?"
Output: {"intent": "search_product", "confidence": 0.92, "extractedEntities": {"productName": "cement", "quantity": null, "products": [{"name": "cement", "quantity": null, "confidence": 0.9}], "keywords": ["cement", "have"]}, "reasoning": "User asking about product availability without specifying quantity"}

Input: "catalog"
Output: {"intent": "browse_catalog", "confidence": 0.99, "extractedEntities": {"keywords": ["catalog"]}, "reasoning": "User explicitly requested catalog"}

${context?.currentStep ? `**Current Conversation Step:** ${context.currentStep}\n` : ''}
${context?.previousMessages?.length ? `**Previous Messages:** ${context.previousMessages.join(', ')}\n` : ''}

**User Message:** "${userMessage}"

Return ONLY the JSON object, no other text:`;
  }

  /**
   * Parse AI response and validate
   */
  private parseAIResponse(aiResponse: string): IntentDetectionResult {
    try {
      // Extract JSON from response (AI might add extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.intent || typeof parsed.confidence !== 'number') {
        throw new Error('Invalid response structure');
      }

      // Map intent string to enum
      const intentMap: Record<string, UserIntent> = {
        'search_product': UserIntent.SEARCH_PRODUCT,
        'place_order': UserIntent.PLACE_ORDER,
        'browse_catalog': UserIntent.BROWSE_CATALOG,
        'ask_help': UserIntent.ASK_HELP,
        'greeting': UserIntent.GREETING,
        'confirm_order': UserIntent.CONFIRM_ORDER,
        'cancel_order': UserIntent.CANCEL_ORDER,
        'check_price': UserIntent.CHECK_PRICE,
        'check_availability': UserIntent.CHECK_AVAILABILITY,
        'complaint': UserIntent.COMPLAINT,
        'unknown': UserIntent.UNKNOWN
      };

      const intent = intentMap[parsed.intent] || UserIntent.UNKNOWN;

      return {
        intent,
        confidence: parsed.confidence,
        extractedEntities: parsed.extractedEntities || {},
        reasoning: parsed.reasoning
      };

    } catch (error) {
      this.logger.warn('Failed to parse AI response:', error.message);
      throw error;
    }
  }

  /**
   * Rule-based fallback intent detection with product extraction
   */
  private detectWithRules(userMessage: string): IntentDetectionResult {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Greeting detection
    if (/^(hi|hello|hey|start|hola|namaste)\b/i.test(lowerMessage)) {
      return {
        intent: UserIntent.GREETING,
        confidence: 0.95,
        extractedEntities: { keywords: ['greeting'] }
      };
    }

    // Help detection
    if (/\b(help|support|assist|how to|guide)\b/i.test(lowerMessage)) {
      return {
        intent: UserIntent.ASK_HELP,
        confidence: 0.9,
        extractedEntities: { keywords: ['help'] }
      };
    }

    // Catalog browsing
    if (/\b(catalog|menu|products|list|show|browse|categories)\b/i.test(lowerMessage)) {
      return {
        intent: UserIntent.BROWSE_CATALOG,
        confidence: 0.9,
        extractedEntities: { keywords: ['catalog'] }
      };
    }

    // Confirmation
    if (/^(yes|ok|confirm|correct|right|1)\b/i.test(lowerMessage)) {
      return {
        intent: UserIntent.CONFIRM_ORDER,
        confidence: 0.85,
        extractedEntities: { keywords: ['confirm'] }
      };
    }

    // Cancellation
    if (/^(no|cancel|stop|wrong|2)\b/i.test(lowerMessage)) {
      return {
        intent: UserIntent.CANCEL_ORDER,
        confidence: 0.85,
        extractedEntities: { keywords: ['cancel'] }
      };
    }

    // Price inquiry
    if (/\b(price|cost|how much|rate)\b/i.test(lowerMessage)) {
      return {
        intent: UserIntent.CHECK_PRICE,
        confidence: 0.8,
        extractedEntities: { keywords: ['price'] }
      };
    }

    // Availability check
    if (/\b(available|in stock|do you have|stock)\b/i.test(lowerMessage)) {
      const productMatch = userMessage.match(/(?:have|stock)\s+(.+?)(?:\?|$)/i);
      return {
        intent: UserIntent.CHECK_AVAILABILITY,
        confidence: 0.8,
        extractedEntities: {
          productName: productMatch?.[1]?.trim(),
          keywords: ['availability']
        }
      };
    }

    // Extract products with quantities using multiple patterns
    const extractedProducts = this.extractProductsWithRules(userMessage);

    // If products with quantities were found, it's an order
    if (extractedProducts.length > 0 && extractedProducts.some(p => p.quantity && p.quantity > 0)) {
      return {
        intent: UserIntent.PLACE_ORDER,
        confidence: 0.9,
        extractedEntities: {
          productName: extractedProducts[0].name,
          quantity: extractedProducts[0].quantity,
          products: extractedProducts,
          keywords: ['order']
        }
      };
    }

    // If products without quantities were found, it's a search
    if (extractedProducts.length > 0) {
      return {
        intent: UserIntent.SEARCH_PRODUCT,
        confidence: 0.8,
        extractedEntities: {
          productName: extractedProducts[0].name,
          quantity: null,
          products: extractedProducts,
          keywords: ['search']
        }
      };
    }

    // Product search (single word or phrase without numbers)
    if (!/\d/.test(userMessage) && userMessage.length > 2 && userMessage.length < 50) {
      return {
        intent: UserIntent.SEARCH_PRODUCT,
        confidence: 0.7,
        extractedEntities: {
          productName: userMessage.trim(),
          products: [{ name: userMessage.trim(), quantity: null, confidence: 0.7 }],
          keywords: ['search']
        }
      };
    }

    // Unknown
    return {
      intent: UserIntent.UNKNOWN,
      confidence: 0.5,
      extractedEntities: {}
    };
  }

  /**
   * Extract products and quantities using rule-based patterns
   */
  private extractProductsWithRules(input: string): Array<{ name: string; quantity: number | null; confidence: number }> {
    const products = [];

    // Pattern 1: "product x quantity" (e.g., "shirt x 1", "cement x 100")
    const pattern1 = /(.+?)\s*x\s*(\d+)/gi;
    let match1;
    while ((match1 = pattern1.exec(input)) !== null) {
      products.push({
        name: match1[1].trim(),
        quantity: parseInt(match1[2], 10),
        confidence: 0.95
      });
    }

    // Pattern 2: "quantity product" (e.g., "10 shirts", "100 cement bags")
    const pattern2 = /(\d+)\s+(?:bags?\s+(?:of\s+)?)?([a-zA-Z][a-zA-Z\s]+?)(?:\s+and|\s*,|$)/gi;
    let match2;
    while ((match2 = pattern2.exec(input)) !== null) {
      const quantity = parseInt(match2[1], 10);
      const name = match2[2].trim().replace(/\s+(bags?|pieces?|units?|boxes?)$/i, '');

      // Avoid duplicates
      if (!products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        products.push({
          name: name,
          quantity: quantity,
          confidence: 0.9
        });
      }
    }

    // Pattern 3: "I need/want X quantity product" (e.g., "I need 5 cement bags")
    const pattern3 = /(?:i\s+(?:need|want|require)\s+)?(\d+)\s+([a-zA-Z][a-zA-Z\s]+)/gi;
    let match3;
    while ((match3 = pattern3.exec(input)) !== null) {
      const quantity = parseInt(match3[1], 10);
      const name = match3[2].trim().replace(/\s+(bags?|pieces?|units?|boxes?)$/i, '');

      // Avoid duplicates
      if (!products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        products.push({
          name: name,
          quantity: quantity,
          confidence: 0.85
        });
      }
    }

    return products;
  }

  /**
   * Get intent-based response suggestion
   */
  getSuggestedResponse(intent: UserIntent, productName?: string): string {
    switch (intent) {
      case UserIntent.SEARCH_PRODUCT:
        return productName
          ? `🔍 Searching for "${productName}"...\n\nType 'search ${productName}' to see all matches, or send '${productName} x [quantity]' to order directly.`
          : `I see you're looking for a product. Please use:\n🔍 'search [product name]'\n🛒 '[product] x [quantity]' to order`;

      case UserIntent.CHECK_AVAILABILITY:
        return `Let me check the availability for you...`;

      case UserIntent.CHECK_PRICE:
        return `Let me get the pricing information for you...`;

      case UserIntent.ASK_HELP:
        return `📋 *How can I help?*\n\n🔍 Search: Type 'search [product]'\n🛒 Order: Send '[product] x [quantity]'\n📄 Browse: Type 'catalog'\n\nWhat would you like to do?`;

      default:
        return null;
    }
  }
}
