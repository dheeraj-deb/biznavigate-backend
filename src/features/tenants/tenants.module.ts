import { Module } from "@nestjs/common";
import { TenantsService } from "./application/tenants.service";

import { TenantsController } from "./controllers/tenants.controller";
import { TenantsRepository } from "./infrastructure/tenants.repsoitory.prisma";

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository],
  exports: [TenantsService],
})
export class TenantsModule {}
