import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "src/prisma/prisma.module";
import { InventoryDatabaseService } from "./inventory-database.service";

@Module({
  imports: [PrismaModule, ConfigModule, CacheModule.register()],
  controllers: [],
  providers: [InventoryDatabaseService],
  exports: [InventoryDatabaseService],
})
export class InventoryDatabaseModule {}
