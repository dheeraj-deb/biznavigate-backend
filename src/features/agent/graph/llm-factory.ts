import { ChatOpenAI } from '@langchain/openai';
import { StructuredTool } from '@langchain/core/tools';
import { BaseMessage } from '@langchain/core/messages';

interface ProviderEntry {
  llm: ChatOpenAI;
  available: boolean;
  failedAt?: number;
  readonly cooldownMs: number;
}

export interface LLMConfig {
  model: string;
  apiKey: string;
  temperature: number;
}

// Mirrors agents-js FallbackAdapter: tracks per-model availability, rotates on failure,
// restores models after a cooldown period.
export class LLMFallbackAdapter {
  private readonly providers: ProviderEntry[];

  constructor(configs: LLMConfig[]) {
    this.providers = configs.map((c) => ({
      llm: new ChatOpenAI({ model: c.model, apiKey: c.apiKey, temperature: c.temperature }),
      available: true,
      cooldownMs: 60_000,
    }));
  }

  bindTools(tools: StructuredTool[]): LLMFallbackAdapter {
    const bound = new LLMFallbackAdapter([]);
    bound['providers'].push(
      ...this.providers.map((p) => ({
        ...p,
        llm: p.llm.bindTools(tools) as unknown as ChatOpenAI,
      })),
    );
    return bound;
  }

  pick(): ChatOpenAI {
    const now = Date.now();
    for (const p of this.providers) {
      if (!p.available && p.failedAt && now - p.failedAt > p.cooldownMs) {
        p.available = true;
      }
      if (p.available) return p.llm;
    }
    // All failed — return last as best-effort
    return this.providers.at(-1)!.llm;
  }

  markFailed(llm: ChatOpenAI): void {
    const p = this.providers.find((x) => x.llm === llm);
    if (p) {
      p.available = false;
      p.failedAt = Date.now();
    }
  }

  async invoke(messages: BaseMessage[]): Promise<any> {
    for (let i = 0; i < this.providers.length; i++) {
      const llm = this.pick();
      try {
        return await llm.invoke(messages);
      } catch (err) {
        this.markFailed(llm);
        if (i === this.providers.length - 1) throw err;
      }
    }
  }
}
