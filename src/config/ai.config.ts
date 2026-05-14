import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  agent: {
    baseUrl: process.env.OPENAI_BASE_URL,
    primaryModel: process.env.AI_PRIMARY_MODEL ?? process.env.OPENAI_PRIMARY_MODEL ?? 'gpt-4o',
    fastModel: process.env.AI_FAST_MODEL ?? process.env.OPENAI_FAST_MODEL ?? 'gpt-4o-mini',
    toolFallbackModel: process.env.AI_TOOL_FALLBACK_MODEL
      ?? process.env.OPENAI_TOOL_FALLBACK_MODEL
      ?? process.env.AI_FAST_MODEL
      ?? process.env.OPENAI_FAST_MODEL
      ?? 'gpt-4o-mini',
    summaryModel: process.env.AI_SUMMARY_MODEL
      ?? process.env.OPENAI_SUMMARY_MODEL
      ?? process.env.AI_FAST_MODEL
      ?? process.env.OPENAI_FAST_MODEL
      ?? 'gpt-4o-mini',
    embeddingModel: process.env.AI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      chat: 'gemini-pro',
      embedding: 'embedding-001',
    },
    settings: {
      temperature: 0.1,
      maxOutputTokens: 200,
      topP: 0.8,
      topK: 10,
    },
  },
  cache: {
    embeddingTtl: 24 * 60 * 60, // 24 hours
    searchTtl: 5 * 60, // 5 minutes
    prefix: 'ai_product:',
  },
}));
