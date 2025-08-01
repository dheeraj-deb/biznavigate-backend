import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  ConversationContext,
  ConverstationSession,
} from "../interfaces/session.interface";

@Injectable()
export class ConversationHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async saveSessionSnapshot(session: ConverstationSession): Promise<void> {
    try {
      await this.prisma.conversationSession.upsert({
        where: { sessionId: session.sessionId },
        create: {
          sessionId: session.sessionId,
          userId: session.userId,
          phoneNumber: session.phoneNumber,
          context: JSON.stringify(session.context),
          currentStep: session.currentStep,
        },
        update: {
          context: JSON.stringify(session.context),
          currentStep: session.currentStep,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error saving session snapshot:", error);
      throw error;
    }
  }

  async getLatestSession(
    phoneNumber: string
  ): Promise<ConverstationSession | null> {
    const entity = await this.prisma.conversationSession.findFirst({
      where: { phoneNumber },
      orderBy: { updatedAt: "desc" },
    });

    if (!entity) return null;

    return {
      sessionId: entity.sessionId,
      userId: entity.userId,
      phoneNumber: entity.phoneNumber,
      context:
        typeof entity.context === "string"
          ? JSON.parse(entity.context)
          : (entity.context as any as ConversationContext),
      currentStep: entity.currentStep as any,
      metadata: null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      expiresAt: new Date(),
    };
  }

  async logMessage(sessionId: string, message: string, fromUser = true) {
    await this.prisma.conversationMessage.create({
      data: { sessionId, message, fromUser },
    });
  }

  async getMessagesForSession(sessionId: string) {
    return await this.prisma.conversationMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
  }
}
