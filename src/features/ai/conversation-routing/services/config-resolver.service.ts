import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { getRedis } from '../../../../utils/redis';
import {
  ConversationCapabilities,
  ConversationFlow,
  ConversationMode,
  ConversationRules,
  ResolvedConversationConfig,
} from '../types/conversation-routing.types';

const DEFAULT_CONFIG: Omit<ResolvedConversationConfig, 'tenantId' | 'wabaId'> = {
  mode: 'text',
  flow: 'support',
  capabilities: {
    buttons: false,
    lists: false,
    ctas: false,
    maxButtons: 3,
    maxListItems: 10,
  },
  rules: {
    tone: 'friendly, concise, and helpful',
    escalation: { enabled: true },
  },
};

@Injectable()
export class ConfigResolverService {
  private readonly logger = new Logger(ConfigResolverService.name);
  private readonly ttlSeconds = 300;

  constructor(private readonly prisma: PrismaService) {}

  async resolve(tenantId: string, wabaId: string): Promise<ResolvedConversationConfig> {
    const key = this.cacheKey(tenantId, wabaId);
    const redis = getRedis();
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as ResolvedConversationConfig;

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT mode, flow, capabilities, rules
      FROM tenant_conversation_configs
      WHERE tenant_id = $1::uuid AND waba_id = $2 AND is_active = true
      LIMIT 1
      `,
      tenantId,
      wabaId,
    ).catch((error) => {
      this.logger.warn(`Config lookup failed for tenant=${tenantId} waba=${wabaId}: ${error?.message ?? error}`);
      return [];
    });

    const row = rows[0];
    const resolved: ResolvedConversationConfig = {
      tenantId,
      wabaId,
      mode: this.asMode(row?.mode),
      flow: this.asFlow(row?.flow),
      capabilities: this.asObject<ConversationCapabilities>(row?.capabilities, DEFAULT_CONFIG.capabilities),
      rules: this.asObject<ConversationRules>(row?.rules, DEFAULT_CONFIG.rules),
    };

    await redis.set(key, JSON.stringify(resolved), 'EX', this.ttlSeconds);
    return resolved;
  }

  cacheKey(tenantId: string, wabaId: string): string {
    return `conv_config:${tenantId}:${wabaId}`;
  }

  private asMode(value: unknown): ConversationMode {
    return value === 'interactive' || value === 'web' || value === 'text' ? value : DEFAULT_CONFIG.mode;
  }

  private asFlow(value: unknown): ConversationFlow {
    return value === 'sales' || value === 'booking' || value === 'ordering' || value === 'support'
      ? value
      : DEFAULT_CONFIG.flow;
  }

  private asObject<T extends Record<string, unknown>>(value: unknown, fallback: T): T {
    return value && typeof value === 'object' ? { ...fallback, ...(value as T) } : fallback;
  }
}
