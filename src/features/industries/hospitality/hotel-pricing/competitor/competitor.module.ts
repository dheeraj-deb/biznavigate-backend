import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompetitorSnapshot, CompetitorSnapshotSchema } from './schemas/competitor-snapshot.schema';
import { CompetitorService } from './competitor.service';
import { CompetitorController } from './competitor.controller';
import { BookingComService } from './booking-com.service';
import { HotelProfileModule } from '../hotel-profile/hotel-profile.module';
import { RedisClientProvider } from '../redis.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompetitorSnapshot.name, schema: CompetitorSnapshotSchema },
    ]),
    HotelProfileModule,
  ],
  controllers: [CompetitorController],
  providers: [CompetitorService, BookingComService, RedisClientProvider],
  exports: [CompetitorService, BookingComService, RedisClientProvider],
})
export class CompetitorModule {}
