import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ProductRepositoryPrisma } from '../../infrastructure/product.repository.prisma';
import { Product, ProductVariant } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { BulkUploadProductDto } from '../dto/bulk-upload-product.dto';
import { PrismaService } from '../../../../prisma/prisma.service';

/**
 * Products module superseded by CatalogModule.
 * All methods throw NotImplementedException.
 */
@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepositoryPrisma,
    private readonly prisma: PrismaService,
  ) {}

  async create(_dto: CreateProductDto): Promise<Product> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async findById(_productId: string): Promise<Product & { variants?: ProductVariant[] }> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async findAll(_query: ProductQueryDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async update(_productId: string, _dto: UpdateProductDto): Promise<Product> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async delete(_productId: string): Promise<void> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async bulkCreate(_dto: BulkUploadProductDto): Promise<{ created: number; failed: number; errors: any[] }> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async checkStockAvailability(_productId: string, _quantity: number): Promise<{ available: boolean; currentStock: number }> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async updateStock(_productId: string, _quantity: number, _operation: 'increment' | 'decrement'): Promise<void> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async reserveStock(_productId: string, _quantity: number): Promise<void> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async releaseStock(_productId: string, _quantity: number): Promise<void> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async createVariant(_productId: string, _dto: any): Promise<ProductVariant> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async getVariantsByProductId(_productId: string): Promise<ProductVariant[]> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async updateVariant(_variantId: string, _dto: any): Promise<ProductVariant> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }

  async deleteVariant(_variantId: string): Promise<void> {
    throw new NotImplementedException('Products module superseded by CatalogModule');
  }
}
