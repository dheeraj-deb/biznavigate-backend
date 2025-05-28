import { Module } from "@nestjs/common";
import { BusinessUserController } from "./business_user.controller";
import { BusinessUserService } from "./business_user.service";
import { PrismaService } from "src/prisma/prisma.service";
import { Zoho } from "src/integration/crms/zoho/zoho";

@Module({
  controllers: [BusinessUserController],
  providers: [BusinessUserService, PrismaService, Zoho],
})
export class BusinessUserModule {}
