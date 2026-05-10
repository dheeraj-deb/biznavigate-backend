import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

const LOW_BALANCE_THRESHOLD = 100; // ₹100

@Injectable()
export class WalletScheduler {
  private readonly logger = new Logger(WalletScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs every day at 10:00 UTC
  @Cron('0 10 * * *', { name: 'low-balance-alert' })
  async runLowBalanceCheck() {
    this.logger.log('Running low balance check...');

    const lowBalanceWallets = await this.prisma.wallets.findMany({
      where: { balance: { lte: LOW_BALANCE_THRESHOLD, gt: 0 } },
      include: {
        businesses: { select: { business_id: true, business_name: true } },
      },
    });

    if (lowBalanceWallets.length === 0) {
      this.logger.log('Low balance check: no wallets below threshold');
      return;
    }

    for (const wallet of lowBalanceWallets) {
      this.logger.warn(
        `Low balance alert: business ${wallet.business_id} (${(wallet.businesses as any)?.business_name}) ` +
        `has ₹${wallet.balance} — below ₹${LOW_BALANCE_THRESHOLD} threshold`,
      );
      // TODO: send WhatsApp notification to business owner via NotificationsModule
    }

    this.logger.log(`Low balance check: ${lowBalanceWallets.length} business(es) need topup`);
  }
}
