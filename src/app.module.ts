import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { WhatsappModule } from './integration/communication/whatsapp/whatsapp.module';
import twilioConfig from './config/twilio.config';
import { BusinessUserModule } from './modules/business_user/business_user.module';

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
    BusinessUserModule
    
    // OrderModule,
    // ProductModule,	
    // CrmModule
  ],
})
export class AppModule { }
