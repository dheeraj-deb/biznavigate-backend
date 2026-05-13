import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { StockReservationService } from '../services/stock-reservation.service';
import { WhatsAppCatalogService } from '../../../../engagement/whatsapp/application/catalog/whatsapp-catalog.service';

/**
 * Background Job Processor for Expired Stock Reservations
 * Runs periodically to clean up expired reservations and release stock
 */
@Processor('reservation-cleanup', {
  concurrency: 1, // Only one cleanup job at a time
  lockDuration: 60000,   // 60s — cleanup can be slow on large datasets
  lockRenewTime: 15000,
})
export class ReservationCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(ReservationCleanupProcessor.name);

  constructor(
    private readonly stockReservationService: StockReservationService,
    private readonly whatsappCatalogService: WhatsAppCatalogService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log('Starting expired reservation cleanup job');

    try {
      const [cleanedCount, { count: cartHoldsReleased, restoredProductIds }] = await Promise.all([
        this.stockReservationService.cleanupExpiredReservations(),
        this.stockReservationService.cleanupExpiredCartHolds(),
      ]);

      // Push availability updates to WhatsApp catalog for all products whose stock was restored.
      // Run in parallel, fire-and-forget per product so one failure doesn't block the rest.
      if (restoredProductIds.length > 0) {
        await Promise.allSettled(
          restoredProductIds.map((productId) =>
            this.whatsappCatalogService
              .syncProductAvailabilityToCatalog(productId)
              .catch((err) => this.logger.warn(`Catalog sync failed for ${productId}: ${err.message}`)),
          ),
        );
      }

      this.logger.log(
        `Cleanup job completed. Order reservations: ${cleanedCount}, cart holds: ${cartHoldsReleased}`,
      );

      return {
        success: true,
        cleanedCount,
        cartHoldsReleased,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Cleanup job failed: ${error.message}`, error.stack);
      throw error; // Job will retry automatically
    }
  }
}
