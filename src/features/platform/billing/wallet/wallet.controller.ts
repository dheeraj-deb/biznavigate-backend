import {
  Controller, Get, Post, Body, Query, Req,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TopupDto } from '../dto/topup.dto';

@ApiTags('Billing')
@Controller('billing/wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet balance and last 20 transactions' })
  getWallet(@Req() req: any) {
    return this.walletService.getWallet(req.user.business_id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Paginated transaction history' })
  getTransactions(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.walletService.getTransactionHistory(req.user.business_id, page, Math.min(limit, 100));
  }

  @Post('topup')
  @ApiOperation({ summary: 'Create Razorpay order for wallet topup. Returns order_id for frontend checkout.' })
  createTopup(@Req() req: any, @Body() body: TopupDto) {
    return this.walletService.createTopupOrder(req.user.business_id, body.amount);
  }
}
