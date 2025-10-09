import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { getRedis } from 'src/utils/redis';
import { firstValueFrom } from 'rxjs';
import { SemanticSearchService } from 'src/features/products/application/services/semantic-search.service';

export interface ProductMatch {
  id: string;
  name: string;
  sku?: string;
  sellingPrice?: number;
  available?: boolean;
  confidence: number;
}

export interface ParsedProduct {
  name: string;
  quantity: number;
  matches: ProductMatch[];
  bestMatch?: ProductMatch;
}

@Injectable()
export class ProductMatcherService {
  private readonly logger = new Logger(ProductMatcherService.name);
  private readonly CACHE_TTL = 5 * 60; // 5 minutes
  private readonly PRODUCT_CACHE_PREFIX = 'product_search:';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private semanticSearchService: SemanticSearchService
  ) {}

  /**
   * Parse and match products from user input
   */
  async parseAndMatchProducts(
    input: string,
    organizationId: string
  ): Promise<ParsedProduct[]> {
    const parsedProducts = this.parseProductInput(input);
    const results: ParsedProduct[] = [];

    for (const product of parsedProducts) {
      const matches = await this.findProductMatches(product.name, organizationId);
      const bestMatch = matches.find(match => match.confidence >= 0.7); // 70% confidence threshold

      results.push({
        ...product,
        matches,
        bestMatch
      });
    }

    return results;
  }

  /**
   * Parse product input into structured format
   */
  private parseProductInput(input: string): { name: string; quantity: number }[] {
    const lines = input.split('\n').filter(line => line.trim());
    const products: { name: string; quantity: number }[] = [];

    for (const line of lines) {
      // Try "Product x Quantity" format
      let match = line.trim().match(/^(.+?)\s*x\s*(\d+)$/i);
      if (match) {
        const productName = match[1].trim();
        const quantity = parseInt(match[2], 10);
        if (productName && quantity > 0) {
          products.push({ name: productName, quantity });
        }
        continue;
      }

      // Try "Quantity Product" format
      match = line.trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        const quantity = parseInt(match[1], 10);
        const productName = match[2].trim();
        if (productName && quantity > 0) {
          products.push({ name: productName, quantity });
        }
        continue;
      }

      // Try product name with quantity in text
      const quantityMatch = line.match(/(\d+)/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
      const cleanName = line.replace(/\d+/g, '').trim();

      if (cleanName) {
        products.push({ name: cleanName, quantity });
      }
    }

    // If no structured format found, treat whole input as single product
    if (products.length === 0) {
      const quantityMatch = input.match(/(\d+)/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
      const cleanName = input.replace(/\d+/g, '').trim();

      if (cleanName) {
        products.push({ name: cleanName, quantity });
      }
    }

    return products;
  }

  /**
   * Find matching products using semantic search service with fallback to external API
   */
  private async findProductMatches(
    productName: string,
    organizationId: string
  ): Promise<ProductMatch[]> {
    try {
      const cacheKey = `${this.PRODUCT_CACHE_PREFIX}${organizationId}:${productName.toLowerCase()}`;

      // Check Redis cache first
      try {
        const redis = getRedis();
        const cached = await redis.get(cacheKey);
        if (cached) {
          this.logger.debug(`Cache hit for product search: ${productName}`);
          return JSON.parse(cached);
        }
      } catch (redisError) {
        this.logger.warn('Redis cache read failed:', redisError);
      }

      // Primary: Use semantic search service
      try {
        this.logger.debug(`Using semantic search for: ${productName}`);

        const searchResult = await this.semanticSearchService.searchProducts({
          query: productName,
          organizationId: organizationId,
          limit: 5,
          threshold: 0.2,
          includeStockInfo: true
        });

        const matches: ProductMatch[] = searchResult.results.map(result => ({
          id: result.id,
          name: result.name,
          sku: result.sku,
          sellingPrice: result.sellingPrice,
          available: result.available,
          confidence: result.confidence
        }));

        // Cache results if we found any
        if (matches.length > 0) {
          try {
            const redis = getRedis();
            await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(matches));
          } catch (redisError) {
            this.logger.warn('Redis cache write failed:', redisError);
          }
        }

        this.logger.debug(`Semantic search found ${matches.length} matches for: ${productName}`);
        return matches;

      } catch (semanticError) {
        this.logger.warn('Semantic search failed, falling back to external API:', semanticError);

        // Fallback: Use external API
        return await this.findProductMatchesViaAPI(productName, organizationId);
      }

    } catch (error) {
      this.logger.error('Error in product matching:', error);
      return [];
    }
  }

  /**
   * Fallback method using external API
   */
  private async findProductMatchesViaAPI(
    productName: string,
    organizationId: string
  ): Promise<ProductMatch[]> {
    try {
      // Call external product matching API
      const apiUrl = this.configService.get<string>('PRODUCT_MATCHER_API_URL') || 'http://localhost:8080/api/products/search';
      const apiKey = this.configService.get<string>('PRODUCT_MATCHER_API_KEY');

      const response = await firstValueFrom(
        this.httpService.post(apiUrl, {
          query: productName,
          organizationId: organizationId,
          limit: 5,
          includeAvailability: true
        }, {
          headers: {
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        })
      );

      const matches: ProductMatch[] = response.data.matches || [];
      this.logger.debug(`External API found ${matches.length} matches for: ${productName}`);

      return matches;

    } catch (error) {
      this.logger.error('Error calling external product matcher API:', error);
      return [];
    }
  }

  /**
   * Simple string similarity calculation using Jaro-Winkler-like algorithm
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1.0;

    // Exact word match gets high score
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(w1 => words2.some(w2 => w1.includes(w2) || w2.includes(w1)));
    const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length);

    // Character-based similarity
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    const charSimilarity = (longer.length - editDistance) / longer.length;

    // Weighted combination
    return (wordSimilarity * 0.7) + (charSimilarity * 0.3);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
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

  /**
   * Get product availability and current stock via external API
   */
  async getProductAvailability(productId: string, organizationId: string): Promise<{
    available: boolean;
    quantity: number;
    reservedQuantity: number;
  }> {
    try {
      const apiUrl = this.configService.get<string>('INVENTORY_API_URL') || 'http://localhost:8080/api/inventory/availability';
      const apiKey = this.configService.get<string>('INVENTORY_API_KEY');

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/${productId}`, {
          params: { organizationId },
          headers: {
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
            'Content-Type': 'application/json'
          },
          timeout: 3000 // 3 second timeout
        })
      );

      return {
        available: response.data.available || false,
        quantity: response.data.quantity || 0,
        reservedQuantity: response.data.reservedQuantity || 0
      };
    } catch (error) {
      this.logger.error('Error checking product availability via API:', error);
      return {
        available: false,
        quantity: 0,
        reservedQuantity: 0
      };
    }
  }
}