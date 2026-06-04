import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Cache } from 'cache-manager';
import { ConversationOrchestratorService } from 'src/features/ai/conversation-routing/services/conversation-orchestrator.service';
import { CustomerLanguage, detectCustomerLanguage } from 'src/features/ai/agent/utils/language-detector';
import { getRedis } from 'src/utils/redis';

@Processor('message-debounce')
export class MessageDebounceProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageDebounceProcessor.name);
  private readonly conversationLanguages = new Map<string, CustomerLanguage>();
  private readonly maxLanguageMemoryEntries = 10_000;

  constructor(
    private readonly conversationOrchestrator: ConversationOrchestratorService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { conversationId } = job.data;
    const redis = getRedis();
    const bufferKey = `msg_buffer:${conversationId}`;

    const raw = await redis.lrange(bufferKey, 0, -1);
    await redis.del(bufferKey);

    if (!raw.length) {
      this.logger.debug(`Buffer empty for conversation ${conversationId}, skipping`);
      return;
    }

    const payloads: any[] = raw.map((entry) => JSON.parse(entry));
    const combinedText = payloads.map((payload) => payload.user_input).filter(Boolean).join(' ');
    const lastPayload = payloads[payloads.length - 1];
    const previousLanguage = await this.getPreviousConversationLanguage(conversationId);
    const languageDetection = detectCustomerLanguage(combinedText, previousLanguage);
    await this.rememberConversationLanguage(conversationId, languageDetection.language);

    this.logger.log(`Debounce fired for conv ${conversationId}: ${payloads.length} msg(s)`);

    const phoneNumberId = lastPayload.context?.contact?.phoneNumberId;
    const customerPhone = lastPayload.context?.contact?.from;
    const tenantId = lastPayload.tenant_id;
    const wabaId = lastPayload.waba_id ?? phoneNumberId;
    const activeConversationId = lastPayload.context?.conversation_id ?? conversationId;

    if (!phoneNumberId || !customerPhone || !lastPayload.business_id || !tenantId || !wabaId) {
      this.logger.warn(`Missing WhatsApp routing context for conversation ${conversationId}`);
      return;
    }

    this.logger.log(`Routing conv ${conversationId} to AI conversation orchestrator`);
    await this.conversationOrchestrator.handleIncoming({
      tenantId,
      wabaId,
      phoneNumberId,
      customerPhone,
      userMessage: combinedText,
      session: {
        conversationId: activeConversationId,
        contactPhone: customerPhone,
        contactName: lastPayload.context?.contact?.name,
        leadId: lastPayload.lead_id,
        metadata: { businessId: lastPayload.business_id },
      },
      history: payloads.map((payload) => ({
        role: 'user' as const,
        text: payload.user_input,
      })),
    });
  }

  // Kept as a no-op for callers compiled against the old pre-generation hook.
  startSpeculativeGeneration(conversationId: string): void {
    this.logger.debug(`Speculative AI generation skipped: ${conversationId}`);
  }

  private async getPreviousConversationLanguage(conversationId: string): Promise<CustomerLanguage | undefined> {
    const cached = this.conversationLanguages.get(conversationId);
    if (cached) return cached;

    const stored = await this.cache.get<CustomerLanguage>(this.languageCacheKey(conversationId));
    if (stored) {
      this.rememberConversationLanguageInMemory(conversationId, stored);
      return stored;
    }

    return undefined;
  }

  private async rememberConversationLanguage(conversationId: string, language: CustomerLanguage) {
    this.rememberConversationLanguageInMemory(conversationId, language);
    await this.cache.set(this.languageCacheKey(conversationId), language, 30 * 24 * 60 * 60 * 1000);
  }

  private rememberConversationLanguageInMemory(conversationId: string, language: CustomerLanguage) {
    this.conversationLanguages.delete(conversationId);
    this.conversationLanguages.set(conversationId, language);

    if (this.conversationLanguages.size <= this.maxLanguageMemoryEntries) return;

    const oldestKey = this.conversationLanguages.keys().next().value;
    if (oldestKey) this.conversationLanguages.delete(oldestKey);
  }

  private languageCacheKey(conversationId: string): string {
    return `agent:conversation_language:${conversationId}`;
  }
}
