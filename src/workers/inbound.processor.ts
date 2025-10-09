import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { ConversationHandlerService } from "src/integrations/whatsapp/services/conversation-handler.service";
import { WhatsAppService } from "src/integrations/whatsapp/services/whatsapp.service";

// @Injectable()
@Processor("inbound-messages")
export class InboundProcessor extends WorkerHost {
  private readonly logger = new Logger(InboundProcessor.name);

  constructor(
    private handler: ConversationHandlerService,
    private whatsappService: WhatsAppService
  ) {
    super();
  }

  async process(job: Job) {
    const { To: to, From: from, Body: body = "" } = job.data;

    this.logger.log(`Processing inbound message: ${from} -> ${to}`);
    this.logger.log(`Message body: "${body}"`);
    this.logger.log(`INBOUND DEBUG - Raw To: ${to}`);
    this.logger.log(`INBOUND DEBUG - Raw From: ${from}`);
    this.logger.log(`INBOUND DEBUG - Body: ${body}`);

    try {
      // CORRECT: handleMessage(distributorPhone, userPhone, body, payload)
      // To = your Twilio number (distributor)
      // From = customer's number (user)
      this.logger.log(`INBOUND DEBUG - Calling handleMessage(distributorPhone: ${to}, userPhone: ${from}, body: ${body})`);

      const response = await this.handler.handleMessage(
        to,    // distributorPhoneNumber (To - your Twilio number)
        from,  // userPhoneNumber (From - customer's number)
        body,
        job.data
      );

      this.logger.log(`INBOUND DEBUG - Response type: ${typeof response}`);
      this.logger.log(`INBOUND DEBUG - Response value: ${JSON.stringify(response)}`);
      this.logger.log(`Response generated: ${response ? 'YES' : 'NO'}`);

      if (response) {
        // Send TO the customer (from) FROM the Twilio number (to)
        // enqueueMessage(to, from, data, ref)
        // But 'from' parameter in enqueueMessage is not used (we use TWILIO_PHONE_NUMBER)
        // So we just need to make sure 'to' is the customer's number
        await this.whatsappService.enqueueMessage(
          from,  // to: customer's number (where to send)
          to,    // from: Twilio number (not used, kept for compatibility)
          response,
          job.data.MessageSid ?? job.data.SmsMessageSid ?? null
        );
      }

      this.logger.log(`Inbound job ${job.id} completed`);
      return { ok: true };
    } catch (error) {
      this.logger.error(
        `Inbound job ${job.id} failed`,
        error?.message ?? error
      );
      throw error;
    }
  }

  @OnWorkerEvent("active")
  async onActive(job: Job) {
    this.logger.log(`Inbound job ${job.id} started`);
  }

  @OnWorkerEvent("completed")
  async onCompleted(job: Job) {
    this.logger.log(`Inbound job ${job.id} completed`);
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Inbound job ${job.id} failed`, error?.message ?? error);
  }
}
