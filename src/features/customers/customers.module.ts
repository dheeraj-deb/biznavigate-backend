import { Module } from '@nestjs/common';
import { CustomerController } from './application/controllers/customer.controller';
import { CustomerService } from './application/services/customer.service';
import { CustomerRepositoryPrisma } from './infrastructure/customer.repository.prisma';
import { CustomerReconciliationScheduler } from './application/jobs/customer-reconciliation.scheduler';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    CustomerRepositoryPrisma,
    CustomerReconciliationScheduler,
  ],
  exports: [CustomerService, CustomerRepositoryPrisma],
})
export class CustomersModule {}
