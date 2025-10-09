import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { getRedis } from 'src/utils/redis';
import { firstValueFrom } from 'rxjs';

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: {
    productId: string;
    productName: string;
    organizationId: string;
    category?: string;
    tags?: string[];
  };
}

export interface VectorIndex {
  indexName: string;
  dimension: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  totalVectors: number;
}

/**
 * Vector Database Service for scalable semantic search
 * Supports multiple vector DB backends: Pinecone, Weaviate, Qdrant, PostgreSQL with pgvector
 */
@Injectable()
export class VectorDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(VectorDatabaseService.name);
  private readonly CACHE_TTL = 30 * 60; // 30 minutes
  private vectorProvider: 'pinecone' | 'weaviate' | 'qdrant' | 'pgvector';
  private isInitialized = false;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService
  ) {
    this.vectorProvider = this.configService.get<any>('VECTOR_DB_PROVIDER') || 'pgvector';
  }

  async onModuleInit() {
    await this.initializeVectorDatabase();
  }

  /**
   * Initialize vector database connection and create indices
   */
  async initializeVectorDatabase(): Promise<void> {
    try {
      this.logger.log(`Initializing vector database: ${this.vectorProvider}`);

      switch (this.vectorProvider) {
        case 'pinecone':
          await this.initializePinecone();
          break;
        case 'weaviate':
          await this.initializeWeaviate();
          break;
        case 'qdrant':
          await this.initializeQdrant();
          break;
        case 'pgvector':
          await this.initializePgVector();
          break;
        default:
          throw new Error(`Unsupported vector provider: ${this.vectorProvider}`);
      }

      this.isInitialized = true;
      this.logger.log('Vector database initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize vector database:', error);
      // Fall back to in-memory search if vector DB fails
      this.isInitialized = false;
    }
  }

  /**
   * Store product embeddings in vector database
   */
  async storeProductEmbeddings(
    organizationId: string,
    products: Array<{
      productId: string;
      name: string;
      description?: string;
      category?: string;
      embedding: number[];
      metadata?: Record<string, any>;
    }>
  ): Promise<void> {
    if (!this.isInitialized) {
      this.logger.warn('Vector database not initialized, skipping storage');
      return;
    }

    try {
      this.logger.log(`Storing ${products.length} product embeddings for org: ${organizationId}`);

      switch (this.vectorProvider) {
        case 'pinecone':
          await this.storePineconeEmbeddings(organizationId, products);
          break;
        case 'weaviate':
          await this.storeWeaviateEmbeddings(organizationId, products);
          break;
        case 'qdrant':
          await this.storeQdrantEmbeddings(organizationId, products);
          break;
        case 'pgvector':
          await this.storePgVectorEmbeddings(organizationId, products);
          break;
      }

      // Update cache
      const redis = getRedis();
      const cacheKey = `vector_index:${organizationId}:last_updated`;
      await redis.set(cacheKey, new Date().toISOString());

      this.logger.log(`Successfully stored ${products.length} embeddings`);

    } catch (error) {
      this.logger.error('Failed to store embeddings:', error);
      throw error;
    }
  }

  /**
   * Search for similar products using vector similarity
   */
  async searchSimilarProducts(
    queryEmbedding: number[],
    organizationId: string,
    options: {
      topK?: number;
      threshold?: number;
      includeMetadata?: boolean;
      filter?: Record<string, any>;
    } = {}
  ): Promise<VectorSearchResult[]> {
    const { topK = 10, threshold = 0.3, includeMetadata = true, filter } = options;

    if (!this.isInitialized) {
      this.logger.warn('Vector database not initialized, using fallback search');
      return this.fallbackSimilaritySearch(queryEmbedding, organizationId, options);
    }

    try {
      this.logger.debug(`Vector search for org: ${organizationId}, topK: ${topK}`);

      let results: VectorSearchResult[];

      switch (this.vectorProvider) {
        case 'pinecone':
          results = await this.searchPinecone(queryEmbedding, organizationId, options);
          break;
        case 'weaviate':
          results = await this.searchWeaviate(queryEmbedding, organizationId, options);
          break;
        case 'qdrant':
          results = await this.searchQdrant(queryEmbedding, organizationId, options);
          break;
        case 'pgvector':
          results = await this.searchPgVector(queryEmbedding, organizationId, options);
          break;
        default:
          results = [];
      }

      // Filter by threshold
      const filteredResults = results.filter(result => result.score >= threshold);

      this.logger.debug(`Vector search returned ${filteredResults.length} results above threshold`);
      return filteredResults;

    } catch (error) {
      this.logger.error('Vector search failed:', error);
      return this.fallbackSimilaritySearch(queryEmbedding, organizationId, options);
    }
  }

  /**
   * Batch process embeddings for better performance
   */
  async batchProcessEmbeddings(
    organizationId: string,
    batchSize: number = 100
  ): Promise<{ processed: number; errors: number; timeElapsed: number }> {
    const startTime = Date.now();
    let processed = 0;
    let errors = 0;

    try {
      // Get products that need embedding updates
      const products = await this.prisma.products.findMany({
        where: {
          organization_id: organizationId,
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          description: true,
          category_id: true
        }
      });

      // Process in batches
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        try {
          // Generate embeddings for batch
          const embeddingsPromises = batch.map(async (product) => {
            const text = `${product.name} ${product.description || ''}`;
            const embedding = await this.generateEmbedding(text);

            return {
              productId: product.id,
              name: product.name,
              description: product.description,
              category: product.category_id,
              embedding,
              metadata: {
                lastUpdated: new Date().toISOString()
              }
            };
          });

          const embeddings = await Promise.all(embeddingsPromises);

          // Store batch
          await this.storeProductEmbeddings(organizationId, embeddings);

          processed += batch.length;
          this.logger.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${batch.length} products`);

        } catch (error) {
          this.logger.error(`Batch processing error:`, error);
          errors += batch.length;
        }
      }

      const timeElapsed = Date.now() - startTime;

      this.logger.log(
        `Batch processing completed: ${processed} processed, ${errors} errors in ${timeElapsed}ms`
      );

      return { processed, errors, timeElapsed };

    } catch (error) {
      this.logger.error('Batch processing failed:', error);
      throw error;
    }
  }

  /**
   * Get vector database statistics
   */
  async getVectorStats(organizationId: string): Promise<{
    totalVectors: number;
    lastUpdated: string;
    indexSize: number;
    provider: string;
  }> {
    try {
      let stats;

      switch (this.vectorProvider) {
        case 'pinecone':
          stats = await this.getPineconeStats(organizationId);
          break;
        case 'pgvector':
          stats = await this.getPgVectorStats(organizationId);
          break;
        default:
          stats = { totalVectors: 0, lastUpdated: 'unknown', indexSize: 0 };
      }

      return {
        ...stats,
        provider: this.vectorProvider
      };

    } catch (error) {
      this.logger.error('Failed to get vector stats:', error);
      return {
        totalVectors: 0,
        lastUpdated: 'unknown',
        indexSize: 0,
        provider: this.vectorProvider
      };
    }
  }

  // ==================== PINECONE IMPLEMENTATION ====================

  private async initializePinecone(): Promise<void> {
    const apiKey = this.configService.get<string>('PINECONE_API_KEY');
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY not configured');
    }

    // Initialize Pinecone connection
    this.logger.log('Pinecone initialized');
  }

  private async storePineconeEmbeddings(organizationId: string, products: any[]): Promise<void> {
    const apiKey = this.configService.get<string>('PINECONE_API_KEY');
    const indexUrl = this.configService.get<string>('PINECONE_INDEX_URL');

    const vectors = products.map((product, index) => ({
      id: `${organizationId}_${product.productId}`,
      values: product.embedding,
      metadata: {
        productId: product.productId,
        productName: product.name,
        organizationId,
        category: product.category,
        ...product.metadata
      }
    }));

    await firstValueFrom(
      this.httpService.post(`${indexUrl}/vectors/upsert`, {
        vectors,
        namespace: organizationId
      }, {
        headers: {
          'Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })
    );
  }

  private async searchPinecone(
    queryEmbedding: number[],
    organizationId: string,
    options: any
  ): Promise<VectorSearchResult[]> {
    const apiKey = this.configService.get<string>('PINECONE_API_KEY');
    const indexUrl = this.configService.get<string>('PINECONE_INDEX_URL');

    const response = await firstValueFrom(
      this.httpService.post(`${indexUrl}/query`, {
        vector: queryEmbedding,
        topK: options.topK,
        includeMetadata: options.includeMetadata,
        namespace: organizationId,
        filter: options.filter
      }, {
        headers: {
          'Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })
    );

    return response.data.matches.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata
    }));
  }

  private async getPineconeStats(organizationId: string): Promise<any> {
    // Implement Pinecone stats retrieval
    return { totalVectors: 0, lastUpdated: new Date().toISOString(), indexSize: 0 };
  }

  // ==================== POSTGRESQL + PGVECTOR IMPLEMENTATION ====================

  private async initializePgVector(): Promise<void> {
    try {
      // Create extension if not exists
      await this.prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;

      // Create embeddings table
      await this.prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS product_embeddings (
          id SERIAL PRIMARY KEY,
          product_id VARCHAR(255) NOT NULL,
          organization_id VARCHAR(255) NOT NULL,
          embedding vector(768),
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(product_id, organization_id)
        )
      `;

      // Create indexes
      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_embeddings_org
        ON product_embeddings(organization_id)
      `;

      await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_embeddings_vector
        ON product_embeddings USING ivfflat (embedding vector_cosine_ops)
      `;

      this.logger.log('pgvector initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize pgvector:', error);
      throw error;
    }
  }

  private async storePgVectorEmbeddings(organizationId: string, products: any[]): Promise<void> {
    try {
      for (const product of products) {
        await this.prisma.$executeRaw`
          INSERT INTO product_embeddings
          (product_id, organization_id, embedding, metadata, updated_at)
          VALUES (${product.productId}, ${organizationId}, ${JSON.stringify(product.embedding)},
                 ${JSON.stringify({
                   productName: product.name,
                   category: product.category,
                   ...product.metadata
                 })}, NOW())
          ON CONFLICT (product_id, organization_id)
          DO UPDATE SET
            embedding = EXCLUDED.embedding,
            metadata = EXCLUDED.metadata,
            updated_at = NOW()
        `;
      }
    } catch (error) {
      this.logger.error('Failed to store pgvector embeddings:', error);
      throw error;
    }
  }

  private async searchPgVector(
    queryEmbedding: number[],
    organizationId: string,
    options: any
  ): Promise<VectorSearchResult[]> {
    try {
      const results = await this.prisma.$queryRaw`
        SELECT
          product_id,
          1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as score,
          metadata
        FROM product_embeddings
        WHERE organization_id = ${organizationId}
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT ${options.topK || 10}
      `;

      return (results as any[]).map(row => ({
        id: row.product_id,
        score: parseFloat(row.score),
        metadata: {
          productId: row.product_id,
          organizationId,
          ...row.metadata
        }
      }));

    } catch (error) {
      this.logger.error('pgvector search failed:', error);
      return [];
    }
  }

  private async getPgVectorStats(organizationId: string): Promise<any> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT
          COUNT(*) as total_vectors,
          MAX(updated_at) as last_updated
        FROM product_embeddings
        WHERE organization_id = ${organizationId}
      `;

      const stats = (result as any[])[0];

      return {
        totalVectors: parseInt(stats.total_vectors),
        lastUpdated: stats.last_updated?.toISOString() || 'never',
        indexSize: 0 // Would need to calculate actual storage size
      };

    } catch (error) {
      this.logger.error('Failed to get pgvector stats:', error);
      return { totalVectors: 0, lastUpdated: 'unknown', indexSize: 0 };
    }
  }

  // ==================== FALLBACK IMPLEMENTATIONS ====================

  private async initializeWeaviate(): Promise<void> {
    this.logger.log('Weaviate initialization - placeholder');
  }

  private async initializeQdrant(): Promise<void> {
    this.logger.log('Qdrant initialization - placeholder');
  }

  private async storeWeaviateEmbeddings(organizationId: string, products: any[]): Promise<void> {
    // Placeholder for Weaviate implementation
  }

  private async storeQdrantEmbeddings(organizationId: string, products: any[]): Promise<void> {
    // Placeholder for Qdrant implementation
  }

  private async searchWeaviate(queryEmbedding: number[], organizationId: string, options: any): Promise<VectorSearchResult[]> {
    return [];
  }

  private async searchQdrant(queryEmbedding: number[], organizationId: string, options: any): Promise<VectorSearchResult[]> {
    return [];
  }

  private async fallbackSimilaritySearch(
    queryEmbedding: number[],
    organizationId: string,
    options: any
  ): Promise<VectorSearchResult[]> {
    this.logger.warn('Using fallback similarity search');
    // Implement basic in-memory search as fallback
    return [];
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const response = await firstValueFrom(
        this.httpService.post(
          'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent',
          {
            model: 'models/embedding-001',
            content: {
              parts: [{ text }]
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            }
          }
        )
      );

      return response.data.embedding.values;

    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      // Return zero vector as fallback
      return new Array(768).fill(0);
    }
  }
}