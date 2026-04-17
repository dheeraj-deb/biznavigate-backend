import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { HospitalityFlowService } from './hospitality-flow.service';

@Injectable()
export class FlowDataExchangeService {
  private readonly logger = new Logger(FlowDataExchangeService.name);

  constructor(private readonly hospitalityFlow: HospitalityFlowService) { }

  // ─── Decrypt / Encrypt ────────────────────────────────────────────────────

  decryptRequest(
    body: {
      encrypted_flow_data: string;
      encrypted_aes_key: string;
      initial_vector: string;
    },
    privateKeyPem: string,
  ): { payload: any; aesKey: Buffer; iv: Buffer } {
    const { encrypted_flow_data, encrypted_aes_key, initial_vector } = body;

    const aesKey = crypto.privateDecrypt(
      {
        key: crypto.createPrivateKey(privateKeyPem),
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encrypted_aes_key, 'base64'),
    );

    const iv = Buffer.from(initial_vector, 'base64');
    const flowData = Buffer.from(encrypted_flow_data, 'base64');
    const encryptedBody = flowData.subarray(0, -16);
    const authTag = flowData.subarray(-16);

    const decipher = crypto.createDecipheriv('aes-128-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedBody), decipher.final()]);
    const payload = JSON.parse(decrypted.toString('utf-8'));

    return { payload, aesKey, iv };
  }

  encryptResponse(response: object, aesKey: Buffer, iv: Buffer): string {
    const flippedIv = Buffer.from(iv.map((b) => ~b & 0xff));

    const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(response), 'utf-8'),
      cipher.final(),
      cipher.getAuthTag(),
    ]);

    return encrypted.toString('base64');
  }

  // ─── Action Router ────────────────────────────────────────────────────────

  async handleAction(payload: any, businessId?: string, businessType?: string): Promise<object> {
    const { action, screen, data, flow_token } = payload;

    this.logger.log(`Flow action=${action} screen=${screen} businessId=${businessId} businessType=${businessType}`);

    if (action === 'ping') {
      return { data: { status: 'active' } };
    }

    if (data?.error) {
      this.logger.warn(`Flow error notification: ${data.error} - ${data.error_message}`);
      return { data: { acknowledged: true } };
    }

    switch (businessType) {
      case 'hospitality':
      default:
        if (action === 'INIT') return this.hospitalityFlow.handleInit(data, businessId, flow_token);
        if (action === 'BACK') return this.hospitalityFlow.handleBack(screen, data, businessId);
        if (action === 'data_exchange') return this.hospitalityFlow.handleDataExchange(screen, data, flow_token, businessId);
    }

    return { data: { error_message: 'Unknown action' } };
  }
}
