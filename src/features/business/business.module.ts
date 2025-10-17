import { Module } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { BusinessesController } from "./controller/business.controller";
import { BusinessesService } from "./application/business.service";
import { BusinessesRepositoryPrisma } from "./infrastructure/business.repository.prisma";

@Module({
  controllers: [BusinessesController],
  providers: [
    BusinessesService,
    BusinessesRepositoryPrisma,
    PrismaService,
    { provide: "BusinessesRepository", useClass: BusinessesRepositoryPrisma },
  ],
  exports: [BusinessesService],
})
export class BusinessesModule {}
