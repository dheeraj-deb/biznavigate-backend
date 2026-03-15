import { Module } from '@nestjs/common';
import { HotelProfileModule } from './hotel-profile/hotel-profile.module';
import { CompetitorModule } from './competitor/competitor.module';
import { PricingModule } from './pricing/pricing.module';
import { HotelNotificationModule } from './hotel-notifications/hotel-notification.module';

@Module({
  imports: [
    HotelProfileModule,
    CompetitorModule,
    PricingModule,
    HotelNotificationModule,
  ],
})
export class HotelPricingModule {}
