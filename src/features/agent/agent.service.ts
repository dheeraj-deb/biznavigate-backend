import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HumanMessage } from '@langchain/core/messages';
import { buildAgentGraph } from './graph/agent-graph';
import { CatalogService } from '../catalog/catalog.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RagService } from '../rag/rag.service';
import { agentRunContextStorage } from './context/agent-run-context';
import { GenerationHandle } from './types/generation-handle';
import { decodeHandoff } from './types/handoff';
import { AgentTurnMetrics } from './types/agent-metrics';

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

  constructor(
    private readonly configService: ConfigService,
    private readonly catalogService: CatalogService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly ragService: RagService,
  ) {}

  async onModuleInit() {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') ?? '';
<<<<<<< HEAD
    try {
      this.graph = await buildAgentGraph({
        openaiApiKey,
        catalogService: this.catalogService,
        prisma: this.prisma,
      });
      this.logger.log('Agent graph initialized');
    } catch (err: any) {
      this.logger.warn(`Agent graph init failed (agent unavailable): ${err?.message}`);
    }
=======
    const databaseUrl = this.configService.get<string>('DATABASE_URL') ?? '';
    this.graph = await buildAgentGraph({
      openaiApiKey,
      databaseUrl,
      catalogService: this.catalogService,
      prisma: this.prisma,
      ragService: this.ragService,
    });
    this.logger.log('Agent graph initialized');
>>>>>>> daeb707a0b823904f997bd55116c7a725f7ad9c3
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

      // Resolve businessType if not supplied by the caller
      let businessType = ctx.businessType;
      if (!businessType) {
        const biz = await this.prisma.businesses.findUnique({
          where: { business_id: ctx.businessId },
          select: { business_type: true },
        });
        businessType = (biz?.business_type ?? 'default').toLowerCase();
      }

      // Wrap graph.invoke in AsyncLocalStorage so all tools can read context without
      // receiving businessId as an LLM-supplied parameter
      const result = await agentRunContextStorage.run(
        {
          businessId: ctx.businessId,
          businessType,
          leadId: ctx.leadId,
          phone: ctx.phone,
          conversationId: ctx.conversationId,
        },
        () =>
          this.graph.invoke(
            {
              messages: [new HumanMessage(text)],
              intent: '',
              businessId: ctx.businessId,
              businessType,
              leadId: ctx.leadId,
              phone: ctx.phone,
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
        model: 'gpt-4o',
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
}
