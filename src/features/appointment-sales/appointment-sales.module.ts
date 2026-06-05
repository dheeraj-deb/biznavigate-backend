import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppointmentSalesController } from './application/appointment-sales.controller';
import { AppointmentSalesService } from './application/appointment-sales.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentSalesController],
  providers: [AppointmentSalesService],
  exports: [AppointmentSalesService],
})
export class AppointmentSalesModule {}

