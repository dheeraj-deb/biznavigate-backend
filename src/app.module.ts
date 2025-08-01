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

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    PrismaModule,
    UsersModule,
    // CustomersModule,
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
export class AppModule {}
