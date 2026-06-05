import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { WhatsAppApiClientService } from '../infrastructure/whatsapp-api-client.service';
import { CircuitBreakerService } from '../infrastructure/circuit-breaker.service';
import { SendWhatsAppMessageDto, SendMessageType, InteractiveSendType } from '../dto/whatsapp-message.dto';
import { WhatsAppCatalogOrderService } from './catalog/whatsapp-catalog-order.service';
import { ConversationService } from '../../../crm/conversation/conversation.service';
import { WhatsAppWebhookDto } from '../dto/webhook-event.dto';
import { WhatsAppTemplatesService } from '../../whatsapp-templates/whatsapp-templates.service';
import { TemplateStatus } from '../../whatsapp-templates/enums/template.enum';
import { GupshupOnboardingService } from '../../gupshup/gupshup-onboarding.service';
import { AutomationRouter } from './inbound/automation-router.service';
import { ContactResolutionService } from './inbound/contact-resolution.service';
import { ConversationCommandService } from './inbound/conversation-command.service';
import { WebhookIngestionService } from './inbound/webhook-ingestion.service';
import { WhatsAppOutboundCommandService } from './outbound/whatsapp-outbound-command.service';
import { WhatsAppProviderSendService } from './outbound/whatsapp-provider-send.service';
import { WhatsAppStatusCommandService } from './outbound/whatsapp-status-command.service';
import { WhatsAppMessageNormalizer } from './inbound/whatsapp-message-normalizer.service';
import { LeadCommandService } from '../../../crm/lead/application/services/lead-command.service';
import { PendingAgentActionService } from '../../../ai/agent/services/pending-agent-action.service';



