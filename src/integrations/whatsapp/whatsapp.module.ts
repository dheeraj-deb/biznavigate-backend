import { Module } from "@nestjs/common";
import { WhatsAppController } from "./controllers/whatsapp.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { WhatsAppService } from "./services/whatsapp.service";
import { ConversationHandlerService } from "./services/conversation-handler.service";
import { ZohoService } from "../crm/zoho/zoho.service";
import { ConversationContextService } from "./services/conversation-context.service";
import { ConversationStateMachineService } from "./services/conversation-state-machine.service";
import { ZohoModule } from "../crm/zoho/zoho.module";
import { ConfigModule } from "@nestjs/config";
import { ConversationLoggerService } from "./services/conversation-logger.service";
import { ConversationHistoryService } from "./services/conversation-history.service";
import { CacheModule } from "@nestjs/cache-manager";
import { SessionService } from "./services/session.service";
import { ZohoSyncService } from "../crm/zoho/zoho-sync.service";
import { InventoryDatabaseModule } from "../dbsync/inventory-database.module";
import { RedisSessionService } from "./services/redis-session.service";
import { WhatsAppTestController } from "./controllers/whatsapp-test.controller";
import { BullModule } from "@nestjs/bullmq";
import { InboundProcessor } from "src/workers/inbound.processor";
import { OutboundProcessor } from "src/workers/outbound.processor";
import { BullMQModule } from "src/config/bullmq.module";
import { ProductMatcherService } from "./services/product-matcher.service";
import { ProductCatalogService } from "./services/product-catalog.service";
import { IntentDetectionService } from "./services/intent-detection.service";
import { CatalogTestController } from "./controllers/catalog-test.controller";
import { DebugCatalogController } from "./controllers/debug-catalog.controller";
import { HttpModule } from "@nestjs/axios";
import { ProductsModule } from "src/features/products/products.module";

// NEW: Import new architecture components
import { MessageHandlerService } from "./core/message-handler.service";
import { MiddlewarePipeline } from "./core/middleware/middleware-pipeline";
import { RateLimitMiddleware } from "./core/middleware/rate-limit.middleware";
import { SessionMiddleware } from "./core/middleware/session.middleware";
import { LoggingMiddleware } from "./core/middleware/logging.middleware";
import { ErrorHandlerMiddleware } from "./core/middleware/error-handler.middleware";
import { ConversationFlowMiddleware } from "./core/middleware/conversation-flow.middleware";

// NEW: Import feature services
import { OrderService } from "./features/orders/application/services/order.service";
import { InvoiceService } from "./features/invoices/application/services/invoice.service";
import { ReminderService } from "./features/reminders/application/services/reminder.service";
import { CampaignService } from "./features/campaigns/application/services/campaign.service";

// NEW: Import workers
import { OrderProcessingWorker } from "./workers/order-processing.worker";
import { ReminderWorker } from "./workers/reminder.worker";
import { CampaignWorker } from "./workers/campaign.worker";
import { InvoiceWorker } from "./workers/invoice.worker";

@Module({
  imports: [
    PrismaModule,
    ZohoModule,
    InventoryDatabaseModule,
    ConfigModule,
    CacheModule.register(),
    BullMQModule,
    HttpModule,
    ProductsModule,
    // Register new queues
    BullModule.registerQueue(
      { name: 'order-processing' },
      { name: 'invoice-processing' },
      { name: 'reminders' },
      { name: 'campaigns' }
    ),
  ],
  controllers: [
    WhatsAppController,
    WhatsAppTestController,
    CatalogTestController,
    DebugCatalogController
  ],
  providers: [
    // Existing services
    WhatsAppService,
    ConversationHandlerService,
    ConversationContextService,
    ConversationStateMachineService,
    SessionService,
    ConversationLoggerService,
    ConversationHistoryService,
    ZohoSyncService,
    RedisSessionService,
    ProductMatcherService,
    ProductCatalogService,
    IntentDetectionService,
    InboundProcessor,
    OutboundProcessor,

    // NEW: Core messaging infrastructure
    MessageHandlerService,
    MiddlewarePipeline,

    // NEW: Middleware
    RateLimitMiddleware,
    SessionMiddleware,
    LoggingMiddleware,
    ErrorHandlerMiddleware,
    ConversationFlowMiddleware,

    // NEW: Feature services
    OrderService,
    InvoiceService,
    ReminderService,
    CampaignService,

    // NEW: Workers
    OrderProcessingWorker,
    ReminderWorker,
    CampaignWorker,
    InvoiceWorker,
  ],
  exports: [
    WhatsAppService,
    ConversationHandlerService,
    ConversationLoggerService,
    ConversationHistoryService,
    ConversationStateMachineService,
    ProductMatcherService,
    ProductCatalogService,
    RedisSessionService,
    InboundProcessor,
    OutboundProcessor,
    // NEW: Export new services
    MessageHandlerService,
    OrderService,
    InvoiceService,
    ReminderService,
    CampaignService,
  ],
})
export class WhatsAppModule {}
