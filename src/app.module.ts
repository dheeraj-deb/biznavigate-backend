import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { WhatsappModule } from './integration/communication/whatsapp/whatsapp.module';
import twilioConfig from './config/twilio.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [twilioConfig],
      envFilePath: '.env'
    }),
    PrismaModule,
    WhatsappModule,
    UserModule,
    // OrderModule,
    // ProductModule,	
    // CrmModule
  ],
})
export class AppModule { }
