import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  HttpException,
  Delete,
  OnModuleInit,
  Logger,
  Param,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import {
  WhatsAppService,
  WhatsAppWebhookPayload,
} from "../services/whatsapp.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { RedisSessionService } from "../services/redis-session.service";

// NEW: Import new architecture
import { MessageHandlerService } from "../core/message-handler.service";
import { MiddlewarePipeline } from "../core/middleware/middleware-pipeline";
import { RateLimitMiddleware, RATE_LIMIT_MIDDLEWARE_ORDER } from "../core/middleware/rate-limit.middleware";
import { SessionMiddleware, SESSION_MIDDLEWARE_ORDER } from "../core/middleware/session.middleware";
import { LoggingMiddleware, LOGGING_MIDDLEWARE_ORDER } from "../core/middleware/logging.middleware";
import { ErrorHandlerMiddleware, ERROR_HANDLER_MIDDLEWARE_ORDER } from "../core/middleware/error-handler.middleware";
import { ConversationFlowMiddleware, CONVERSATION_FLOW_MIDDLEWARE_ORDER } from "../core/middleware/conversation-flow.middleware";

// NEW: Import feature services
import { OrderService } from "../features/orders/application/services/order.service";
import { InvoiceService } from "../features/invoices/application/services/invoice.service";
import { ReminderService } from "../features/reminders/application/services/reminder.service";
import { CampaignService } from "../features/campaigns/application/services/campaign.service";
import { ReminderType } from "../features/reminders/domain/reminder.entity";
import { CampaignType, TargetAudience } from "../features/campaigns/domain/campaign.entity";

@ApiTags("whatsapp")
@Controller("whatsapp")
export class WhatsAppController implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppController.name);
  private useNewPipeline = true; // Set to true to use new architecture

  constructor(
    private readonly whatsAppService: WhatsAppService,
    @InjectQueue("inbound-messages") private inboundQueue: Queue,
    private readonly sessionService: RedisSessionService,
    // NEW: Inject new services
    private readonly messageHandler: MessageHandlerService,
    private readonly pipeline: MiddlewarePipeline,
    private readonly orderService: OrderService,
    private readonly invoiceService: InvoiceService,
    private readonly reminderService: ReminderService,
    private readonly campaignService: CampaignService,
    // NEW: Inject middleware
    private readonly rateLimitMiddleware: RateLimitMiddleware,
    private readonly sessionMiddleware: SessionMiddleware,
    private readonly loggingMiddleware: LoggingMiddleware,
    private readonly errorHandlerMiddleware: ErrorHandlerMiddleware,
    private readonly conversationFlowMiddleware: ConversationFlowMiddleware,
  ) {}

  /**
   * Initialize middleware pipeline on module init
   */
  onModuleInit() {
    if (this.useNewPipeline) {
      this.logger.log('Initializing new WhatsApp Bot middleware pipeline...');

      // Register middleware in order
      this.pipeline.use(this.loggingMiddleware, LOGGING_MIDDLEWARE_ORDER);
      this.pipeline.use(this.rateLimitMiddleware, RATE_LIMIT_MIDDLEWARE_ORDER);
      this.pipeline.use(this.sessionMiddleware, SESSION_MIDDLEWARE_ORDER);
      this.pipeline.use(this.conversationFlowMiddleware, CONVERSATION_FLOW_MIDDLEWARE_ORDER);
      this.pipeline.use(this.errorHandlerMiddleware, ERROR_HANDLER_MIDDLEWARE_ORDER);

      this.logger.log('✅ WhatsApp Bot initialized with new architecture');
    }
  }

  @Get("/webhook")
  @ApiOperation({ summary: "Verify WhatsApp webhook" })
  @ApiResponse({ status: 200, description: "Webhook verified successfully" })
  @ApiQuery({
    name: "hub.mode",
    required: false,
    description: "Webhook verification mode",
  })
  @ApiQuery({
    name: "hub.verify_token",
    required: false,
    description: "Verification token",
  })
  @ApiQuery({
    name: "hub.challenge",
    required: false,
    description: "Challenge string",
  })
  async verifyWebhook(@Query() query: any): Promise<string> {
    // Handle webhook verification for platforms like Facebook/Meta
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    console.log("Webhook verification query:", query);

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }

    return "OK";
  }

  @Post("/webhook")
  @ApiOperation({ summary: "Handle incoming WhatsApp messages" })
  @ApiResponse({ status: 200, description: "Webhook processed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({
    description: "WhatsApp webhook payload",
    schema: {
      type: "object",
      properties: {
        SmsStatus: { type: "string", example: "received" },
        Body: { type: "string", example: "Hello" },
        From: { type: "string", example: "whatsapp:+1234567890" },
        To: { type: "string", example: "whatsapp:+0987654321" },
        MessageSid: { type: "string" },
        AccountSid: { type: "string" },
        WaId: { type: "string" },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: WhatsAppWebhookPayload
  ): Promise<string> {
    try {
      // NEW: Use new middleware pipeline architecture
      if (this.useNewPipeline) {
        const { From, To, Body } = payload;

        this.logger.log(`📱 New architecture handling message from ${From}`);

        // Process through middleware pipeline
        const response = await this.messageHandler.handle({
          from: From,
          to: To,
          body: Body,
          rawPayload: payload,
        });

        // Send response if any
        if (response && response.message) {
          // FIX: Swap From and To - send TO the customer FROM your Twilio number
          await this.whatsAppService.sendMessage(
            From,  // to: customer's number
            To,    // from: your Twilio WhatsApp number
            response
          );
        }

        return 'OK';
      }

      // OLD: Fallback to old system
      return await this.whatsAppService.handleWebhook(payload);
    } catch (error) {
      this.logger.error("Error handling WhatsApp webhook:", error);
      throw new HttpException(
        "Failed to process webhook",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/debug/session/:phoneNumber")
  @ApiOperation({ summary: "Get session details for debugging" })
  async getSession(@Query("phoneNumber") phoneNumber: string) {
    const session = await this.sessionService.getSession(phoneNumber);
    return {
      phoneNumber,
      session,
      exists: !!session
    };
  }

  @Delete("/debug/session/:phoneNumber")
  @ApiOperation({ summary: "Delete session for debugging" })
  async deleteSession(@Query("phoneNumber") phoneNumber: string) {
    await this.sessionService.deleteSession(phoneNumber);
    return {
      message: "Session deleted",
      phoneNumber
    };
  }

  // ========== NEW API ENDPOINTS ==========

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
      architecture: this.useNewPipeline ? 'new-pipeline' : 'legacy',
      services: {
        messageHandler: 'operational',
        redis: 'operational',
        database: 'operational',
      },
    };
  }
}
