import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HumanMessage } from '@langchain/core/messages';
import { buildAgentGraph } from './graph/agent-graph';
import { InventoryService } from '../inventory/application/services/inventory.service';
import { BookingService } from '../bookings/application/services/booking.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface AgentContext {
  businessId: string;
  leadId?: string;
  phone: string;
  conversationId: string; // used as LangGraph thread_id for multi-turn memory
}

@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);
  private graph: Awaited<ReturnType<typeof buildAgentGraph>>;

  constructor(
    private readonly configService: ConfigService,
    private readonly inventoryService: InventoryService,
    private readonly bookingService: BookingService,
    private readonly prisma: PrismaService,
  ) { }

  async onModuleInit() {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    this.graph = await buildAgentGraph({ openaiApiKey, databaseUrl, inventoryService: this.inventoryService, bookingService: this.bookingService, prisma: this.prisma });
    this.logger.log('Agent graph initialized with PostgreSQL checkpointer');
  }

  async processMessage(text: string, ctx: AgentContext): Promise<string> {
    this.logger.debug(`processMessage phone=${ctx.phone} businessId=${ctx.businessId}`);

    const result = await this.graph.invoke(
      {
        messages: [new HumanMessage(text)],
        intent: '',
        businessId: ctx.businessId,
        leadId: ctx.leadId,
        phone: ctx.phone,
      },
      { configurable: { thread_id: ctx.conversationId } },
    );

    const reply = result.messages.at(-1)?.content;
    const replyStr = typeof reply === 'string' ? reply : JSON.stringify(reply);

    // Write lead_events based on what happened in this turn
    if (ctx.leadId) {
      this.syncLeadEvents(ctx, result.messages, replyStr).catch((e) =>
        this.logger.error(`syncLeadEvents failed for lead ${ctx.leadId}: ${e.message}`),
      );
    }

    return replyStr;
  }

  // ─── Lead event sync (fire-and-forget, never blocks the reply) ────────────

  private async syncLeadEvents(ctx: AgentContext, messages: any[], reply: string) {
    const { leadId, businessId } = ctx;

    // 1. Activate lead: new → active (idempotent)
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

    // 2. Handoff event
    if (reply.startsWith('HANDOFF:')) {
      try {
        const { reason } = JSON.parse(reply.slice(8));
        await this.prisma.lead_events.create({
          data: {
            lead_id: leadId,
            business_id: businessId,
            type: 'handoff',
            actor: 'ai',
            data: { reason } as any,
          },
        });
        this.logger.log(`Lead ${leadId} handoff event written`);
      } catch {
        // malformed HANDOFF payload — skip
      }
    }

    // 3. Demand miss — detect from check_availability tool result
    for (const msg of messages) {
      const msgType = typeof msg.getType === 'function' ? msg.getType() : (msg._getType?.() ?? '');
      if (msgType === 'tool') {
        const content = String(msg.content ?? '');
        if (content.startsWith('No rooms available from ') || content.startsWith('No availability')) {
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
