import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { InboxGateway } from './inbox.gateway';

@Module({
    imports: [ConfigModule, JwtModule.register({})],
    providers: [InboxGateway],
    exports: [InboxGateway],
})
export class GatewayModule {}
