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
import { WebhookVerificationDto } from './dto/webhook-event.dto';
import {
  SendWhatsAppMessageDto,
} from './dto/whatsapp-message.dto';
import {
  ConnectWhatsAppAccountDto,
  DisconnectWhatsAppAccountDto,
  GetAccountsDto,
} from './dto/whatsapp-auth.dto';
import { WhatsAppSignatureGuard } from './guards/whatsapp-signature.guard';
import { GupshupOnboardingService } from '../gupshup/gupshup-onboarding.service';@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly webhookValidator: WebhookValidatorService,
    private readonly gupshupOnboarding: GupshupOnboardingService,
  ) { }

  // ==================== Account Management ====================

  @Post('accounts/connect')  async connectAccount(@Body() dto: ConnectWhatsAppAccountDto) {
    this.logger.log(`Connecting WhatsApp account for business ${dto.businessId}`);

    return this.whatsappService.connectWhatsAppAccount(
      dto.whatsappBusinessAccountId,
      dto.phoneNumberId,
      dto.businessId,
    );
  }

  @Get('accounts')  async getAccounts(@Query() dto: GetAccountsDto) {
    return this.whatsappService.getWhatsAppAccounts(dto.businessId);
  }

  @Post('accounts/:accountId/refresh-verification')
  async refreshVerification(
    @Param('accountId') accountId: string,
    @Query('businessId') businessId: string,
  ) {
    return this.whatsappService.refreshAccountVerification(accountId, businessId);
  }

  @Delete('accounts/:accountId')  async disconnectAccount(
    @Param('accountId') accountId: string,
    @Body() dto: DisconnectWhatsAppAccountDto,
  ) {
    return this.whatsappService.disconnectAccount(accountId, dto.businessId);
  }

  // ==================== Webhooks ====================

  // ========== META WHATSAPP WEBHOOKS (COMMENTED OUT) ==========

  @Get('webhook/debug')  debugWebhookConfig() {
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

    // Return plain text response (bypass interceptor)
    // Facebook expects just the challenge string, not JSON
    res.status(200).send(challenge);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @UseGuards(WhatsAppSignatureGuard)
  async handleWebhook(
    @Res() res: Response,
    @Body() body: any,
  ) {
    setImmediate(() => this.whatsappService.processWebhook(body));
    res.status(200).json({ success: 200 })
  }


  @Post('messages/send')  async sendMessage(
    @Body() dto: { phoneNumberId: string; to: string; message: SendWhatsAppMessageDto },
  ) {
    return this.whatsappService.sendMessage(
      dto.phoneNumberId,
      dto.to,
      dto.message,
    );
  }

  @Post('messages/button')  async sendButtonMessage(
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

  @Post('messages/list')  async sendListMessage(
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

  // ==================== Gupshup Live Event ====================

  /**
   * Receives Gupshup's "docker-status-event" live-event webhook.
   * Gupshup POSTs here when a WABA app has finished provisioning and gone live.
   * This triggers Step 4 (webhook subscription) and marks the account active.
   *
   * Route: POST /whatsapp/gupshup/live-event
   * No auth guard — Gupshup calls this without a JWT.
   */
  @Post('gupshup/live-event')
  @HttpCode(HttpStatus.OK)
  async handleGupshupLiveEvent(@Body() body: any) {
    this.logger.log(`[GupshupLiveEvent] Received: ${JSON.stringify(body)}`);

    // Only process the docker-status-event with status=live
    const type = body?.type;
    const innerType = body?.payload?.type;
    const innerStatus = body?.payload?.payload?.status;

    // message-event = delivery status (sent/delivered/read/failed) — normalize as Meta status
    if (type === 'message-event') {
      const gsAppId: string = body.app;
      const p = body.payload;
      const statusMap: Record<string, string> = { sent: 'sent', delivered: 'delivered', read: 'read', failed: 'failed' };
      const metaStatus = statusMap[p?.type] ?? p?.type ?? 'sent';
      const normalized = {
        object: 'whatsapp_business_account',
        entry: [{
          id: gsAppId,
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '', phone_number_id: gsAppId },
              statuses: [{
                id: p?.id ?? '',
                status: metaStatus,
                timestamp: String(Math.floor((body.timestamp ?? Date.now()) / 1000)),
                recipient_id: p?.destination ?? p?.source ?? '',
                errors: p?.type === 'failed' ? [{ code: p?.payload?.code, title: p?.payload?.reason }] : undefined,
              }],
            },
          }],
        }],
      };
      setImmediate(() => this.whatsappService.processWebhook(normalized));
      return { received: true };
    }

    // message = incoming customer message — normalize to Meta format
    if (type === 'message') {
      const gsAppId: string = body.app;
      const p = body.payload;
      const normalized = {
        object: 'whatsapp_business_account',
        entry: [{
          id: gsAppId,
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: p?.sender?.phone ?? '', phone_number_id: gsAppId },
              contacts: [{ profile: { name: p?.sender?.name ?? '' }, wa_id: p?.source ?? '' }],
              messages: [{
                from: p?.source ?? '',
                id: p?.id ?? '',
                timestamp: String(Math.floor((body.timestamp ?? Date.now()) / 1000)),
                type: p?.type ?? 'text',
                text: p?.type === 'text' ? { body: p?.payload?.text ?? '' } : undefined,
                image: p?.type === 'image' ? { id: p?.payload?.url, mime_type: p?.payload?.contentType, caption: p?.payload?.caption } : undefined,
                audio: p?.type === 'audio' ? { id: p?.payload?.url, mime_type: p?.payload?.contentType } : undefined,
                video: p?.type === 'video' ? { id: p?.payload?.url, mime_type: p?.payload?.contentType, caption: p?.payload?.caption } : undefined,
                document: p?.type === 'document' ? { id: p?.payload?.url, mime_type: p?.payload?.contentType, filename: p?.payload?.filename, caption: p?.payload?.caption } : undefined,
                location: p?.type === 'location' ? { latitude: p?.payload?.latitude, longitude: p?.payload?.longitude, name: p?.payload?.name, address: p?.payload?.address } : undefined,
                interactive: p?.type === 'interactive' ? p?.payload : undefined,
                button: p?.type === 'button' ? { text: p?.payload?.text, payload: p?.payload?.payload } : undefined,
              }],
            },
          }],
        }],
      };
      setImmediate(() => this.whatsappService.processWebhook(normalized));
      return { received: true };
    }

    // Onboarding live-event
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
