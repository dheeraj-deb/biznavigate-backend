import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { KafkaProducerService } from "src/features/kafka/kafka-producer.service";
import { getRedis } from "src/utils/redis";

@Processor('message-debounce')
export class MessageDebounceProcessor extends WorkerHost {
    private readonly logger = new Logger(MessageDebounceProcessor.name);

    constructor(
        private readonly kafkaProducer: KafkaProducerService,
    ) {
        super();
    }

    async process(job: Job): Promise<any> {
        const { conversationId } = job.data;
        const redis = getRedis();
        const bufferKey = `msg_buffer:${conversationId}`;

        const raw = await redis.lrange(bufferKey, 0, -1);
        await redis.del(bufferKey);

        if (!raw.length) {
            this.logger.debug(`Buffer empty for conversation ${conversationId}, skipping`);
            return;
        }

        const payloads: any[] = raw.map(r => JSON.parse(r));

        const combinedText = payloads.map(p => p.text).filter(Boolean).join(' ');

        const lastPayload = payloads[payloads.length - 1];

        this.logger.log(
            `🔀 Debounce fired for conv ${conversationId}: ${payloads.length} message(s) → "${combinedText}"`,
        );

        await this.kafkaProducer.requestAiProcessing({
            ...lastPayload,
            text: combinedText,
        });
    }
}
