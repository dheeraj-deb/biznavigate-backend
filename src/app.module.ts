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
import { KafkaModule } from "./features/kafka/kafka.module";
// import { UploadsModule } from "./features/uploads/uploads.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { CommerceModule } from "./features/commerce/commerce.module";
import { HospitalityIndustryModule } from "./features/industries/hospitality/hospitality-industry.module";
import { CrmModule } from "./features/crm/crm.module";
import { EngagementModule } from "./features/engagement/engagement.module";
import { AutomationModule } from "./features/automation/automation.module";
import { PlatformModule } from "./features/platform/platform.module";
import { AiModule } from "./features/ai/ai.module";
import { InsightsModule } from "./features/insights/insights.module";
import { PublicBookingModule } from "./features/public-booking/public-booking.module";
import { SellerOsModule } from "./features/seller-os/seller-os.module";
import { ProductsModule } from "./features/products/products.module";
import { HealthController } from "./health.controller";

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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get<string>("REDIS_HOST", "localhost"),
        port: config.get<number>("REDIS_PORT", 6379),
        ttl: 60 * 60 * 24,
      }),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    LoggerModule,
    PrismaModule,
    BullMQModule,
    PlatformModule,
    // UploadsModule,
    ...(process.env.MONGODB_URI
      ? [CrmModule.withRealtime()]
      : [CrmModule]),
    ...(process.env.MONGODB_URI
      ? [EngagementModule.withChannels()]
      : [EngagementModule]),
    CommerceModule,
    ProductsModule,
    ...(process.env.MONGODB_URI
      ? [HospitalityIndustryModule.withPricing()]
      : [HospitalityIndustryModule]),
    InsightsModule,
    SellerOsModule,
    PublicBookingModule,
    ...(process.env.MONGODB_URI
      ? [AiModule.withRag()]
      : [AiModule]),
    ...(process.env.MONGODB_URI
      ? [AutomationModule.withWorkflows()]
      : [AutomationModule]),
    ...(process.env.MONGODB_URI
      ? [KafkaModule]
      : []),
  ],
  controllers: [HealthController],
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
