import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import appConfig from "../../config/app.config";
import twilioConfig from "../../config/twilio.config";
import zohoConfig from "../../config/zoho.config";
import aiConfig from "../../config/ai.config";
import envConfig from "src/config/env.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, twilioConfig, zohoConfig, aiConfig, envConfig],
      envFilePath: [".env.local", ".env"],
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class AppConfigModule {}
