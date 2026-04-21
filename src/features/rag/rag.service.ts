import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
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

  constructor(
    @InjectModel(RagDocument.name) private readonly ragModel: Model<RagDocumentDoc>,
    private readonly config: ConfigService,
  ) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: this.config.getOrThrow<string>('OPENAI_API_KEY'),
      model: 'text-embedding-3-small',
      dimensions: 1536,
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
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Fetch all docs for this business+collection (MongoDB Atlas needed for $vectorSearch)
    // We do in-process cosine similarity since pgvector is unavailable
    const docs = await this.ragModel
      .find({ businessId, collection })
      .select('text embedding metadata')
      .lean();

    if (!docs.length) return [];

    const scored = docs
      .map((doc) => ({
        text: doc.text,
        metadata: doc.metadata ?? {},
        score: cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .filter((d) => d.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  async deleteDocuments(businessId: string, collection?: string): Promise<void> {
    const filter: any = { businessId };
    if (collection) filter.collection = collection;
    await this.ragModel.deleteMany(filter);
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
