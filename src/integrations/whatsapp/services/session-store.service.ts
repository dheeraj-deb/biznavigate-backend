import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConverstationSession } from "../interfaces/session.interface";
import { Cache } from "cache-manager";

@Injectable()
export class SessionStoreService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private getSessionKey(phoneNumber: string): string {
    return `whatsapp:session:${phoneNumber}`;
  }

  async getSession(phoneNumber: string): Promise<ConverstationSession | null> {
    try {
      const sessionData = await this.cacheManager.get<string>(
        this.getSessionKey(phoneNumber)
      );

      // console.log("Retrieved session data:===============>", JSON.parse(sessionData || "{}"));

      if (!sessionData) return null;

      return JSON.parse(sessionData);
    } catch (error) {
      console.error("Error retrieving session:", error);
      return null;
    }
  }

  async setSession(
    phoneNumber: string,
    session: ConverstationSession,
    ttl: number = 24 * 60 * 60 * 1000 // Default TTL: 24 hours
  ): Promise<void> {
    try {
      const sessionKey = this.getSessionKey(phoneNumber);
      await this.cacheManager.set(sessionKey, JSON.stringify(session), ttl);
    } catch (error) {
      console.error("Error setting session:", error);
      throw error;
    }
  }

  async updateSession(
    phoneNumber: string,
    updates: Partial<ConverstationSession>
  ): Promise<ConverstationSession | null> {
    try {
      const currentSession = await this.getSession(phoneNumber);

      if (!currentSession) return null;

      const updatedSession: ConverstationSession = {
        ...currentSession,
        ...updates,
        updatedAt: new Date(),
      };

      await this.setSession(phoneNumber, updatedSession);
      return updatedSession;
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }

  async extendSession(phoneNumber: string): Promise<void> {
    const session = await this.getSession(phoneNumber);
    if (session) {
      session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extend by 24 hours
      await this.setSession(phoneNumber, session);
    }
  }

  async deleteSession(phoneNumber: string): Promise<void> {
    try {
      await this.cacheManager.del(this.getSessionKey(phoneNumber));
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }
}
