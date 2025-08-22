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
    private readonly prisma: PrismaService
  ) {}

  async handleWebhook(payload: WhatsAppWebhookPayload): Promise<string> {
    try {
      this.logger.log(`Received WhatsApp webhook: ${payload.MessageSid}`);

      if (payload.SmsStatus === "received") {
        const response = await this.conversationHandler.handleMessage(
          payload.To,
          payload.From,
          payload.Body
        );

        // this.logger.log(
        //   `Processed message from ${payload.From}: ${payload.Body}`
        // );

        if (response) {
          await this.sendMessage(payload.From, payload.To, response);
        }
      }

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
        `Sending WhatsApp message to ${to}: ${data.message.substring(0, 50)}...`
      );

      // Call the WhatsApp API to send the message
      const accountSid = this.configService.get<string>("TWILIO.SID");
      const authToken = this.configService.get<string>("TWILIO.AUTH_TOKEN");
      const client = new Twilio(accountSid, authToken);

      console.log("Sending message with data:", data.contentVariables);

      const messageOptions: any = {
        contentSid: data.contentSid,
        contentVariables: data.contentVariables,
        body: data.message,
        from,
        to,
      };

      // if (mediaUrl) {
      //   messageOptions.mediaUrl = [mediaUrl];
      // }

      await client.messages.create(messageOptions);

      // For now, just log the message
      // In real implementation, you would call the WhatsApp API

      return true;
    } catch (error) {
      this.logger.error("Failed to send WhatsApp message:", error);
      return false;
    }
  }
}
