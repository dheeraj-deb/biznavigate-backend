import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HumanMessage } from '@langchain/core/messages';
import { Cache } from 'cache-manager';
import { buildAgentGraph } from './graph/agent-graph';
import { CatalogService } from '../../commerce/catalog/catalog.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { RagService } from '../rag/rag.service';
import { agentRunContextStorage } from './context/agent-run-context';
import { AgentContextBuilder } from './context/agent-context-builder.service';
import { GenerationHandle } from './types/generation-handle';
import { decodeHandoff } from './types/handoff';
import { AgentTurnMetrics } from './types/agent-metrics';
import { CustomerLanguage, detectCustomerLanguage } from './utils/language-detector';
import { AgentModelConfig, resolveAgentModelConfig } from './graph/llm-factory';
import {
  normalizeBookingMethodsConfig,
  summarizeBookingMethodsForAgent,
} from '../../platform/business-settings/booking-methods.config';

export interface AgentContext {
  businessId: string;
  businessType?: string;
  leadId?: string;
  phone: string;
  conversationId: string;
}

@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);
  private graph: Awaited<ReturnType<typeof buildAgentGraph>>;

  // One in-flight GenerationHandle per conversationId — new message cancels previous
  private readonly inFlight = new Map<string, GenerationHandle>();
  private readonly conversationLanguages = new Map<string, CustomerLanguage>();
  private readonly maxLanguageMemoryEntries = 10_000;
  private agentModelConfig!: AgentModelConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly catalogService: CatalogService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly contextBuilder: AgentContextBuilder,
    @Optional() private readonly ragService: RagService | null,
  ) {}

  async onModuleInit() {
    this.agentModelConfig = resolveAgentModelConfig(this.configService);
    this.graph = await buildAgentGraph({
      modelConfig: this.agentModelConfig,
      catalogService: this.catalogService,
      prisma: this.prisma,
      ragService: this.ragService ?? null,
    });
    this.logger.log(`Agent graph initialized with primary=${this.agentModelConfig.primaryModel} fast=${this.agentModelConfig.fastModel}`);
  }

  async processMessage(text: string, ctx: AgentContext): Promise<string | null> {
    this.logger.debug(`processMessage phone=${ctx.phone} businessId=${ctx.businessId}`);

    // Cancel any previous in-flight generation for this conversation
    const existing = this.inFlight.get(ctx.conversationId);
    if (existing && !existing.done) {
      this.logger.debug(`Cancelling previous generation for ${ctx.conversationId}`);
      existing.cancel();
    }

    const handle = new GenerationHandle(`gen_${ctx.conversationId}_${Date.now()}`);
    this.inFlight.set(ctx.conversationId, handle);

    const startMs = Date.now();
    const turnId = `turn_${Date.now()}`;

    try {
      if (handle.cancelled) return null;

      // Build agent context (business profile + lead + recent bookings).
      // The business profile is cached for 5min so this is cheap on repeat turns.
      const builtContext = await this.contextBuilder.build({
        businessId: ctx.businessId,
        leadId: ctx.leadId,
        phone: ctx.phone,
      });
      const businessType = ctx.businessType ?? builtContext.businessProfile.business_type;

      const previousLanguage = await this.getPreviousConversationLanguage(ctx.conversationId);
      const languageDetection = detectCustomerLanguage(text, previousLanguage);
      const customerLanguage = languageDetection.language;
      await this.rememberConversationLanguage(ctx.conversationId, customerLanguage);
      const bookingMethods = await this.resolveBookingMethods(ctx.businessId);

      if (!bookingMethods.ai_chat.enabled) {
        return bookingMethods.human_handoff.enabled
          ? 'I will connect you with our team to help with this booking.'
          : 'Online booking support is currently disabled. Please contact the business directly.';
      }

      const result = await agentRunContextStorage.run(
        {
          businessId: ctx.businessId,
          businessType,
          customerLanguage,
          leadId: ctx.leadId ?? builtContext.lead?.lead_id,
          phone: ctx.phone,
          conversationId: ctx.conversationId,
          lead: builtContext.lead,
          businessProfile: builtContext.businessProfile,
          recentBookings: builtContext.recentBookings,
        },
        () =>
          this.graph.invoke(
            {
              messages: [new HumanMessage(text)],
              intent: '',
              businessId: ctx.businessId,
              businessType,
              bookingMethodsSummary: summarizeBookingMethodsForAgent(bookingMethods),
              customerLanguage,
              leadId: ctx.leadId ?? builtContext.lead?.lead_id,
              phone: ctx.phone,
              businessProfile: builtContext.businessProfile,
              lead: builtContext.lead,
              recentBookings: builtContext.recentBookings,
            },
            { configurable: { thread_id: ctx.conversationId } },
          ),
      );

      if (handle.cancelled) return null;

      const reply = result.messages.at(-1)?.content;
      const replyStr = typeof reply === 'string' ? reply : JSON.stringify(reply);

      const durationMs = Date.now() - startMs;
      const toolsExecuted: string[] = result.messages
        .filter((m: any) => typeof m.getType === 'function' && m.getType() === 'tool')
        .map((m: any) => m.name ?? 'unknown');

      this.eventEmitter.emit('agent.turn.completed', {
        conversationId: ctx.conversationId,
        businessId: ctx.businessId,
        turnId,
        intent: result.intent ?? '',
        model: this.agentModelConfig.primaryModel,
        durationMs,
        toolsExecuted,
        cancelled: false,
        timestamp: new Date(),
      } satisfies Partial<AgentTurnMetrics>);

      if (ctx.leadId) {
        this.syncLeadEvents(ctx, result.messages, replyStr).catch((e) =>
          this.logger.error(`syncLeadEvents failed for lead ${ctx.leadId}: ${e.message}`),
        );
      }

      return replyStr;
    } finally {
      handle._markDone();
      if (this.inFlight.get(ctx.conversationId) === handle) {
        this.inFlight.delete(ctx.conversationId);
      }
    }
  }

  // ─── Lead event sync (fire-and-forget) ────────────────────────────────────

  private async syncLeadEvents(ctx: AgentContext, messages: any[], reply: string) {
    const { leadId, businessId } = ctx;

    // Activate lead: new → active (idempotent)
    const lead = await this.prisma.leads.findUnique({
      where: { lead_id: leadId },
      select: { status: true },
    });

    if (lead?.status === 'new') {
      await this.prisma.$transaction([
        this.prisma.leads.update({
          where: { lead_id: leadId },
          data: { status: 'active', updated_at: new Date() },
        }),
        this.prisma.lead_events.create({
          data: {
            lead_id: leadId,
            business_id: businessId,
            type: 'status_changed',
            actor: 'ai',
            data: { from: 'new', to: 'active' } as any,
          },
        }),
      ]);
      this.logger.log(`Lead ${leadId} activated (new → active)`);
    }

    // Handoff event — use typed decoder instead of raw string parse
    const handoff = decodeHandoff(reply);
    if (handoff) {
      await this.prisma.lead_events.create({
        data: {
          lead_id: leadId,
          business_id: businessId,
          type: 'handoff',
          actor: 'ai',
          data: handoff as any,
        },
      });
      this.logger.log(`Lead ${leadId} handoff event written`);
    }

    // Demand miss — detect from check_availability / check_slots tool results
    for (const msg of messages) {
      const msgType = typeof msg.getType === 'function' ? msg.getType() : (msg._getType?.() ?? '');
      if (msgType === 'tool') {
        const content = String(msg.content ?? '');
        if (content.startsWith('No rooms available') || content.startsWith('No availability') || content.startsWith('No available slots')) {
          const match = content.match(/from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/);
          await this.prisma.lead_events.create({
            data: {
              lead_id: leadId,
              business_id: businessId,
              type: 'demand_miss',
              actor: 'ai',
              data: {
                check_in: match?.[1] ?? null,
                check_out: match?.[2] ?? null,
                message: content,
              } as any,
            },
          });
          this.logger.log(`Lead ${leadId} demand_miss event written`);
        }
      }
    }
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

  private async resolveBookingMethods(businessId: string) {
    const settings = await (this.prisma.business_settings as any).findUnique({
      where: { business_id: businessId },
      select: { booking_methods: true },
    }).catch(() => null);

    return normalizeBookingMethodsConfig(settings?.booking_methods);
  }
}
