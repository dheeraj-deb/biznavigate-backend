import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  BusinessLogicException,
  ExternalServiceException,
} from "src/common/exceptions/base.exception";
// import { PrismaService } from '../../core/prisma/prisma.service';
// import {
//   BusinessLogicException,
//   ExternalServiceException,
// } from "../../common/exceptions/base.exception";
import { PrismaService } from "src/prisma/prisma.service";
import { Twilio } from "twilio";
import { ConversationHandlerService } from "./conversation-handler.service";
import { WhatsAppResponseWithTemplate } from "../interfaces/whatsapp-response-template.interface";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

export interface WhatsAppWebhookPayload {
  SmsMessageSid: string;
  NumMedia: string;
  ProfileName: string;
  MessageType: string;
  SmsSid: string;
  WaId: string;
  SmsStatus: string;
  Body: string;
  To: string;
  NumSegments: string;
  ReferralNumMedia: string;
  MessageSid: string;
  AccountSid: string;
  From: string;
  ApiVersion: string;
}

export interface OnboardingStep {
  message: string;
  type: "text" | "location";
  data: string;
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

export interface UserSession {
  sessionId: string;
  stepIndex: number;
  data: Record<string, string>;
  startedAt: Date;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private conversationHandler: ConversationHandlerService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @InjectQueue("outbound-messages") private outboundQueue: Queue,
    @InjectQueue("inbound-messages") private inboundQueue: Queue
  ) {}

  async enqueueMessage(
    to: string,
    from: string,
    data: WhatsAppResponseWithTemplate,
    inboundRef?: string
  ) {
    try {
      await this.outboundQueue.add(
        "send",
        {
          to,
          from,
          data,
          inboundRef,
        },
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
      this.logger.log(`Enqueued outbound message to=${to}`);
      return true;
    } catch (error) {
      this.logger.error(
        "Failed to enqueue outbound message",
        error?.message ?? error
      );
      return false;
    }
  }

  async handleWebhook(payload: WhatsAppWebhookPayload): Promise<string> {
    try {
      this.logger.log(`Received WhatsApp webhook: ${payload.MessageSid}`);

      // console.log("payload==>", payload);

      // if (payload.SmsStatus === "received") {
      //   const response = await this.conversationHandler.handleMessage(
      //     payload.To,
      //     payload.From,
      //     payload.Body
      //   );

      //   // this.logger.log(
      //   //   `Processed message from ${payload.From}: ${payload.Body}`
      //   // );

      //   if (response) {
      //     await this.sendMessage(payload.From, payload.To, response);
      //   }
      // }

      const id =
        payload.MessageSid ??
        payload.SmsMessageSid ??
        `${Date.now()}-${Math.random()}`;

      await this.inboundQueue
        .add("incoming", payload, {
          jobId: `in_${id}`,
          removeOnComplete: {
            age: 3600,
            count: 1000,
          },
          // removeOnFail: {
          //   age: 86400,
          //   count: 1000,
          // },
          removeOnFail: false,
        })
        .then(() => {
          console.log(`Enqueued inbound message job in_${id}`);
        })
        .catch((error) => {
          console.error("Failed to enqueue inbound message job:", error);
        });

      return "OK";
    } catch (error) {
      this.logger.error("Error handling WhatsApp webhook:", error);
      throw new ExternalServiceException("WhatsApp", error.message);
    }
  }

  async sendMessage(
    to: string,
    from: string,
    data: WhatsAppResponseWithTemplate
  ): Promise<boolean> {
    try {
      // Implement actual WhatsApp message sending logic here
      // This would typically use Twilio WhatsApp API or similar service

      this.logger.log(
        `Sending WhatsApp message to ${to}: ${data.message?.substring(0, 50)}...`
      );

      // Call the WhatsApp API to send the message
      const accountSid = this.configService.get<string>("TWILIO.SID");
      const authToken = this.configService.get<string>("TWILIO.AUTH_TOKEN");
      const twilioWhatsAppNumber = this.configService.get<string>("TWILIO.PHONE_NUMBER");
      const client = new Twilio(accountSid, authToken);

      console.log("Sending message with data:", data.contentVariables);

      // Format phone numbers for WhatsApp API
      // Use configured Twilio WhatsApp number instead of 'from' parameter
      const formattedFrom = twilioWhatsAppNumber?.startsWith('whatsapp:')
        ? twilioWhatsAppNumber
        : `whatsapp:${twilioWhatsAppNumber}`;
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      console.log("Formatted phone numbers - From:", formattedFrom, "To:", formattedTo);

      const messageOptions: any = {
        body: data.message,
        from: formattedFrom,
        to: formattedTo,
      };

      // Only add contentSid if it exists (for templates)
      if (data.contentSid) {
        messageOptions.contentSid = data.contentSid;
        messageOptions.contentVariables = data.contentVariables;
      }

      // console.log("Message options:", messageOptions);

      // if (mediaUrl) {
      //   messageOptions.mediaUrl = [mediaUrl];
      // }

      await client.messages.create(messageOptions).then(() => {
        this.logger.error("WhatsApp message sent successfully");
      });

      // For now, just log the message
      // In real implementation, you would call the WhatsApp API

      return true;
    } catch (error) {
      this.logger.error("Failed to send WhatsApp message:", error);
      console.error("Twilio error details:", error);
      return false;
    }
  }
}
