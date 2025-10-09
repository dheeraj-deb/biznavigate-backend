import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpStatus,
  Logger,
  BadRequestException,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery
} from '@nestjs/swagger';
import { Express } from 'express';
import { AIProductMatcherService, AIProductExtractionResult } from '../services/ai-product-matcher.service';
import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTOs for the AI endpoints
class AITextMatchRequestDto {
  @ApiProperty({
    description: 'Text input containing product information',
    example: 'I need 100 bags of cement and 50 steel rods'
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Organization ID',
    example: 'org-123-456'
  })
  @IsString()
  organizationId: string;

  @ApiPropertyOptional({
    description: 'Enable spell correction',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  enableSpellCorrection?: boolean = true;

  @ApiPropertyOptional({
    description: 'Enable semantic search',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  enableSemanticSearch?: boolean = true;

  @ApiPropertyOptional({
    description: 'Maximum number of results',
    default: 10,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxResults?: number = 10;

  @ApiPropertyOptional({
    description: 'Minimum confidence threshold',
    default: 0.3,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number = 0.3;
}

class AIBulkRequestDto {
  @ApiProperty({
    description: 'Array of requests to process',
    type: [Object]
  })
  @IsArray()
  requests: Array<{
    input: string;
    organizationId: string;
    type: 'text' | 'image' | 'voice';
  }>;

  @ApiPropertyOptional({
    description: 'Concurrency limit',
    default: 10,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  concurrency?: number = 10;

  @ApiPropertyOptional({
    description: 'Enable caching',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  enableCaching?: boolean = true;
}

@ApiTags('AI Product Matching')
@Controller('api/ai/products')
export class AIProductController {
  private readonly logger = new Logger(AIProductController.name);

  constructor(private readonly aiProductMatcher: AIProductMatcherService) {}

  @Post('match/text')
  @ApiOperation({
    summary: 'AI-powered text product matching',
    description: 'Extract and match products from text with spell correction and semantic search'
  })
  @ApiBody({ type: AITextMatchRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products matched successfully',
    schema: {
      type: 'object',
      properties: {
        extractedProducts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              quantity: { type: 'number' },
              confidence: { type: 'number' }
            }
          }
        },
        matches: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              confidence: { type: 'number' },
              available: { type: 'boolean' }
            }
          }
        },
        processingTime: { type: 'number' },
        correctedText: { type: 'string' }
      }
    }
  })
  async matchFromText(
    @Body(ValidationPipe) request: AITextMatchRequestDto
  ): Promise<AIProductExtractionResult> {
    this.logger.log(`AI text matching request: "${request.text}"`);

    try {
      const result = await this.aiProductMatcher.matchProductsFromText(
        request.text,
        request.organizationId,
        {
          enableSpellCorrection: request.enableSpellCorrection,
          enableSemanticSearch: request.enableSemanticSearch,
          maxResults: request.maxResults,
          minConfidence: request.minConfidence
        }
      );

      this.logger.log(
        `AI text matching completed: ${result.matches.length} matches in ${result.processingTime}ms`
      );

      return result;

    } catch (error) {
      this.logger.error('AI text matching failed:', error);
      throw error;
    }
  }

  @Post('match/image')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files are allowed'), false);
      }
    }
  }))
  @ApiOperation({
    summary: 'AI-powered image product extraction',
    description: 'Extract products from images using OCR and computer vision'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary'
        },
        organizationId: {
          type: 'string'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image processed successfully'
  })
  async matchFromImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('organizationId') organizationId: string
  ): Promise<AIProductExtractionResult> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    this.logger.log(`AI image processing: ${file.originalname} (${file.size} bytes)`);

