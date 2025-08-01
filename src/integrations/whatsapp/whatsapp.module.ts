import { Module } from "@nestjs/common";
import { WhatsAppController } from "./controllers/whatsapp.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { WhatsAppService } from "./services/whatsapp.service";
import { ConversationHandlerService } from "./services/conversation-handler.service";
import { ZohoService } from "../crm/zoho/zoho.service";
import { ConversationContextService } from "./services/conversation-context.service";
import { ConversationStateMachineService } from "./services/conversation-state-machine.service";
import { AdvancedSessionService } from "./services/advanced-session.service";
import { ZohoModule } from "../crm/zoho/zoho.module";
import { ConfigModule } from "@nestjs/config";
import { SessionStoreService } from "./services/session-store.service";
import { ConversationLoggerService } from "./services/conversation-logger.service";
import { ConversationHistoryService } from "./services/conversation-history.service";
import { CacheModule } from "@nestjs/cache-manager";
// import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ZohoModule, ConfigModule, CacheModule.register()],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    ConversationHandlerService,
    ConversationContextService,
    ConversationStateMachineService,
    AdvancedSessionService,
    SessionStoreService,
    ConversationLoggerService,
    ConversationHistoryService,
  ],
  exports: [
    WhatsAppService,
    ConversationHandlerService,
    SessionStoreService, // Export if needed by other modules
    ConversationLoggerService, // Export if needed by other modules
    ConversationHistoryService,
  ],
})
export class WhatsAppModule {}
