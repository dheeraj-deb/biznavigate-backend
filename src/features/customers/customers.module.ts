import { Module } from '@nestjs/common';
import { CustomersService } from './application/customers.service';
import { ZohoModule } from 'src/integrations/crm/zoho/zoho.module';
import { CustomersController } from './infrastructure/customers.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CustomerRepository } from './domain/repositories/customer.repository';
import { PrismaCustomerRepository } from './infrastructure/customers.repository.prisma';
import { UsersModule } from '../users/users.module';


@Module({
    imports: [ZohoModule, PrismaModule, UsersModule],
    controllers: [CustomersController],
    providers: [
        CustomersService,
        {
            provide: CustomerRepository,
            useClass: PrismaCustomerRepository,
        },
    ],
    exports: [CustomersService, CustomerRepository],
})
export class CustomersModule {}