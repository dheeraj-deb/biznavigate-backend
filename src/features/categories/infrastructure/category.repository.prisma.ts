import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Category } from '../domain/entities/category.entity';

/**
 * Categories module superseded by CatalogModule (category field on catalog_items).
 * All methods throw NotImplementedException.
 */
@Injectable()
export class CategoryRepositoryPrisma {
  private readonly logger = new Logger(CategoryRepositoryPrisma.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(_data: Partial<Category>): Promise<Category> {
    throw new NotImplementedException('CategoryRepository superseded by CatalogModule');
  }

  async findAllByBusiness(_businessId: string): Promise<Category[]> {
    throw new NotImplementedException('CategoryRepository superseded by CatalogModule');
  }

  async findById(_categoryId: string): Promise<Category | null> {
    throw new NotImplementedException('CategoryRepository superseded by CatalogModule');
  }

  async findBySlug(_slug: string, _businessId: string): Promise<Category | null> {
    throw new NotImplementedException('CategoryRepository superseded by CatalogModule');
  }

  async findChildren(_parentCategoryId: string): Promise<Category[]> {
    throw new NotImplementedException('CategoryRepository superseded by CatalogModule');
  }

  async update(_categoryId: string, _data: Partial<Category>): Promise<Category> {
    throw new NotImplementedException('CategoryRepository superseded by CatalogModule');
  }

  async delete(_categoryId: string): Promise<void> {
    throw new NotImplementedException('CategoryRepository superseded by CatalogModule');
  }

  async hardDelete(_categoryId: string): Promise<void> {
    throw new NotImplementedException('CategoryRepository superseded by CatalogModule');
  }
}
