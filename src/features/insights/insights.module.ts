import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';

/**
 * Insights boundary module.
 *
 * Owns reporting, KPIs, and business analytics composition.
 */
@Module({
  imports: [AnalyticsModule],
  exports: [AnalyticsModule],
})
export class InsightsModule {}
