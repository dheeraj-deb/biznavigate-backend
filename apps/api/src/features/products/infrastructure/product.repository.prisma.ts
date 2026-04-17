import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Product, ProductVariant } from '../domain/entities/product.entity';
import { ProductQueryDto } from '../application/dto/product-query.dto';

/**
 * Product Repository Interface
 */
export interface IProductRepository {
  create(product: Partial<Product>): Promise<Product>;
  findById(productId: string): Promise<Product | null>;
  findAll(query: ProductQueryDto): Promise<{ data: Product[]; total: number; page: number; limit: number }>;
  update(productId: string, data: Partial<Product>): Promise<Product>;
  delete(productId: string): Promise<void>;
  checkStockAvailability(productId: string, quantity: number): Promise<boolean>;
  updateStock(productId: string, quantity: number, operation: 'increment' | 'decrement'): Promise<void>;
  createVariant(variant: Partial<ProductVariant>): Promise<ProductVariant>;
  findVariantsByProductId(productId: string): Promise<ProductVariant[]>;
  updateVariant(variantId: string, data: Partial<ProductVariant>): Promise<ProductVariant>;
  deleteVariant(variantId: string): Promise<void>;
}

/**
 * Products module superseded by CatalogModule.
 * All methods throw NotImplementedException.
 */
@Injectable()
export class ProductRepositoryPrisma implements IProductRepository {
  private readonly logger = new Logger(ProductRepositoryPrisma.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(_product: Partial<Product>): Promise<Product> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async findById(_productId: string): Promise<Product | null> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async findAll(_query: ProductQueryDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async update(_productId: string, _data: Partial<Product>): Promise<Product> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async delete(_productId: string): Promise<void> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async checkStockAvailability(_productId: string, _quantity: number): Promise<boolean> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async updateStock(_productId: string, _quantity: number, _operation: 'increment' | 'decrement'): Promise<void> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async createVariant(_variant: Partial<ProductVariant>): Promise<ProductVariant> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async findVariantsByProductId(_productId: string): Promise<ProductVariant[]> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async updateVariant(_variantId: string, _data: Partial<ProductVariant>): Promise<ProductVariant> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }

  async deleteVariant(_variantId: string): Promise<void> {
    throw new NotImplementedException('ProductRepository superseded by CatalogModule');
  }
}
