import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from "@nestjs/core";
import { AppConfigModule } from "./core/config/config.module";
import { LoggerModule } from "./core/logging/logger.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";
import { RequestLoggerInterceptor } from "./common/interceptors/request-logger.interceptor";
import { UsageMeterInterceptor } from "./common/interceptors/usage-meter.interceptor";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { SubscriptionGuard } from "./common/guards/subscription.guard";
import { TenantContextMiddleware } from "./common/middleware/tenant-context.middleware";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";

import { PrismaModule } from "./prisma/prisma.module";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-ioredis";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullMQModule } from "./config/bullmq.module";
import { createRedisConfig } from "./config/redis.config";
import { HealthModule } from "./health/health.module";

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
import { ProductsModule } from "./features/products/products.module";
import { CategoriesModule } from "./features/categories/categories.module";
import { CustomersModule } from "./features/customers/customers.module";
import { OrdersModule } from "./features/orders/orders.module";
import { PaymentsModule } from "./features/payments/payments.module";
import { ReviewsModule } from "./features/reviews/reviews.module";
import { NotificationsModule } from "./features/notifications/notifications.module";
import { InventoryModule } from "./features/inventory/inventory.module";
import { AnalyticsModule } from "./features/analytics/analytics.module";
import { TemplatesModule } from "./features/notification-templates/templates.module";
import { MessagesModule } from "./features/messages/messages.module";
import { ContactsModule } from "./features/contacts/contacts.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { MongooseModule } from "@nestjs/mongoose";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { CampaignModule } from "./features/campaign/campaign.module";
import { InboxModule } from "./features/inbox/inbox.module";
import { GatewayModule } from "./features/inbox/gateway/gateway.module";
import { HotelPricingModule } from "./features/hotel-pricing/hotel-pricing.module";
import { S3Module } from "./s3/s3.module";

@Module({
  imports: [
    AppConfigModule,
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,   limit: 10   },
      { name: 'medium', ttl: 60000,  limit: 100  },
      { name: 'long',   ttl: 900000, limit: 1000 },
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/',
    }),
    // Redis cache — env-driven, supports TLS/password for production
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        ...createRedisConfig(configService),
        ttl: 60 * 60 * 24, // 24 hours default TTL
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    LoggerModule,
    PrismaModule,
    BullMQModule,
    HealthModule,
    AuthModule,
    TenantsModule,
    BusinessesModule,
    SubscriptionsModule,
    RolesModule,
    UsersModule,
    LeadModule,
    ProductsModule,
    CategoriesModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    InventoryModule,
    AnalyticsModule,
    TemplatesModule,
    MessagesModule,
    ContactsModule,
    InstagramModule,
    S3Module,
    ...(process.env.MONGODB_URI
      ? [
          CampaignModule,
          InboxModule,
          GatewayModule,
          WhatsAppModule,
          ChatWidgetModule,
          WorkflowsModule,
          HotelPricingModule,
        ]
      : []),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Request logger runs first to measure total response time
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    // Usage metering runs last (after response is formed)
    {
      provide: APP_INTERCEPTOR,
      useClass: UsageMeterInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Subscription guard — only activates when @RequireFeature() is present
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, TenantContextMiddleware)
      .forRoutes('*');
  }
}
