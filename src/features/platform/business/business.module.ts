import { Module } from "@nestjs/common";

import { BusinessesController } from "./controller/business.controller";
import { OnboardingController } from "./controller/onboarding.controller";
import { BusinessesService } from "./application/business.service";
import { BusinessBlueprintSeedService } from "./application/business-blueprint-seed.service";
import { BusinessesRepositoryPrisma } from "./infrastructure/business.repository.prisma";
import { PrismaModule } from "../../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [BusinessesController, OnboardingController],
  providers: [
    BusinessesService,
    BusinessBlueprintSeedService,
    BusinessesRepositoryPrisma,
    { provide: "BusinessesRepository", useClass: BusinessesRepositoryPrisma },
  ],
  exports: [BusinessesService],
})
export class BusinessesModule {}
