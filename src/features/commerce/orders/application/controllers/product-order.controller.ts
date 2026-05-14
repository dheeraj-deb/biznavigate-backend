import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { ProductOrderQueryDto } from '../dto/product-order-query.dto';
import { UpdateProductOrderStatusDto } from '../dto/update-product-order-status.dto';
import { ProductOrderService } from '../services/product-order.service';

@Controller('product-orders')
@UseGuards(JwtAuthGuard)
export class ProductOrderController {
  constructor(private readonly productOrderService: ProductOrderService) {}

  @Get()
  findAll(@Req() req: any, @Query() query: ProductOrderQueryDto) {
    return this.productOrderService.findAll(req.user.business_id, query);
  }

  @Get(':productOrderId')
  findById(@Req() req: any, @Param('productOrderId') productOrderId: string) {
    return this.productOrderService.findById(req.user.business_id, productOrderId);
  }

  @Patch(':productOrderId/status')
  updateStatus(
    @Req() req: any,
    @Param('productOrderId') productOrderId: string,
    @Body() dto: UpdateProductOrderStatusDto,
  ) {
    return this.productOrderService.updateStatus(req.user.business_id, productOrderId, dto);
  }

  @Patch(':productOrderId/cancel')
  cancel(
    @Req() req: any,
    @Param('productOrderId') productOrderId: string,
    @Body('notes') notes?: string,
  ) {
    return this.productOrderService.cancel(req.user.business_id, productOrderId, notes);
  }
}
