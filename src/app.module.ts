import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from "@nestjs/core";
import { AppConfigModule } from "./core/config/config.module";
// import { PrismaModule } from "./core/prisma/prisma.module";
import { LoggerModule } from "./core/logging/logger.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";

import { PrismaModule } from "./prisma/prisma.module";
import { CacheModule } from "@nestjs/cache-manager";
// import { RedisOptions } from "./config/redis.config";
import * as redisStore from "cache-manager-ioredis";
import { BullMQModule } from "./config/bullmq.module";
import { TenantsModule } from "./features/tenants/tenants.module";
import { BusinessesModule } from "./features/business/business.module";
import { SubscriptionsModule } from "./features/subscriptions/subscription.module";
import { RolesModule } from "./features/roles/role.module";
import { UsersModule } from "./features/users/user.module";
import { LeadModule } from "./features/lead/lead.module";
import { AuthModule } from "./features/auth/auth.module";
import { KafkaModule } from "./features/kafka/kafka.module";
import { WhatsAppModule } from "./features/whatsapp/whatsapp.module";
import { InstagramModule } from "./features/instagram/instagram.module";
import { ChatWidgetModule } from "./features/chat-widget/chat-widget.module";
import { WorkflowsModule } from "./features/workflows/workflows.module";
// import { UploadsModule } from "./features/uploads/uploads.module";
import { CustomersModule } from "./features/customers/customers.module";
import { OrdersModule } from "./features/orders/orders.module";
import { PaymentsModule } from "./features/payments/payments.module";
import { NotificationsModule } from "./features/notifications/notifications.module";
import { CatalogModule } from "./features/catalog/catalog.module";
import { AnalyticsModule } from "./features/analytics/analytics.module";
import { TemplatesModule } from "./features/notification-templates/templates.module";
import { ContactsModule } from "./features/contacts/contacts.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { CampaignModule } from "./features/campaign/campaign.module";
import { InboxModule } from "./features/inbox/inbox.module";
import { GatewayModule } from "./features/inbox/gateway/gateway.module";
import { HumanHandoffModule } from "./features/human-handoff/human-handoff.module";
import { HotelPricingModule } from "./features/hotel-pricing/hotel-pricing.module";
import { S3Module } from "./s3/s3.module";
import { AgentModule } from "./features/agent/agent.module";
import { GupshupModule } from "./features/gupshup/gupshup.module";
import { RagModule } from "./features/rag/rag.module";

@Module({
  imports: [
    AppConfigModule,
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second (global)
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 1000, // 1000 requests per 15 minutes
      },
    ]),
    ...(process.env.MONGODB_URI
      ? [MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (config: ConfigService) => ({
            uri: config.get<string>('MONGODB_URI'),
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
          }),
          inject: [ConfigService],
        })]
      : []),
    // Static file serving for uploaded images
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/',
    }),
    CacheModule.register({
      store: redisStore,
      host: "localhost", // update with your Redis host
      port: 6379,
      ttl: 60 * 60 * 24, // Cache expiry in seconds (24 hours)
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    LoggerModule,
    PrismaModule,
    BullMQModule,
    AuthModule,
    TenantsModule,
    BusinessesModule,
    SubscriptionsModule,
    RolesModule,
    UsersModule,
    LeadModule,
    // UploadsModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    CatalogModule,
    AnalyticsModule,
    TemplatesModule,
    ContactsModule,
    InstagramModule,
    S3Module,
    AgentModule,
    GupshupModule,
    RagModule,
    ...(process.env.MONGODB_URI
      ? [CampaignModule, InboxModule, GatewayModule, HumanHandoffModule, WhatsAppModule, ChatWidgetModule, WorkflowsModule, HotelPricingModule]
      : []),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log(__dirname, "public");
  }
}
