import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { SubscriptionsController } from "./controllers/subscriptions.controller";
import { SubscriptionsService } from "./application/subscription.service";
import { SubscriptionsRepositoryPrisma } from "./infrastructure/subscription.repository.prisma";

@Module({
  imports: [CacheModule.register()],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    {
      provide: "SubscriptionsRepository",
      useClass: SubscriptionsRepositoryPrisma,
    },
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
