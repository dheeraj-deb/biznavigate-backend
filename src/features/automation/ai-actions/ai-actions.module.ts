import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuditLogModule } from '../../platform/audit-log/audit-log.module';
import { BookingsModule } from '../../industries/hospitality/bookings/bookings.module';
import { CartModule } from '../../commerce/cart/cart.module';
import { AiActionRouterService } from './ai-action-router.service';
import { CheckRoomAvailabilityHandler } from './handlers/check-room-availability.handler';
import { CreateHospitalityBookingHandler } from './handlers/create-hospitality-booking.handler';
import { CreateHospitalityInquiryHandler } from './handlers/create-hospitality-inquiry.handler';
import { CreateProductInquiryHandler } from './handlers/create-product-inquiry.handler';
import { CreateProductOrderHandler } from './handlers/create-product-order.handler';
import { HandoffToHumanHandler } from './handlers/handoff-to-human.handler';

@Module({
  imports: [PrismaModule, AuditLogModule, BookingsModule, CartModule],
  providers: [
    AiActionRouterService,
    CheckRoomAvailabilityHandler,
    CreateHospitalityBookingHandler,
    CreateHospitalityInquiryHandler,
    CreateProductInquiryHandler,
    CreateProductOrderHandler,
    HandoffToHumanHandler,
  ],
  exports: [AiActionRouterService],
})
export class AiActionsModule {}
