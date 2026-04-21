import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { BulkUploadProductDto } from '../dto/bulk-upload-product.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  /**
   * POST /products — business_id & tenant_id from JWT
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() dto: CreateProductDto) {
    dto.business_id = req.user.business_id;
    dto.tenant_id = req.user.tenant_id;
    if (!dto.product_type) dto.product_type = 'physical';
    this.logger.log(`Creating product: ${dto.name}`);
    const product = await this.productService.create(dto);
    return product;
  }

  /**
   * GET /products — list with filters, pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Request() req, @Query() query: ProductQueryDto) {
    query.business_id = req.user.business_id;
    const result = await this.productService.findAll(query);
    return {
      products: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  /**
   * GET /products/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  /**
   * PATCH /products/:id — partial update
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  /**
   * PUT /products/:id — kept for backward compat
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updatePut(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id — soft delete
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.productService.delete(id);
    return { success: true };
  }

  /**
   * PATCH /products/:id/stock — adjustment-based stock update
   * Body: { adjustment: -3, reason: "sale" }
   */
  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  async adjustStock(
    @Param('id') id: string,
    @Body() body: { adjustment: number; reason?: string },
  ) {
    const operation = body.adjustment >= 0 ? 'increment' : 'decrement';
    const qty = Math.abs(body.adjustment);
    await this.productService.updateStock(id, qty, operation);
    return {
      product_id: id,
      adjustment: body.adjustment,
      reason: body.reason ?? null,
    };
  }

  /**
   * POST /products/bulk
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Request() req, @Body() bulkUploadDto: BulkUploadProductDto) {
    // Inject business_id into each product
    for (const p of bulkUploadDto.products) {
      p.business_id = req.user.business_id;
      p.tenant_id = req.user.tenant_id;
    }
    const result = await this.productService.bulkCreate(bulkUploadDto);
    return {
      totalProcessed: bulkUploadDto.products.length,
      successCount: result.created,
      failedCount: result.failed,
      errors: result.errors,
    };
  }

  /**
   * GET /products/:id/stock/check
   */
  @Get(':id/stock/check')
  @HttpCode(HttpStatus.OK)
  async checkStockAvailability(
    @Param('id') id: string,
    @Query('quantity') quantity: number,
  ) {
    const available = await this.productService.checkStockAvailability(id, Number(quantity));
    return { product_id: id, requested_quantity: Number(quantity), available };
  }

  /**
   * POST /products/:id/stock/update — legacy endpoint
   */
  @Post(':id/stock/update')
  @HttpCode(HttpStatus.OK)
  async updateStock(
    @Param('id') id: string,
    @Body() body: { quantity: number; operation: 'increment' | 'decrement' },
  ) {
    await this.productService.updateStock(id, body.quantity, body.operation);
    return { product_id: id, quantity: body.quantity, operation: body.operation };
  }

  @Post(':id/stock/reserve')
  @HttpCode(HttpStatus.OK)
  async reserveStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    await this.productService.reserveStock(id, body.quantity);
    return { product_id: id, reserved_quantity: body.quantity };
  }

  @Post(':id/stock/release')
  @HttpCode(HttpStatus.OK)
  async releaseStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    await this.productService.releaseStock(id, body.quantity);
    return { product_id: id, released_quantity: body.quantity };
  }

  @Post(':id/variants')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(@Param('id') productId: string, @Body() variantData: any) {
    return this.productService.createVariant(productId, variantData);
  }

  @Get(':id/variants')
  @HttpCode(HttpStatus.OK)
  async getVariants(@Param('id') productId: string) {
    return this.productService.getVariantsByProductId(productId);
  }

  @Put('variants/:variantId')
  @HttpCode(HttpStatus.OK)
  async updateVariant(@Param('variantId') variantId: string, @Body() variantData: any) {
    return this.productService.updateVariant(variantId, variantData);
  }

  @Delete('variants/:variantId')
  @HttpCode(HttpStatus.OK)
  async deleteVariant(@Param('variantId') variantId: string) {
    await this.productService.deleteVariant(variantId);
    return { success: true };
  }
}
