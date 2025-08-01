import { Injectable } from "@nestjs/common";
import { ConverstationSession } from "../interfaces/session.interface";
import { SessionStoreService } from "./session-store.service";
import { ConversationHistoryService } from "./conversation-history.service";

@Injectable()
export class AdvancedSessionService {
  private localCache = new Map<string, ConverstationSession>();
  constructor(
    private redisCache: SessionStoreService,
    private dbService: ConversationHistoryService
  ) {}

  async getSessionWithFallback(
    phoneNumber: string
  ): Promise<ConverstationSession | null> {
    // L1
    if (this.localCache.has(phoneNumber)) {
      console.log("l1");
      return this.localCache.get(phoneNumber)!;
    }

    // L2
    let session = await this.redisCache.getSession(phoneNumber);

    if (session) {
      console.log("l2");
      this.localCache.set(phoneNumber, session);
      return session;
    }

    // L3
    session = await this.dbService.getLatestSession(phoneNumber);

    if (session) {
      console.log("l3");
      this.localCache.set(phoneNumber, session);
      return session;
    }

    return session;
  }

  async createSessionSnapshot(phoneNumber: string): Promise<void> {
    const session = await this.getSessionWithFallback(phoneNumber);
    if (session) {
      await this.dbService.saveSessionSnapshot(session);
    }
  }
}
