import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HumanMessage } from '@langchain/core/messages';
import { buildAgentGraph } from './graph/agent-graph';
import { InventoryService } from '../inventory/inventory.service';
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
    private readonly prisma: PrismaService,
  ) { }

  async onModuleInit() {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    this.graph = await buildAgentGraph({ openaiApiKey, databaseUrl, inventoryService: this.inventoryService, prisma: this.prisma });
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
    return typeof reply === 'string' ? reply : JSON.stringify(reply);
  }
}
