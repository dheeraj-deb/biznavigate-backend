import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConversationContextService } from "../services/conversation-context.service";

@Injectable()
export class ConversationMiddleware implements NestMiddleware {
  constructor(private contextService: ConversationContextService) {}

  async use(req: any, res: any, next: (error?: Error | any) => void) {
    try {
      const phoneNumber = this.extractPhoneNumber(req);

      if (phoneNumber) {
        await this.contextService.initializeContext(phoneNumber);
        req["conversationContext"] = this.contextService;
      }
      next();
    } catch (error) {
      console.error("Error in ConversationMiddleware:", error);
      next();
    }
  }

  private extractPhoneNumber(req: any): string | null {
    return req.body?.From?.replace("whatsapp:", "") || null;
  }
}
