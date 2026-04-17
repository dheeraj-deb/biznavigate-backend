import { Module } from "@nestjs/common";

import { RolesService } from "./application/role.service";
import { RolesRepository } from "./infrastructure/role.repository.prisma";
import { PrismaService } from "src/prisma/prisma.service";
import { RolesController } from "./controllers/role.controller";
import { UsersRepository } from "src/features/users/applications/infrastructure/users.repository.prisma";

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, PrismaService, UsersRepository],
})
export class RolesModule {}
