import { Module } from "@nestjs/common";
import { WhatsappController } from "./controllers/whatsapp.controller";
import { MessageHandler } from "./classes/message-handler";
import { WhatsappService } from "./services/whatsapp.service";

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, MessageHandler],
})
export class WhatsappModule {}
