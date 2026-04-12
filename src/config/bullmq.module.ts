import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createRedisConfig } from "./redis.config";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: createRedisConfig(configService),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: "inbound-messages" },
      { name: "outbound-messages" },
      { name: "message-debounce" },
    ),
  ],
  exports: [BullModule],
})
export class BullMQModule {}
