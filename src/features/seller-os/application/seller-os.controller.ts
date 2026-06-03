import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  AgentCreateOrderDto,
  AgentProductSearchDto,
  AiGuardrailCheckDto,
  CancelSellerPaymentOrderDto,
  CollectCreditPaymentDto,
  CompleteSellerSetupDto,
  CreateCreditCustomerDto,
  CreateDeliveryDto,
  CreateManualSaleDto,
  CreatePaymentRequestFromHoldDto,
  CreateReturnCaseDto,
  CreateStockReservationDto,
  MarkSellerOrderPaidDto,
  SellerProductBulkImportDto,
  SellerProductsStockQueryDto,
  SellerStockAdjustmentDto,
  SellerLeadListQueryDto,
  UpdateSellerLeadStatusDto,
} from './dto/seller-os.dto';
import { SellerOsService } from './seller-os.service';

@Controller('seller-os')
@UseGuards(JwtAuthGuard)
export class SellerOsController {
  constructor(private readonly sellerOsService: SellerOsService) {}

  @Get('setup')
  getSetup(@Req() req: any) {
    return this.sellerOsService.getSetup(req.user);
  }

  @Post('setup/complete')
  completeSetup(@Req() req: any, @Body() dto: CompleteSellerSetupDto) {
    return this.sellerOsService.completeSetup(req.user, dto);
  }

  @Get('overview')
  getOverview(@Req() req: any) {
    return this.sellerOsService.getOverview(req.user);
  }

  @Get('products-stock')
  getProductsStock(@Req() req: any, @Query() query: SellerProductsStockQueryDto) {
    return this.sellerOsService.getProductsStock(req.user, query);
  }

  @Post('products-stock/import')
  importProductsStock(@Req() req: any, @Body() dto: SellerProductBulkImportDto) {
    return this.sellerOsService.importProductsStock(req.user, dto);
  }

  @Post('products-stock/adjustments')
  adjustProductStock(@Req() req: any, @Body() dto: SellerStockAdjustmentDto) {
    return this.sellerOsService.adjustProductStock(req.user, dto);
  }

  @Get('products-stock/adjustments')
  getStockAdjustments(@Req() req: any, @Query() query: SellerProductsStockQueryDto) {
    return this.sellerOsService.getStockAdjustments(req.user, query);
  }

  @Get('leads')
  getSellerLeads(@Req() req: any, @Query() query: SellerLeadListQueryDto) {
    return this.sellerOsService.getSellerLeads(req.user, query);
  }

  @Patch('leads/:id/status')
  updateSellerLeadStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSellerLeadStatusDto,
  ) {
    return this.sellerOsService.updateSellerLeadStatus(req.user, id, dto);
  }

  @Post('manual-sales')
  createManualSale(@Req() req: any, @Body() dto: CreateManualSaleDto) {
    return this.sellerOsService.createManualSale(req.user, dto);
  }

  @Post('stock-reservations')
  createStockReservation(@Req() req: any, @Body() dto: CreateStockReservationDto) {
    return this.sellerOsService.createStockReservation(req.user, dto);
  }

  @Patch('stock-reservations/:id/release')
  releaseStockReservation(@Req() req: any, @Param('id') id: string) {
    return this.sellerOsService.releaseStockReservation(req.user, id);
  }

  @Get('credit-customers')
  listCreditCustomers(@Req() req: any) {
    return this.sellerOsService.listCreditCustomers(req.user);
  }

  @Get('credit-customers/check')
  checkCreditCustomer(@Req() req: any, @Query('phone') phone: string) {
    return this.sellerOsService.checkCreditCustomer(req.user, phone);
  }

  @Post('credit-customers')
  createCreditCustomer(@Req() req: any, @Body() dto: CreateCreditCustomerDto) {
    return this.sellerOsService.createCreditCustomer(req.user, dto);
  }

  @Post('credit-customers/:id/payments')
  collectCreditPayment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CollectCreditPaymentDto,
  ) {
    return this.sellerOsService.collectCreditPayment(req.user, id, dto);
  }

  @Get('payment-desk')
  getPaymentDesk(@Req() req: any) {
    return this.sellerOsService.getPaymentDesk(req.user);
  }

  @Post('payment-desk/holds/:id/payment-request')
  createPaymentRequestFromHold(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreatePaymentRequestFromHoldDto,
  ) {
    return this.sellerOsService.createPaymentRequestFromHold(req.user, id, dto);
  }

  @Patch('payment-desk/orders/:id/paid')
  markSellerOrderPaid(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: MarkSellerOrderPaidDto,
  ) {
    return this.sellerOsService.markSellerOrderPaid(req.user, id, dto);
  }

  @Patch('payment-desk/orders/:id/cancel')
  cancelSellerPaymentOrder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CancelSellerPaymentOrderDto,
  ) {
    return this.sellerOsService.cancelSellerPaymentOrder(req.user, id, dto);
  }

  @Post('returns')
  createReturnCase(@Req() req: any, @Body() dto: CreateReturnCaseDto) {
    return this.sellerOsService.createReturnCase(req.user, dto);
  }

  @Post('deliveries')
  createDelivery(@Req() req: any, @Body() dto: CreateDeliveryDto) {
    return this.sellerOsService.createDelivery(req.user, dto);
  }

  @Patch('approvals/:id/status')
  updateApprovalStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected'; notes?: string },
  ) {
    return this.sellerOsService.updateApprovalStatus(req.user, id, body.status, body.notes);
  }

  @Post('ai/check')
  aiGuardrailCheck(@Req() req: any, @Body() dto: AiGuardrailCheckDto) {
    return this.sellerOsService.aiGuardrailCheck(req.user, dto);
  }

  @Get('agent/products/search')
  searchProductsForAgent(@Req() req: any, @Query() query: AgentProductSearchDto) {
    return this.sellerOsService.searchProductsForAgent(req.user, query);
  }

  @Post('agent/stock-reservations')
  reserveForAgent(@Req() req: any, @Body() dto: CreateStockReservationDto) {
    return this.sellerOsService.createStockReservation(req.user, dto, 'whatsapp_ai');
  }

  @Post('agent/orders')
  createAgentOrder(@Req() req: any, @Body() dto: AgentCreateOrderDto) {
    return this.sellerOsService.createAgentOrder(req.user, dto);
  }
}