@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiClient: WhatsAppApiClientService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly catalogOrderService: WhatsAppCatalogOrderService,
    private readonly conversationService: ConversationService,
    private readonly whatsappTemplatesService: WhatsAppTemplatesService,
    private readonly gupshupOnboarding: GupshupOnboardingService,
    private readonly webhookIngestionService: WebhookIngestionService,
    private readonly outboundCommandService: WhatsAppOutboundCommandService,
    private readonly providerSendService: WhatsAppProviderSendService,
    private readonly statusCommandService: WhatsAppStatusCommandService,
    private readonly messageNormalizer: WhatsAppMessageNormalizer,
    private readonly contactResolutionService: ContactResolutionService,
    private readonly conversationCommandService: ConversationCommandService,
    private readonly automationRouter: AutomationRouter,
    private readonly leadCommands: LeadCommandService,
    private readonly pendingActions: PendingAgentActionService,
  ) { }

  /**
   * Sends outbound WhatsApp messages through Gupshup only.
   */
  async sendViaAccount(
    account: { page_id: string; gupshup_app_id: string | null; username?: string | null },
    to: string,
    message: SendWhatsAppMessageDto,
  ): Promise<any> {
    return this.providerSendService.sendViaAccount(account, to, message);
  }


  async processWebhook(webhookData: WhatsAppWebhookDto): Promise<void> {
    try {
      console.log('Received WhatsApp webhook:', JSON.stringify(webhookData));
      await this.webhookIngestionService.processMetaWebhook(webhookData, {
        onMessage: (message, metadata, contacts) => this.handleMessageWebhook(message, metadata, contacts),
        onStatus: (status, metadata) => this.handleStatusWebhook(status, metadata),
      });
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
    }
  }

  /**
   * Handle inbound messages from Gupshup webhook.
   * Looks up the account by Gupshup app ID, then routes to handleMessageWebhook.
   */
  async handleGupshupInboundMessage(gupshupAppId: string, normalizedMessage: any, contacts: any[] = []): Promise<void> {
    const account = await this.prisma.social_accounts.findFirst({
      where: { gupshup_app_id: gupshupAppId, platform: 'whatsapp', is_active: true },
    });

    if (!account) {
      this.logger.warn(`[GupshupWebhook] No active account found for app ID ${gupshupAppId}`);
      return;
    }

    const metadata = { phone_number_id: account.page_id, display_phone_number: account.username };
    await this.handleMessageWebhook(normalizedMessage, metadata, contacts);
  }

  /**
   * Handle incoming message webhook
   */
  async handleMessageWebhook(message: any, metadata: any, contacts: any[]): Promise<void> {
    try {
      const phoneNumberId = metadata.phone_number_id;
      const normalizedMessage = this.messageNormalizer.normalize(message);

      

      // Skip messages older than 5 minutes (Meta replays queued webhooks on restart)
      const messageTimestampSeconds = Number.parseInt(normalizedMessage.timestamp ?? '', 10);
      const ageMs = Number.isFinite(messageTimestampSeconds)
        ? Date.now() - messageTimestampSeconds * 1000
        : 0;
      if (ageMs > 5 * 60 * 1000) {
        this.logger.warn(`Skipping stale message ${normalizedMessage.message_id} (${Math.round(ageMs / 60000)}min old)`);
        return;
      }

      if (normalizedMessage.is_catalog_order) {
        await this.catalogOrderService.handleCatalogOrder(message, metadata, contacts);
        return;
      }

      const resolved = await this.contactResolutionService.resolveForInboundMessage({
        phone_number_id: phoneNumberId,
        from: normalizedMessage.from,
        contacts,
      });
      if (!resolved) return;

      const persisted = await this.conversationCommandService.persistInboundMessage({
        account: resolved.account,
        lead: resolved.lead,
        contact_name: resolved.contact_name,
        phone_number_id: phoneNumberId,
        message: normalizedMessage,
      });
      if (!persisted) return;

      // Mark as read + typing indicator
      if (resolved.account.gupshup_app_id) {
        // Gupshup: use v1/event endpoint for read receipt + typing indicator
        setImmediate(async () => {
          const token = await this.gupshupOnboarding.getPartnerAppToken(resolved.account.gupshup_app_id).catch(() => null);
          if (token) {
            await this.apiClient.sendGupshupTypingIndicator(
              token,
              resolved.account.gupshup_app_id,
              normalizedMessage.message_id,
            );
          }
        });
      } else {
        await this.circuitBreaker.execute(
          `whatsapp-mark-read-${phoneNumberId}`,
          () => this.apiClient.markAsRead(phoneNumberId, normalizedMessage.message_id),
        );
      }

      const handledDeterministically = await this.handleDeterministicInbound({
        account: resolved.account,
        lead: resolved.lead,
        conversation: persisted.conversation,
        contact_name: resolved.contact_name,
        phone_number_id: phoneNumberId,
        message: normalizedMessage,
      });
      if (handledDeterministically) return;

      await this.automationRouter.routeInboundMessage({
        account: resolved.account,
        lead: resolved.lead,
        conversation: persisted.conversation,
        lead_message_id: persisted.lead_message_id,
        contact_name: resolved.contact_name,
        phone_number_id: phoneNumberId,
        message: normalizedMessage,
      });
    } catch (error) {
      this.logger.error('Error processing WhatsApp message webhook:', error);
    }
  }

  private async handleDeterministicInbound(params: {
    account: any;
    lead: any;
    conversation: any;
    contact_name: string;
    phone_number_id: string;
    message: ReturnType<WhatsAppMessageNormalizer['normalize']>;
  }): Promise<boolean> {
    const input = String(params.message.user_input ?? '').trim();
    const normalized = input.toLowerCase();
    const replyCtx = {
      conversationId: params.conversation.conversation_id,
      leadId: params.lead.lead_id,
      tenantId: params.account.businesses?.tenant_id ?? params.lead.tenant_id,
    };

    const pending = await this.pendingActions.getPending(params.conversation.conversation_id);
    if (pending) {
      const decision = this.pendingActions.parseDecision(input);
      if (!decision) {
        await this.sendButtonMessage(
          params.phone_number_id,
          params.message.from,
          `Please confirm: ${pending.displayText}?`,
          [
            { id: 'confirm_cancel', title: 'Confirm' },
            { id: 'keep_booking', title: 'Keep' },
          ],
          undefined,
          undefined,
        );
        return true;
      }

      const result = await this.pendingActions.resolvePending(params.conversation.conversation_id, decision);
      await this.sendAgentReply(
        params.account.business_id,
        params.phone_number_id,
        params.message.from,
        result.message,
        replyCtx,
      );
      return true;
    }

    if (normalized === 'help') {
      await this.sendAgentReply(
        params.account.business_id,
        params.phone_number_id,
        params.message.from,
        'I can help with bookings, orders, payments, or connecting you to the team. What do you need help with?',
        replyCtx,
      );
      return true;
    }

    if (normalized === 'cancel') {
      await this.sendAgentReply(
        params.account.business_id,
        params.phone_number_id,
        params.message.from,
        'What would you like to cancel? Please share the booking or order ID.',
        replyCtx,
      );
      return true;
    }

    if (normalized === 'stop') {
      await this.conversationService.updateConversation(params.conversation.conversation_id, {
        is_ai: false,
        is_ai_handled: false,
        status: 'handed_off',
        human_takeover_at: new Date(),
        human_takeover_reason: 'Customer sent STOP',
      });
      await this.sendAgentReply(
        params.account.business_id,
        params.phone_number_id,
        params.message.from,
        'Okay, automated replies are paused. Our team will help you from here.',
        replyCtx,
      );
      return true;
    }

    return false;
  }


  /**
   * Called by MessageDebounceProcessor to send an agent-generated reply.
   * Looks up the account for the business and handles token decryption internally.
   */
  async sendAgentReply(
    businessId: string,
    phoneNumberId: string,
    to: string,
    text: string,
    ctx?: { conversationId: string; leadId: string; tenantId: string },
  ): Promise<void> {
    const account = await this.prisma.social_accounts.findFirst({
      where: { business_id: businessId, platform: 'whatsapp', page_id: phoneNumberId, is_active: true },
    });
    if (!account) {
      this.logger.warn(`sendAgentReply: no active WhatsApp account for business ${businessId}`);
      return;
    }
    const apiResult = await this.providerSendService.sendViaProvider(account, to, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: SendMessageType.TEXT,
      text: { body: text },
    });
    const platformMessageId = this.extractProviderMessageId(apiResult);

    // If caller didn't supply a context, derive one so persistence still happens.
    let resolvedCtx = ctx;
    if (!resolvedCtx) {
      const lead = await this.prisma.leads.findFirst({
        where: { business_id: businessId, platform_id: to, deleted_at: null },
        select: { lead_id: true, tenant_id: true },
      });
      if (lead) {
        const conversation = await this.conversationService.findActiveConversation(
          lead.lead_id,
          'whatsapp',
          businessId,
        );
        if (conversation) {
          resolvedCtx = {
            conversationId: conversation.conversation_id,
            leadId: lead.lead_id,
            tenantId: lead.tenant_id,
          };
        }
      }
    }

    this.logger.log(
      `sendAgentReply persistence — to=${to} businessId=${businessId} ctxProvided=${!!ctx} resolved=${!!resolvedCtx} convId=${resolvedCtx?.conversationId} platformId=${platformMessageId}`,
    );

    if (resolvedCtx) {
      await this.outboundCommandService.persistSentMessage({
        account: { ...account, business_id: businessId, page_id: phoneNumberId },
        to,
        text,
        message_type: 'text',
        platform_message_id: platformMessageId,
        sender_name: 'AI Agent',
        assigned_to: 'bot',
        metadata: { is_ai: true },
        conversation_context: {
          conversation_id: resolvedCtx.conversationId,
          lead_id: resolvedCtx.leadId,
          tenant_id: resolvedCtx.tenantId,
        },
      });

      // First AI reply → advance lead from `new` to `contacted`. autoAdvance
      // is forward-only and idempotent, so calling on every AI reply is safe;
      // subsequent replies are no-ops once the lead is past `contacted`.
      await this.leadCommands.autoAdvance({
        leadId: resolvedCtx.leadId,
        toSlug: 'contacted',
        reason: 'ai_reply_sent',
        actor: 'ai',
      });
    } else {
      this.logger.warn(`sendAgentReply: could not resolve conversation context for ${to} — message not persisted`);
    }
  }

  async handleStatusWebhook(status: any, metadata?: any): Promise<void> {
    return this.statusCommandService.handleStatusWebhook(status, metadata);
  }

  async handleGupshupMessageEvent(event: any): Promise<void> {
    return this.statusCommandService.handleGupshupMessageEvent(event);
  }

  private extractProviderMessageId(result: any): string | null {
    const candidates = [
      result?.messages?.[0]?.id,
      result?.messageId,
      result?.message_id,
      result?.id,
      result?.gsId,
      result?.gs_id,
      result?.data?.messages?.[0]?.id,
      result?.data?.messageId,
      result?.data?.id,
    ];

    return candidates.find((value) => typeof value === 'string' && value.length > 0) ?? null;
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
      });

      if (!account) {
        throw new NotFoundException('WhatsApp account not found');
      }

      const { text: messageText, metadata: templateMetadata } = await this.resolveMessageContent(message, account.business_id);
      this.logger.log('Sending message via WhatsApp Business API');
      const result = await this.circuitBreaker.execute(
        `whatsapp-send-${phoneNumberId}`,
        () => this.providerSendService.sendViaProvider(account, to, message),
      );

      // Find lead (stays in Postgres)
      const lead = await this.prisma.leads.findFirst({
        where: { business_id: account.business_id, platform_id: to, deleted_at: null },
      });

      // Extract message ID from WhatsApp API response (format: { messages: [{id: "wamid..."}] })
      const platformMessageId = this.extractProviderMessageId(result);

      await this.outboundCommandService.persistSentMessage({
        account,
        lead,
        to,
        text: messageText,
        message_type: message.type,
        platform_message_id: platformMessageId,
        workflow_node_id: nodeId,
        metadata: templateMetadata,
      });

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

  async sendFlowMessage(
    phoneNumberId: string,
    to: string,
    bodyText: string,
    cta: string,
    flowId: string,
    headerText?: string,
    footerText?: string,
    screen?: string,
    flowToken?: string,
    nodeId?: string,
    flowData?: Record<string, any>,
  ): Promise<any> {
    const businessId = flowData?.business_id;
    const tokenContext: Record<string, any> = {
      customerPhone: to,
      phoneNumberId,
      ...(businessId ? { businessId } : {}),
      ...(flowData?.check_in ? { check_in: flowData.check_in } : {}),
      ...(flowData?.check_out ? { check_out: flowData.check_out } : {}),
    };

    if (businessId && to) {
      const lead = await this.prisma.leads.findFirst({
        where: { business_id: businessId, phone: to },
        select: { lead_id: true },
      }).catch(() => null);
      if (lead) tokenContext.leadId = lead.lead_id;
    }

    try {
      if (flowToken) Object.assign(tokenContext, JSON.parse(flowToken));
    } catch {
      // Non-JSON flow tokens are ignored so callers can pass plain legacy tokens safely.
    }

    const message: SendWhatsAppMessageDto = {
      messaging_product: 'whatsapp',
      to,
      type: SendMessageType.INTERACTIVE,
      interactive: {
        type: 'flow' as any,
        body: { text: bodyText },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: JSON.stringify(tokenContext),
            flow_id: flowId,
            flow_cta: cta,
            flow_action: 'data_exchange',
            ...(screen ? { flow_action_payload: { screen } } : {}),
          },
        } as any,
      },
    };

    if (headerText) message.interactive!.header = { type: 'text', text: headerText };
    if (footerText) message.interactive!.footer = { text: footerText };

    return this.sendMessage(phoneNumberId, to, message, nodeId);
  }

  async sendBookingEntryButtons(
    phoneNumberId: string,
    to: string,
    bodyText = 'How would you like to continue with your booking?',
    nodeId?: string,
  ): Promise<any> {
    return this.sendButtonMessage(
      phoneNumberId,
      to,
      bodyText,
      [
        { id: 'booking_check_availability', title: 'Check availability' },
        { id: 'booking_start', title: 'Book now' },
        { id: 'booking_handoff', title: 'Talk to staff' },
      ],
      'Booking options',
      undefined,
      nodeId,
    );
  }

  async sendImageMessage(
    phoneNumberId: string,
    to: string,
    imageUrl: string,
    caption?: string,
    nodeId?: string,
  ): Promise<any> {
    return this.sendMessage(
      phoneNumberId,
      to,
      {
        messaging_product: 'whatsapp',
        to,
        type: SendMessageType.IMAGE,
        image: {
          link: imageUrl,
          ...(caption ? { caption } : {}),
        },
      },
      nodeId,
    );
  }

  async sendSingleProductMessage(
    phoneNumberId: string,
    to: string,
    catalogId: string,
    productRetailerId: string,
    bodyText = 'Here is an option you can review.',
    footerText?: string,
    nodeId?: string,
  ): Promise<any> {
    const message: SendWhatsAppMessageDto = {
      messaging_product: 'whatsapp',
      to,
      type: SendMessageType.INTERACTIVE,
      interactive: {
        type: InteractiveSendType.PRODUCT,
        body: { text: bodyText },
        action: {
          catalog_id: catalogId,
          product_retailer_id: productRetailerId,
        } as any,
      },
    };

    if (footerText) message.interactive!.footer = { text: footerText };
    return this.sendMessage(phoneNumberId, to, message, nodeId);
  }

  async sendProductListMessage(
    phoneNumberId: string,
    to: string,
    catalogId: string,
    sections: { title: string; product_items: { product_retailer_id: string }[] }[],
    bodyText = 'Please choose an option from our catalog.',
    headerText?: string,
    footerText?: string,
    nodeId?: string,
  ): Promise<any> {
    const message: SendWhatsAppMessageDto = {
      messaging_product: 'whatsapp',
      to,
      type: SendMessageType.INTERACTIVE,
      interactive: {
        type: InteractiveSendType.PRODUCT_LIST,
        body: { text: bodyText },
        action: { catalog_id: catalogId, sections },
      },
    };

    if (headerText) message.interactive!.header = { type: 'text', text: headerText };
    if (footerText) message.interactive!.footer = { text: footerText };
    return this.sendMessage(phoneNumberId, to, message, nodeId);
  }

  async sendBookingTemplateMessage(
    phoneNumberId: string,
    to: string,
    templateName: string,
    languageCode = 'en',
    bodyParameters: string[] = [],
    nodeId?: string,
  ): Promise<any> {
    const message: SendWhatsAppMessageDto = {
      messaging_product: 'whatsapp',
      to,
      type: SendMessageType.TEMPLATE,
      template: {
        name: templateName,
        language: { code: languageCode },
        components: bodyParameters.length
          ? [
              {
                type: 'body',
                parameters: bodyParameters.map((text) => ({ type: 'text', text })),
              },
            ]
          : undefined,
      },
    };

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
        select: { name: true },
      });

      const duration = firstMessage && lastMessage
        ? new Date(lastMessage.timestamp).getTime() - new Date(firstMessage.timestamp).getTime()
        : 0;

      return {
        conversation_id: conversationId,
        lead_name: lead?.name ?? '',
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
   * Resolve message text and optional template metadata from a send message DTO.
   * For template messages, looks up the stored template to render the body with
   * substituted parameters and captures header/footer/buttons for the frontend.
   */
  private async resolveMessageContent(
    message: SendWhatsAppMessageDto,
    businessId: string,
  ): Promise<{ text: string; metadata?: Record<string, any> }> {
    if (message.text) return { text: message.text.body };
    if (message.interactive) return { text: message.interactive.body.text };

    if (message.template) {
      try {
        const tmpl = await this.whatsappTemplatesService.findByName(businessId, message.template.name);
        if (tmpl.status !== TemplateStatus.APPROVED) {
          throw new Error(`WhatsApp template "${message.template.name}" is ${tmpl.status}; wait for Meta approval before sending`);
        }

        // Substitute {{N}} in body with parameters from the DTO's body component
        const bodyComponent = message.template.components?.find(c => c.type === 'body');
        let renderedBody = tmpl.components.body;
        if (bodyComponent?.parameters?.length) {
          bodyComponent.parameters.forEach((param, i) => {
            const value = param.text ?? param.currency?.fallback_value ?? param.date_time?.fallback_value ?? '';
            renderedBody = renderedBody.replace(new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g'), value);
          });
        }

        // Render header text with parameter substitution if applicable
        let renderedHeaderText: string | undefined;
        if (tmpl.components.header?.type === 'TEXT' && tmpl.components.header.text) {
          renderedHeaderText = tmpl.components.header.text;
          const headerComponent = message.template.components?.find(c => c.type === 'header');
          const headerParam = headerComponent?.parameters?.[0];
          if (headerParam?.text) {
            renderedHeaderText = renderedHeaderText.replace(/\{\{1\}\}/g, headerParam.text);
          }
        }

        const metadata: Record<string, any> = {
          template: {
            name: tmpl.name,
            language: tmpl.language,
            body: renderedBody,
            ...(tmpl.components.header && {
              header: {
                type: tmpl.components.header.type,
                ...(renderedHeaderText ? { text: renderedHeaderText } : {}),
                ...(tmpl.components.header.mediaUrl ? { mediaUrl: tmpl.components.header.mediaUrl } : {}),
              },
            }),
            ...(tmpl.components.footer && { footer: tmpl.components.footer }),
            ...(tmpl.components.buttons?.length && {
              buttons: tmpl.components.buttons.map(b => ({ type: b.type, text: b.text })),
            }),
          },
        };

        return { text: renderedBody, metadata };
      } catch (error) {
        throw error;
      }
    }

    return { text: `[${message.type}]` };
  }

}
