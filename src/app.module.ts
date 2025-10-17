import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AppConfigModule } from "./core/config/config.module";
// import { PrismaModule } from "./core/prisma/prisma.module";
import { LoggerModule } from "./core/logging/logger.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

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

@Module({
  imports: [
    AppConfigModule,
    CacheModule.register({
      store: redisStore,
      host: "localhost", // update with your Redis host
      port: 6379,
      ttl: 60 * 60 * 24, // Cache expiry in seconds (24 hours)
    }),
    LoggerModule,
    PrismaModule,
    BullMQModule,
    TenantsModule,
    BusinessesModule,
    SubscriptionsModule,
    RolesModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log(__dirname, "public");
  }
}
