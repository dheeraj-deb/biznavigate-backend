import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Cache } from 'cache-manager';
import { createHash } from 'node:crypto';
import { RagDocument, RagDocumentDoc } from './schemas/rag-document.schema';

export interface SearchResult {
  text: string;
  score: number;
  metadata: Record<string, any>;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly embeddings: OpenAIEmbeddings;
  private readonly resultCacheTtlMs = 6 * 60 * 60 * 1000;
  private readonly embeddingCacheTtlMs = 24 * 60 * 60 * 1000;

  constructor(
    @InjectModel(RagDocument.name) private readonly ragModel: Model<RagDocumentDoc>,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: this.config.getOrThrow<string>('OPENAI_API_KEY'),
      model: this.config.get<string>('AI_EMBEDDING_MODEL') ?? 'text-embedding-3-small',
      dimensions: 1536,
      configuration: this.config.get<string>('OPENAI_BASE_URL')
        ? { baseURL: this.config.get<string>('OPENAI_BASE_URL') }
        : undefined,
    });
  }

  async ingestDocuments(
    businessId: string,
    collection: string,
    documents: { text: string; metadata?: Record<string, any> }[],
  ): Promise<number> {
    const texts = documents.map((d) => d.text);
    const embeddings = await this.embeddings.embedDocuments(texts);

    const docs = documents.map((doc, i) => ({
      businessId,
      collection,
      text: doc.text,
      embedding: embeddings[i],
      metadata: doc.metadata ?? {},
    }));

    await this.ragModel.insertMany(docs);
    await this.bumpCollectionCacheVersion(businessId, collection);
    this.logger.log(`Ingested ${docs.length} documents for business=${businessId} collection=${collection}`);
    return docs.length;
  }

  async search(
    businessId: string,
    collection: string,
    query: string,
    limit = 3,
    threshold = 0.4,
  ): Promise<SearchResult[]> {
    const normalizedQuery = this.normalizeQuery(query);
    if (!normalizedQuery) return [];

    const resultCacheKey = await this.buildResultCacheKey(
      businessId,
      collection,
      normalizedQuery,
      limit,
      threshold,
    );
    const cachedResults = await this.cache.get<SearchResult[]>(resultCacheKey);
    if (cachedResults) {
      this.logger.debug(`RAG search cache hit: business=${businessId} collection=${collection}`);
      return cachedResults;
    }

    const queryEmbedding = await this.getCachedQueryEmbedding(normalizedQuery);

    // Fetch all docs for this business+collection (MongoDB Atlas needed for $vectorSearch)
    // We do in-process cosine similarity since pgvector is unavailable
    const docs = await this.ragModel
      .find({ businessId, collection })
      .select('text embedding metadata')
      .lean();

    if (!docs.length) {
      await this.cache.set(resultCacheKey, [], this.resultCacheTtlMs);
      return [];
    }

    const scored = docs
      .map((doc) => ({
        text: doc.text,
        metadata: doc.metadata ?? {},
        score: cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .filter((d) => d.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    await this.cache.set(resultCacheKey, scored, this.resultCacheTtlMs);

    return scored;
  }

  async deleteDocuments(businessId: string, collection?: string): Promise<void> {
    const filter: any = { businessId };
    const collections = collection
      ? [collection]
      : await this.ragModel.distinct('collection', { businessId });
    if (collection) filter.collection = collection;
    await this.ragModel.deleteMany(filter);
    await Promise.all(collections.map((item) => this.bumpCollectionCacheVersion(businessId, item)));
  }

  private async getCachedQueryEmbedding(normalizedQuery: string): Promise<number[]> {
    const cacheKey = `rag:embedding:${this.hash(normalizedQuery)}`;
    const cached = await this.cache.get<number[]>(cacheKey);
    if (cached) return cached;

    const embedding = await this.embeddings.embedQuery(normalizedQuery);
    await this.cache.set(cacheKey, embedding, this.embeddingCacheTtlMs);
    return embedding;
  }

  private async buildResultCacheKey(
    businessId: string,
    collection: string,
    normalizedQuery: string,
    limit: number,
    threshold: number,
  ): Promise<string> {
    const version = await this.getCollectionCacheVersion(businessId, collection);
    const queryHash = this.hash(normalizedQuery);
    return `rag:search:${businessId}:${collection}:v${version}:l${limit}:t${threshold}:${queryHash}`;
  }

  private async getCollectionCacheVersion(businessId: string, collection: string): Promise<string> {
    const key = this.collectionVersionKey(businessId, collection);
    const version = await this.cache.get<string>(key);
    if (version) return version;

    await this.cache.set(key, '1', this.embeddingCacheTtlMs);
    return '1';
  }

  private async bumpCollectionCacheVersion(businessId: string, collection: string): Promise<void> {
    const version = String(Date.now());
    await this.cache.set(this.collectionVersionKey(businessId, collection), version, this.embeddingCacheTtlMs);
  }

  private collectionVersionKey(businessId: string, collection: string): string {
    return `rag:version:${businessId}:${collection}`;
  }

  private normalizeQuery(query: string): string {
    return query.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
