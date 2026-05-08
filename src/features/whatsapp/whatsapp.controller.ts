import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { WhatsAppService } from './whatsapp.service';
import { WebhookValidatorService } from './infrastructure/webhook-validator.service';
import {
  WhatsAppWebhookDto,
  WebhookVerificationDto,
} from './dto/webhook-event.dto';
import {
  SendWhatsAppMessageDto,
} from './dto/whatsapp-message.dto';
import {
  ConnectWhatsAppAccountDto,
  DisconnectWhatsAppAccountDto,
  GetAccountsDto,
} from './dto/whatsapp-auth.dto';
import { WhatsAppSignatureGuard } from './guards/whatsapp-signature.guard';
import { GupshupOnboardingService } from '../gupshup/gupshup-onboarding.service';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly webhookValidator: WebhookValidatorService,
    private readonly gupshupOnboarding: GupshupOnboardingService,
  ) { }

  // ==================== Account Management ====================

  @Post('accounts/connect')
  async connectAccount(@Body() dto: ConnectWhatsAppAccountDto) {
    this.logger.log(`Connecting WhatsApp account for business ${dto.businessId}`);

    return this.whatsappService.connectWhatsAppAccount(
      dto.whatsappBusinessAccountId,
      dto.phoneNumberId,
      dto.businessId,
    );
  }

  @Get('accounts')
  async getAccounts(@Query() dto: GetAccountsDto) {
    return this.whatsappService.getWhatsAppAccounts(dto.businessId);
  }

  @Post('accounts/:accountId/refresh-verification')
  async refreshVerification(
    @Param('accountId') accountId: string,
    @Query('businessId') businessId: string,
  ) {
    return this.whatsappService.refreshAccountVerification(accountId, businessId);
  }

  @Delete('accounts/:accountId')
  async disconnectAccount(
    @Param('accountId') accountId: string,
    @Body() dto: DisconnectWhatsAppAccountDto,
  ) {
    return this.whatsappService.disconnectAccount(accountId, dto.businessId);
  }

  // ==================== Webhooks ====================

  @Get('webhook/debug')
  debugWebhookConfig() {
    return {
      hasVerifyToken: !!process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN,
      verifyTokenLength: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN?.length || 0,
      verifyTokenValue: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN,
      hasAppId: !!process.env.FACEBOOK_APP_ID,
      hasAppSecret: !!process.env.FACEBOOK_APP_SECRET,
    };
  }

  @Get('webhook')
  @HttpCode(HttpStatus.OK)
  async verifyWebhook(@Query() query: WebhookVerificationDto, @Res() res: Response) {
    this.logger.log('🔔 Webhook verification request received');
    this.logger.log(`Query params: ${JSON.stringify(query)}`);

    const challenge = this.webhookValidator.verifyChallenge(
      query['hub.mode'],
      query['hub.verify_token'],
      query['hub.challenge'],
    );

    if (!challenge) {
      throw new BadRequestException('Webhook verification failed');
    }

    this.logger.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @UseGuards(WhatsAppSignatureGuard)
  async handleWebhook(
    @Res() res: Response,
    @Body() body: WhatsAppWebhookDto,
  ) {
    setImmediate(() => this.whatsappService.processWebhook(body));
    res.status(200).json({ success: 200 });
  }

  @Post('messages/send')
  async sendMessage(
    @Body() dto: { phoneNumberId: string; to: string; message: SendWhatsAppMessageDto },
  ) {
    return this.whatsappService.sendMessage(
      dto.phoneNumberId,
      dto.to,
      dto.message,
    );
  }

  @Post('messages/button')
  async sendButtonMessage(
    @Body() dto: {
      phoneNumberId: string;
      to: string;
      bodyText: string;
      buttons: { id: string; title: string }[];
      headerText?: string;
      footerText?: string;
    },
  ) {
    return this.whatsappService.sendButtonMessage(
      dto.phoneNumberId,
      dto.to,
      dto.bodyText,
      dto.buttons,
      dto.headerText,
      dto.footerText,
    );
  }

  @Post('messages/list')
  async sendListMessage(
    @Body() dto: {
      phoneNumberId: string;
      to: string;
      bodyText: string;
      buttonText: string;
      sections: { title: string; rows: { id: string; title: string; description?: string }[] }[];
      headerText?: string;
      footerText?: string;
    },
  ) {
    return this.whatsappService.sendListMessage(
      dto.phoneNumberId,
      dto.to,
      dto.bodyText,
      dto.buttonText,
      dto.sections,
      dto.headerText,
      dto.footerText,
    );
  }

  // ==================== Gupshup Webhooks ====================

  /**
   * Receives inbound messages from Gupshup (regular WhatsApp messages).
   * Gupshup posts to this URL when a customer sends a message.
   * Normalizes Gupshup format to Meta-compatible format and routes to the message pipeline.
   * Route: POST /whatsapp/gupshup/webhook
   */
  @Post('gupshup/webhook')
  @HttpCode(HttpStatus.OK)
  async handleGupshupWebhook(@Body() body: any) {
    this.logger.log(`[GupshupWebhook] Received: ${JSON.stringify(body)}`);

    // Gupshup sends webhooks in Meta's exact format with gs_app_id at root.
    // Route each message through the standard Meta handler, using gs_app_id
    // to resolve the account instead of the phone_number_id.
    const gupshupAppId: string | undefined = body?.gs_app_id;
    const entries: any[] = body?.entry ?? [];

    for (const entry of entries) {
      for (const change of entry?.changes ?? []) {
        if (change?.field !== 'messages') continue;
        const value = change?.value;
        const messages: any[] = value?.messages ?? [];
        const contacts: any[] = value?.contacts ?? [];

        for (const message of messages) {
          setImmediate(async () => {
            try {
              if (gupshupAppId) {
                await this.whatsappService.handleGupshupInboundMessage(gupshupAppId, message, contacts);
              } else {
                // Fallback: use metadata phone_number_id as normal
                await this.whatsappService.handleMessageWebhook(message, value?.metadata, contacts);
              }
            } catch (err) {
              this.logger.error('[GupshupWebhook] Error handling inbound message:', err?.message);
            }
          });
        }
      }
    }

    return { received: true };
  }

  /**
   * Receives Gupshup's "docker-status-event" live-event webhook.
   * Route: POST /whatsapp/gupshup/live-event
   * No auth guard — Gupshup calls this without a JWT.
   */
  @Post('gupshup/live-event')
  @HttpCode(HttpStatus.OK)
  async handleGupshupLiveEvent(@Body() body: any) {
    this.logger.log(`[GupshupLiveEvent] Received: ${JSON.stringify(body)}`);

    const type = body?.type;
    const innerType = body?.payload?.type;
    const innerStatus = body?.payload?.payload?.status;

    if (type !== 'onboarding-event' || innerType !== 'docker-status-event' || innerStatus !== 'live') {
      this.logger.log(`[GupshupLiveEvent] Ignoring non-live event: type=${type} innerType=${innerType} innerStatus=${innerStatus}`);
      return { received: true };
    }

    const waId: string | undefined = body?.payload?.payload?.waId;
    const appId: string | undefined = body?.appId;
    const phone: string | undefined = body?.phone;

    setImmediate(() =>
      this.gupshupOnboarding
        .handleLiveEvent({ appId, phone, waId })
        .catch((err) => this.logger.error('[GupshupLiveEvent] Handler error:', err?.message)),
    );

    return { received: true };
  }
}
