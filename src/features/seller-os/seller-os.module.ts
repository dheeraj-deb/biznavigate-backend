import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InventoryModule } from '../inventory/inventory.module';
import { SellerOrderPaymentSafetyService } from './application/seller-order-payment-safety.service';
import { SellerOsController } from './application/seller-os.controller';
import { SellerOsService } from './application/seller-os.service';

@Module({
  imports: [PrismaModule, InventoryModule],
  controllers: [SellerOsController],
  providers: [SellerOsService, SellerOrderPaymentSafetyService],
  exports: [SellerOsService, SellerOrderPaymentSafetyService],
})
export class SellerOsModule {}
