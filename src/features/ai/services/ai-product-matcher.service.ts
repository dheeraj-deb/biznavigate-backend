import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { VectorDatabaseService } from './vector-database.service';
import { getRedis } from 'src/utils/redis';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

export interface AIProductMatch {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  sellingPrice?: number;
  available?: boolean;
  confidence: number;
  similarityScore: number;
  embedding?: number[];
  correctedQuery?: string;
  extractionMethod: 'text' | 'image' | 'voice' | 'vector_search';
}

export interface AIProductExtractionResult {
  extractedProducts: {
    name: string;
    quantity: number;
    confidence: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }[];
  matches: AIProductMatch[];
  processingTime: number;
  correctedText?: string;
  originalQuery: string;
}

@Injectable()
export class AIProductMatcherService {
  private readonly logger = new Logger(AIProductMatcherService.name);
  private readonly EMBEDDING_CACHE_TTL = 24 * 60 * 60; // 24 hours
  private readonly SEARCH_CACHE_TTL = 5 * 60; // 5 minutes
  private readonly CACHE_PREFIX = 'ai_product:';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
    private vectorDb: VectorDatabaseService
  ) {}

  /**
   * Enhanced text-based product matching with spell correction and semantic search
   */
  async matchProductsFromText(
    input: string,
    organizationId: string,
    options: {
      enableSpellCorrection?: boolean;
      enableSemanticSearch?: boolean;
      maxResults?: number;
      minConfidence?: number;
    } = {}
  ): Promise<AIProductExtractionResult> {
    const startTime = Date.now();
    const {
      enableSpellCorrection = true,
      enableSemanticSearch = true,
      maxResults = 10,
      minConfidence = 0.3
    } = options;

    try {
      this.logger.log(`AI text matching for: "${input}"`);

      // Step 1: Spell correction
      let correctedText = input;
      if (enableSpellCorrection) {
        correctedText = await this.correctSpelling(input);
      }

      // Step 2: Extract products from text
      const extractedProducts = await this.extractProductsFromText(correctedText);

      // Step 3: Semantic matching with embeddings
      const matches: AIProductMatch[] = [];

      for (const product of extractedProducts) {
        const productMatches = await this.findSemanticMatches(
          product.name,
          organizationId,
          { maxResults: 3, minConfidence, enableSemanticSearch }
        );
        matches.push(...productMatches);
      }

      // Step 4: Remove duplicates and sort by confidence
      const uniqueMatches = this.deduplicateMatches(matches);
      const sortedMatches = uniqueMatches
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxResults);

      const processingTime = Date.now() - startTime;

      return {
        extractedProducts,
        matches: sortedMatches,
        processingTime,
        correctedText: correctedText !== input ? correctedText : undefined,
        originalQuery: input
      };

    } catch (error) {
      this.logger.error('AI text matching failed:', error);
      throw error;
    }
  }

  /**
   * Image-based product extraction using AI vision
   */
  async matchProductsFromImage(
    imageBuffer: Buffer,
    organizationId: string,
    mimeType: string = 'image/jpeg'
  ): Promise<AIProductExtractionResult> {
    const startTime = Date.now();

    try {
      this.logger.log(`AI image processing for organization: ${organizationId}`);

      // Step 1: Extract text and products from image using OCR + Vision AI
      const imageAnalysis = await this.analyzeProductImage(imageBuffer, mimeType);

      // Step 2: Process extracted text for product matching
      const textResult = await this.matchProductsFromText(
        imageAnalysis.extractedText,
        organizationId,
        { enableSpellCorrection: true, enableSemanticSearch: true }
      );

      // Step 3: Combine with visual product detection
      const visualProducts = await this.detectProductsInImage(imageBuffer, mimeType);

      // Step 4: Merge results
      const combinedProducts = [
        ...textResult.extractedProducts,
        ...visualProducts.detectedProducts
      ];

      const matches = await this.enhanceMatchesWithVisualData(
        textResult.matches,
        visualProducts.visualMatches
      );

      const processingTime = Date.now() - startTime;

      return {
        extractedProducts: combinedProducts,
        matches,
        processingTime,
        correctedText: textResult.correctedText,
        originalQuery: imageAnalysis.extractedText
      };

    } catch (error) {
      this.logger.error('AI image processing failed:', error);
      throw error;
    }
  }

  /**
   * Voice-based product extraction using speech-to-text + AI
   */
  async matchProductsFromVoice(
    audioBuffer: Buffer,
    organizationId: string,
    audioFormat: string = 'wav'
  ): Promise<AIProductExtractionResult> {
    const startTime = Date.now();

    try {
      this.logger.log(`AI voice processing for organization: ${organizationId}`);

      // Step 1: Convert speech to text
      const transcription = await this.transcribeAudio(audioBuffer, audioFormat);

      // Step 2: Process transcribed text
      const textResult = await this.matchProductsFromText(
        transcription.text,
        organizationId,
        {
          enableSpellCorrection: true,
          enableSemanticSearch: true,
          maxResults: 15 // Voice might be less precise, get more options
        }
      );

      // Step 3: Apply voice-specific confidence adjustments
      const adjustedMatches = textResult.matches.map(match => ({
        ...match,
        confidence: match.confidence * transcription.confidence, // Adjust for transcription quality
        extractionMethod: 'voice' as const
      }));

      const processingTime = Date.now() - startTime;

      return {
        ...textResult,
        matches: adjustedMatches,
        processingTime,
        originalQuery: transcription.text
      };

    } catch (error) {
      this.logger.error('AI voice processing failed:', error);
      throw error;
    }
  }

  /**
   * Bulk product matching for high-volume scenarios
   */
  async bulkMatchProducts(
    requests: Array<{
      input: string;
      organizationId: string;
      type: 'text' | 'image' | 'voice';
    }>,
    options: {
      concurrency?: number;
      enableCaching?: boolean;
    } = {}
  ): Promise<AIProductExtractionResult[]> {
    const { concurrency = 10, enableCaching = true } = options;

    this.logger.log(`Bulk processing ${requests.length} requests with concurrency: ${concurrency}`);

    // Process in batches for better performance
    const batches = this.chunkArray(requests, concurrency);
    const results: AIProductExtractionResult[] = [];

    for (const batch of batches) {
      const batchPromises = batch.map(async (request) => {
        const cacheKey = enableCaching
          ? `${this.CACHE_PREFIX}bulk:${request.type}:${Buffer.from(request.input).toString('base64')}`
          : null;

        // Check cache if enabled
        if (cacheKey && enableCaching) {
          try {
            const redis = getRedis();
            const cached = await redis.get(cacheKey);
            if (cached) {
              return JSON.parse(cached);
            }
          } catch (error) {
            this.logger.warn('Cache read failed:', error);
          }
        }

        // Process request based on type
        let result: AIProductExtractionResult;

        switch (request.type) {
          case 'text':
            result = await this.matchProductsFromText(request.input, request.organizationId);
            break;
          case 'image':
            // For bulk image processing, input should be base64 encoded
            const imageBuffer = Buffer.from(request.input, 'base64');
            result = await this.matchProductsFromImage(imageBuffer, request.organizationId);
            break;
          case 'voice':
            // For bulk voice processing, input should be base64 encoded
            const audioBuffer = Buffer.from(request.input, 'base64');
            result = await this.matchProductsFromVoice(audioBuffer, request.organizationId);
            break;
          default:
            throw new Error(`Unsupported type: ${request.type}`);
        }

        // Cache result if enabled
        if (cacheKey && enableCaching) {
          try {
            const redis = getRedis();
            await redis.setex(cacheKey, this.SEARCH_CACHE_TTL, JSON.stringify(result));
          } catch (error) {
            this.logger.warn('Cache write failed:', error);
          }
        }

        return result;
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error(`Batch item ${index} failed:`, result.reason);
          // Add empty result for failed items to maintain order
          results.push({
            extractedProducts: [],
            matches: [],
            processingTime: 0,
            originalQuery: batch[index].input
          });
        }
      });
    }

    return results;
  }

  /**
   * Spell correction using AI language model
   */
  private async correctSpelling(text: string): Promise<string> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}spell:${Buffer.from(text).toString('base64')}`;

      // Check cache
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Use Gemini for spell correction
      const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!geminiApiKey) {
        this.logger.warn('Gemini API key not configured, skipping spell correction');
        return text;
      }

      const response = await firstValueFrom(
        this.httpService.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
          contents: [{
            parts: [{
              text: `You are a spell checker for construction and industrial product names. Correct spelling errors but keep the meaning intact. Only return the corrected text, nothing else.\n\nCorrect any spelling mistakes in this product list: "${text}"`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
            topP: 0.8,
            topK: 10
          }
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      const correctedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;

      // Cache result
      await redis.setex(cacheKey, this.EMBEDDING_CACHE_TTL, correctedText);

      return correctedText;

    } catch (error) {
      this.logger.warn('Spell correction failed, using original text:', error);
      return text;
    }
  }

  /**
   * Extract products from text using NLP
   */
  private async extractProductsFromText(text: string): Promise<Array<{
    name: string;
    quantity: number;
    confidence: number;
  }>> {
    const products = [];

    // Enhanced regex patterns for product extraction
    const patterns = [
      /^(.+?)\s*x\s*(\d+)$/i,                    // "cement x 100"
      /^(\d+)\s*x?\s*(.+?)(?:\s+(?:bags?|boxes?|pieces?|units?))?$/i,  // "100 x cement bags"
      /^(\d+)\s+(.+)$/,                          // "100 cement"
      /(.+?)\s+(\d+)(?:\s+(?:bags?|boxes?|pieces?|units?))?$/i,        // "cement 100 bags"
    ];

    const lines = text.split(/[,\n;]/).map(line => line.trim()).filter(line => line);

    for (const line of lines) {
      let matched = false;

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          let quantity: number;
          let productName: string;

          if (pattern.source.includes('x')) {
            if (isNaN(parseInt(match[1]))) {
              productName = match[1].trim();
              quantity = parseInt(match[2], 10);
            } else {
              quantity = parseInt(match[1], 10);
              productName = match[2].trim();
            }
          } else {
            if (isNaN(parseInt(match[1]))) {
              productName = match[1].trim();
              quantity = parseInt(match[2], 10);
            } else {
              quantity = parseInt(match[1], 10);
              productName = match[2].trim();
            }
          }

          if (!isNaN(quantity) && quantity > 0 && productName) {
            // Clean product name
            productName = productName
              .replace(/\b(bags?|boxes?|pieces?|units?|packets?|nos?|pcs?)\b/gi, '')
              .trim();

            products.push({
              name: productName,
              quantity,
              confidence: 0.9
            });
            matched = true;
            break;
          }
        }
      }

      // If no pattern matched, treat as product with quantity 1
      if (!matched && line.length > 2) {
        products.push({
          name: line,
          quantity: 1,
          confidence: 0.6
        });
      }
    }

    return products;
  }

  /**
   * Find semantic matches using embeddings
   */
  private async findSemanticMatches(
    productName: string,
    organizationId: string,
    options: {
      maxResults: number;
      minConfidence: number;
      enableSemanticSearch: boolean;
    }
  ): Promise<AIProductMatch[]> {
    try {
      if (!options.enableSemanticSearch) {
        return await this.findExactMatches(productName, organizationId, options.maxResults);
      }

      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbeddingInternal(productName);

      // Use vector database for semantic search
      const vectorResults = await this.vectorDb.searchSimilarProducts(
        queryEmbedding,
        organizationId,
        {
          topK: options.maxResults * 2, // Get more candidates for filtering
          threshold: options.minConfidence,
          includeMetadata: true
        }
      );

      const matches: AIProductMatch[] = [];

      for (const vectorResult of vectorResults) {
        try {
          // Get full product details from database
          const product = await this.prisma.products.findUnique({
            where: {
              id: vectorResult.metadata.productId,
              organization_id: organizationId,
              status: 'active'
            },
            select: {
              id: true,
              name: true,
              description: true,
              sku: true,
              selling_price: true
            }
          });

          if (!product) {
            this.logger.warn(`Product ${vectorResult.metadata.productId} not found in database`);
            continue;
          }

          // Get inventory data
          const inventoryData = await this.getInventoryData(product.id, organizationId);

          matches.push({
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            sellingPrice: product.selling_price ? Number(product.selling_price) : undefined,
            available: inventoryData.availableStock > 0,
            confidence: vectorResult.score,
            similarityScore: vectorResult.score,
            embedding: queryEmbedding, // Use query embedding
            extractionMethod: 'vector_search'
          });

        } catch (error) {
          this.logger.error(`Error processing vector result for product ${vectorResult.metadata.productId}:`, error);
          continue;
        }
      }

      // If vector DB returned no results, fall back to exact search
      if (matches.length === 0) {
        this.logger.warn('Vector search returned no results, falling back to exact search');
        return await this.findExactMatches(productName, organizationId, options.maxResults);
      }

      return matches
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, options.maxResults);

    } catch (error) {
      this.logger.warn('Semantic search failed, falling back to exact matches:', error);
      return await this.findExactMatches(productName, organizationId, options.maxResults);
    }
  }

  /**
   * Generate embeddings using Gemini embedding service (public method)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return this.generateEmbeddingInternal(text);
  }

  /**
   * Generate embeddings using Gemini embedding service (internal)
   */
  private async generateEmbeddingInternal(text: string): Promise<number[]> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}embedding:${Buffer.from(text).toString('base64')}`;

      // Check cache
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!geminiApiKey) {
        // Return dummy embedding if API key not configured
        return new Array(768).fill(0).map(() => Math.random());
      }

      const response = await firstValueFrom(
        this.httpService.post(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${geminiApiKey}`, {
          model: 'models/embedding-001',
          content: {
            parts: [{
              text: text
            }]
          }
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      const embedding = response.data.embedding?.values;

      // Cache embedding
      await redis.setex(cacheKey, this.EMBEDDING_CACHE_TTL, JSON.stringify(embedding));

      return embedding;

    } catch (error) {
      this.logger.warn('Embedding generation failed:', error);
      // Return dummy embedding (Gemini embeddings are 768-dimensional)
      return new Array(768).fill(0).map(() => Math.random());
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Fallback exact matching
   */
  private async findExactMatches(
    productName: string,
    organizationId: string,
    maxResults: number
  ): Promise<AIProductMatch[]> {
    const products = await this.prisma.products.findMany({
      where: {
        organization_id: organizationId,
        status: 'active',
        name: {
          contains: productName,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        selling_price: true,
        organization_id: true
      },
      take: maxResults
    });

    const results = [];
    for (const product of products) {
      const inventoryData = await this.getInventoryData(product.id, product.organization_id);

      results.push({
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        sellingPrice: product.selling_price ? Number(product.selling_price) : undefined,
        available: inventoryData.availableStock > 0,
        confidence: 0.8,
        similarityScore: 0.8,
        extractionMethod: 'text' as const
      });
    }

    return results;
  }

  private async getInventoryData(productId: string, organizationId: string): Promise<{
    availableStock: number;
    minimumStock: number;
  }> {
    try {
      const inventory = await this.prisma.inventory_current.findFirst({
        where: {
          product_id: productId,
          organization_id: organizationId
        },
        select: {
          available_stock: true,
          minimum_stock: true
        }
      });

      return {
        availableStock: inventory?.available_stock ? Number(inventory.available_stock) : 0,
        minimumStock: inventory?.minimum_stock ? Number(inventory.minimum_stock) : 0
      };
    } catch (error) {
      this.logger.warn(`Failed to get inventory for product ${productId}:`, error);
      return { availableStock: 0, minimumStock: 0 };
    }
  }

  /**
   * Image analysis placeholder - integrate with Google Vision, AWS Rekognition, etc.
   */
  private async analyzeProductImage(imageBuffer: Buffer, mimeType: string) {
    // This would integrate with actual OCR/Vision services
    return {
      extractedText: 'cement bags steel rods', // Placeholder
      confidence: 0.85
    };
  }

  /**
   * Visual product detection placeholder
   */
  private async detectProductsInImage(imageBuffer: Buffer, mimeType: string) {
    // This would integrate with custom vision models
    return {
      detectedProducts: [],
      visualMatches: []
    };
  }

  /**
   * Audio transcription placeholder
   */
  private async transcribeAudio(audioBuffer: Buffer, format: string) {
    // This would integrate with speech-to-text services
    return {
      text: 'I need cement and steel rods', // Placeholder
      confidence: 0.9
    };
  }

  /**
   * Utility methods
   */
  private deduplicateMatches(matches: AIProductMatch[]): AIProductMatch[] {
    const seen = new Set<string>();
    return matches.filter(match => {
      if (seen.has(match.id)) return false;
      seen.add(match.id);
      return true;
    });
  }

  private async enhanceMatchesWithVisualData(
    textMatches: AIProductMatch[],
    visualMatches: any[]
  ): Promise<AIProductMatch[]> {
    // Combine and enhance matches with visual data
    return textMatches; // Placeholder
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}