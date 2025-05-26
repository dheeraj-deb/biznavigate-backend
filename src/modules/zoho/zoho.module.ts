import { Module } from "@nestjs/common";
import { ZohoController } from "./zoho.controller";
import { Zoho } from "src/integration/crms/zoho/zoho";

@Module({
  imports: [],
  controllers: [ZohoController],
  providers: [Zoho],
  exports: [],
})
export class ZohoModule {}
