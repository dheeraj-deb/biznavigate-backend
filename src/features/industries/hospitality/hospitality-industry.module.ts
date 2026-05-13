import { DynamicModule, Module } from '@nestjs/common';
import { BookingsModule } from './bookings/bookings.module';
import { HotelPricingModule } from './hotel-pricing/hotel-pricing.module';

/**
 * Hospitality industry boundary.
 *
 * Bookings are the core operational capability and stay available without
 * MongoDB. Revenue/pricing modules depend on Mongoose-backed hotel pricing
 * schemas, so the app composes them only when MongoDB is enabled.
 */
@Module({
  imports: [BookingsModule],
  exports: [BookingsModule],
})
export class HospitalityIndustryModule {
  static withPricing(): DynamicModule {
    return {
      module: HospitalityIndustryModule,
      imports: [BookingsModule, HotelPricingModule],
      exports: [BookingsModule, HotelPricingModule],
    };
  }
}
