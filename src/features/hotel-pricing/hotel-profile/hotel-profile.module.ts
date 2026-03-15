import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelProfile, HotelProfileSchema } from './schemas/hotel-profile.schema';
import { HotelProfileService } from './hotel-profile.service';
import { HotelProfileController } from './hotel-profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HotelProfile.name, schema: HotelProfileSchema },
    ]),
  ],
  controllers: [HotelProfileController],
  providers: [HotelProfileService],
  exports: [HotelProfileService],
})
export class HotelProfileModule {}
