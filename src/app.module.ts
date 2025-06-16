import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { WhatsappModule } from './integration/communication/whatsapp/whatsapp.module';
import twilioConfig from './config/twilio.config';
import { BusinessUserModule } from './modules/business_user/business_user.module';
import { ZohoModule } from './modules/zoho/zoho.module';
import zohoConfig from './config/zoho.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [twilioConfig, zohoConfig],
      envFilePath: '.env'
    }),
    PrismaModule,
    WhatsappModule,
    UserModule,
    BusinessUserModule,
    ZohoModule,
    // OrderModule,
    // ProductModule,	
    // CrmModule
  ],
})
export class AppModule { }
