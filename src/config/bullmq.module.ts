import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST", "localhost"),
          port: config.get<number>("REDIS_PORT", 6379),
        },
      }),
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
