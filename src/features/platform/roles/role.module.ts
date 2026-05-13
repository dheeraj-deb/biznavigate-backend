import { Module } from "@nestjs/common";

import { RolesService } from "./application/role.service";
import { RolesRepository } from "./infrastructure/role.repository.prisma";
import { RolesController } from "./controllers/role.controller";
import { UsersRepository } from "src/features/platform/users/applications/infrastructure/users.repository.prisma";

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, UsersRepository],
})
export class RolesModule {}
