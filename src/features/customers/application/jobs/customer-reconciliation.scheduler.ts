import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../prisma/prisma.service';

/**
 * Nightly job that recomputes customer counter caches from the orders table.
 * Guards against drift caused by failed service calls mid-transaction.
 * Runs at 02:00 every night (low-traffic window).
 */
@Injectable()
export class CustomerReconciliationScheduler {
  private readonly logger = new Logger(CustomerReconciliationScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 2 * * *', { name: 'customer-stats-reconciliation' })
  async reconcileCustomerStats() {
    this.logger.log('Starting nightly customer stats reconciliation...');
    const start = Date.now();

    try {
      // Single UPDATE ... FROM subquery — atomic, no Node.js loop needed
      await this.prisma.$executeRaw`
        UPDATE customers c
        SET
          total_orders   = COALESCE(agg.order_count, 0),
          total_spent    = COALESCE(agg.total_spent, 0),
          last_order_date = agg.last_order_date,
          updated_at     = NOW()
        FROM (
          SELECT
            customer_id,
            COUNT(*)::INT                        AS order_count,
            SUM(total_amount)                    AS total_spent,
            MAX(created_at)                      AS last_order_date
          FROM orders
          WHERE payment_status IN ('paid', 'captured')
            AND customer_id IS NOT NULL
          GROUP BY customer_id
        ) agg
        WHERE c.customer_id = agg.customer_id
      `;

      const elapsed = Date.now() - start;
      this.logger.log(`Customer stats reconciliation completed in ${elapsed}ms`);
    } catch (err) {
      this.logger.error('Customer stats reconciliation failed', err?.message);
    }
  }
}
