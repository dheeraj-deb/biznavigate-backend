import { Module } from '@nestjs/common';
import { HotelNotificationService } from './hotel-notification.service';
import { HotelNotificationController } from './hotel-notification.controller';
import { PrismaModule } from '../../../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HotelNotificationController],
  providers: [HotelNotificationService],
  exports: [HotelNotificationService],
})
export class HotelNotificationModule {}
