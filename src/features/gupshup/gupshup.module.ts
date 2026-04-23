import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GupshupOnboardingService } from "./gupshup-onboarding.service";
import { GupshupOnboardingController } from "./gupshup-onboarding.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [GupshupOnboardingController],
  providers: [GupshupOnboardingService],
  exports: [GupshupOnboardingService],
})
export class GupshupModule {}
