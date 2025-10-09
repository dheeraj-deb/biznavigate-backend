import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { getRedis } from 'src/utils/redis';

export interface ProductCatalogItem {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  sellingPrice?: number;
  mrp?: number;
  hsnCode?: string;
  availableStock?: number;
  category?: string;
  status: string;
}

export interface CatalogMessageOptions {
  organizationId: string;
  category?: string;
  maxProducts?: number;
  page?: number;
  includeStockInfo?: boolean;
  includePrice?: boolean;
  sortBy?: 'name' | 'price' | 'stock' | 'category';
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

export interface CatalogResponse {
  message: string;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  products: ProductCatalogItem[];
}

@Injectable()
export class ProductCatalogService {
  private readonly logger = new Logger(ProductCatalogService.name);
  private readonly CACHE_TTL = 10 * 60; // 10 minutes
  private readonly PRODUCTS_PER_PAGE = 10;
  private readonly MAX_MESSAGE_LENGTH = 4000; // WhatsApp message limit

  constructor(private prisma: PrismaService) {}

  /**
   * Generate WhatsApp catalog message from products table
   */
  async generateCatalogMessage(options: CatalogMessageOptions): Promise<CatalogResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(`Generating catalog for org: ${options.organizationId}`);

      // Generate cache key
      const cacheKey = this.generateCacheKey(options);

      // Check cache first
      const cached = await this.getCachedResult(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached catalog result');
        return cached;
      }

      // Get products from database
      const { products, totalCount } = await this.getProducts(options);

      // Calculate pagination
      const page = options.page || 1;
      const maxProducts = options.maxProducts || this.PRODUCTS_PER_PAGE;
      const totalPages = Math.ceil(totalCount / maxProducts);

      // Generate formatted message
      const message = await this.formatProductsMessage(products, {
        ...options,
        totalProducts: totalCount,
        currentPage: page,
        totalPages
      });

      const response: CatalogResponse = {
        message,
        totalProducts: totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        products
      };

      // Cache the result
      await this.cacheResult(cacheKey, response);

