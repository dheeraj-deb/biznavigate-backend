import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SemanticSearchRequestDto,
  ProductSearchResultDto,
  SemanticSearchResponseDto,
  BulkProductSearchRequestDto,
  BulkProductSearchResponseDto
} from '../dto/product-search.dto';

interface ProductWithStock {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  sku?: string;
  selling_price?: any; // Decimal type from Prisma
  purchase_price?: any;
  mrp?: any;
  hsn_code?: string;
  status?: string;
}

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);

  constructor(private prisma: PrismaService) {}

  async searchProducts(request: SemanticSearchRequestDto): Promise<SemanticSearchResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log(`[SEMANTIC_SEARCH] Query: "${request.query}"`);
      this.logger.log(`[SEMANTIC_SEARCH] Organization ID: ${request.organizationId}`);
      this.logger.log(`[SEMANTIC_SEARCH] Threshold: ${request.threshold}, Limit: ${request.limit}`);

      // Get products with inventory data
      const products = await this.getProductsWithInventory(request.organizationId);
      this.logger.log(`[SEMANTIC_SEARCH] Found ${products.length} active products in database`);

      // Perform semantic matching
      const matches = await this.performSemanticMatching(
        request.query,
        products,
        request.threshold,
        request.limit
      );

      const processingTime = Date.now() - startTime;
      this.logger.log(`[SEMANTIC_SEARCH] Matched ${matches.length} products (${processingTime}ms)`);
      if (matches.length > 0) {
        this.logger.log(`[SEMANTIC_SEARCH] Top matches:`, matches.map(m => ({ name: m.name, confidence: m.confidence, available: m.available })));
      }

      return {
        results: matches,
        total: matches.length,
        query: request.query,
        processingTime
      };

    } catch (error) {
      this.logger.error('Error in semantic search:', error);
      throw error;
    }
  }

  async bulkSearchProducts(request: BulkProductSearchRequestDto): Promise<BulkProductSearchResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log(`Bulk semantic search for ${request.queries.length} queries`);

      // Get products once for all queries
      const products = await this.getProductsWithInventory(request.organizationId);

      const results: Record<string, ProductSearchResultDto[]> = {};

      // Process each query
      for (const query of request.queries) {
        const matches = await this.performSemanticMatching(
          query,
          products,
          request.threshold,
          request.limitPerQuery
        );
        results[query] = matches;
      }

      const processingTime = Date.now() - startTime;

      return {
        results,
        processingTime,
        totalQueries: request.queries.length
      };

    } catch (error) {
      this.logger.error('Error in bulk semantic search:', error);
      throw error;
    }
  }

  private async getProductsWithInventory(organizationId?: string): Promise<ProductWithStock[]> {
    const whereClause = organizationId
      ? { organization_id: organizationId, status: 'active' }
      : { status: 'active' };

    return await this.prisma.products.findMany({
      where: whereClause,
      select: {
        id: true,
        organization_id: true,
        name: true,
        description: true,
        sku: true,
        selling_price: true,
        purchase_price: true,
        mrp: true,
        hsn_code: true,
        status: true
      }
    });
  }

  private async getProductInventory(productId: string, organizationId: string): Promise<{
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

  private async performSemanticMatching(
    query: string,
    products: ProductWithStock[],
    threshold: number,
    limit: number
  ): Promise<ProductSearchResultDto[]> {

    const queryLower = query.toLowerCase().trim();
    const matches: Array<ProductSearchResultDto & { score: number }> = [];

    for (const product of products) {
      const similarity = this.calculateSimilarity(queryLower, product);

      if (similarity >= threshold) {
        // Get inventory data separately
        const inventoryData = await this.getProductInventory(product.id, product.organization_id);

        matches.push({
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          sellingPrice: product.selling_price ? Number(product.selling_price) : undefined,
          purchasePrice: product.purchase_price ? Number(product.purchase_price) : undefined,
          mrp: product.mrp ? Number(product.mrp) : undefined,
          hsnCode: product.hsn_code,
          status: product.status,
          availableStock: inventoryData.availableStock,
          minimumStock: inventoryData.minimumStock,
          similarityScore: similarity,
          available: inventoryData.availableStock > 0,
          confidence: similarity,
          score: similarity
        });
      }
    }

    // Sort by similarity score (descending) and return top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...match }) => match);
  }

  private calculateSimilarity(query: string, product: ProductWithStock): number {
    const productText = [
      product.name,
      product.description,
      product.sku
    ].filter(Boolean).join(' ').toLowerCase();

    // Multiple similarity techniques combined
    const exactMatch = this.exactMatchScore(query, productText);
    const keywordMatch = this.keywordMatchScore(query, productText);
    const fuzzyMatch = this.fuzzyMatchScore(query, productText);
    const contextualMatch = this.contextualMatchScore(query, productText);

    // Weighted combination of different matching techniques
    const weightedScore =
      exactMatch * 0.4 +
      keywordMatch * 0.3 +
      fuzzyMatch * 0.2 +
      contextualMatch * 0.1;

    return Math.min(1, Math.max(0, weightedScore));
  }

  private exactMatchScore(query: string, productText: string): number {
    if (productText.includes(query)) {
      return 1.0;
    }

    // Check for partial exact matches
    const queryWords = query.split(' ').filter(w => w.length > 2);
    let matchCount = 0;

    for (const word of queryWords) {
      if (productText.includes(word)) {
        matchCount++;
      }
    }

    return queryWords.length > 0 ? matchCount / queryWords.length : 0;
  }

  private keywordMatchScore(query: string, productText: string): number {
    const queryWords = query.split(' ').filter(w => w.length > 1);
    const productWords = productText.split(' ').filter(w => w.length > 1);

    if (queryWords.length === 0 || productWords.length === 0) return 0;

    let matchCount = 0;

    for (const queryWord of queryWords) {
      for (const productWord of productWords) {
        if (queryWord === productWord ||
            queryWord.includes(productWord) ||
            productWord.includes(queryWord)) {
          matchCount++;
          break;
        }
      }
    }

    return matchCount / queryWords.length;
  }

  private fuzzyMatchScore(query: string, productText: string): number {
    // Simple Levenshtein distance-based fuzzy matching
    const queryWords = query.split(' ').filter(w => w.length > 2);
    const productWords = productText.split(' ').filter(w => w.length > 2);

    if (queryWords.length === 0 || productWords.length === 0) return 0;

    let totalSimilarity = 0;
    let matchCount = 0;

    for (const queryWord of queryWords) {
      let bestMatch = 0;

      for (const productWord of productWords) {
        const similarity = this.stringSimilarity(queryWord, productWord);
        if (similarity > bestMatch) {
          bestMatch = similarity;
        }
      }

      if (bestMatch > 0.6) { // Only count good matches
        totalSimilarity += bestMatch;
        matchCount++;
      }
    }

    return matchCount > 0 ? totalSimilarity / queryWords.length : 0;
  }

  private contextualMatchScore(query: string, productText: string): number {
    // Industry-specific term matching
    const constructionTerms = {
      'cement': ['cement', 'concrete', 'portland'],
      'steel': ['steel', 'iron', 'rebar', 'rod', 'tmt'],
      'paint': ['paint', 'coating', 'enamel', 'primer'],
      'brick': ['brick', 'block', 'masonry'],
      'sand': ['sand', 'aggregate', 'gravel'],
      'pipe': ['pipe', 'tube', 'conduit'],
      'wire': ['wire', 'cable', 'electrical']
    };

    let contextScore = 0;
    const queryWords = query.split(' ');

    for (const queryWord of queryWords) {
      for (const [category, synonyms] of Object.entries(constructionTerms)) {
        if (queryWord.includes(category) || synonyms.some(syn => queryWord.includes(syn))) {
          // Check if product contains related terms
          if (synonyms.some(syn => productText.includes(syn))) {
            contextScore += 0.8;
            break;
          }
        }
      }
    }

    return Math.min(1, contextScore / queryWords.length);
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Utility method for getting product suggestions
  async getProductSuggestions(query: string, organizationId?: string, limit: number = 5): Promise<string[]> {
    const products = await this.getProductsWithInventory(organizationId);

    const suggestions = products
      .map(product => product.name)
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);

    return suggestions;
  }

  // Method to update product embeddings (placeholder for future AI integration)
  async updateProductEmbeddings(organizationId?: string): Promise<void> {
    this.logger.log('Product embeddings update - placeholder for AI integration');

    // Future implementation:
    // 1. Generate embeddings for product names and descriptions using AI service
    // 2. Store embeddings in a vector database (e.g., pgvector, Pinecone)
    // 3. Use vector similarity for better semantic matching

    // For now, this is a placeholder that could trigger re-indexing
  }
}