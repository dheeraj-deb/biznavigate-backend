import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RAZORPAY_CLIENT } from '../razorpay.provider';
import { RazorpayClient } from '../razorpay.types';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(RAZORPAY_CLIENT) private readonly razorpay: RazorpayClient,
  ) {}

  async ensureWallet(businessId: string) {
    return this.prisma.wallets.upsert({
      where: { business_id: businessId },
      create: { business_id: businessId, balance: 0 },
      update: {},
    });
  }

  async getWallet(businessId: string) {
    const wallet = await this.ensureWallet(businessId);
    const transactions = await this.prisma.wallet_transactions.findMany({
      where: { wallet_id: wallet.wallet_id },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
    return { ...wallet, transactions };
  }

  async getTransactionHistory(businessId: string, page = 1, limit = 30) {
    const wallet = await this.ensureWallet(businessId);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.wallet_transactions.findMany({
        where: { wallet_id: wallet.wallet_id },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.wallet_transactions.count({ where: { wallet_id: wallet.wallet_id } }),
    ]);
    return { data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  // Credit wallet — safe (no balance check needed for adding money).
  async creditWallet(
    businessId: string,
    amount: number,
    referenceId: string,
    referenceType: string,
    description: string,
  ) {
    if (amount <= 0) return;
    const wallet = await this.ensureWallet(businessId);

    // CRITICAL-6: Both the balance UPDATE and transaction log must be atomic.
    // A crash between the two would move money with no audit record.
    await this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ balance_after: string }>>`
        UPDATE wallets
        SET balance = balance + ${amount}::numeric, updated_at = NOW()
        WHERE wallet_id = ${wallet.wallet_id}::uuid
        RETURNING balance::text AS balance_after
      `;

      const balanceAfter = parseFloat(rows[0].balance_after);
      const balanceBefore = balanceAfter - amount;

      await tx.wallet_transactions.create({
        data: {
          wallet_id: wallet.wallet_id,
          type: 'credit',
          amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description,
          reference_id: referenceId,
          reference_type: referenceType,
          status: 'completed',
        },
      });

      return balanceAfter;
    });

    this.logger.log(`Credited ₹${amount} to business ${businessId}`);
  }

  // Debit wallet for a specific WhatsApp action.
  // Uses atomic UPDATE WHERE balance >= amount — prevents negative balance without locking.
  async deductCredits(
    businessId: string,
    actionType: string,
    quantity: number,
    referenceId: string,
  ) {
    const pricing = await this.prisma.credit_pricing.findUnique({
      where: { action_type: actionType },
    });
    if (!pricing || !pricing.is_active) {
      throw new BadRequestException(`Unknown credit action: ${actionType}`);
    }

    const totalCost = parseFloat(pricing.cost.toString()) * quantity;
    await this.ensureWallet(businessId);

    // CRITICAL-6: Balance UPDATE and transaction log must be atomic.
    await this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ wallet_id: string; balance_after: string }>>`
        UPDATE wallets
        SET balance = balance - ${totalCost}::numeric, updated_at = NOW()
        WHERE business_id = ${businessId}::uuid AND balance >= ${totalCost}::numeric
        RETURNING wallet_id, balance::text AS balance_after
      `;

      if (!rows.length) {
        const w = await tx.wallets.findUnique({
          where: { business_id: businessId },
          select: { balance: true },
        });
        throw new HttpException(
          {
            message: 'Insufficient wallet balance. Please topup your wallet.',
            current_balance: w?.balance ?? 0,
            required: totalCost,
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      const balanceAfter = parseFloat(rows[0].balance_after);
      const balanceBefore = balanceAfter + totalCost;

      await tx.wallet_transactions.create({
        data: {
          wallet_id: rows[0].wallet_id,
          type: 'debit',
          amount: totalCost,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: `${actionType} × ${quantity}`,
          reference_id: referenceId,
          reference_type: 'action',
          action_type: actionType,
          status: 'completed',
        },
      });
    });

    this.logger.log(`Debited ₹${totalCost} (${actionType}×${quantity}) from business ${businessId}`);
  }

  // Create a Razorpay order for wallet topup — frontend uses this to open checkout.
  async createTopupOrder(businessId: string, amountRupees: number) {
    if (amountRupees < 10) throw new BadRequestException('Minimum topup is ₹10');
    if (amountRupees > 100000) throw new BadRequestException('Maximum single topup is ₹1,00,000');

    const amountPaise = Math.round(amountRupees * 100);
    const receipt = `wallet_${businessId.slice(0, 8)}_${Date.now()}`;

    const order = await this.razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        type: 'wallet_topup',
        business_id: businessId,
        amount_rupees: amountRupees,
      },
    });

    return {
      order_id: order.id,
      amount: amountPaise,
      currency: 'INR',
      receipt,
    };
  }

  // Called by webhook processor on payment.captured for wallet topup.
  async handleTopupCapture(businessId: string, razorpayPaymentId: string, amountPaise: number) {
    // Idempotency — skip if already processed
    const exists = await this.prisma.billing_payments.findUnique({
      where: { razorpay_payment_id: razorpayPaymentId },
    });
    if (exists && exists.status === 'captured') {
      this.logger.warn(`Topup payment ${razorpayPaymentId} already processed, skipping`);
      return;
    }

    const amountRupees = amountPaise / 100;

    await this.prisma.billing_payments.upsert({
      where: { razorpay_payment_id: razorpayPaymentId },
      create: {
        business_id: businessId,
        razorpay_payment_id: razorpayPaymentId,
        amount: amountPaise,
        type: 'topup',
        status: 'captured',
        idempotency_key: razorpayPaymentId,
        metadata: { source: 'wallet_topup' },
      },
      update: { status: 'captured' },
    });

    await this.creditWallet(businessId, amountRupees, razorpayPaymentId, 'topup', `Wallet topup ₹${amountRupees}`);
  }
}
