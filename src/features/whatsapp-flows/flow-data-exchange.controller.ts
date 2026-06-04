import {
  Controller,
  Post,
  Param,
  Req,
  Res,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { FlowDataExchangeService } from './flow-data-exchange.service';
import { WhatsAppFlow, WhatsAppFlowDocument } from './schemas/flow.schema';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('whatsapp/flows')
export class FlowDataExchangeController {
  private readonly logger = new Logger(FlowDataExchangeController.name);

  constructor(
    private readonly flowService: FlowDataExchangeService,
    @InjectModel(WhatsAppFlow.name)
    private readonly flowModel: Model<WhatsAppFlowDocument>,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) { }

  @Post('exchange/:flowId')
  async exchange(
    @Param('flowId') flowId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {

    console.log("incoming req")
    const flow = await this.flowModel.findOne({ _id: flowId, isDeleted: false });
    if (!flow || !flow.privateKey) {
      throw new NotFoundException('Flow not found or encryption not configured');
    }

    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    const privateKeyPem = this.decryptPrivateKey(flow.privateKey, encryptionKey);

    const appSecret = this.configService.get<string>('META_APP_SECRET');
    if (appSecret) {
      const signature = req.headers['x-hub-signature-256'] as string;
      if (!signature) {
        this.logger.warn('Missing X-Hub-Signature-256 header');
        return res.status(HttpStatus.UNAUTHORIZED).send('Missing signature');
      }

      const rawBody = (req as any).rawBody as Buffer;
      if (rawBody) {
        const expected =
          'sha256=' +
          crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
          this.logger.warn('Invalid X-Hub-Signature-256');
          return res.status(HttpStatus.UNAUTHORIZED).send('Invalid signature');
        }
      }
    }

    let payload: any;
    let aesKey: Buffer;
    let iv: Buffer;

    try {
      const decrypted = this.flowService.decryptRequest(req.body, privateKeyPem);
      payload = decrypted.payload;
      aesKey = decrypted.aesKey;
      iv = decrypted.iv;
    } catch (err) {
      this.logger.error('Failed to decrypt flow request', err);
      return res.status(421).send('Failed to decrypt request');
    }

    // Parse flow_token — can be a JSON object string or plain string
    let flowContext: Record<string, any> = {};
    try {
      if (payload.flow_token) {
        flowContext = JSON.parse(payload.flow_token);
      }
    } catch {
      // plain string token, not JSON
    }

    const businessId = flowContext.businessId ?? flow.businessId;

    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: { business_type: true },
    });
    const businessType = business?.business_type ?? 'hospitality';

    // Merge flowContext into payload.data so handlers can access customerPhone, phoneNumberId, etc.
    if (payload.data) {
      payload.data._flowContext = flowContext;
    }

    console.log("payload")
    console.dir(payload, { depth: null })

    let responseData: object;
    try {
      responseData = await this.flowService.handleAction(payload, businessId, businessType);
    } catch (err) {
      this.logger.error('Flow action handler error', err);
      responseData = { data: { error_message: 'Internal server error' } };
    }

    const encrypted = this.flowService.encryptResponse(responseData, aesKey, iv);
    return res.status(HttpStatus.OK).send(encrypted);
  }

  private decryptPrivateKey(encryptedKey: string, encryptionKey: string): string {
    const [ivHex, encrypted] = encryptedKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(encryptionKey, 'hex'),
      iv,
    );
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }
}
