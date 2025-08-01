import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './infrastructure/users.controller';
import { UserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/users.repository.prisma';
import { ZohoModule } from '../../integrations/crm/zoho/zoho.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ZohoModule, PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
