import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { getRedis } from 'src/utils/redis';
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
import { InboxGateway } from '../inbox/gateway/inbox.gateway';
import { HumanHandoffGateway } from '../human-handoff/human-handoff.gateway';
import { WhatsAppWebhookDto } from './dto/webhook-event.dto';
import { WebhookValidatorService } from './infrastructure/webhook-validator.service';
import { WhatsAppTemplatesService } from '../whatsapp-templates/whatsapp-templates.service';
import { WhatsAppFlowsService } from '../whatsapp-flows/whatsapp-flows.service';



@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiClient: WhatsAppApiClientService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly _kafkaConsumer: KafkaConsumerService,
    private readonly _conversationState: ConversationStateService,
    private readonly configService: ConfigService,
    private readonly catalogOrderService: WhatsAppCatalogOrderService,
    private readonly conversationService: ConversationService,
    private readonly inboxGateway: InboxGateway,
    private readonly humanHandoffGateway: HumanHandoffGateway,
    private readonly webhookValidator: WebhookValidatorService,
    private readonly whatsappTemplatesService: WhatsAppTemplatesService,
    private readonly _whatsappFlowsService: WhatsAppFlowsService,
    @InjectQueue('message-debounce') private readonly debounceQueue: Queue,
  ) { }


  /**
   * Connect WhatsApp account to business
   */
  async connectWhatsAppAccount(
    whatsappBusinessAccountId: string,
    phoneNumberId: string,
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
        () => this.apiClient.getPhoneNumberDetails(phoneNumberId),
      );

      const account = await this.prisma.social_accounts.create({
        data: {
          business_id: businessId,
          platform: 'whatsapp',
          platform_user_id: phoneDetails.id,
          username: phoneDetails.display_phone_number,
          page_id: phoneNumberId,
          access_token: '',
          instagram_business_account_id: whatsappBusinessAccountId,
          is_active: true,
        },
      });

      // Subscribe this WABA to the app's webhook so Meta starts delivering events
      await this.apiClient.subscribeToWebhooks(whatsappBusinessAccountId);

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

  async processWebhook(webhookData: WhatsAppWebhookDto): Promise<void> {
    if (!this.webhookValidator.validateWebhookEvent(webhookData)) {
      throw new BadRequestException('Invalid webhook event structure');
    }

    try {
      for (const entry of webhookData.entry) {
        const changes = this.webhookValidator.extractChanges(entry);

        for (const change of changes) {
          const { value } = change;

          if (change.field === 'message_template_status_update') {
            await this.whatsappTemplatesService.handleMetaWebhook(value);
            continue;
          }

          const messages = this.webhookValidator.extractMessages(value);
          if (messages.length > 0) {
            await Promise.all(
              messages.map(msg =>
                this.handleMessageWebhook(msg, value.metadata, value.contacts || [])
              )
            );
          }

          // Handle message statuses (sent, delivered, read, failed)
          const statuses = this.webhookValidator.extractStatuses(value);
          if (statuses.length > 0) {
            for (const status of statuses) {
              await this.handleStatusWebhook(status);
            }
          }
        }
      }
    } catch (error) {
      console.log("error", error);
      this.logger.error('Error processing webhook:', error);
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

      // Skip messages older than 5 minutes (Meta replays queued webhooks on restart)
      const messageTimestampMs = parseInt(message.timestamp) * 1000;
      const ageMs = Date.now() - messageTimestampMs;
      if (ageMs > 5 * 60 * 1000) {
        this.logger.warn(`⏭️ Skipping stale message ${messageId} (${Math.round(ageMs / 60000)}min old)`);
        return;
      }

      // Check if this message has already been processed
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
          } else if (message.interactive?.type === 'nfm_reply') {
            messageText = 'Flow completed';
            (message as any).buttonId = message.interactive.nfm_reply?.response_json;
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

      let conversation = await this.conversationService.findActiveConversation(lead.lead_id, 'whatsapp', account.business_id);

      console.log('conversation==>', conversation);

      if (!conversation) {
        const newConversationId = crypto.randomUUID();
        conversation = await this.conversationService.createConversation({
          conversation_id: newConversationId,
          lead_id: lead.lead_id,
          customer_id: from,
          business_id: account.business_id,
          tenant_id: account.businesses.tenant_id,
          channel: 'whatsapp',
          status: 'active',
          sender_id: phoneNumberId,
          sender_name: contactName,
        });

        // Create the matching Postgres row so escalation/handoff queries can find it
        await this.prisma.lead_conversations.create({
          data: {
            conversation_id: newConversationId,
            lead_id: lead.lead_id,
            business_id: account.business_id,
            tenant_id: account.businesses.tenant_id,
            channel: 'whatsapp',
            customer_identifier: from,
          },
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

      // Bump conversation preview + updated_at so it surfaces to top of inbox list
      await this.conversationService.touchConversation(conversation.conversation_id, messageText);

      const msgTimestamp = new Date();
      // Notify inbox in real-time
      this.inboxGateway.notifyNewMessage(account.business_id, conversation.conversation_id, {
        _id: leadMessageId,
        conversation_id: conversation.conversation_id,
        sender_type: 'lead',
        sender_name: contactName,
        message_type: messageType,
        message_text: messageText,
        platform_message_id: messageId,
        delivery_status: 'received',
        timestamp: msgTimestamp,
      });
      this.inboxGateway.notifyConversationUpdated(account.business_id, conversation.conversation_id, {
        message_text: messageText,
        timestamp: msgTimestamp,
      });

      // If this conversation is human-handled, also notify the handoff namespace
      const pgConv = await this.prisma.lead_conversations.findFirst({
        where: { conversation_id: conversation.conversation_id, is_ai_handled: false, is_resolved: false },
        select: { conversation_id: true },
      });
      if (pgConv) {
        this.humanHandoffGateway.notifyCustomerMessage(account.business_id, conversation.conversation_id, {
          _id: leadMessageId,
          conversation_id: conversation.conversation_id,
          sender_type: 'lead',
          sender_name: contactName,
          message_type: messageType,
          message_text: messageText,
          platform_message_id: messageId,
          timestamp: msgTimestamp,
        });
      }

      // Mark as read + show typing indicator while AI processes
      await this.circuitBreaker.execute(
        `whatsapp-mark-read-${phoneNumberId}`,
        () => this.apiClient.markAsRead(phoneNumberId, messageId),
      );

      // Map business_type to AI service expected values
      // const businessTypeMap: Record<string, string> = {
      //   'Retail': 'retail',
      //   'Beauty': 'service',
      //   'Restaurant': 'service',
      //   'Service': 'service',
      //   'D2C': 'd2c',
      //   'Education': 'education',
      // };

      // const mappedBusinessType = account.businesses.business_type
      //   ? businessTypeMap[account.businesses.business_type] || 'service'
      //   : 'service';

      // Get conversation history for context continuity from MongoDB
      // const conversationHistory = await this.getConversationHistory(conversation.conversation_id, 10);

      // Check if message is interactive (button/list reply)
      const isInteractive = messageType === 'interactive' && (message as any).buttonId;
      const userInput = isInteractive ? (message as any).buttonId : messageText;

      const workflowPayload = {
        lead_id: lead.lead_id,
        business_id: account.business_id,
        tenant_id: account.businesses.tenant_id,
        user_input: userInput,
        context: {
          message_id: leadMessageId,
          conversation_id: conversation.conversation_id,
          channel: 'whatsapp' as const,
          message_type: messageType,
          contact: {
            name: contactName,
            from,
            phoneNumberId,
          },
          lead: {
            id: lead.lead_id,
            first_name: lead.first_name,
            last_name: lead.last_name,
            status: lead.status,
            score: lead.lead_score,
            phone: lead.phone,
          },
        },
      };

      if (isInteractive) {
        this.logger.log(`📲 Interactive selection: ${userInput}`);
        await this.kafkaProducer.publishInteractiveSelection(workflowPayload);
      } else {
        // Buffer rapid-fire messages and debounce before processing
        const bufferKey = `msg_buffer:${conversation.conversation_id}`;
        const redis = getRedis();
        await redis.rpush(bufferKey, JSON.stringify(workflowPayload));
        await redis.expire(bufferKey, 30);

        await this.debounceQueue.add(
          'process-messages',
          { conversationId: conversation.conversation_id },
          {
            jobId: `conv:${conversation.conversation_id}`,
            delay: 10000,
            removeOnComplete: true,
            removeOnFail: true,
          },
        );
      }

    } catch (error) {
      this.logger.error('Error processing WhatsApp message webhook:', error);
    }
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
    const apiResult = await this.apiClient.sendMessage(phoneNumberId, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: SendMessageType.TEXT,
      text: { body: text },
    });
    const platformMessageId = apiResult?.messages?.[0]?.id;

    // Persist agent reply to MongoDB so it appears in the inbox
    if (ctx) {
      const saved = await this.conversationService.createMessage({
        conversation_id: ctx.conversationId,
        lead_id: ctx.leadId,
        business_id: businessId,
        tenant_id: ctx.tenantId,
        sender_type: 'business',
        sender_id: phoneNumberId,
        sender_name: 'AI Agent',
        message_text: text,
        message_type: 'text',
        platform_message_id: platformMessageId,
        delivery_status: 'sent',
        assigned_to: 'bot',
        metadata: { is_ai: true },
      });

      this.inboxGateway.notifyNewMessage(businessId, ctx.conversationId, {
        _id: (saved._id as any).toString(),
        conversation_id: ctx.conversationId,
        sender_type: 'business',
        sender_name: 'AI Agent',
        message_type: 'text',
        message_text: text,
        delivery_status: 'sent',
        timestamp: new Date(),
      });
    }
  }

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

      // Update conversation message status in MongoDB
      await this.conversationService.updateMessageStatus(messageId, updateData);

      if (status.errors && status.errors.length > 0) {
        this.logger.error(`Message ${messageId} failed:`, status.errors);
      }

      // Emit real-time status update to inbox
      const msg = await this.conversationService.findMessageByPlatformId(messageId);
      if (msg) {
        const conv = await this.conversationService.findConversationById(msg.conversation_id);
        if (conv) {
          this.inboxGateway.notifyStatusUpdate(conv.business_id, conv.conversation_id, messageId, statusType);
        }
      }

      // Campaign delivery tracking
      await this.updateCampaignRecipientStatus(messageId, statusType, timestamp, status.errors);

    } catch (error) {
      this.logger.error('Error processing status webhook:', error);
    }
  }

  /**
   * Update campaign_recipients + campaign_analytics when WhatsApp sends delivery/read/failed events
   */
  private async updateCampaignRecipientStatus(
    waMessageId: string,
    statusType: string,
    timestamp: Date,
    errors?: any[],
  ): Promise<void> {
    const campaignStatusMap: Record<string, string> = {
      delivered: 'DELIVERED',
      read: 'READ',
      failed: 'FAILED',
    };

    const campaignStatus = campaignStatusMap[statusType];
    if (!campaignStatus) return; // ignore 'sent' — already set by dispatch processor

    const recipient = await this.prisma.campaign_recipients.findFirst({
      where: { whatsapp_message_id: waMessageId },
      select: { id: true, campaign_id: true },
    });

    if (!recipient) return; // not a campaign message

    const recipientUpdate: any = { status: campaignStatus, updated_at: timestamp };
    if (statusType === 'delivered') recipientUpdate.delivered_at = timestamp;
    else if (statusType === 'read') recipientUpdate.read_at = timestamp;
    else if (statusType === 'failed') {
      const err = errors?.[0];
      recipientUpdate.failed_at = timestamp;
      recipientUpdate.error_code = String(err?.code ?? 'UNKNOWN');
      // Prefer the detailed explanation over the short title
      recipientUpdate.error_message = err?.error_data?.details || err?.message || err?.title || 'Unknown error';
    }

    await this.prisma.campaign_recipients.update({
      where: { id: recipient.id },
      data: recipientUpdate,
    });

    // Increment the analytics counter for this status
    const analyticsIncrement: any = { updated_at: new Date() };
    if (statusType === 'delivered') analyticsIncrement.delivered = { increment: 1 };
    else if (statusType === 'read') analyticsIncrement.read = { increment: 1 };
    else if (statusType === 'failed') analyticsIncrement.failed = { increment: 1 };

    await this.prisma.campaign_analytics.updateMany({
      where: { campaign_id: recipient.campaign_id },
      data: analyticsIncrement,
    });

    // Recompute rates after incrementing
    const analytics = await this.prisma.campaign_analytics.findUnique({
      where: { campaign_id: recipient.campaign_id },
    });

    if (analytics) {
      const deliveryRate = Number(analytics.sent) > 0
        ? (Number(analytics.delivered) / Number(analytics.sent)) * 100
        : 0;
      const readRate = Number(analytics.delivered) > 0
        ? (Number(analytics.read) / Number(analytics.delivered)) * 100
        : 0;

      await this.prisma.campaign_analytics.update({
        where: { campaign_id: recipient.campaign_id },
        data: { delivery_rate: deliveryRate, read_rate: readRate, last_synced_at: new Date() },
      });
    }

    this.logger.log(`[Campaign ${recipient.campaign_id}] Recipient ${waMessageId} → ${campaignStatus}`);
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

      const { text: messageText, metadata: templateMetadata } = await this.resolveMessageContent(message, account.business_id);
      this.logger.log('Sending message via WhatsApp Business API');
      const result = await this.circuitBreaker.execute(
        `whatsapp-send-${phoneNumberId}`,
        () => this.apiClient.sendMessage(phoneNumberId, message),
      );

      // Find lead (stays in Postgres)
      const lead = await this.prisma.leads.findFirst({
        where: { business_id: account.business_id, platform_user_id: to, source: 'whatsapp' },
      });

      // Extract message ID from WhatsApp API response (format: { messages: [{id: "wamid..."}] })
      const platformMessageId = result?.messages?.[0]?.id;

      // Persist outbound message in MongoDB
      if (lead && platformMessageId) {
        let conversation = await this.conversationService.findActiveConversation(lead.lead_id, 'whatsapp', account.business_id);

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

        const saved = await this.conversationService.createMessage({
          conversation_id: conversation.conversation_id,
          lead_id: lead.lead_id,
          business_id: account.business_id,
          tenant_id: account.businesses.tenant_id,
          sender_type: 'business',
          sender_id: phoneNumberId,
          sender_name: account.businesses.business_name ?? 'Business',
          message_text: messageText,
          message_type: message.type,
          platform_message_id: platformMessageId,
          delivery_status: 'sent',
          workflow_node_id: nodeId,
          ...(templateMetadata && { metadata: templateMetadata }),
        });

        const outboundTimestamp = new Date();
        await this.conversationService.touchConversation(conversation.conversation_id, messageText);

        this.inboxGateway.notifyNewMessage(account.business_id, conversation.conversation_id, {
          _id: (saved._id as any).toString(),
          conversation_id: conversation.conversation_id,
          sender_type: 'business',
          message_type: message.type,
          message_text: messageText,
          platform_message_id: platformMessageId,
          delivery_status: 'sent',
          timestamp: outboundTimestamp,
          ...(templateMetadata && { metadata: templateMetadata }),
        });
        this.inboxGateway.notifyConversationUpdated(account.business_id, conversation.conversation_id, {
          message_text: messageText,
          timestamp: outboundTimestamp,
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
   * Send a WhatsApp Flow message
   */
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
    // Build flow_token as JSON context so the data exchange endpoint can access customerPhone, businessId etc.
    const businessId = flowData?.business_id;
    const tokenContext: Record<string, any> = {
      customerPhone: to,
      phoneNumberId,
      ...(businessId ? { businessId } : {}),
      // Agent handoff: embed pre-filled dates so INIT handler can skip SELECT_DATES
      ...(flowData?.check_in ? { check_in: flowData.check_in } : {}),
      ...(flowData?.check_out ? { check_out: flowData.check_out } : {}),
    };

    // Resolve lead_id once here so handlers don't need to query it repeatedly
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
      // flowToken is not JSON, ignore
    }
    const token = JSON.stringify(tokenContext);
    const message: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'flow',
        body: { text: bodyText },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: token,
            flow_id: flowId,
            flow_cta: cta,
            flow_action: 'data_exchange',
          },
        },
      },
    };

    if (headerText) {
      message.interactive.header = { type: 'text', text: headerText };
    }
    if (footerText) {
      message.interactive.footer = { text: footerText };
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
      } catch {
        // Template not found in local DB — fall back gracefully
        return { text: `Template: ${message.template.name}` };
      }
    }

    return { text: `[${message.type}]` };
  }

}
