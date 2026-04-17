import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
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