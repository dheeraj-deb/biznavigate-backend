import { Module } from "@nestjs/common";
import { UsersService } from "./applications/user.service";
import { UsersRepository } from "./applications/infrastructure/users.repository.prisma";
import { UsersController } from "./controllers/user.controller";


@Module({
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
