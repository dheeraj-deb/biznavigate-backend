import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { LeadCommandService } from '../../crm/lead/application/services/lead-command.service';
import { LeadQueryService } from '../../crm/lead/application/services/lead-query.service';
import { SendWidgetMessageDto, UpdateVisitorInfoDto } from './dto/widget-message.dto';

@Injectable()
export class ChatWidgetService {
  private readonly logger = new Logger(ChatWidgetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leadCommands: LeadCommandService,
    private readonly leadQueries: LeadQueryService,
  ) {}

  /**
   * Initialize widget session — returns existing conversation history if any.
   */
  async initWidget(businessId: string, visitorId: string, utmSource?: string): Promise<any> {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    // Find existing lead and conversation
    const lead = await this.prisma.leads.findFirst({
      where: { platform_id: visitorId, business_id: businessId, deleted_at: null },
    });

    let messages: any[] = [];
    let conversationId: string | null = null;

    if (lead) {
      const conv = await this.leadCommands.upsertConversation({
        leadId: lead.lead_id,
        businessId,
        channel: 'website',
        platformId: visitorId,
      });
      conversationId = conv.conversation_id;
      const rawMessages = await this.leadQueries.getMessages(conv.conversation_id, 50);
      messages = rawMessages.map((m: any) => ({
        id: m._id,
        text: m.body,
        role: m.role,
        timestamp: m.created_at,
      }));
    }

    return {
      visitorId,
      leadId: lead?.lead_id ?? null,
      conversationId,
      messages,
      config: {
        welcomeMessage: `Hi! Welcome to ${business.business_name}. How can we help you today?`,
        botName: business.business_name || 'Support Bot',
      },
    };
  }

  /**
   * Process incoming widget message from visitor.
   * 1. Upsert lead (PostgreSQL)
   * 2. Upsert conversation (MongoDB)
   * 3. Insert message (MongoDB)
   */
  async processMessage(data: SendWidgetMessageDto): Promise<any> {
    const { businessId, message, visitorId, visitorName, visitorEmail, visitorPhone, pageUrl } = data;

    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    // Detect source from UTM or referrer context (passed in dto metadata)
    const source = (data as any).utmSource ?? 'direct';

    // 1. Upsert lead
    const lead = await this.leadCommands.upsertLead({
      businessId,
      tenantId: business.tenant_id,
      channel: 'website',
      source,
      platformId: visitorId,
      name: visitorName,
      email: visitorEmail,
      phone: visitorPhone,
    });

    // 2. Upsert conversation
    const conversation = await this.leadCommands.upsertConversation({
      leadId: lead.lead_id,
      businessId,
      channel: 'website',
      platformId: visitorId,
    });

    // 3. Insert visitor message
    const msg = await this.leadCommands.insertMessage({
      conversationId: conversation.conversation_id,
      leadId: lead.lead_id,
      businessId,
      role: 'user',
      body: message,
      type: 'text',
      meta: { page_url: pageUrl },
    });

    this.logger.log(`Widget message stored for lead ${lead.lead_id}`);

    return {
      messageId: msg?._id ?? null,
      conversationId: conversation.conversation_id,
      leadId: lead.lead_id,
    };
  }

  /**
   * Send AI/bot response — called by agent after processing.
   */
  async sendBotResponse(conversationId: string, messageBody: string): Promise<any> {
    // Fetch conversation from MongoDB to get lead_id and business_id
    const conv = await this.leadQueries.getConversationById(conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');

    const msg = await this.leadCommands.insertMessage({
      conversationId,
      leadId: conv.lead_id,
      businessId: conv.business_id,
      role: 'ai',
      body: messageBody,
      type: 'text',
      meta: { is_automated: true },
    });

    return { messageId: msg?._id, text: messageBody };
  }

  /**
   * Update visitor contact info (called when they share phone/email in chat).
   */
  async updateVisitorInfo(data: UpdateVisitorInfoDto): Promise<void> {
    const { businessId, visitorId, name, email, phone } = data;

    const lead = await this.prisma.leads.findFirst({
      where: { platform_id: visitorId, business_id: businessId, deleted_at: null },
    });
    if (!lead) return;

    const updateData: any = { updated_at: new Date() };
    if (name && !lead.name) updateData.name = name;
    if (email && !lead.email) updateData.email = email;
    if (phone && !lead.phone) updateData.phone = phone;

    if (Object.keys(updateData).length > 1) {
      await this.prisma.leads.update({ where: { lead_id: lead.lead_id }, data: updateData });
    }
  }

  async getConversationHistory(businessId: string, visitorId: string): Promise<any[]> {
    const lead = await this.prisma.leads.findFirst({
      where: { platform_id: visitorId, business_id: businessId, deleted_at: null },
    });
    if (!lead) return [];

    const conv = await this.leadQueries.getConversationByLead(lead.lead_id, businessId);
    if (!conv) return [];

    const messages = await this.leadQueries.getMessages(conv.conversation_id, 50);
    return messages.map((m: any) => ({
      id: m._id,
      text: m.body,
      role: m.role,
      timestamp: m.created_at,
    }));
  }

  async getWidgetConfig(businessId: string): Promise<any> {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    return {
      businessId,
      primaryColor: '#0084FF',
      welcomeMessage: `Hi! Welcome to ${business.business_name}. How can we help you today?`,
      botName: business.business_name || 'Support Bot',
      position: 'bottom-right',
      showBranding: true,
    };
  }
}
