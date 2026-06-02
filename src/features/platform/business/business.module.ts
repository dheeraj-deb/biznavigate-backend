import { Module } from "@nestjs/common";

import { BusinessesController } from "./controller/business.controller";
import { OnboardingController } from "./controller/onboarding.controller";
import { BusinessesService } from "./application/business.service";
import { BusinessesRepositoryPrisma } from "./infrastructure/business.repository.prisma";
import { StarterTemplatesModule } from "../starter-templates/starter-templates.module";

@Module({
  imports: [StarterTemplatesModule],
  controllers: [BusinessesController, OnboardingController],
  providers: [
    BusinessesService,
    BusinessesRepositoryPrisma,
    { provide: "BusinessesRepository", useClass: BusinessesRepositoryPrisma },
  ],
  exports: [BusinessesService],
})
export class BusinessesModule {}
