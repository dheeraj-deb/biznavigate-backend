import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import {
  WhatsAppService,
  WhatsAppWebhookPayload,
} from "../services/whatsapp.service";

@ApiTags("whatsapp")
@Controller("whatsapp")
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get("/webhook")
  @ApiOperation({ summary: "Verify WhatsApp webhook" })
  @ApiResponse({ status: 200, description: "Webhook verified successfully" })
  @ApiQuery({
    name: "hub.mode",
    required: false,
    description: "Webhook verification mode",
  })
  @ApiQuery({
    name: "hub.verify_token",
    required: false,
    description: "Verification token",
  })
  @ApiQuery({
    name: "hub.challenge",
    required: false,
    description: "Challenge string",
  })
  async verifyWebhook(@Query() query: any): Promise<string> {
    // Handle webhook verification for platforms like Facebook/Meta
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    console.log("Webhook verification query:", query);

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }

    return "OK";
  }

  @Post("/webhook")
  @ApiOperation({ summary: "Handle incoming WhatsApp messages" })
  @ApiResponse({ status: 200, description: "Webhook processed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({
    description: "WhatsApp webhook payload",
    schema: {
      type: "object",
      properties: {
        SmsStatus: { type: "string", example: "received" },
        Body: { type: "string", example: "Hello" },
        From: { type: "string", example: "whatsapp:+1234567890" },
        To: { type: "string", example: "whatsapp:+0987654321" },
        MessageSid: { type: "string" },
        AccountSid: { type: "string" },
        WaId: { type: "string" },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: WhatsAppWebhookPayload
  ): Promise<string> {
    // console.log("Received WhatsApp webhook payload:", payload);
    return await this.whatsAppService.handleWebhook(payload);
  }
}
