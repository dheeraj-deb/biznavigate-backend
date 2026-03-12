import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
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
