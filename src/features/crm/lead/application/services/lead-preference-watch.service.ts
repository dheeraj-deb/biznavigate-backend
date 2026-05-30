import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';

export type WatchType =
  | 'price_range'
  | 'item_match'
  | 'date_available'
  | 'stock_available'
  | 'batch_available';

export interface AutomotiveWatchCriteria {
  budget_max?: number;
  make?: string;
  model?: string;
  fuel_type?: string;
  year_min?: number;
}

export interface DateAvailableWatchCriteria {
  date_from: string;
  date_to: string;
  guests?: number;
  item_id?: string;
}

export interface StockWatchCriteria {
  item_id: string;
  variant?: string;
}

export interface BatchWatchCriteria {
  course_id: string;
  preferred_timing?: string;
  preferred_days?: string[];
}

export type WatchCriteria =
  | AutomotiveWatchCriteria
  | DateAvailableWatchCriteria
  | StockWatchCriteria
  | BatchWatchCriteria;

@Injectable()
export class LeadPreferenceWatchService {
  private readonly logger = new Logger(LeadPreferenceWatchService.name);
  private static readonly EXPIRY_DAYS = 90;

  constructor(private readonly prisma: PrismaService) {}

  async createWatch(
    leadId: string,
    businessId: string,
    watchType: WatchType,
    criteria: WatchCriteria,
  ) {
    const expiresAt = new Date(
      Date.now() + LeadPreferenceWatchService.EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    return this.prisma.lead_preference_watches.create({
      data: {
        lead_id: leadId,
        business_id: businessId,
        watch_type: watchType,
        criteria: criteria as any,
        is_active: true,
        expires_at: expiresAt,
      },
    });
  }

  /** Find active watches for a business+type, optionally filtered by criteria match. */
  async findActiveWatches(businessId: string, watchType: WatchType) {
    return this.prisma.lead_preference_watches.findMany({
      where: {
        business_id: businessId,
        watch_type: watchType,
        is_active: true,
        notified_at: null,
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
    });
  }

  /**
   * SQL-level pre-filter for automotive watches.
   * Pushes budget_max, fuel_type, and year_min comparisons into Postgres so
   * only potentially-matching rows are loaded, then applies make/model
   * substring logic in JS on the smaller result set.
   */
  async findMatchingAutomotiveWatches(
    businessId: string,
    vehicle: { asking_price: number; make: string; model_name: string; fuel_type?: string | null; year: number },
  ) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT *
      FROM lead_preference_watches
      WHERE business_id     = ${businessId}::uuid
        AND watch_type       = 'item_match'
        AND is_active        = true
        AND notified_at      IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (
          criteria->>'budget_max' IS NULL
          OR (criteria->>'budget_max')::numeric >= ${vehicle.asking_price}
        )
        AND (
          criteria->>'fuel_type' IS NULL
          OR LOWER(criteria->>'fuel_type') = LOWER(${vehicle.fuel_type ?? ''})
        )
        AND (
          criteria->>'year_min' IS NULL
          OR (criteria->>'year_min')::integer <= ${vehicle.year}
        )
    `;

    // make/model substring match in JS (complex OR/AND logic not worth raw SQL)
    return rows.filter((w) => this.matchesAutomotive(w.criteria, vehicle));
  }

  async markNotified(watchId: string) {
    await this.prisma.lead_preference_watches.update({
      where: { watch_id: watchId },
      data: { notified_at: new Date() },
    });
  }

  /** Called by a weekly BullMQ job — expires stale watches. */
  async expireOldWatches() {
    const result = await this.prisma.lead_preference_watches.updateMany({
      where: { is_active: true, expires_at: { lt: new Date() } },
      data: { is_active: false },
    });
    this.logger.log(`expireOldWatches: deactivated ${result.count} watches`);
    return result.count;
  }

  /** Automotive match: price <= budget_max AND (make OR model matches). */
  matchesAutomotive(
    criteria: AutomotiveWatchCriteria,
    vehicle: { asking_price: number; make: string; model_name: string; fuel_type?: string | null; year: number },
  ): boolean {
    if (criteria.budget_max && vehicle.asking_price > criteria.budget_max) return false;
    if (criteria.fuel_type && vehicle.fuel_type?.toLowerCase() !== criteria.fuel_type.toLowerCase()) return false;
    if (criteria.year_min && vehicle.year < criteria.year_min) return false;
    // If only one of make/model is given → OR (match either). If both given → AND (must match both).
    const makeMatch = criteria.make
      ? vehicle.make.toLowerCase().includes(criteria.make.toLowerCase())
      : null;
    const modelMatch = criteria.model
      ? vehicle.model_name.toLowerCase().includes(criteria.model.toLowerCase())
      : null;
    if (makeMatch !== null && modelMatch !== null) return makeMatch && modelMatch;
    return makeMatch ?? modelMatch ?? true;
  }

  /** Date-available match: vehicle/item date overlaps with watch date range. */
  matchesDateRange(
    criteria: DateAvailableWatchCriteria,
    availableFrom: string,
    availableTo: string,
  ): boolean {
    return availableFrom <= criteria.date_to && availableTo >= criteria.date_from;
  }
}
