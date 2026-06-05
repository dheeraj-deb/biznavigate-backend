import { Module } from '@nestjs/common';
import { CartController } from './application/controllers/cart.controller';
import { CartService } from './application/services/cart.service';
import { CartRepositoryPrisma } from './infrastructure/cart.repository.prisma';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService, CartRepositoryPrisma],
  exports: [CartService], // Export for use in WhatsApp module
})
export class CartModule {}
