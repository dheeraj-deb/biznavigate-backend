import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ConversationSession } from "../interfaces/session.interface";
import { Cache } from "cache-manager";

@Injectable()
export class SessionService {
  private readonly REDIS_PREFIX = "whatsapp:session:";

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private prisma: PrismaService
  ) {}

  async getSession(phoneNumber: string): Promise<ConversationSession | null> {
    const redisKey = this.REDIS_PREFIX + phoneNumber;
    let session = await this.cache.get<string>(redisKey);
    if (session) {
      const parsed = JSON.parse(session);

      if (typeof parsed.context === "string") {
        parsed.context = JSON.parse(parsed.context);
      }
      return parsed as ConversationSession; // Cast to ConversationSession
    }
    // Fallback to DB
    const dbSession = await this.prisma.conversationSession.findFirst({
      where: { phoneNumber },
      orderBy: { updatedAt: "desc" },
    });
    if (dbSession) {
      // Ensure context is an object
      if (typeof dbSession.context === "string") {
        dbSession.context = JSON.parse(dbSession.context);
      }

      // Hydrate cache for next time
      await this.cache.set(redisKey, JSON.stringify(dbSession), 86400);
      return dbSession as any;
    }
    return null;
  }

  async setSession(
    phoneNumber: string,
    session: ConversationSession
  ): Promise<void> {
    const redisKey = this.REDIS_PREFIX + phoneNumber;
    await this.cache.set(redisKey, JSON.stringify(session), 86400);
    await this.prisma.conversationSession.upsert({
      where: { id: session.sessionId },
      create: {
        id: session.sessionId,
        userId: session.userId,
        phoneNumber: session.phoneNumber,
        context: JSON.stringify(session.context),
        currentStep: session.currentStep,
        updatedAt: new Date(),
      },
      update: {
        context: JSON.stringify(session.context),
        currentStep: session.currentStep,
        updatedAt: new Date(),
      },
    });
  }

  async persistSession(session: ConversationSession): Promise<void> {
    // Upsert in DB (called on major state changes)
    await this.prisma.conversationSession.update({
      where: { id: session.sessionId },
      data: {
        // context: session.context,
        currentStep: session.currentStep,
        // lastEvent: session.lastEvent,
        updatedAt: new Date(),
      },
    });
  }

  async extendSession(phoneNumber: string): Promise<void> {
    const redisKey = this.REDIS_PREFIX + phoneNumber;
    const session = await this.cache.get<string>(redisKey);
    if (session) {
      await this.cache.set(redisKey, session, 86400); // Extend TTL
    } else {
      // If session not found in cache, try to fetch from DB
      const dbSession = await this.prisma.conversationSession.findFirst({
        where: { phoneNumber },
      });
      if (dbSession) {
        await this.cache.set(redisKey, JSON.stringify(dbSession), 86400);
        // await this.prisma.conversationSession.update({
        //   where: { id: dbSession.id },
        //   data: {
        //     updatedAt: new Date(),
        //     // expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Extend by 24 hours
        //   },
        // })
      }
    }
  }

  async logEvent(params: {
    sessionId: string;
    eventType: string;
    stepFrom?: string;
    stepTo?: string;
    payload?: any;
  }) {
    await this.prisma.conversationEvent.create({
      data: {
        id: `${params.sessionId}_${params.eventType}_${Date.now()}`,
        ...params
      },
    });
  }

  async clearSession(phoneNumber: string): Promise<void> {
    await this.cache.del(this.REDIS_PREFIX + phoneNumber);
  }
}
