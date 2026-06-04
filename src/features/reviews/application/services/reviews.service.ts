import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { RespondReviewDto } from '../dto/respond-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Reviews module superseded by CatalogModule.
 * All methods throw NotImplementedException.
 */
@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(_dto: CreateReviewDto): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async findAll(_query: QueryReviewsDto): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async findOne(_reviewId: string): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async update(_reviewId: string, _dto: UpdateReviewDto): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async respond(_reviewId: string, _dto: RespondReviewDto): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async markHelpful(_reviewId: string): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async report(_reviewId: string): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async delete(_reviewId: string): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async getAnalytics(_businessId: string, _fromDate?: string, _toDate?: string): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }

  async getProductAnalytics(_productId: string): Promise<any> {
    throw new NotImplementedException('ReviewsService superseded by CatalogModule');
  }
}
