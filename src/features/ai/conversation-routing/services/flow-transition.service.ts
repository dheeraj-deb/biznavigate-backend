import { Injectable } from '@nestjs/common';
import { getRedis } from '../../../../utils/redis';
import { AgentStructuredResponse, ConversationFlow, ContactSession } from '../types/conversation-routing.types';

@Injectable()
export class FlowTransitionService {
  private readonly ttlSeconds = 60 * 60 * 24;

  async applyIfNeeded(params: {
    tenantId: string;
    wabaId: string;
    session: ContactSession;
    response: AgentStructuredResponse;
  }): Promise<ContactSession> {
    if (!params.response.switch_flow || !this.isFlow(params.response.target_flow)) {
      return params.session;
    }

    const next: ContactSession = {
      ...params.session,
      activeFlow: params.response.target_flow,
      metadata: {
        ...(params.session.metadata ?? {}),
        last_flow_switch_at: new Date().toISOString(),
        previous_flow: params.session.activeFlow,
      },
    };

    await getRedis().set(this.sessionKey(params.tenantId, params.wabaId, params.session.conversationId), JSON.stringify(next), 'EX', this.ttlSeconds);
    return next;
  }

  async getSession(tenantId: string, wabaId: string, fallback: ContactSession): Promise<ContactSession> {
    const raw = await getRedis().get(this.sessionKey(tenantId, wabaId, fallback.conversationId));
    if (!raw) return fallback;
    try {
      return { ...fallback, ...(JSON.parse(raw) as ContactSession) };
    } catch {
      return fallback;
    }
  }

  private sessionKey(tenantId: string, wabaId: string, conversationId: string): string {
    return `conv_session:${tenantId}:${wabaId}:${conversationId}`;
  }

  private isFlow(value: unknown): value is ConversationFlow {
    return value === 'sales' || value === 'booking' || value === 'ordering' || value === 'support';
  }
}