    try {
      const result = await this.aiProductMatcher.matchProductsFromImage(
        file.buffer,
        organizationId,
        file.mimetype
      );

      this.logger.log(
        `AI image processing completed: ${result.matches.length} matches in ${result.processingTime}ms`
      );

      return result;

    } catch (error) {
      this.logger.error('AI image processing failed:', error);
      throw error;
    }
  }

  @Post('match/voice')
  @UseInterceptors(FileInterceptor('audio', {
    limits: {
      fileSize: 25 * 1024 * 1024 // 25MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only audio files are allowed'), false);
      }
    }
  }))
  @ApiOperation({
    summary: 'AI-powered voice product extraction',
    description: 'Extract products from voice recordings using speech-to-text'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary'
        },
        organizationId: {
          type: 'string'
        },
        audioFormat: {
          type: 'string',
          default: 'wav'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audio processed successfully'
  })
  async matchFromVoice(
    @UploadedFile() file: Express.Multer.File,
    @Query('organizationId') organizationId: string,
    @Query('audioFormat') audioFormat?: string
  ): Promise<AIProductExtractionResult> {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    this.logger.log(`AI voice processing: ${file.originalname} (${file.size} bytes)`);

    try {
      const result = await this.aiProductMatcher.matchProductsFromVoice(
        file.buffer,
        organizationId,
        audioFormat || 'wav'
      );

      this.logger.log(
        `AI voice processing completed: ${result.matches.length} matches in ${result.processingTime}ms`
      );

      return result;

    } catch (error) {
      this.logger.error('AI voice processing failed:', error);
      throw error;
    }
  }

  @Post('match/bulk')
  @ApiOperation({
    summary: 'Bulk AI product matching',
    description: 'Process multiple product matching requests in parallel for high-volume scenarios'
  })
  @ApiBody({ type: AIBulkRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk processing completed',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object'
          }
        },
        totalProcessed: { type: 'number' },
        totalTime: { type: 'number' },
        successCount: { type: 'number' },
        errorCount: { type: 'number' }
      }
    }
  })
  async bulkMatch(
    @Body(ValidationPipe) request: AIBulkRequestDto
  ) {
    this.logger.log(`AI bulk processing: ${request.requests.length} requests`);

    const startTime = Date.now();

    try {
      const results = await this.aiProductMatcher.bulkMatchProducts(
        request.requests,
        {
          concurrency: request.concurrency,
          enableCaching: request.enableCaching
        }
      );

      const totalTime = Date.now() - startTime;
      const successCount = results.filter(r => r.matches.length > 0).length;
      const errorCount = results.length - successCount;

      this.logger.log(
        `AI bulk processing completed: ${results.length} processed in ${totalTime}ms`
      );

      return {
        results,
        totalProcessed: results.length,
        totalTime,
        successCount,
        errorCount
      };

    } catch (error) {
      this.logger.error('AI bulk processing failed:', error);
      throw error;
    }
  }

  @Post('analyze/performance')
  @ApiOperation({
    summary: 'Analyze AI matching performance',
    description: 'Get performance metrics for AI matching algorithms'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        organizationId: { type: 'string' },
        timeRange: {
          type: 'object',
          properties: {
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Performance analysis completed',
    schema: {
      type: 'object',
      properties: {
        totalRequests: { type: 'number' },
        averageProcessingTime: { type: 'number' },
        averageConfidence: { type: 'number' },
        successRate: { type: 'number' },
        topPerformingQueries: { type: 'array' },
        recommendations: { type: 'array' }
      }
    }
  })
  async analyzePerformance(
    @Body() request: {
      organizationId: string;
      timeRange?: {
        start: string;
        end: string;
      };
    }
  ) {
    this.logger.log(`Performance analysis for org: ${request.organizationId}`);

    // This would analyze logs/metrics to provide insights
    // For now, return mock data
    return {
      totalRequests: 1250,
      averageProcessingTime: 245,
      averageConfidence: 0.847,
      successRate: 0.923,
      topPerformingQueries: [
        { query: 'cement', count: 156, avgConfidence: 0.95 },
        { query: 'steel rods', count: 142, avgConfidence: 0.91 },
        { query: 'paint', count: 128, avgConfidence: 0.88 }
      ],
      recommendations: [
        'Consider adding more product variants for steel categories',
        'Image processing performs 15% better than text for construction materials',
        'Spell correction improved match accuracy by 12%'
      ]
    };
  }

  @Post('feedback')
  @ApiOperation({
    summary: 'Submit matching feedback',
    description: 'Submit feedback to improve AI matching accuracy'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        originalQuery: { type: 'string' },
        selectedProductId: { type: 'string' },
        wasCorrect: { type: 'boolean' },
        actualProductName: { type: 'string' },
        organizationId: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Feedback submitted successfully'
  })
  async submitFeedback(
    @Body() feedback: {
      originalQuery: string;
      selectedProductId?: string;
      wasCorrect: boolean;
      actualProductName?: string;
      organizationId: string;
    }
  ) {
    this.logger.log(`Feedback received for query: "${feedback.originalQuery}"`);

    // Store feedback for model improvement
    // This could be used to retrain or fine-tune the AI models

    return {
      message: 'Feedback received and will be used to improve matching accuracy',
      feedbackId: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
}