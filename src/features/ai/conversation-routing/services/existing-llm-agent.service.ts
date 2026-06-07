import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
  createChatModel,
  resolveAgentModelConfig,
} from '../../agent/graph/llm-factory';
import {
  AgentStructuredResponse,
  ContextPacket,
} from '../types/conversation-routing.types';

@Injectable()
export class ExistingLlmAgentService {
  private readonly logger = new Logger(ExistingLlmAgentService.name);

  constructor(private readonly configService: ConfigService) {}

  async respond(context: ContextPacket, userMessage: string): Promise<AgentStructuredResponse> {
    const modelConfig = resolveAgentModelConfig(this.configService);
    if (!modelConfig.apiKey) {
      this.logger.warn('OPENAI_API_KEY is missing; returning safe fallback response');
      return {
        type: 'text',
        message: 'I am unable to process this right now. Our team will help you shortly.',
        intent: 'agent_unavailable',
      };
    }

    try {
      const llm = createChatModel({
        model: modelConfig.primaryModel,
        apiKey: modelConfig.apiKey,
        baseUrl: modelConfig.baseUrl,
        temperature: 0.2,
        maxTokens: 700,
      });

      const result = await Promise.race([
        llm.invoke([
          new SystemMessage(context.systemPrompt),
          ...context.history.map((item) =>
            item.role === 'assistant'
              ? new SystemMessage(`Previous assistant message: ${item.text}`)
              : new HumanMessage(item.text),
          ),
          new HumanMessage([
            `Injected context: ${JSON.stringify({
              mode: context.config.mode,
              flow: context.config.flow,
              capabilities: context.config.capabilities,
              rules: context.config.rules,
              session: context.session,
              business: context.business,
            })}`,
            `User message: ${userMessage}`,
          ].join('\n')),
        ]),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('LLM timeout after 3000ms')), 3000),
        ),
      ]);

      const content = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
      return this.parseStructuredResponse(content);
    } catch (error: any) {
      this.logger.warn(`Existing LLM response failed: ${error?.message ?? error}`);
      return {
        type: 'text',
        message: 'I am checking that for you. Our team will help complete the next step.',
        intent: 'agent_error',
      };
    }
  }

  private parseStructuredResponse(text: string): AgentStructuredResponse {
    const parsed = JSON.parse(this.stripJsonFence(text));
    const type = ['text', 'buttons', 'list', 'link'].includes(parsed?.type) ? parsed.type : 'text';
    return {
      type,
      message: String(parsed?.message ?? '').slice(0, 2000) || 'How can I help you?',
      options: Array.isArray(parsed?.options) ? parsed.options : undefined,
      items: Array.isArray(parsed?.items) ? parsed.items : undefined,
      metadata: parsed?.metadata && typeof parsed.metadata === 'object' ? parsed.metadata : undefined,
      intent: typeof parsed?.intent === 'string' ? parsed.intent : undefined,
      switch_flow: parsed?.switch_flow === true,
      target_flow: parsed?.target_flow,
    };
  }

  private stripJsonFence(text: string): string {
    return text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  }
}