      this.logger.log(`Catalog generated: ${products.length} products in ${Date.now() - startTime}ms`);
      return response;

    } catch (error) {
      this.logger.error('Error generating product catalog:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getCatalogByCategory(
    organizationId: string,
    categoryId?: string,
    options: Partial<CatalogMessageOptions> = {}
  ): Promise<CatalogResponse> {
    return this.generateCatalogMessage({
      organizationId,
      category: categoryId,
      includeStockInfo: true,
      includePrice: true,
      sortBy: 'name',
      sortOrder: 'asc',
      ...options
    });
  }

  /**
   * Search products and generate catalog
   */
  async searchCatalog(
    organizationId: string,
    searchQuery: string,
    options: Partial<CatalogMessageOptions> = {}
  ): Promise<CatalogResponse> {
    return this.generateCatalogMessage({
      organizationId,
      searchQuery,
      includeStockInfo: true,
      includePrice: true,
      sortBy: 'name',
      sortOrder: 'asc',
      maxProducts: 20, // More results for search
      ...options
    });
  }

  /**
   * Get featured/bestselling products
   */
  async getFeaturedCatalog(
    organizationId: string,
    options: Partial<CatalogMessageOptions> = {}
  ): Promise<CatalogResponse> {
    // This could be enhanced with actual sales data
    return this.generateCatalogMessage({
      organizationId,
      sortBy: 'name',
      sortOrder: 'asc',
      maxProducts: 15,
      includeStockInfo: true,
      includePrice: true,
      ...options
    });
  }

  /**
   * Generate quick product list for WhatsApp menu
   */
  async generateQuickCatalog(organizationId: string): Promise<string> {
    try {
      const { products } = await this.getProducts({
        organizationId,
        maxProducts: 5,
        includeStockInfo: true,
        includePrice: true,
        sortBy: 'stock',
        sortOrder: 'desc'
      });

      if (products.length === 0) {
        return "📦 *No products available at the moment*\n\nPlease contact us for more information.";
      }

      let message = "🛒 *Quick Catalog - Top Products*\n\n";

      products.forEach((product, index) => {
        const price = product.sellingPrice ? `₹${product.sellingPrice.toLocaleString('en-IN')}` : 'Price on request';
        const stock = product.availableStock > 0 ? '✅ In Stock' : '❌ Out of Stock';

        message += `*${index + 1}. ${product.name}*\n`;
        message += `💰 ${price} | ${stock}\n`;
        if (product.sku) message += `📋 SKU: ${product.sku}\n`;
        message += '\n';
      });

      message += "📱 *Type product name to place order*\n";
      message += "📋 Type 'catalog' to see full catalog\n";
      message += "🔍 Type 'search [keyword]' to find specific products";

      return message;

    } catch (error) {
      this.logger.error('Error generating quick catalog:', error);
      return "❌ Unable to load product catalog. Please try again later.";
    }
  }

  /**
   * Get products from database with filters
   */
  private async getProducts(options: CatalogMessageOptions): Promise<{
    products: ProductCatalogItem[];
    totalCount: number;
  }> {
    const page = options.page || 1;
    const maxProducts = options.maxProducts || this.PRODUCTS_PER_PAGE;
    const offset = (page - 1) * maxProducts;

    this.logger.debug(`[DEBUG] getProducts called with options:`, options);

    // Build where clause - make organization_id optional if not provided
    const whereClause: any = {
      status: 'active'
    };

    // Only filter by organization_id if provided and not empty
    if (options.organizationId && options.organizationId !== 'default-org' && options.organizationId.trim() !== '') {
      whereClause.organization_id = options.organizationId;
      this.logger.debug(`[DEBUG] Filtering by organization_id: ${options.organizationId}`);
    } else {
      this.logger.warn(`[DEBUG] No valid organizationId provided (${options.organizationId}), fetching all active products`);
    }

    if (options.category) {
      whereClause.category_id = options.category;
    }

    if (options.searchQuery) {
      whereClause.OR = [
        { name: { contains: options.searchQuery, mode: 'insensitive' } },
        { description: { contains: options.searchQuery, mode: 'insensitive' } },
        { sku: { contains: options.searchQuery, mode: 'insensitive' } }
      ];
    }

    this.logger.debug(`[DEBUG] Final where clause:`, whereClause);

    // Build order by clause
    const orderBy: any = {};
    switch (options.sortBy) {
      case 'price':
        orderBy.selling_price = options.sortOrder || 'asc';
        break;
      case 'name':
        orderBy.name = options.sortOrder || 'asc';
        break;
      default:
        orderBy.name = 'asc';
    }

    // Get products
    const [products, totalCount] = await Promise.all([
      this.prisma.products.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          sku: true,
          selling_price: true,
          mrp: true,
          hsn_code: true,
          status: true,
          category_id: true,
          organization_id: true
        },
        orderBy,
        take: maxProducts,
        skip: offset
      }),
      this.prisma.products.count({ where: whereClause })
    ]);

    this.logger.debug(`[DEBUG] Query results: ${products.length} products found, ${totalCount} total`);
    if (products.length > 0) {
      this.logger.debug(`[DEBUG] Sample product:`, {
        id: products[0].id,
        name: products[0].name,
        organization_id: products[0].organization_id,
        status: products[0].status
      });
    }

    // Get inventory data if requested
    const enrichedProducts: ProductCatalogItem[] = [];

    for (const product of products) {
      const catalogItem: ProductCatalogItem = {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        sellingPrice: product.selling_price ? Number(product.selling_price) : undefined,
        mrp: product.mrp ? Number(product.mrp) : undefined,
        hsnCode: product.hsn_code,
        status: product.status,
        category: product.category_id
      };

      // Get inventory data if requested
      if (options.includeStockInfo) {
        try {
          const inventory = await this.prisma.inventory_current.findFirst({
            where: {
              product_id: product.id,
              organization_id: options.organizationId
            },
            select: {
              available_stock: true
            }
          });

          catalogItem.availableStock = inventory?.available_stock ? Number(inventory.available_stock) : 0;
        } catch (error) {
          this.logger.warn(`Failed to get inventory for ${product.id}:`, error);
          catalogItem.availableStock = 0;
        }
      }

      enrichedProducts.push(catalogItem);
    }

    return { products: enrichedProducts, totalCount };
  }

  /**
   * Format products into WhatsApp message
   */
  private async formatProductsMessage(
    products: ProductCatalogItem[],
    options: CatalogMessageOptions & {
      totalProducts: number;
      currentPage: number;
      totalPages: number;
    }
  ): Promise<string> {
    if (products.length === 0) {
      return "📦 *No products found*\n\nTry adjusting your search or browse our categories.";
    }

    let message = "";

    // Header
    if (options.searchQuery) {
      message += `🔍 *Search Results for "${options.searchQuery}"*\n\n`;
    } else if (options.category) {
      message += `📁 *Category Catalog*\n\n`;
    } else {
      message += `🛒 *Product Catalog*\n\n`;
    }

    // Products list
    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      const itemNumber = ((options.currentPage - 1) * (options.maxProducts || this.PRODUCTS_PER_PAGE)) + index + 1;

      message += `*${itemNumber}. ${product.name}*\n`;

      if (product.description && product.description.length < 100) {
        message += `📝 ${product.description}\n`;
      }

      if (options.includePrice && product.sellingPrice) {
        const price = `₹${product.sellingPrice.toLocaleString('en-IN')}`;
        const mrp = product.mrp && product.mrp > product.sellingPrice
          ? ` (MRP: ₹${product.mrp.toLocaleString('en-IN')})`
          : '';
        message += `💰 ${price}${mrp}\n`;
      }

      if (options.includeStockInfo && product.availableStock !== undefined) {
        if (product.availableStock > 0) {
          message += `📦 Stock: ${product.availableStock} units ✅\n`;
        } else {
          message += `📦 Out of Stock ❌\n`;
        }
      }

      if (product.sku) {
        message += `🏷️ SKU: ${product.sku}\n`;
      }

      message += `\n`;

      // Check message length limit
      if (message.length > this.MAX_MESSAGE_LENGTH - 500) {
        message += "⚠️ *Message limit reached. More products available.*\n\n";
        break;
      }
    }

    // Footer with pagination and actions
    if (options.totalPages > 1) {
      message += `📄 *Page ${options.currentPage} of ${options.totalPages}* (${options.totalProducts} total products)\n\n`;

      if (options.currentPage > 1) {
        message += `⬅️ Type 'prev' for previous page\n`;
      }
      if (options.currentPage < options.totalPages) {
        message += `➡️ Type 'next' for next page\n`;
      }
      message += `\n`;
    } else {
      message += `📊 *Total: ${options.totalProducts} products*\n\n`;
    }

    // Action buttons
    message += `🛒 *How to Order:*\n`;
    message += `• Type product name + quantity (e.g., "Cement x 100")\n`;
    message += `• Or reply with item number (e.g., "1 x 50")\n\n`;
    message += `🔍 Type 'search [keyword]' to find specific products\n`;
    message += `📋 Type 'categories' to browse by category`;

    return message;
  }

  /**
   * Generate categories list message
   */
  async generateCategoriesMessage(organizationId: string): Promise<string> {
    try {
      const categories = await this.prisma.product_categories.findMany({
        where: {
          organization_id: organizationId
        },
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: {
              products: {
                where: {
                  status: 'active'
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      if (categories.length === 0) {
        return "📁 *No categories available*\n\nAll products are listed in the main catalog.";
      }

      let message = "📁 *Product Categories*\n\n";

      categories.forEach((category, index) => {
        const productCount = category._count.products;
        message += `*${index + 1}. ${category.name}*\n`;
        if (category.description) {
          message += `   ${category.description}\n`;
        }
        message += `   📦 ${productCount} products\n\n`;
      });

      message += `💡 *How to browse:*\n`;
      message += `• Type category name (e.g., "Construction Materials")\n`;
      message += `• Or reply with category number (e.g., "1")\n\n`;
      message += `🛒 Type 'catalog' to see all products`;

      return message;

    } catch (error) {
      this.logger.error('Error generating categories message:', error);
      return "❌ Unable to load categories. Please try again later.";
    }
  }

  /**
   * Cache management
   */
  private generateCacheKey(options: CatalogMessageOptions): string {
    const key = `catalog:${options.organizationId}:${options.category || 'all'}:${options.page || 1}:${options.searchQuery || ''}:${options.sortBy || 'name'}`;
    return key.replace(/\s+/g, '_').toLowerCase();
  }

  private async getCachedResult(cacheKey: string): Promise<CatalogResponse | null> {
    try {
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn('Cache read failed:', error);
      return null;
    }
  }

  private async cacheResult(cacheKey: string, result: CatalogResponse): Promise<void> {
    try {
      const redis = getRedis();
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));
    } catch (error) {
      this.logger.warn('Cache write failed:', error);
    }
  }

  /**
   * Clear catalog cache for organization
   */
  async clearCatalogCache(organizationId: string): Promise<void> {
    try {
      const redis = getRedis();
      const pattern = `catalog:${organizationId}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(...keys);
        this.logger.log(`Cleared ${keys.length} catalog cache entries for org: ${organizationId}`);
      }
    } catch (error) {
      this.logger.warn('Failed to clear catalog cache:', error);
    }
  }
}