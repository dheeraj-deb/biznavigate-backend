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
  vectorScore?: number;
  keywordScore?: number;
  metadata: Record<string, any>;
}

export interface RagDocumentListItem {
  id: string;
  collection: string;
  text: string;
  metadata: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly embeddings: OpenAIEmbeddings;
  private readonly resultCacheTtlMs = 6 * 60 * 60 * 1000;
  private readonly embeddingCacheTtlMs = 24 * 60 * 60 * 1000;
  private readonly chunkMaxChars = 1_200;
  private readonly chunkOverlapChars = 180;

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
    const docs = await this.buildEmbeddedDocuments(businessId, collection, documents);

    await this.ragModel.insertMany(docs);
    await this.bumpCollectionCacheVersion(businessId, collection);
    this.logger.log(`Ingested ${docs.length} documents for business=${businessId} collection=${collection}`);
    return docs.length;
  }

  async replaceDocuments(
    businessId: string,
    collection: string,
    documents: { text: string; metadata?: Record<string, any> }[],
  ): Promise<number> {
    const docs = await this.buildEmbeddedDocuments(businessId, collection, documents);

    await this.ragModel.deleteMany({ businessId, collection });
    if (docs.length) await this.ragModel.insertMany(docs);
    await this.bumpCollectionCacheVersion(businessId, collection);
    this.logger.log(`Replaced ${docs.length} documents for business=${businessId} collection=${collection}`);
    return docs.length;
  }

  private async buildEmbeddedDocuments(
    businessId: string,
    collection: string,
    documents: { text: string; metadata?: Record<string, any> }[],
  ) {
    const chunks = documents.flatMap((doc, docIndex) => {
      const normalizedText = this.normalizeDocumentText(doc.text);
      return this.chunkText(normalizedText).map((text, chunkIndex, allChunks) => ({
        businessId,
        collection,
        text,
        metadata: {
          ...(doc.metadata ?? {}),
          document_index: docIndex,
          chunk_index: chunkIndex,
          chunk_count: allChunks.length,
          is_chunked: allChunks.length > 1,
        },
      }));
    });

    const texts = chunks.map((d) => d.text);
    const embeddings = await this.embeddings.embedDocuments(texts);

    return chunks.map((doc, i) => ({
      ...doc,
      embedding: embeddings[i],
    }));
  }

  async listDocuments(businessId: string, collection?: string): Promise<RagDocumentListItem[]> {
    const filter: any = { businessId };
    if (collection) filter.collection = collection;

    const docs = await this.ragModel
      .find(filter)
      .select('collection text metadata createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc: any) => ({
      id: String(doc._id),
      collection: doc.collection,
      text: doc.text,
      metadata: doc.metadata ?? {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
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
      .map((doc) => {
        const vectorScore = cosineSimilarity(queryEmbedding, doc.embedding);
        const keywordScore = lexicalScore(normalizedQuery, doc.text);
        return {
        text: doc.text,
        metadata: doc.metadata ?? {},
          vectorScore,
          keywordScore,
          score: (vectorScore * 0.75) + (keywordScore * 0.25),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(limit, 1));

    const relevant = scored.filter((d) => d.score >= threshold || d.keywordScore >= 0.2);
    const results = (relevant.length ? relevant : scored).slice(0, limit);

    await this.cache.set(resultCacheKey, results, this.resultCacheTtlMs);

    return results;
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

  private normalizeDocumentText(text: string): string {
    return text.trim().replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');
  }

  private chunkText(text: string): string[] {
    if (text.length <= this.chunkMaxChars) return [text];

    const paragraphs = text.split(/\n\s*\n/g).map((item) => item.trim()).filter(Boolean);
    const chunks: string[] = [];
    let current = '';

    for (const paragraph of paragraphs) {
      if (paragraph.length > this.chunkMaxChars) {
        if (current) {
          chunks.push(current);
          current = '';
        }
        chunks.push(...this.chunkLongText(paragraph));
        continue;
      }

      const next = current ? `${current}\n\n${paragraph}` : paragraph;
      if (next.length > this.chunkMaxChars) {
        chunks.push(current);
        current = paragraph;
      } else {
        current = next;
      }
    }

    if (current) chunks.push(current);
    return chunks.length ? chunks : [text];
  }

  private chunkLongText(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + this.chunkMaxChars, text.length);
      chunks.push(text.slice(start, end).trim());
      if (end === text.length) break;
      start = Math.max(end - this.chunkOverlapChars, start + 1);
    }

    return chunks.filter(Boolean);
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

function lexicalScore(query: string, text: string): number {
  const queryTerms = tokenize(query);
  if (!queryTerms.length) return 0;

  const textTerms = new Set(tokenize(text));
  const matchedTerms = queryTerms.filter((term) => textTerms.has(term));
  return matchedTerms.length / queryTerms.length;
}

function tokenize(value: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'can', 'do', 'does', 'for', 'from',
    'have', 'how', 'i', 'in', 'is', 'it', 'of', 'on', 'or', 'our', 'the',
    'to', 'we', 'what', 'when', 'where', 'with', 'you', 'your',
  ]);

  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((term) => term.trim())
    .filter((term) => term.length > 1 && !stopWords.has(term));
}
