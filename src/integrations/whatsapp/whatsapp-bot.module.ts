import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ZohoModule } from '../crm/zoho/zoho.module';
import { ProductsModule } from 'src/features/products/products.module';
import { InventoryDatabaseModule } from '../dbsync/inventory-database.module';
import { HttpModule } from '@nestjs/axios';

// Controllers
import { WhatsAppBotController } from './controllers/whatsapp-bot.controller';

// Core messaging
import { MessageHandlerService } from './core/message-handler.service';
import { MiddlewarePipeline } from './core/middleware/middleware-pipeline';

// Middleware
import { RateLimitMiddleware } from './core/middleware/rate-limit.middleware';
import { SessionMiddleware } from './core/middleware/session.middleware';
import { LoggingMiddleware } from './core/middleware/logging.middleware';
import { ErrorHandlerMiddleware } from './core/middleware/error-handler.middleware';
import { ConversationFlowMiddleware } from './core/middleware/conversation-flow.middleware';

// Services (existing)
import { WhatsAppService } from './services/whatsapp.service';
import { ConversationHandlerService } from './services/conversation-handler.service';
import { ConversationStateMachineService } from './services/conversation-state-machine.service';
import { RedisSessionService } from './services/redis-session.service';
import { ProductMatcherService } from './services/product-matcher.service';
import { ProductCatalogService } from './services/product-catalog.service';

// Features - Orders
import { OrderService } from './features/orders/application/services/order.service';

// Features - Invoices
import { InvoiceService } from './features/invoices/application/services/invoice.service';

// Features - Reminders
import { ReminderService } from './features/reminders/application/services/reminder.service';

// Features - Campaigns
import { CampaignService } from './features/campaigns/application/services/campaign.service';

// Workers
import { OrderProcessingWorker } from './workers/order-processing.worker';
import { ReminderWorker } from './workers/reminder.worker';
import { CampaignWorker } from './workers/campaign.worker';
import { InvoiceWorker } from './workers/invoice.worker';

// Existing workers
import { InboundProcessor } from 'src/workers/inbound.processor';
import { OutboundProcessor } from 'src/workers/outbound.processor';

/**
 * WhatsApp Bot Module - Enterprise-grade WhatsApp automation
 *
 * Features:
 * - Order management with CQRS
 * - Automated invoice generation and delivery
 * - Scheduled reminders (payment, abandoned cart, restock)
 * - Campaign management for broadcasts
 * - Rate limiting and circuit breaker patterns
 * - Middleware pipeline for extensibility
 */
@Module({
  imports: [
    PrismaModule,
    ZohoModule,
    ProductsModule,
    InventoryDatabaseModule,
    HttpModule,
    BullModule.registerQueue(
      { name: 'inbound-messages' },
      { name: 'outbound-messages' },
      { name: 'order-processing' },
      { name: 'invoice-processing' },
      { name: 'reminders' },
      { name: 'campaigns' }
    ),
  ],
  controllers: [WhatsAppBotController],
  providers: [
    // Core messaging infrastructure
    MessageHandlerService,
    MiddlewarePipeline,

    // Middleware
    RateLimitMiddleware,
    SessionMiddleware,
    LoggingMiddleware,
    ErrorHandlerMiddleware,
    ConversationFlowMiddleware,

    // Existing services
    WhatsAppService,
    ConversationHandlerService,
    ConversationStateMachineService,
    RedisSessionService,
    ProductMatcherService,
    ProductCatalogService,

    // Feature services
    OrderService,
    InvoiceService,
    ReminderService,
    CampaignService,

    // Workers
    InboundProcessor,
    OutboundProcessor,
    OrderProcessingWorker,
    ReminderWorker,
    CampaignWorker,
    InvoiceWorker,
  ],
  exports: [
    MessageHandlerService,
    WhatsAppService,
    OrderService,
    InvoiceService,
    ReminderService,
    CampaignService,
    ConversationHandlerService,
  ],
})
export class WhatsAppBotModule {}
