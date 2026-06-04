import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  AiGuardrailCheckDto,
  CompleteSellerSetupDto,
  CreateCreditCustomerDto,
  CreateDeliveryDto,
  CreateManualSaleDto,
  CreateOwnerApprovalDto,
  CreateReturnCaseDto,
  CreateStockReservationDto,
  UpdateCreditCustomerDto,
  UpdateSellerStatusDto,
} from './dto/seller-os.dto';
import { SellerOsService } from './seller-os.service';

@Controller('seller-os')
@UseGuards(JwtAuthGuard)
export class SellerOsController {
  constructor(private readonly sellerOsService: SellerOsService) {}

  @Get('overview')
  getOverview(@Req() req: any) {
    return this.sellerOsService.getOverview(req.user);
  }

  @Get('setup')
  getSetup(@Req() req: any) {
    return this.sellerOsService.getSetup(req.user);
  }

  @Post('setup/complete')
  completeSetup(@Req() req: any, @Body() dto: CompleteSellerSetupDto) {
    return this.sellerOsService.completeSetup(req.user, dto);
  }

  @Post('manual-sales')
  createManualSale(@Req() req: any, @Body() dto: CreateManualSaleDto) {
    return this.sellerOsService.createManualSale(req.user, dto);
  }

  @Post('stock-reservations')
  createStockReservation(@Req() req: any, @Body() dto: CreateStockReservationDto) {
    return this.sellerOsService.createStockReservation(req.user, dto);
  }

  @Patch('stock-reservations/:reservationId/release')
  releaseStockReservation(@Req() req: any, @Param('reservationId') reservationId: string) {
    return this.sellerOsService.releaseStockReservation(req.user, reservationId);
  }

  @Get('credit-customers')
  listCreditCustomers(@Req() req: any) {
    return this.sellerOsService.listCreditCustomers(req.user);
  }

  @Post('credit-customers')
  upsertCreditCustomer(@Req() req: any, @Body() dto: CreateCreditCustomerDto) {
    return this.sellerOsService.upsertCreditCustomer(req.user, dto);
  }

  @Patch('credit-customers/:creditAccountId')
  updateCreditCustomer(
    @Req() req: any,
    @Param('creditAccountId') creditAccountId: string,
    @Body() dto: UpdateCreditCustomerDto,
  ) {
    return this.sellerOsService.updateCreditCustomer(req.user, creditAccountId, dto);
  }

  @Post('returns')
  createReturnCase(@Req() req: any, @Body() dto: CreateReturnCaseDto) {
    return this.sellerOsService.createReturnCase(req.user, dto);
  }

  @Patch('returns/:returnId/status')
  updateReturnStatus(
    @Req() req: any,
    @Param('returnId') returnId: string,
    @Body() dto: UpdateSellerStatusDto,
  ) {
    return this.sellerOsService.updateReturnStatus(req.user, returnId, dto);
  }

  @Post('deliveries')
  createDelivery(@Req() req: any, @Body() dto: CreateDeliveryDto) {
    return this.sellerOsService.createDelivery(req.user, dto);
  }

  @Patch('deliveries/:deliveryId/status')
  updateDeliveryStatus(
    @Req() req: any,
    @Param('deliveryId') deliveryId: string,
    @Body() dto: UpdateSellerStatusDto,
  ) {
    return this.sellerOsService.updateDeliveryStatus(req.user, deliveryId, dto);
  }

  @Post('approvals')
  createApproval(@Req() req: any, @Body() dto: CreateOwnerApprovalDto) {
    return this.sellerOsService.createApproval(req.user, dto);
  }

  @Patch('approvals/:approvalId/approve')
  approve(@Req() req: any, @Param('approvalId') approvalId: string) {
    return this.sellerOsService.decideApproval(req.user, approvalId, 'approved');
  }

  @Patch('approvals/:approvalId/reject')
  reject(@Req() req: any, @Param('approvalId') approvalId: string) {
    return this.sellerOsService.decideApproval(req.user, approvalId, 'rejected');
  }

  @Post('ai/check')
  checkAiGuardrails(@Req() req: any, @Body() dto: AiGuardrailCheckDto) {
    return this.sellerOsService.checkAiGuardrails(req.user, dto);
  }
}
