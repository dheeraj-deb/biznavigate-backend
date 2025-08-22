import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AppConfigModule } from "./core/config/config.module";
// import { PrismaModule } from "./core/prisma/prisma.module";
import { LoggerModule } from "./core/logging/logger.module";
import { UsersModule } from "./features/users/users.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { WhatsAppModule } from "./integrations/whatsapp/whatsapp.module";
import { CrmModule } from "./integrations/crm/crm.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CustomersModule } from "./features/customers/customers.module";
import { CacheModule } from "@nestjs/cache-manager";
// import { RedisOptions } from "./config/redis.config";
import * as redisStore from "cache-manager-ioredis";
import { ServeStaticModule } from "@nestjs/serve-static";

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
    UsersModule,
    CustomersModule,
    WhatsAppModule,
    CrmModule,
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
