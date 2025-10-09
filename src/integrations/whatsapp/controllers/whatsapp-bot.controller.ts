import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageHandlerService } from '../core/message-handler.service';
import { MiddlewarePipeline } from '../core/middleware/middleware-pipeline';
import { WhatsAppService } from '../services/whatsapp.service';

// Middleware
import { RateLimitMiddleware, RATE_LIMIT_MIDDLEWARE_ORDER } from '../core/middleware/rate-limit.middleware';
import { SessionMiddleware, SESSION_MIDDLEWARE_ORDER } from '../core/middleware/session.middleware';
import { LoggingMiddleware, LOGGING_MIDDLEWARE_ORDER } from '../core/middleware/logging.middleware';
import { ErrorHandlerMiddleware, ERROR_HANDLER_MIDDLEWARE_ORDER } from '../core/middleware/error-handler.middleware';
import { ConversationFlowMiddleware, CONVERSATION_FLOW_MIDDLEWARE_ORDER } from '../core/middleware/conversation-flow.middleware';

// Services
import { OrderService } from '../features/orders/application/services/order.service';
import { InvoiceService } from '../features/invoices/application/services/invoice.service';
import { ReminderService } from '../features/reminders/application/services/reminder.service';
import { CampaignService } from '../features/campaigns/application/services/campaign.service';
import { CampaignType, TargetAudience } from '../features/campaigns/domain/campaign.entity';
import { ReminderType } from '../features/reminders/domain/reminder.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * WhatsApp Bot Controller - Main entry point for WhatsApp interactions
 */
@ApiTags('whatsapp-bot')
@Controller('whatsapp')
export class WhatsAppBotController implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppBotController.name);

  constructor(
    private readonly messageHandler: MessageHandlerService,
    private readonly pipeline: MiddlewarePipeline,
    private readonly whatsappService: WhatsAppService,
    private readonly orderService: OrderService,
    private readonly invoiceService: InvoiceService,
    private readonly reminderService: ReminderService,
    private readonly campaignService: CampaignService,
    @InjectQueue('inbound-messages') private inboundQueue: Queue,
    // Middleware
    private readonly rateLimitMiddleware: RateLimitMiddleware,
    private readonly sessionMiddleware: SessionMiddleware,
    private readonly loggingMiddleware: LoggingMiddleware,
    private readonly errorHandlerMiddleware: ErrorHandlerMiddleware,
    private readonly conversationFlowMiddleware: ConversationFlowMiddleware
  ) {}

  /**
   * Initialize middleware pipeline on module init
   */
  onModuleInit() {
    this.logger.log('Initializing WhatsApp Bot middleware pipeline...');

    // Register middleware in order
    this.pipeline.use(this.loggingMiddleware, LOGGING_MIDDLEWARE_ORDER);
    this.pipeline.use(this.rateLimitMiddleware, RATE_LIMIT_MIDDLEWARE_ORDER);
    this.pipeline.use(this.sessionMiddleware, SESSION_MIDDLEWARE_ORDER);
    this.pipeline.use(this.conversationFlowMiddleware, CONVERSATION_FLOW_MIDDLEWARE_ORDER);
    this.pipeline.use(this.errorHandlerMiddleware, ERROR_HANDLER_MIDDLEWARE_ORDER);

    this.logger.log('WhatsApp Bot initialized with middleware pipeline');
  }

  /**
   * Webhook verification endpoint
   */
  @Get('/webhook')
  @ApiOperation({ summary: 'Verify WhatsApp webhook' })
  async verifyWebhook(@Query() query: any): Promise<string> {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    this.logger.log('Webhook verification request');

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }

    return 'OK';
  }

  /**
   * Main webhook endpoint for incoming messages
   */
  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle incoming WhatsApp messages' })
  @ApiResponse({ status: 200, description: 'Message processed' })
  async handleWebhook(@Body() payload: any): Promise<string> {
    try {
      const { From, To, Body, MessageSid } = payload;

      this.logger.log(`Webhook received from ${From}`);

      // Handle via message pipeline
      const response = await this.messageHandler.handle({
        from: From,
        to: To,
        body: Body,
        rawPayload: payload,
      });

      // Send response if any
      if (response && response.message) {
        await this.whatsappService.sendMessage(From, response.message, response);
      }

      return 'OK';
    } catch (error) {
      this.logger.error('Webhook processing failed:', error);
      return 'ERROR';
    }
  }

  /**
   * Get order details
   */
  @Get('/orders/:orderId')
  @ApiOperation({ summary: 'Get order details' })
  async getOrder(@Param('orderId') orderId: string) {
    const order = await this.orderService.getOrder(orderId);
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    };
  }

  /**
   * Get invoice details
   */
  @Get('/invoices/:invoiceId')
  @ApiOperation({ summary: 'Get invoice details' })
  async getInvoice(@Param('invoiceId') invoiceId: string) {
    const invoice = await this.invoiceService.getInvoice(invoiceId);
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      status: invoice.status,
      totalAmount: invoice.totalAmount,
      createdAt: invoice.createdAt,
    };
  }

  /**
   * Schedule a reminder
   */
  @Post('/reminders')
  @ApiOperation({ summary: 'Schedule a reminder' })
  async scheduleReminder(@Body() body: {
    organizationId: string;
    customerId: string;
    customerPhone: string;
    type: ReminderType;
    message: string;
    scheduledFor: Date;
  }) {
    const reminder = await this.reminderService.scheduleReminder(body);
    return {
      id: reminder.id,
      type: reminder.type,
      scheduledFor: reminder.scheduledFor,
      status: reminder.status,
    };
  }

  /**
   * Create and start a campaign
   */
  @Post('/campaigns')
  @ApiOperation({ summary: 'Create and start a campaign' })
  async createCampaign(@Body() body: {
    organizationId: string;
    name: string;
    message: string;
    type: CampaignType;
    targetAudience: TargetAudience;
    startImmediately?: boolean;
  }) {
    const campaign = await this.campaignService.createCampaign(body);

    if (body.startImmediately) {
      await this.campaignService.startCampaign(campaign.id);
    }

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      createdAt: campaign.createdAt,
    };
  }

  /**
   * Get campaign metrics
   */
  @Get('/campaigns/:campaignId/metrics')
  @ApiOperation({ summary: 'Get campaign metrics' })
  async getCampaignMetrics(@Param('campaignId') campaignId: string) {
    return await this.campaignService.getCampaignMetrics(campaignId);
  }

  /**
   * Health check
   */
  @Get('/health')
  @ApiOperation({ summary: 'Health check' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        messageHandler: 'operational',
        redis: 'operational',
        database: 'operational',
      },
    };
  }
}
