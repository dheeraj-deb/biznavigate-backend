// @ts-nocheck
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { KafkaService } from '../kafka/kafka.service';
import { SellerOsService } from '../seller-os/application/seller-os.service';

const SELLER_TYPES = new Set(['products', 'retail', 'ecommerce', 'product_seller']);
const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'have',
  'need',
  'want',
  'please',
  'show',
  'send',
  'price',
  'available',
  'stock',
  'product',
  'products',
  'order',
  'buy',
]);

@Injectable()
export class ProductSellerAiWorkerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(ProductSellerAiWorkerService.name);
  private consumer?: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly kafkaService: KafkaService,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly prisma: PrismaService,
    private readonly sellerOsService: SellerOsService,
  ) {}

  async onApplicationBootstrap() {
    const enabled =
      this.configService.get<string>('PRODUCT_AI_WORKER_ENABLED', 'true') !==
      'false';

    if (!enabled) {
      this.logger.log('Product seller AI worker disabled');
      return;
    }

    const baseGroupId = this.configService.get<string>(
      'KAFKA_GROUP_ID',
      'biznavigate-backend-group',
    );
    const groupId = this.configService.get<string>(
      'PRODUCT_AI_WORKER_GROUP_ID',
      `${baseGroupId}-product-ai-worker`,
    );

    this.consumer = this.kafkaService.createConsumer(groupId);
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'ai.process.request',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: (payload) => this.handleKafkaMessage(payload),
    });

    this.logger.log(`Product seller AI worker started with group ${groupId}`);
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.logger.log('Product seller AI worker stopped');
    }
  }

  private async handleKafkaMessage(payload: EachMessagePayload) {
    try {
      const value = payload.message.value?.toString();
      if (!value) return;

      const event = JSON.parse(value);
      if (event.event_type !== 'ai.process.request') return;

      const result = await this.processRequest({
        ...event.payload,
        request_event_id: event.event_id,
      });

      if (result) {
        await this.kafkaProducerService.publishAiProcessingResult(result);
      }
    } catch (error) {
      this.logger.error('Product seller AI worker failed to process message', error);
    }
  }

  async processRequest(payload: any) {
    const startedAt = Date.now();
    const ctx = await this.resolveContext(payload);
    if (!ctx) return null;

    const text = String(payload.text || payload.message_text || '').trim();
    const customerPhone = this.cleanPhone(
      payload.customer_phone ||
        payload.context?.customer_phone ||
        payload.context?.from ||
        ctx.lead?.phone,
    );
    const customerName =
      payload.customer_name ||
      payload.context?.customer_name ||
      [ctx.lead?.first_name, ctx.lead?.last_name].filter(Boolean).join(' ') ||
      undefined;

    const entryContext = this.normalizeEntryContext(
      payload.context?.entry_context ||
        payload.context?.lead_info?.entry_context ||
        ctx.lead?.extracted_entities?.entry_context ||
        ctx.lead?.custom_fields?.last_entry_context,
    );
    const products = await this.fetchProducts(ctx);
    const searchText = this.buildEntryAwareSearchText(text, entryContext);
    const matches = this.rankProducts(products, searchText);
    const topMatch = matches[0];
    const quantity = this.extractQuantity(text);
    const risk = this.detectRisk(text);
    const creditMentioned = this.isCreditText(text);

    let response = '';
    let intent = 'PRODUCT_SEARCH';
    let confidence = 0.78;
    let actions: any[] = [];
    let decision = 'answered';

    if (entryContext && this.isVagueEntryText(text)) {
      const entryResult = await this.handleEntryContext(ctx, entryContext, {
        products,
        matches,
        quantity,
        customerPhone,
      });
      intent = entryResult.intent;
      confidence = entryResult.confidence;
      response = entryResult.response;
      decision = entryResult.decision;
      actions = entryResult.actions;
    } else if (!text) {
      intent = 'PRODUCT_CLARIFICATION';
      confidence = 0.62;
      response =
        'Please tell me the product name or category you want. I will check stock and price for you.';
      decision = 'clarification_requested';
    } else if (creditMentioned && this.wantsOrder(text) && topMatch) {
      const orderResult = await this.handleOrderRequest(ctx, topMatch, {
        text,
        quantity,
        customerPhone,
        customerName,
      });
      intent = orderResult.intent;
      confidence = orderResult.confidence;
      response = orderResult.response;
      decision = orderResult.decision;
      actions = orderResult.actions;
    } else if (creditMentioned) {
      const creditResult = await this.handleCreditQuestion(ctx, {
        text,
        customerPhone,
      });
      intent = creditResult.intent;
      confidence = creditResult.confidence;
      response = creditResult.response;
      decision = creditResult.decision;
      actions = creditResult.actions;
    } else if (risk) {
      intent = risk.intent;
      confidence = 0.88;
      const approval = await this.requestOwnerApproval(ctx, {
        action: risk.action,
        text,
        customerPhone,
        output:
          'This needs owner approval before I can promise it to the customer.',
        amount: topMatch ? topMatch.price * quantity : 0,
      });
      response = risk.customerMessage;
      decision = 'owner_approval_requested';
      actions.push({
        type: 'owner_approval_requested',
        approval_id: approval?.approval?.owner_approval_id,
        risk_level: approval?.risk_level || 'medium',
      });
    } else if (this.wantsReserve(text) && topMatch) {
      intent = 'STOCK_RESERVATION_REQUEST';
      confidence = 0.9;
      const hold = await this.reserveStock(ctx, topMatch, {
        quantity,
        customerPhone,
        customerName,
        reason: `Customer asked to hold: ${text}`,
      });
      response = hold.response;
      decision = hold.decision;
      actions.push(hold.action);
    } else if (this.wantsOrder(text) && topMatch) {
      const orderResult = await this.handleOrderRequest(ctx, topMatch, {
        text,
        quantity,
        customerPhone,
        customerName,
      });
      intent = orderResult.intent;
      confidence = orderResult.confidence;
      response = orderResult.response;
      decision = orderResult.decision;
      actions = orderResult.actions;
    } else {
      const productList = matches.length > 0 ? matches : products.slice(0, 5);
      if (productList[0]) {
        await this.recordDemandSignal(ctx, productList[0], 'product_search', quantity, customerPhone, {
          query: text,
          matched_count: matches.length,
        });
      }
      response = this.buildProductSearchResponse(productList, matches.length === 0);
      actions.push({
        type: 'product_search',
        products: productList.slice(0, 5).map((item) => this.publicProduct(item)),
      });
    }

    response = await this.rewriteWithGemini(ctx, text, response, {
      intent,
      products: matches.slice(0, 3).map((item) => this.publicProduct(item)),
      quantity,
      decision,
      entry_context: entryContext,
    });

    await this.safeAudit(ctx, {
      action: intent.toLowerCase(),
      customerPhone,
      confidence,
      decision,
      input: text,
      output: response,
      metadata: {
        request_event_id: payload.request_event_id,
        matched_products: matches.slice(0, 3).map((item) => item.product_id),
        entry_context: entryContext,
        actions,
      },
    });

    return {
      lead_id: payload.lead_id,
      business_id: ctx.businessId,
      tenant_id: ctx.tenantId,
      processing_id:
        payload.processing_id || payload.request_event_id || randomUUID(),
      intent: {
        intent,
        confidence,
        method: 'product_seller_ai_worker',
        cached: false,
      },
      entities: {
        products: matches.slice(0, 5).map((item) => this.publicProduct(item)),
        quantity,
        customer_phone: customerPhone,
        business_type: ctx.business.business_type,
      },
      suggested_actions: actions,
      suggested_response: response,
      context: {
        ...(payload.context || {}),
        entry_context: entryContext || payload.context?.entry_context,
        product_seller_ai: true,
      },
      processing_time_ms: Date.now() - startedAt,
    };
  }

  private async resolveContext(payload: any) {
    const db: any = this.prisma;
    const lead = payload.lead_id
      ? await db.leads
          .findUnique({
            where: { lead_id: payload.lead_id },
            select: {
              lead_id: true,
              business_id: true,
              tenant_id: true,
              phone: true,
              first_name: true,
              last_name: true,
              delivery_address: true,
              custom_fields: true,
              extracted_entities: true,
            },
          })
          .catch(() => null)
      : null;

    const businessId = payload.business_id || lead?.business_id;
    if (!businessId) return null;

    const business = await db.businesses.findFirst({
      where: { business_id: businessId },
      select: {
        business_id: true,
        tenant_id: true,
        business_name: true,
        business_type: true,
      },
    });

    if (!business) return null;

    const requestType = String(payload.business_type || '').toLowerCase();
    const businessType = String(business.business_type || '').toLowerCase();
    const productSellerContext = Boolean(payload.context?.product_seller);

    if (
      !SELLER_TYPES.has(requestType) &&
      !SELLER_TYPES.has(businessType) &&
      !productSellerContext
    ) {
      return null;
    }

    const tenantId = payload.tenant_id || lead?.tenant_id || business.tenant_id;
    if (!tenantId) return null;

    return {
      businessId,
      tenantId,
      lead,
      business,
      user: {
        business_id: businessId,
        tenant_id: tenantId,
        user_id: payload.user_id || null,
      },
    };
  }

  private async fetchProducts(ctx: any) {
    const db: any = this.prisma;
    const products = await db.products.findMany({
      where: {
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        product_type: 'physical',
        is_active: true,
      },
      include: { product_variants: true },
      orderBy: [{ in_stock: 'desc' }, { updated_at: 'desc' }],
      take: 80,
    });

    return products.map((product) => this.decorateProduct(product));
  }

  private decorateProduct(product: any, variant?: any) {
    const productAvailable = product.track_inventory === false
      ? 999999
      : Math.max(
          0,
          Number(product.stock_quantity || 0) -
            Number(product.reserved_stock || 0),
        );

    const variantAvailable = variant
      ? Math.max(
          0,
          Number(variant.quantity || 0) - Number(variant.reserved_stock || 0),
        )
      : undefined;

    return {
      ...product,
      selected_variant: variant,
      available_stock: variant ? variantAvailable : productAvailable,
      price: Number(variant?.price ?? product.price ?? 0),
      variant_id: variant?.variant_id,
      variant_name: variant?.name,
    };
  }

  private rankProducts(products: any[], text: string) {
    const normalizedText = this.normalize(text);
    const tokens = normalizedText
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

    return products
      .flatMap((product) => {
        const variants = product.product_variants?.length
          ? [undefined, ...product.product_variants]
          : [undefined];

        return variants.map((variant) => {
          const decorated = variant ? this.decorateProduct(product, variant) : product;
          const haystack = this.normalize(
            [
              product.name,
              product.category,
              product.sku,
              product.description,
              variant?.name,
              variant?.sku,
            ]
              .filter(Boolean)
              .join(' '),
          );
          const productName = this.normalize(product.name || '');
          const sku = this.normalize(variant?.sku || product.sku || '');
          let score = 0;

          if (productName && normalizedText.includes(productName)) score += 100;
          if (sku && normalizedText.includes(sku)) score += 80;
          if (
            product.category &&
            normalizedText.includes(this.normalize(product.category))
          ) {
            score += 25;
          }
          for (const token of tokens) {
            if (haystack.includes(token)) score += 8;
          }
          if (variant?.name && normalizedText.includes(this.normalize(variant.name))) {
            score += 30;
          }
          if (decorated.available_stock > 0) score += 5;

          return { ...decorated, match_score: score };
        });
      })
      .filter((product) => product.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 8);
  }

  private normalizeEntryContext(entryContext: any) {
    if (!entryContext || typeof entryContext !== 'object') return null;
    return {
      ...entryContext,
      product_hint: this.cleanHint(entryContext.product_hint),
      category_hint: this.cleanHint(entryContext.category_hint),
      sku_hint: this.cleanHint(entryContext.sku_hint),
      headline: this.cleanHint(entryContext.headline),
      body: this.cleanHint(entryContext.body),
      path_hint: this.cleanHint(entryContext.path_hint),
    };
  }

  private buildEntryAwareSearchText(text: string, entryContext: any) {
    if (!entryContext) return text;
    return [
      text,
      entryContext.product_hint,
      entryContext.category_hint,
      entryContext.sku_hint,
      entryContext.headline,
      entryContext.body,
      entryContext.path_hint,
      entryContext.product_retailer_id,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private isVagueEntryText(text: string) {
    const normalized = this.normalize(text);
    if (!normalized) return true;
    if (
      /^(hi|hello|hey|hai|interested|details|detail|price|available|yes|ok|more|send details|need details)$/.test(
        normalized,
      )
    ) {
      return true;
    }
    return /\b(i am interested|i m interested|is this available|still available|send price|share price|more details)\b/i.test(
      text,
    );
  }

  private async handleEntryContext(ctx: any, entryContext: any, input: any) {
    const product = input.matches?.[0];
    const actions: any[] = [];
    const entrySource = this.entrySourceLabel(entryContext);

    if (product) {
      await this.recordDemandSignal(
        ctx,
        product,
        'entry_interest',
        input.quantity,
        input.customerPhone,
        {
          entry_context: entryContext,
          matched_from_entry_context: true,
        },
      );

      actions.push({
        type: 'entry_product_interest',
        entry_source: entryContext.source_channel,
        product: this.publicProduct(product),
      });

      return {
        intent: 'ENTRY_PRODUCT_INTEREST',
        confidence: 0.86,
        decision: 'entry_product_answered',
        actions,
        response: this.buildEntryProductResponse(product, entrySource, entryContext),
      };
    }

    const productList = input.products.slice(0, 5);
    actions.push({
      type: 'entry_clarification',
      entry_source: entryContext.source_channel,
      products: productList.map((item) => this.publicProduct(item)),
    });

    return {
      intent: 'ENTRY_CLARIFICATION',
      confidence: 0.72,
      decision: 'entry_clarification_requested',
      actions,
      response: this.buildEntryClarificationResponse(entrySource, entryContext, productList),
    };
  }

  private buildEntryProductResponse(product: any, entrySource: string, entryContext: any) {
    const stock =
      product.available_stock > 0
        ? `${product.available_stock} in stock`
        : 'currently out of stock';
    const hint = entryContext.product_hint ? ` about ${entryContext.product_hint}` : '';
    const nextStep =
      product.available_stock > 0
        ? 'Reply with quantity to hold it, or send delivery area for COD.'
        : 'I can note your interest and tell the owner to update you when stock comes.';

    return `Thanks for reaching us from ${entrySource}${hint}. ${this.productLabel(product)} is Rs ${product.price} (${stock}). ${nextStep}`;
  }

  private buildEntryClarificationResponse(entrySource: string, entryContext: any, products: any[]) {
    const intro = `Thanks for reaching us from ${entrySource}.`;
    const hintLine = entryContext.product_hint
      ? `I could not match "${entryContext.product_hint}" exactly.`
      : 'Please tell me which product you are looking for.';

    if (!products.length) {
      return `${intro} ${hintLine} You can send product name, category, or screenshot.`;
    }

    const lines = products.slice(0, 4).map((product, index) => {
      const stock = product.available_stock > 0 ? `${product.available_stock} in stock` : 'out of stock';
      return `${index + 1}. ${this.productLabel(product)} - Rs ${product.price} (${stock})`;
    });

    return `${intro} ${hintLine}\n${lines.join('\n')}\nReply with the item number/name and quantity.`;
  }

  private entrySourceLabel(entryContext: any) {
    const source = String(entryContext?.source_channel || '').toLowerCase();
    if (source.includes('instagram')) return 'Instagram';
    if (source.includes('facebook') || source.includes('meta')) return 'Facebook ad';
    if (source.includes('youtube')) return 'YouTube';
    if (source.includes('website')) return 'website';
    if (source.includes('whatsapp_catalog')) return 'WhatsApp catalog';
    if (source.includes('whatsapp_link')) return 'WhatsApp link';
    return 'the link';
  }

  private cleanHint(value?: string | null) {
    const cleaned = String(value || '')
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/[^\w\s.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.length >= 2 ? cleaned.slice(0, 120) : undefined;
  }

  private wantsReserve(text: string) {
    return /\b(hold|reserve|keep|book|block)\b/i.test(text);
  }

  private wantsOrder(text: string) {
    return /\b(buy|order|confirm|purchase|take it|cod|cash on delivery)\b/i.test(
      text,
    );
  }

  private detectRisk(text: string) {
    if (/\b(discount|reduce price|less price|lower price|free)\b/i.test(text)) {
      return {
        intent: 'DISCOUNT_REQUEST',
        action: 'discount_request',
        customerMessage:
          'Discount needs owner approval. I have sent this request to the owner and will update you after approval.',
      };
    }

    if (/\b(refund|return|exchange|replace)\b/i.test(text)) {
      return {
        intent: 'RETURN_EXCHANGE_REQUEST',
        action: 'refund_return_exchange_request',
        customerMessage:
          'Return, exchange, or refund requests need owner approval. I have sent this to the owner for review.',
      };
    }

    return null;
  }

  private isCreditText(text: string) {
    return /\b(credit|khaata|khata|udhaar|pay later|later payment)\b/i.test(text);
  }

  private extractQuantity(text: string) {
    const digitMatch = text.match(/\b(\d{1,3})\b/);
    if (digitMatch) return Math.max(1, Number(digitMatch[1]));

    const words = new Map([
      ['one', 1],
      ['two', 2],
      ['three', 3],
      ['four', 4],
      ['five', 5],
      ['six', 6],
      ['seven', 7],
      ['eight', 8],
      ['nine', 9],
      ['ten', 10],
    ]);

    const normalized = this.normalize(text);
    for (const [word, value] of words) {
      if (normalized.split(' ').includes(word)) return value;
    }

    return 1;
  }

  private extractPaymentMethod(text: string) {
    if (/\b(cod|cash on delivery)\b/i.test(text)) return 'cod';
    if (/\bupi\b/i.test(text)) return 'upi';
    if (/\bcard\b/i.test(text)) return 'card';
    if (/\bcash\b/i.test(text)) return 'cash';
    if (/\b(credit|khaata|khata|udhaar|pay later)\b/i.test(text)) return 'credit';
    return undefined;
  }

  private extractAddress(text: string, fallback?: string) {
    const explicit = text.match(
      /(?:deliver to|delivery to|address is|address:|ship to)\s+(.{8,180})/i,
    );
    if (explicit?.[1]) return explicit[1].trim().replace(/[.]+$/, '');

    if (
      /\b(near|road|street|lane|flat|house|building|pincode|pin|address)\b/i.test(
        text,
      ) &&
      text.includes(',')
    ) {
      return text.trim();
    }

    return fallback;
  }

  private async handleOrderRequest(ctx: any, product: any, input: any) {
    if (product.available_stock < input.quantity) {
      await this.recordDemandSignal(ctx, product, 'out_of_stock', input.quantity, input.customerPhone, {
        requested_quantity: input.quantity,
        available_stock: product.available_stock,
      });
      return {
        intent: 'OUT_OF_STOCK',
        confidence: 0.92,
        decision: 'blocked_out_of_stock',
        response: `${this.productLabel(product)} has only ${product.available_stock} in stock. I cannot create this order now. Please choose a lower quantity or another product.`,
        actions: [
          {
            type: 'out_of_stock_blocked',
            product: this.publicProduct(product),
            requested_quantity: input.quantity,
          },
        ],
      };
    }

    const paymentMethod = this.extractPaymentMethod(input.text);
    const address = this.extractAddress(input.text, ctx.lead?.delivery_address);

    if (paymentMethod === 'credit') {
      if (!input.customerPhone) {
        return {
          intent: 'CREDIT_DETAILS_NEEDED',
          confidence: 0.82,
          decision: 'phone_requested',
          response:
            'Please send the customer phone number so I can check whether credit is allowed.',
          actions: [{ type: 'credit_phone_needed' }],
        };
      }

      const wantsDelivery = /\b(deliver|delivery|send|ship)\b/i.test(input.text);
      if (wantsDelivery && !address) {
        const hold = await this.reserveStock(ctx, product, {
          quantity: input.quantity,
          customerPhone: input.customerPhone,
          customerName: input.customerName,
          reason: `Reserved while collecting credit delivery address: ${input.text}`,
        });

        return {
          intent: 'ORDER_DETAILS_NEEDED',
          confidence: 0.84,
          decision: 'delivery_address_requested_with_stock_hold',
          response: `${hold.shortResponse} Credit is being checked. Please send the delivery address.`,
          actions: [hold.action],
        };
      }

      const amount = product.price * input.quantity;
      const creditDecision = await this.checkCreditForPhone(
        ctx,
        input.customerPhone,
        amount,
      );

      if (!creditDecision.can_use_credit) {
        if (creditDecision.status === 'disabled') {
          return {
            intent: 'CREDIT_NOT_AVAILABLE',
            confidence: 0.9,
            decision: 'credit_disabled',
            response:
              'Credit is not available for this store. You can place the order with the available payment options.',
            actions: [
              {
                type: 'credit_disabled',
              },
            ],
          };
        }

        const approval = creditDecision.needs_owner_approval
          ? await this.requestOwnerApproval(ctx, {
              action: 'credit_sale_request',
              text: input.text,
              customerPhone: input.customerPhone,
              output: creditDecision.message,
              amount,
            })
          : null;

        return {
          intent: 'CREDIT_REQUEST',
          confidence: 0.9,
          decision: creditDecision.status === 'blocked'
            ? 'credit_blocked'
            : 'owner_approval_requested',
        response:
          creditDecision.status === 'blocked'
            ? 'Credit is blocked for this customer. The owner can review it from the dashboard.'
            : 'Credit needs owner approval for this customer. I have sent the request to the owner.',
          actions: [
            {
              type: creditDecision.status === 'blocked'
                ? 'credit_blocked'
                : 'owner_approval_requested',
              approval_id: approval?.approval?.owner_approval_id,
              credit_status: creditDecision.status,
              available_credit: creditDecision.available_credit,
            },
          ],
        };
      }

      const order = await this.sellerOsService.createAgentOrder(ctx.user, {
        lead_id: ctx.lead?.lead_id,
        customer_phone: input.customerPhone,
        customer_name: input.customerName,
        payment_method: 'credit',
        delivery_required: Boolean(address),
        delivery_address: address,
        notes: `Credit order created by Sales AI from WhatsApp: ${input.text}`,
        items: [
          {
            product_id: product.product_id,
            variant_id: product.variant_id,
            quantity: input.quantity,
          },
        ],
      });

      return {
        intent: 'CREDIT_ORDER_CREATED',
        confidence: 0.93,
        decision: 'credit_order_created',
        response: `Credit order ${order.order_number || order.order_id} created for ${input.quantity} x ${this.productLabel(product)}. Total Rs ${Number(order.total_amount || 0)}. Available credit after this is Rs ${Math.max(0, Number(creditDecision.available_credit || 0) - amount)}.`,
        actions: [
          {
            type: 'credit_order_created',
            order_id: order.order_id,
            order_number: order.order_number,
            total_amount: Number(order.total_amount || 0),
          },
        ],
      };
    }

    if (paymentMethod !== 'cod' || !address || !input.customerPhone) {
      const hold = await this.reserveStock(ctx, product, {
        quantity: input.quantity,
        customerPhone: input.customerPhone,
        customerName: input.customerName,
        reason: `Reserved while collecting order details: ${input.text}`,
      });

      return {
        intent: 'ORDER_DETAILS_NEEDED',
        confidence: 0.84,
        decision: 'details_requested_with_stock_hold',
        response:
          `${hold.shortResponse} Please send delivery address and confirm COD, or wait for the owner to share payment details.`,
        actions: [hold.action],
      };
    }

    const existingOrder = await this.findRecentAiOrder(ctx, product);
    if (existingOrder) {
      return {
        intent: 'ORDER_CREATED',
        confidence: 0.86,
        decision: 'duplicate_prevented',
        response: `Your order ${existingOrder.order_number || existingOrder.order_id} is already created. The delivery desk will follow up for COD delivery.`,
        actions: [
          {
            type: 'duplicate_order_prevented',
            order_id: existingOrder.order_id,
          },
        ],
      };
    }

    const order = await this.sellerOsService.createAgentOrder(ctx.user, {
      lead_id: ctx.lead?.lead_id,
      customer_phone: input.customerPhone,
      customer_name: input.customerName,
      payment_method: 'cod',
      delivery_required: true,
      delivery_address: address,
      notes: `Created by Sales AI from WhatsApp: ${input.text}`,
      items: [
        {
          product_id: product.product_id,
          variant_id: product.variant_id,
          quantity: input.quantity,
        },
      ],
    });

    return {
      intent: 'ORDER_CREATED',
      confidence: 0.93,
      decision: 'order_created',
      response: `COD order ${order.order_number || order.order_id} created for ${input.quantity} x ${this.productLabel(product)}. Total Rs ${Number(order.total_amount || 0)}. The delivery desk will follow up.`,
      actions: [
        {
          type: 'order_created',
          order_id: order.order_id,
          order_number: order.order_number,
          total_amount: Number(order.total_amount || 0),
        },
      ],
    };
  }

  private async reserveStock(ctx: any, product: any, input: any) {
    if (product.available_stock < input.quantity) {
      await this.recordDemandSignal(ctx, product, 'out_of_stock', input.quantity, input.customerPhone, {
        requested_quantity: input.quantity,
        available_stock: product.available_stock,
      });
      return {
        decision: 'blocked_out_of_stock',
        response: `${this.productLabel(product)} has only ${product.available_stock} in stock. I cannot hold ${input.quantity} unit(s).`,
        shortResponse: `${this.productLabel(product)} has only ${product.available_stock} in stock.`,
        action: {
          type: 'out_of_stock_blocked',
          product: this.publicProduct(product),
          requested_quantity: input.quantity,
        },
      };
    }

    const db: any = this.prisma;
    const existing = await db.seller_stock_reservations
      .findFirst({
        where: {
          business_id: ctx.businessId,
          product_id: product.product_id,
          variant_id: product.variant_id || null,
          status: 'active',
          expires_at: { gt: new Date() },
          OR: [
            ctx.lead?.lead_id ? { lead_id: ctx.lead.lead_id } : undefined,
            input.customerPhone ? { customer_phone: input.customerPhone } : undefined,
          ].filter(Boolean),
        },
        orderBy: { expires_at: 'desc' },
      })
      .catch(() => null);

    if (existing) {
      const minutes = Math.max(
        1,
        Math.ceil((new Date(existing.expires_at).getTime() - Date.now()) / 60000),
      );
      return {
        decision: 'existing_hold_reused',
        response: `Already holding ${existing.quantity} x ${this.productLabel(product)} for you. Hold expires in about ${minutes} minute(s).`,
        shortResponse: `Already holding ${existing.quantity} x ${this.productLabel(product)} for you.`,
        action: {
          type: 'stock_hold_exists',
          reservation_id: existing.seller_reservation_id,
          expires_at: existing.expires_at,
        },
      };
    }

    const reservation = await this.sellerOsService.createStockReservation(
      ctx.user,
      {
        product_id: product.product_id,
        variant_id: product.variant_id,
        lead_id: ctx.lead?.lead_id,
        customer_phone: input.customerPhone,
        customer_name: input.customerName,
        quantity: input.quantity,
        reason: input.reason || 'Customer asked Sales AI to hold product',
      },
      'whatsapp_ai',
    );

    const minutes = Math.max(
      1,
      Math.ceil((new Date(reservation.expires_at).getTime() - Date.now()) / 60000),
    );

    return {
      decision: 'stock_reserved',
      response: `Done. I am holding ${input.quantity} x ${this.productLabel(product)} for about ${minutes} minute(s). Please confirm payment or delivery details before the hold expires.`,
      shortResponse: `I am holding ${input.quantity} x ${this.productLabel(product)} for about ${minutes} minute(s).`,
      action: {
        type: 'stock_reserved',
        reservation_id: reservation.seller_reservation_id,
        expires_at: reservation.expires_at,
        product: this.publicProduct(product),
      },
    };
  }

  private async requestOwnerApproval(ctx: any, input: any) {
    return this.sellerOsService
      .aiGuardrailCheck(ctx.user, {
        ai_employee_key: 'ai_guard',
        action: input.action,
        customer_phone: input.customerPhone,
        input_summary: input.text,
        output_summary: input.output,
        metadata: {
          amount: input.amount || 0,
          channel: 'whatsapp',
          lead_id: ctx.lead?.lead_id,
        },
      })
      .catch((error) => {
        this.logger.warn(`Owner approval could not be created: ${error.message}`);
        return null;
      });
  }

  private async handleCreditQuestion(ctx: any, input: any) {
    if (!input.customerPhone) {
      return {
        intent: 'CREDIT_DETAILS_NEEDED',
        confidence: 0.78,
        decision: 'phone_requested',
        response:
          'Please send the customer phone number. I will check whether credit is allowed.',
        actions: [{ type: 'credit_phone_needed' }],
      };
    }

    const decision = await this.checkCreditForPhone(ctx, input.customerPhone);
    if (decision.can_use_credit) {
      return {
        intent: 'CREDIT_ALLOWED',
        confidence: 0.9,
        decision: 'credit_allowed',
        response: `Credit is allowed for this customer. Available credit is Rs ${decision.available_credit}.`,
        actions: [
          {
            type: 'credit_allowed',
            available_credit: decision.available_credit,
          },
        ],
      };
    }

    if (decision.status === 'disabled') {
      return {
        intent: 'CREDIT_NOT_AVAILABLE',
        confidence: 0.88,
        decision: 'credit_disabled',
        response:
          'Credit is not available for this store. Please choose another payment option.',
        actions: [{ type: 'credit_disabled' }],
      };
    }

    const approval = decision.needs_owner_approval
      ? await this.requestOwnerApproval(ctx, {
          action: 'credit_customer_review',
          text: input.text,
          customerPhone: input.customerPhone,
          output: decision.message,
          amount: 0,
        })
      : null;

    return {
      intent: 'CREDIT_REQUEST',
      confidence: 0.86,
      decision:
        decision.status === 'blocked' ? 'credit_blocked' : 'owner_approval_requested',
      response:
        decision.status === 'blocked'
          ? 'Credit is blocked for this customer. The owner can review it from the dashboard.'
          : 'Credit needs owner approval for this customer. I have sent the request to the owner.',
      actions: [
        {
          type:
            decision.status === 'blocked'
              ? 'credit_blocked'
              : 'owner_approval_requested',
          approval_id: approval?.approval?.owner_approval_id,
          credit_status: decision.status,
          available_credit: decision.available_credit,
        },
      ],
    };
  }

  private async checkCreditForPhone(ctx: any, phone: string, amount = 0) {
    const db: any = this.prisma;
    const settings = await db.seller_store_settings.findUnique({
      where: { business_id: ctx.businessId },
    }).catch(() => null);
    if (!this.creditEnabled(settings)) {
      return {
        status: 'disabled',
        can_use_credit: false,
        needs_owner_approval: false,
        message: 'This store does not offer credit sales.',
        available_credit: 0,
      };
    }
    const cleanedPhone = this.cleanPhone(phone);
    const account = await db.seller_customer_credit_accounts.findFirst({
      where: { business_id: ctx.businessId, phone: cleanedPhone },
    });

    if (!account) {
      return {
        status: 'unknown',
        can_use_credit: false,
        needs_owner_approval: true,
        message: 'This customer is not added for credit yet.',
        available_credit: 0,
      };
    }

    const creditLimit = Number(account.credit_limit || 0);
    const currentBalance = Number(account.current_balance || 0);
    const availableCredit = Math.max(0, creditLimit - currentBalance);

    if (account.status !== 'approved') {
      return {
        status: account.status,
        can_use_credit: false,
        needs_owner_approval: account.status !== 'blocked',
        message:
          account.status === 'blocked'
            ? 'Credit is blocked for this customer.'
            : 'Owner approval is needed before giving credit.',
        available_credit: availableCredit,
      };
    }

    if (amount > 0 && amount > availableCredit) {
      return {
        status: 'over_limit',
        can_use_credit: false,
        needs_owner_approval: true,
        message: `Credit limit exceeded. Available credit is ${availableCredit}.`,
        available_credit: availableCredit,
      };
    }

    return {
      status: 'approved',
      can_use_credit: true,
      needs_owner_approval: false,
      message: `Credit allowed. Available credit is ${availableCredit}.`,
      available_credit: availableCredit,
    };
  }

  private async findRecentAiOrder(ctx: any, product: any) {
    const db: any = this.prisma;
    return db.orders
      .findFirst({
        where: {
          business_id: ctx.businessId,
          lead_id: ctx.lead?.lead_id,
          source: 'whatsapp_ai',
          created_at: { gte: new Date(Date.now() - 2 * 60 * 1000) },
          order_items: {
            some: {
              product_id: product.product_id,
              variant_id: product.variant_id || null,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })
      .catch(() => null);
  }

  private buildProductSearchResponse(products: any[], generic: boolean) {
    if (!products.length) {
      return 'I could not find active products in this store yet. The owner can add products from Store Setup.';
    }

    const lines = products.slice(0, 5).map((product, index) => {
      const stock =
        product.available_stock > 0
          ? `${product.available_stock} in stock`
          : 'out of stock';
      return `${index + 1}. ${this.productLabel(product)} - Rs ${product.price} (${stock})`;
    });

    const intro = generic
      ? 'Here are some available products:'
      : 'I found these matching products:';

    return `${intro}\n${lines.join('\n')}\nReply with product name and quantity to hold or order.`;
  }

  private async rewriteWithGemini(ctx: any, text: string, fallback: string, facts: any) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) return fallback;

    const model =
      this.configService.get<string>('GEMINI_MODEL') ||
      this.configService.get<string>('ai.gemini.models.chat') ||
      'gemini-pro';
    const baseUrl =
      this.configService.get<string>('GEMINI_BASE_URL') ||
      'https://generativelanguage.googleapis.com/v1beta';

    const prompt = [
      `You are the Sales AI for ${ctx.business.business_name}.`,
      'Rewrite the seller response as a short WhatsApp reply.',
      'Never add a product, price, stock, discount, credit, refund, or promise not present in the facts.',
      'Keep the same meaning and keep it under 80 words.',
      `Customer message: ${text}`,
      `Facts: ${JSON.stringify(facts)}`,
      `Seller response to rewrite: ${fallback}`,
    ].join('\n');

    try {
      const response = await fetch(
        `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 220,
              topP: 0.8,
            },
          }),
        },
      );

      if (!response.ok) {
        this.logger.warn(`Gemini rewrite skipped: ${response.status}`);
        return fallback;
      }

      const data = await response.json();
      const textParts = data?.candidates?.[0]?.content?.parts || [];
      const rewritten = textParts
        .map((part) => part.text)
        .filter(Boolean)
        .join('')
        .trim();

      return rewritten || fallback;
    } catch (error) {
      this.logger.warn(`Gemini rewrite failed: ${error.message}`);
      return fallback;
    }
  }

  private async safeAudit(ctx: any, input: any) {
    const db: any = this.prisma;
    await db.seller_ai_audit_logs
      .create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          ai_employee_key: 'sales_ai',
          action: input.action,
          customer_phone: input.customerPhone,
          risk_level: input.decision?.includes('owner') ? 'medium' : 'low',
          confidence: input.confidence,
          decision: input.decision,
          input_summary: input.input,
          output_summary: input.output,
          metadata: input.metadata,
        },
      })
      .catch((error) =>
        this.logger.warn(`Product AI audit skipped: ${error.message}`),
      );
  }

  private async recordDemandSignal(
    ctx: any,
    product: any,
    signalType: string,
    quantity = 1,
    customerPhone?: string,
    metadata?: Record<string, unknown>,
  ) {
    const db: any = this.prisma;
    await db.seller_demand_signals
      .create({
        data: {
          business_id: ctx.businessId,
          tenant_id: ctx.tenantId,
          product_id: product.product_id,
          category: product.category,
          customer_phone: this.cleanPhone(customerPhone),
          signal_type: signalType,
          channel: 'whatsapp',
          quantity: Math.max(1, Number(quantity || 1)),
          metadata: {
            product_name: this.productLabel(product),
            ...metadata,
          },
        },
      })
      .catch((error) =>
        this.logger.warn(`Product AI demand signal skipped: ${error.message}`),
      );
  }

  private publicProduct(product: any) {
    return {
      product_id: product.product_id,
      variant_id: product.variant_id,
      name: this.productLabel(product),
      category: product.category,
      price: Number(product.price || 0),
      available_stock: Number(product.available_stock || 0),
      currency: product.currency || 'INR',
      in_stock: Number(product.available_stock || 0) > 0,
    };
  }

  private productLabel(product: any) {
    return [product.name, product.variant_name].filter(Boolean).join(' - ');
  }

  private normalize(value: string) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanPhone(phone?: string) {
    return phone ? String(phone).replace(/[^\d+]/g, '') : undefined;
  }

  private creditEnabled(settings: any) {
    const storeType = settings?.store_type || 'product_seller';
    const explicitCredit =
      settings?.credit_defaults?.enabled ?? settings?.ai_guardrails?.credit_enabled;
    return explicitCredit !== undefined
      ? Boolean(explicitCredit)
      : storeType !== 'online_seller';
  }
}
