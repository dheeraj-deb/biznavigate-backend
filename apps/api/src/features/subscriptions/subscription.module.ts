import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./controllers/subscriptions.controller";
import { SubscriptionsService } from "./application/subscription.service";
import { SubscriptionsRepositoryPrisma } from "./infrastructure/subscription.repository.prisma";

@Module({
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    {
      provide: "SubscriptionsRepository",
      useClass: SubscriptionsRepositoryPrisma,
    },
  ],
})
export class SubscriptionsModule {}
