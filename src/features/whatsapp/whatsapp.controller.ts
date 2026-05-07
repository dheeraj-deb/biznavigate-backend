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

    const payload = body?.payload;
    if (!payload) {
      return { received: true };
    }

    const type = payload?.type;
    if (type !== 'message') {
      this.logger.log(`[GupshupWebhook] Ignoring non-message event: type=${type}`);
      return { received: true };
    }

    // Find account by Gupshup app ID
    const appId: string | undefined = body?.app;
    if (!appId) {
      this.logger.warn('[GupshupWebhook] No app ID in payload');
      return { received: true };
    }

    // Normalize Gupshup message format to Meta-compatible structure
    const from: string = payload?.sender?.phone ?? payload?.source;
    const messageId: string = payload?.id;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const messagePayload = payload?.payload;
    const msgType: string = payload?.type === 'message' ? (messagePayload?.type ?? 'text') : 'text';

    // Build Meta-compatible message object
    const normalizedMessage: any = {
      id: messageId,
      from,
      timestamp,
      type: msgType,
    };

    if (msgType === 'text') {
      normalizedMessage.text = { body: messagePayload?.text ?? messagePayload?.payload ?? '' };
    } else if (msgType === 'image') {
      normalizedMessage.image = { id: messagePayload?.id, caption: messagePayload?.caption };
    } else if (msgType === 'audio') {
      normalizedMessage.audio = { id: messagePayload?.id };
    } else if (msgType === 'video') {
      normalizedMessage.video = { id: messagePayload?.id, caption: messagePayload?.caption };
    } else if (msgType === 'document') {
      normalizedMessage.document = { id: messagePayload?.id, filename: messagePayload?.filename };
    } else if (msgType === 'location') {
      normalizedMessage.location = {
        latitude: messagePayload?.latitude,
        longitude: messagePayload?.longitude,
      };
    } else {
      normalizedMessage.text = { body: JSON.stringify(messagePayload) };
      normalizedMessage.type = 'text';
    }

    // Look up account by Gupshup app ID to get phone_number_id
    setImmediate(async () => {
      try {
        await this.whatsappService.handleGupshupInboundMessage(appId, normalizedMessage);
      } catch (err) {
        this.logger.error('[GupshupWebhook] Error handling inbound message:', err?.message);
      }
    });

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
