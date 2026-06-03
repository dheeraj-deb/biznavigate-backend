import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppApiClientService } from './infrastructure/whatsapp-api-client.service';
import { CircuitBreakerService } from './infrastructure/circuit-breaker.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { KafkaConsumerService } from '../kafka/kafka-consumer.service';
import { ConversationStateService } from './services/conversation-state.service';
import { SendWhatsAppMessageDto, SendMessageType, InteractiveSendType } from './dto/whatsapp-message.dto';
import * as crypto from 'crypto';
import { WhatsAppCatalogOrderService } from './services/whatsapp-catalog-order.service';
import { ConversationService } from '../conversation/conversation.service';
import { AiRouterService } from '../ai-router/ai-router.service';

interface PendingContext {
  messageId: string;
  conversationId: string;
  from: string;
  to: string;
  businessId: string;
  tenantId: string;
  type: 'text' | 'interactive' | 'media';
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly pendingMessages = new Map<string, PendingContext>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiClient: WhatsAppApiClientService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly conversationState: ConversationStateService,
    private readonly configService: ConfigService,
    private readonly catalogOrderService: WhatsAppCatalogOrderService,
    private readonly conversationService: ConversationService,
    private readonly aiRouter: AiRouterService,
  ) { }


  /**
   * Connect WhatsApp account to business
   */
  async connectWhatsAppAccount(
    whatsappBusinessAccountId: string,
    phoneNumberId: string,
    accessToken: string,
    businessId: string,
  ): Promise<any> {
    try {
      const business = await this.prisma.businesses.findUnique({
        where: { business_id: businessId },
      });

      if (!business) {
        throw new NotFoundException('Business not found');
      }

      const phoneDetails = await this.circuitBreaker.execute(
        `whatsapp-phone-details-${phoneNumberId}`,
        () => this.apiClient.getPhoneNumberDetails(phoneNumberId, accessToken),
      );

      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 60);

      const account = await this.prisma.social_accounts.create({
        data: {
          business_id: businessId,
          platform: 'whatsapp',
          platform_user_id: phoneDetails.id,
          username: phoneDetails.display_phone_number,
          page_id: phoneNumberId,
          access_token: this.encryptToken(accessToken),
          token_expiry: tokenExpiry,
          instagram_business_account_id: whatsappBusinessAccountId,
          is_active: true,
        },
      });

      this.logger.log(`WhatsApp account ${phoneDetails.display_phone_number} connected for business ${businessId}`);

      return {
        accountId: account.account_id,
        phoneNumber: phoneDetails.display_phone_number,
        verifiedName: phoneDetails.verified_name,
        qualityRating: phoneDetails.quality_rating,
      };
    } catch (error) {
      this.logger.error('Failed to connect WhatsApp account:', error);
      throw error;
    }
  }

  /**
   * Get all WhatsApp accounts for a business
   */
  async getWhatsAppAccounts(businessId: string): Promise<any[]> {
    const accounts = await this.prisma.social_accounts.findMany({
      where: { business_id: businessId, platform: 'whatsapp', is_active: true },
      select: {
        account_id: true,
        username: true,
        page_id: true,
        instagram_business_account_id: true,
        is_active: true,
        created_at: true,
      },
    });

    return accounts.map(acc => ({
      ...acc,
      phone_number_id: acc.page_id,
      whatsapp_business_account_id: acc.instagram_business_account_id,
    }));
  }

  /**
   * Disconnect WhatsApp account
   */
  async disconnectAccount(accountId: string, businessId: string): Promise<void> {
    const account = await this.prisma.social_accounts.findFirst({
      where: { account_id: accountId, business_id: businessId, platform: 'whatsapp' },
    });

    if (!account) {
      throw new NotFoundException('WhatsApp account not found');
    }

    await this.prisma.social_accounts.update({
      where: { account_id: accountId },
      data: { is_active: false },
    });

    this.logger.log(`WhatsApp account ${accountId} disconnected`);
  }

  /**
   * Handle incoming message webhook
   */
  async handleMessageWebhook(message: any, metadata: any, contacts: any[]): Promise<void> {
    try {
      const phoneNumberId = metadata.phone_number_id;
      const from = message.from;
      const messageId = message.id;

      // 🕐 STALE MESSAGE CHECK: Skip messages older than 5 minutes (Meta replays queued webhooks on restart)
      const messageTimestampMs = parseInt(message.timestamp) * 1000;
      const ageMs = Date.now() - messageTimestampMs;
      if (ageMs > 5 * 60 * 1000) {
        this.logger.warn(`⏭️ Skipping stale message ${messageId} (${Math.round(ageMs / 60000)}min old)`);
        return;
      }

      // 🔒 DEDUPLICATION: Check if this message has already been processed
      const existingMessage = await this.conversationService.findMessageByPlatformId(messageId);
      if (existingMessage) {
        this.logger.debug(`⏭️ Message ${messageId} already processed, skipping duplicate`);
        return;
      }

      // Find business by phone number ID
      const account = await this.prisma.social_accounts.findFirst({
        where: { platform: 'whatsapp', page_id: phoneNumberId, is_active: true },
        include: { businesses: true },
      });

      if (!account) {
        this.logger.warn(`No active WhatsApp account found for phone number ID: ${phoneNumberId}`);
        return;
      }

      // Extract contact info
      const contact = contacts?.find(c => c.wa_id === from);
      const contactName = contact?.profile?.name || from;

      let customer = await this.prisma.customers.findFirst({
        where: { business_id: account.business_id, platform_user_id: from }
      })

      if (!customer) {
        await this.prisma.customers.create({
          data: {
            business_id: account.business_id,
            tenant_id: account.businesses.tenant_id,
            name: contactName,
            platform_user_id: from,
            whatsapp_number: from,
            phone: from
          }
        })
      }

      let lead = await this.prisma.leads.findFirst({
        where: { business_id: account.business_id, platform_user_id: from, source: 'whatsapp' },
      });

      if (!lead) {
        const nameParts = contactName.split(' ');
        lead = await this.prisma.leads.create({
          data: {
            business_id: account.business_id,
            tenant_id: account.businesses.tenant_id,
            source: 'whatsapp',
            platform_user_id: from,
            first_name: nameParts[0] || contactName,
            last_name: nameParts.slice(1).join(' ') || null,
            phone: from,
            status: 'new',
            lead_score: 5,
          },
        });
        this.logger.log(`New lead created from WhatsApp: ${lead.lead_id}`);
      }

      // Extract message content
      let messageText = '';
      let messageType = message.type;
      let mediaData: any = null;

      console.log('message.type==>', message.type);

      switch (message.type) {
        case 'text':
          messageText = message.text?.body || '';
          break;
        case 'image':
        case 'video':
        case 'audio':
        case 'document':
          mediaData = message[message.type];
          messageText = mediaData?.caption || `[${message.type}]`;
          break;
        case 'location':
          messageText = `Location: ${message.location?.latitude}, ${message.location?.longitude}`;
          break;
        case 'interactive':
          if (message.interactive?.type === 'button_reply') {
            messageText = message.interactive.button_reply?.title || '';
            (message as any).buttonId = message.interactive.button_reply?.id;
          } else if (message.interactive?.type === 'list_reply') {
            messageText = message.interactive.list_reply?.title || '';
            (message as any).buttonId = message.interactive.list_reply?.id;
          }
          break;
        case 'order':
          await this.catalogOrderService.handleCatalogOrder(message, metadata, contacts);
          return;
        case 'reaction':
          messageText = `Reacted with ${message.reaction?.emoji || 'removed reaction'}`;
          break;
        default:
          messageText = `[Unsupported message type: ${message.type}]`;
      }

      const entryContext = this.buildCustomerEntryContext(message, messageText);
      if (entryContext) {
        lead = await this.attachEntryContextToLead(lead, entryContext);
      }

      let conversation = await this.conversationService.findActiveConversation(lead.lead_id, 'whatsapp');

      if (!conversation) {
        conversation = await this.conversationService.createConversation({
          conversation_id: crypto.randomUUID(),
          lead_id: lead.lead_id,
          customer_id: from,
          business_id: account.business_id,
          tenant_id: account.businesses.tenant_id,
          channel: 'whatsapp',
          status: 'active',
          sender_id: phoneNumberId,
          sender_name: contactName,
        });
      }

      // Look up the current waiting workflow node (if any) to tag this inbound message
      const waitingExecution = await this.prisma.workflow_executions.findFirst({
        where: { lead_id: lead.lead_id, waiting_for_input: true, channel: 'whatsapp' },
        select: { current_node_id: true },
      });

      // Store inbound message in MongoDB — unique index on platform_message_id prevents duplicates atomically
      let leadMessage: any;
      try {
        leadMessage = await this.conversationService.createMessage({
          conversation_id: conversation.conversation_id,
          lead_id: lead.lead_id,
          business_id: account.business_id,
          tenant_id: account.businesses.tenant_id,
          sender_type: 'lead',
          sender_id: phoneNumberId,
          sender_name: contactName,
          message_text: messageText,
          message_type: messageType,
          message_response_based_on_type: messageType === "interactive" ? message.buttonId : null,
          platform_message_id: messageId,
          delivery_status: 'received',
          workflow_node_id: waitingExecution?.current_node_id ?? undefined,
        });
      } catch (err: any) {
        if (err?.code === 11000) {
          // Duplicate key — Meta sent the same webhook twice, skip
          this.logger.debug(`⏭️ Duplicate insert for message ${messageId}, skipping`);
          return;
        }
        throw err;
      }

      const leadMessageId = (leadMessage._id as any).toString();

      // Mark as read + show typing indicator while AI processes
      const accessToken = this.decryptToken(account.access_token);
      await this.circuitBreaker.execute(
        `whatsapp-mark-read-${phoneNumberId}`,
        () => this.apiClient.markAsRead(phoneNumberId, accessToken, messageId),
      );

      const aiRoute = this.aiRouter.routeForBusiness(account.businesses.business_type);

      // Get conversation history for context continuity from MongoDB
      const conversationHistory = await this.getConversationHistory(conversation.conversation_id, 10);
      const productSellerContext = this.aiRouter.isProductSellerRoute(aiRoute)
        ? await this.getProductSellerContext(account.business_id)
        : null;

      if (productSellerContext && messageText) {
        await this.recordProductSellerDemand(
          account.business_id,
          account.businesses.tenant_id,
          from,
          messageText,
        );
      }

      // Check if message is interactive (button/list reply)
      if (messageType === 'interactive' && (message as any).buttonId) {
        this.logger.log(`📲 Interactive message detected, bypassing AI processing`);

        const buttonId = (message as any).buttonId;

        const workflowContext = {
          lead_id: lead.lead_id,
          business_id: account.business_id,
          tenant_id: account.businesses.tenant_id,
          processing_id: `interactive-${messageId}`,
          user_input: buttonId,
          intent: {
            intent: 'INTERACTIVE_SELECTION',
            confidence: 1.0,
            suggested_actions: [],
            method: 'interactive' as const,
            processing_time_ms: 0,
            cached: false,
          },
          entities: {},
          structured_data: {
            type: 'interactive_selection',
            entities: {
              selection_id: [buttonId],
              selection_text: [messageText],
            },
          },
          suggested_actions: [],
          suggested_response: null,
          processing_time_ms: 0,
          context: {
            message_id: leadMessageId,
            conversation_id: conversation.conversation_id,
            channel: 'whatsapp' as const,
            contactName,
            phoneNumberId,
            from,
            business_name: account.businesses.business_name,
            entry_context: entryContext,
            ...aiRoute.context_flags,
            product_seller: productSellerContext,
            lead_info: {
              lead_id: lead.lead_id,
              first_name: lead.first_name,
              last_name: lead.last_name,
              status: lead.status,
              lead_score: lead.lead_score,
              entry_context: entryContext,
            },
            interactive_selection: buttonId,
            message_type: messageType,
          },
        };

        await this.kafkaProducer.publishInteractiveSelection(workflowContext);

      } else {
        await this.kafkaProducer.requestAiProcessing({
          lead_id: lead.lead_id,
          business_id: account.business_id,
          text: messageText,
          business_type: aiRoute.request_business_type,
          conversation_history: conversationHistory,
          context: {
            message_id: leadMessageId,
            conversation_id: conversation.conversation_id,
            channel: 'whatsapp',
            contactName,
            phoneNumberId,
            from,
            business_name: account.businesses.business_name,
            entry_context: entryContext,
            ...aiRoute.context_flags,
            product_seller: productSellerContext,
            lead_info: {
              lead_id: lead.lead_id,
              first_name: lead.first_name,
              last_name: lead.last_name,
              status: lead.status,
              lead_score: lead.lead_score,
              entry_context: entryContext,
            },
            interactive_selection: (message as any).buttonId,
            message_type: messageType,
          },
          priority: 'normal',
        });
      }

      // Store pending context for AI response
      this.pendingMessages.set(leadMessageId, {
        messageId: leadMessageId,
        conversationId: conversation.conversation_id,
        from: phoneNumberId,
        to: from,
        businessId: account.business_id,
        tenantId: account.businesses.tenant_id,
        type: messageType,
      });

      // Auto-cleanup after 10 minutes
      setTimeout(() => {
        this.pendingMessages.delete(leadMessageId);
      }, 600000);

    } catch (error) {
      this.logger.error('Error processing WhatsApp message webhook:', error);
    }
  }

  /**
   * Handle status update webhook (sent, delivered, read, failed)
   */
  async handleStatusWebhook(status: any): Promise<void> {
    try {
      const messageId = status.id;
      const statusType = status.status;

      this.logger.log(`📊 Message ${messageId} status: ${statusType}`);

      const deliveryStatusMap: Record<string, string> = {
        sent: 'sent',
        delivered: 'delivered',
        read: 'read',
        failed: 'failed',
      };

      const timestamp = new Date(parseInt(status.timestamp) * 1000);

      const updateData: any = {
        delivery_status: deliveryStatusMap[statusType] || statusType,
      };

      if (statusType === 'delivered') {
        updateData.delivered_at = timestamp;
      } else if (statusType === 'read') {
        updateData.read_at = timestamp;
      } else if (statusType === 'failed') {
        updateData.failed_reason = status.errors?.[0]?.message || 'Unknown error';
      }

      // Update message status in MongoDB
      await this.conversationService.updateMessageStatus(messageId, updateData);

      if (status.errors && status.errors.length > 0) {
        this.logger.error(`Message ${messageId} failed:`, status.errors);
      }

    } catch (error) {
      this.logger.error('Error processing status webhook:', error);
    }
  }

  /**
   * Send message via WhatsApp
   */
  async sendMessage(
    phoneNumberId: string,
    to: string,
    message: SendWhatsAppMessageDto,
    nodeId?: string,
  ): Promise<any> {
    try {
      const account = await this.prisma.social_accounts.findFirst({
        where: { page_id: phoneNumberId, platform: 'whatsapp', is_active: true },
        include: { businesses: true },
      });

      if (!account) {
        throw new NotFoundException('WhatsApp account not found');
      }

      const messageText = this.extractMessageText(message);
      const accessToken = this.decryptToken(account.access_token);

      this.logger.log('Sending message via WhatsApp Business API');
      const result = await this.circuitBreaker.execute(
        `whatsapp-send-${phoneNumberId}`,
        () => this.apiClient.sendMessage(phoneNumberId, accessToken, message),
      );

      // Find lead (stays in Postgres)
      const lead = await this.prisma.leads.findFirst({
        where: { business_id: account.business_id, platform_user_id: to, source: 'whatsapp' },
      });

      // Extract message ID from WhatsApp API response (format: { messages: [{id: "wamid..."}] })
      const platformMessageId = result?.messages?.[0]?.id;

      // Persist outbound message in MongoDB
      if (lead && platformMessageId) {
        let conversation = await this.conversationService.findActiveConversation(lead.lead_id, 'whatsapp');

        if (!conversation) {
          conversation = await this.conversationService.createConversation({
            conversation_id: crypto.randomUUID(),
            lead_id: lead.lead_id,
            customer_id: to,
            business_id: account.business_id,
            tenant_id: account.businesses.tenant_id,
            channel: 'whatsapp',
            status: 'active',
            sender_id: phoneNumberId,
          });
        }

        await this.conversationService.createMessage({
          conversation_id: conversation.conversation_id,
          lead_id: lead.lead_id,
          business_id: account.business_id,
          tenant_id: account.businesses.tenant_id,
          sender_type: 'business',
          sender_id: phoneNumberId,
          message_text: messageText,
          message_type: message.type,
          platform_message_id: platformMessageId,
          delivery_status: 'sent',
          workflow_node_id: nodeId,
        });
      }

      return {
        success: true,
        messages: platformMessageId ? [{ id: platformMessageId }] : [],
        ...result,
      };
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Get conversation history for context continuity (reads from MongoDB)
   */
  private async getConversationHistory(conversationId: string, limit: number = 10): Promise<any[]> {
    try {
      const messages = await this.conversationService.getConversationHistory(conversationId, limit);
      return messages.map(msg => ({
        role: msg.sender_type === 'lead' ? 'user' : 'assistant',
        content: msg.message_text,
        timestamp: msg.timestamp,
        message_type: msg.message_type,
      }));
    } catch (error) {
      this.logger.error('Failed to get conversation history:', error);
      return [];
    }
  }

  private async getProductSellerContext(businessId: string): Promise<any> {
    try {
      const db = this.prisma as any;
      const [settings, products] = await Promise.all([
        db.seller_store_settings.findUnique({ where: { business_id: businessId } }),
        this.prisma.products.findMany({
          where: {
            business_id: businessId,
            product_type: 'physical',
            is_active: true,
          },
          orderBy: [{ in_stock: 'desc' }, { updated_at: 'desc' }],
          take: 12,
          select: {
            product_id: true,
            name: true,
            category: true,
            price: true,
            stock_quantity: true,
            reserved_stock: true,
            in_stock: true,
          },
        }),
      ]);

      return {
        mode: 'product_seller',
        stock_hold_minutes: settings?.stock_hold_minutes ?? 15,
        low_stock_threshold: settings?.low_stock_threshold ?? 5,
        payment_modes: settings?.payment_modes ?? ['cash', 'upi', 'cod'],
        delivery_modes: settings?.delivery_modes ?? ['pickup', 'local_delivery'],
        guardrails: settings?.ai_guardrails ?? {
          block_negative_stock: true,
          block_unapproved_credit: true,
        },
        products: products.map((product) => ({
          product_id: product.product_id,
          name: product.name,
          category: product.category,
          price: Number(product.price || 0),
          available_stock: Math.max(0, Number(product.stock_quantity || 0) - Number(product.reserved_stock || 0)),
          in_stock: product.in_stock,
        })),
      };
    } catch (error) {
      this.logger.warn(`Product seller context unavailable: ${error.message}`);
      return null;
    }
  }

  private buildCustomerEntryContext(message: any, messageText: string): any | null {
    const referral = message?.referral || message?.context?.referral;
    const referredProduct = message?.context?.referred_product || message?.referred_product;
    const textUrl = this.extractFirstUrl(messageText);
    const urlContext = textUrl ? this.parseEntryUrl(textUrl) : null;
    const inferredEntrySource = this.inferEntrySourceFromText(messageText);

    if (!referral && !referredProduct && !urlContext && !inferredEntrySource) {
      return null;
    }

    const entryContext: any = {
      source_channel: referral ? 'meta_ad' : inferredEntrySource || urlContext?.source_channel || 'unknown',
      captured_at: new Date().toISOString(),
      first_customer_text: String(messageText || '').slice(0, 300),
    };

    if (referral) {
      Object.assign(entryContext, {
        source_channel: 'meta_ad',
        source_type: referral.source_type,
        source_id: referral.source_id,
        source_url: referral.source_url,
        headline: referral.headline,
        body: referral.body,
        media_type: referral.media_type,
        image_url: referral.image_url,
        video_url: referral.video_url,
        thumbnail_url: referral.thumbnail_url,
        ctwa_clid: referral.ctwa_clid,
      });
    }

    if (referredProduct) {
      Object.assign(entryContext, {
        source_channel: entryContext.source_channel === 'unknown' ? 'whatsapp_catalog' : entryContext.source_channel,
        catalog_id: referredProduct.catalog_id,
        product_retailer_id: referredProduct.product_retailer_id,
      });
    }

    if (urlContext) {
      Object.assign(entryContext, {
        ...urlContext,
        source_channel: entryContext.source_channel === 'unknown'
          ? urlContext.source_channel
          : entryContext.source_channel,
      });
    }

    const productHint =
      this.cleanEntryHint(referredProduct?.product_retailer_id) ||
      this.cleanEntryHint(urlContext?.product_hint) ||
      this.cleanEntryHint(referral?.headline) ||
      this.cleanEntryHint(this.extractProductHintFromEntryText(messageText)) ||
      this.cleanEntryHint(referral?.body) ||
      this.cleanEntryHint(urlContext?.path_hint);

    if (productHint) entryContext.product_hint = productHint;
    if (urlContext?.category_hint) entryContext.category_hint = urlContext.category_hint;
    if (urlContext?.sku_hint) entryContext.sku_hint = urlContext.sku_hint;

    return this.removeEmptyValues(entryContext);
  }

  private async attachEntryContextToLead(lead: any, entryContext: any): Promise<any> {
    const customFields = this.asObject(lead.custom_fields);
    const extractedEntities = this.asObject(lead.extracted_entities);
    const previousHistory = Array.isArray(customFields.entry_context_history)
      ? customFields.entry_context_history
      : [];

    const data: any = {
      custom_fields: {
        ...customFields,
        last_entry_context: entryContext,
        entry_context_history: [entryContext, ...previousHistory].slice(0, 5),
      },
      extracted_entities: this.removeEmptyValues({
        ...extractedEntities,
        entry_context: entryContext,
        product_name: extractedEntities.product_name || entryContext.product_hint,
        item_name: extractedEntities.item_name || entryContext.product_hint,
        category: extractedEntities.category || entryContext.category_hint,
      }),
      referral_source: entryContext.source_channel || lead.referral_source,
      source_reference_id:
        entryContext.source_id ||
        entryContext.ctwa_clid ||
        entryContext.product_retailer_id ||
        lead.source_reference_id,
      utm_source: entryContext.utm_source || lead.utm_source,
      utm_medium: entryContext.utm_medium || lead.utm_medium,
      utm_campaign: entryContext.utm_campaign || lead.utm_campaign,
      updated_at: new Date(),
    };

    if (entryContext.source_type === 'post' && entryContext.source_id) {
      data.post_id = entryContext.source_id;
    }

    try {
      return await this.prisma.leads.update({
        where: { lead_id: lead.lead_id },
        data,
      });
    } catch (error) {
      this.logger.warn(`Lead entry context update skipped: ${error.message}`);
      return lead;
    }
  }

  private parseEntryUrl(rawUrl: string): any | null {
    try {
      const url = new URL(rawUrl);
      const params = url.searchParams;
      const sourceChannel =
        params.get('utm_source') ||
        this.inferEntrySourceFromHost(url.hostname) ||
        'website';

      const productHint =
        params.get('product') ||
        params.get('product_name') ||
        params.get('item') ||
        params.get('q') ||
        this.humanizePathSegment(url.pathname);

      return this.removeEmptyValues({
        source_channel: sourceChannel,
        source_url: rawUrl,
        landing_host: url.hostname,
        landing_path: url.pathname,
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        product_id: params.get('product_id') || params.get('pid'),
        product_hint: this.cleanEntryHint(productHint),
        sku_hint: params.get('sku'),
        category_hint: params.get('category'),
        path_hint: this.humanizePathSegment(url.pathname),
      });
    } catch {
      return null;
    }
  }

  private extractFirstUrl(text: string): string | null {
    const match = String(text || '').match(/https?:\/\/[^\s]+/i);
    return match?.[0]?.replace(/[),.]+$/, '') || null;
  }

  private inferEntrySourceFromHost(host: string): string | null {
    const normalized = String(host || '').toLowerCase();
    if (normalized.includes('instagram')) return 'instagram';
    if (normalized.includes('facebook') || normalized.includes('fb.')) return 'facebook';
    if (normalized.includes('youtube') || normalized.includes('youtu.be')) return 'youtube';
    if (normalized.includes('wa.me') || normalized.includes('whatsapp')) return 'whatsapp_link';
    return null;
  }

  private inferEntrySourceFromText(text: string): string | null {
    const value = String(text || '').toLowerCase();
    if (!value) return null;
    if (/\b(instagram|insta|reel|story)\b/.test(value)) return 'instagram';
    if (/\b(facebook|fb|ad|advertisement|sponsored)\b/.test(value)) return 'facebook';
    if (/\b(website|site|landing page|online)\b/.test(value)) return 'website';
    if (/\b(youtube|video)\b/.test(value)) return 'youtube';
    return null;
  }

  private extractProductHintFromEntryText(text: string): string | null {
    const value = String(text || '').trim();
    const patterns = [
      /\b(?:interested in|enquiring about|asking about|details for|price for|saw|seen|ad for)\s+(.{3,80})/i,
      /\b(?:from|on)\s+(?:instagram|facebook|website|ad|reel|post|story)\s+(?:for|about)?\s*(.{3,80})/i,
    ];

    for (const pattern of patterns) {
      const match = value.match(pattern);
      const hint = this.cleanEntryHint(match?.[1]);
      if (hint) return hint;
    }

    return null;
  }

  private humanizePathSegment(pathname: string): string | null {
    const parts = String(pathname || '')
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last || /^[a-f0-9-]{16,}$/i.test(last)) return null;
    return this.cleanEntryHint(last.replace(/[-_]+/g, ' '));
  }

  private cleanEntryHint(value?: string | null): string | null {
    const cleaned = String(value || '')
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/[^\w\s.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned || cleaned.length < 3) return null;
    return cleaned.slice(0, 120);
  }

  private removeEmptyValues(value: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ''),
    );
  }

  private asObject(value: any): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  private async recordProductSellerDemand(
    businessId: string,
    tenantId: string,
    phone: string,
    messageText: string,
  ): Promise<void> {
    try {
      const db = this.prisma as any;
      await db.seller_demand_signals.create({
        data: {
          business_id: businessId,
          tenant_id: tenantId,
          customer_phone: phone,
          signal_type: 'whatsapp_message',
          channel: 'whatsapp',
          quantity: 1,
          metadata: {
            text: messageText.slice(0, 500),
          },
        },
      });
    } catch (error) {
      this.logger.warn(`Product demand signal skipped: ${error.message}`);
    }
  }

  /**
   * Send interactive button message
   */
  async sendButtonMessage(
    phoneNumberId: string,
    to: string,
    bodyText: string,
    buttons: { id: string; title: string }[],
    headerText?: string,
    footerText?: string,
    nodeId?: string,
  ): Promise<any> {
    const message: SendWhatsAppMessageDto = {
      messaging_product: 'whatsapp',
      to,
      type: SendMessageType.INTERACTIVE,
      interactive: {
        type: InteractiveSendType.BUTTON,
        body: { text: bodyText },
        action: {
          buttons: buttons.map(btn => ({ type: 'reply', reply: btn })),
        },
      },
    };

    if (headerText) {
      message.interactive!.header = { type: 'text', text: headerText };
    }
    if (footerText) {
      message.interactive!.footer = { text: footerText };
    }

    return this.sendMessage(phoneNumberId, to, message, nodeId);
  }

  /**
   * Send list message
   */
  async sendListMessage(
    phoneNumberId: string,
    to: string,
    bodyText: string,
    buttonText: string,
    sections: { title: string; rows: { id: string; title: string; description?: string }[] }[],
    headerText?: string,
    footerText?: string,
    nodeId?: string,
  ): Promise<any> {
    const message: SendWhatsAppMessageDto = {
      messaging_product: 'whatsapp',
      to,
      type: SendMessageType.INTERACTIVE,
      interactive: {
        type: InteractiveSendType.LIST,
        body: { text: bodyText },
        action: { button: buttonText, sections },
      },
    };

    if (headerText) {
      message.interactive!.header = { type: 'text', text: headerText };
    }
    if (footerText) {
      message.interactive!.footer = { text: footerText };
    }

    return this.sendMessage(phoneNumberId, to, message, nodeId);
  }

  /**
   * Close a conversation
   */
  async closeConversation(conversationId: string): Promise<void> {
    try {
      await this.conversationService.updateConversation(conversationId, { status: 'ended' });
      this.logger.log(`Conversation ${conversationId} closed`);
    } catch (error) {
      this.logger.error('Failed to close conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation summary statistics
   */
  async getConversationStats(conversationId: string): Promise<any> {
    try {
      const [conversation, messageCount, { first: firstMessage, last: lastMessage }] = await Promise.all([
        this.conversationService.findConversationById(conversationId),
        this.conversationService.countMessages(conversationId),
        this.conversationService.getFirstAndLastMessage(conversationId),
      ]);

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Lead info still fetched from Postgres
      const lead = await this.prisma.leads.findUnique({
        where: { lead_id: conversation.lead_id },
        select: { first_name: true, last_name: true },
      });

      const duration = firstMessage && lastMessage
        ? new Date(lastMessage.timestamp).getTime() - new Date(firstMessage.timestamp).getTime()
        : 0;

      return {
        conversation_id: conversationId,
        lead_name: `${lead?.first_name || ''} ${lead?.last_name || ''}`.trim(),
        channel: conversation.channel,
        status: conversation.status,
        message_count: messageCount,
        started_at: (conversation as any).created_at,
        last_message_at: lastMessage?.timestamp,
        duration_ms: duration,
        duration_minutes: Math.round(duration / 60000),
      };
    } catch (error) {
      this.logger.error('Failed to get conversation stats:', error);
      throw error;
    }
  }

  /**
   * Extract message text from send message DTO
   */
  private extractMessageText(message: SendWhatsAppMessageDto): string {
    if (message.text) return message.text.body;
    if (message.template) return `Template: ${message.template.name}`;
    if (message.interactive) return message.interactive.body.text;
    return `[${message.type}]`;
  }

  /**
   * Encrypt access token
   */
  private encryptToken(token: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const encryptionKey = this.configService.get<string>('encryption.key');
      if (!encryptionKey) throw new Error('ENCRYPTION_KEY not configured.');
      const key = Buffer.from(encryptionKey, 'hex');
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(token, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Failed to encrypt token:', error);
      throw new BadRequestException('Token encryption failed. Please check server configuration.');
    }
  }

  /**
   * Decrypt access token
   */
  private decryptToken(encryptedToken: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const encryptionKey = this.configService.get<string>('encryption.key');
      if (!encryptionKey) throw new Error('ENCRYPTION_KEY not configured.');
      if (!encryptedToken || !encryptedToken.includes(':')) throw new Error('Invalid encrypted token format');
      const key = Buffer.from(encryptionKey, 'hex');
      const parts = encryptedToken.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt token:', error);
      throw new BadRequestException('Token decryption failed. The stored token may be corrupted or the encryption key has changed.');
    }
  }
}
