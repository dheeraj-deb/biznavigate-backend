import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { HotelProfileModule } from '../hotel-profile/hotel-profile.module';
import { CompetitorModule } from '../competitor/competitor.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { RedisClientProvider } from '../redis.provider';

@Module({
  imports: [PrismaModule, HotelProfileModule, CompetitorModule],
  controllers: [PricingController],
  providers: [PricingService, RedisClientProvider],
  exports: [PricingService],
})
export class PricingModule {}
