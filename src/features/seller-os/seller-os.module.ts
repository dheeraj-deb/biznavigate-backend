import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersModule } from '../commerce/orders/orders.module';
import { SellerOsController } from './application/seller-os.controller';
import { SellerOsService } from './application/seller-os.service';

@Module({
  imports: [PrismaModule, OrdersModule],
  controllers: [SellerOsController],
  providers: [SellerOsService],
  exports: [SellerOsService],
})
export class SellerOsModule {}
