import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { SendWhatsAppMessageDto, MarkAsReadDto } from '../dto/whatsapp-message.dto';

@Injectable()
export class WhatsAppApiClientService {
  private readonly logger = new Logger(WhatsAppApiClientService.name);
  private readonly apiClient: AxiosInstance;
  private readonly apiVersion: string;
  private readonly baseUrl: string;
  private readonly permanentToken: string;

  constructor(private readonly configService: ConfigService) {
    this.apiVersion = this.configService.get<string>('whatsapp.apiVersion', 'v21.0');
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    this.permanentToken = this.configService.get<string>('whatsapp.permanentToken', '');

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.permanentToken}`,
      },
    });

    // Request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send a message
   */
  async sendMessage(
    phoneNumberId: string,
    message: SendWhatsAppMessageDto
  ): Promise<any> {

    console.dir(message, { depth: null })
    try {
      const response = await this.apiClient.post(
        `/${phoneNumberId}/messages`,
        message,
      );

      console.dir(response.data, { depth: null })

      this.logger.log(`Message sent successfully: ${response.data.messages?.[0]?.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(
    phoneNumberId: string,
    messageId: string
  ): Promise<any> {
    try {
      const payload: MarkAsReadDto = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
        typing_indicator: {
          type: "text"
        }
      };

      const response = await this.apiClient.post(
        `/${phoneNumberId}/messages`,
        payload,
      );

      this.logger.debug(`Message ${messageId} marked as read`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  /**
   * Upload media
   */
  async uploadMedia(
    phoneNumberId: string,
    file: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(file)], { type: mimeType });
      formData.append('file', blob);
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', mimeType);

      const response = await this.apiClient.post(
        `/${phoneNumberId}/media`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const mediaId = response.data.id;
      this.logger.log(`Media uploaded successfully: ${mediaId}`);
      return mediaId;
    } catch (error) {
      this.logger.error('Failed to upload media:', error);
      throw error;
    }
  }

  /**
   * Get media URL
   */
  async getMediaUrl(
    mediaId: string,
  ): Promise<string> {
    try {
      const response = await this.apiClient.get(`/${mediaId}`);

      return response.data.url;
    } catch (error) {
      this.logger.error('Failed to get media URL:', error);
      throw error;
    }
  }

  /**
   * Download media
   */
  async downloadMedia(
    mediaUrl: string,
  ): Promise<Buffer> {
    try {
      const response = await axios.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${this.permanentToken}`,
        },
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('Failed to download media:', error);
      throw error;
    }
  }

  /**
   * Get message templates
   */
  async getTemplates(
    whatsappBusinessAccountId: string,
  ): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        `/${whatsappBusinessAccountId}/message_templates`,
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error('Failed to get templates:', error);
      throw error;
    }
  }

  /**
   * Create message template
   */
  async createTemplate(
    whatsappBusinessAccountId: string,
    template: any
  ): Promise<any> {

    console.log("template==>", template);

    try {
      const response = await this.apiClient.post(
        `/${whatsappBusinessAccountId}/message_templates`,
        template,
      );

      console.log("submission res", response)

      this.logger.log(`Template created: ${template.name}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Delete message template
   */
  async deleteTemplate(
    whatsappBusinessAccountId: string,
    templateName: string
  ): Promise<any> {
    try {
      const response = await this.apiClient.delete(
        `/${whatsappBusinessAccountId}/message_templates`,
        {
          params: {
            name: templateName,
          },
        }
      );

      this.logger.log(`Template deleted: ${templateName}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to delete template:', error);
      throw error;
    }
  }

  /**
   * Get phone number details
   */
  async getPhoneNumberDetails(
    phoneNumberId: string,
  ): Promise<any> {
    try {
      const response = await this.apiClient.get(`/${phoneNumberId}`, {
        params: {
          fields: 'verified_name,display_phone_number,quality_rating,messaging_limit_tier,id',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get phone number details:', error);
      throw error;
    }
  }

  /**
   * Get WhatsApp Business Account details
   */
  async getBusinessAccountDetails(
    whatsappBusinessAccountId: string,
  ): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `/${whatsappBusinessAccountId}`,
        {
          params: {
            fields: 'id,name,timezone_id,message_template_namespace,account_review_status',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get business account details:', error);
      throw error;
    }
  }

  /**
   * Create or update product in WhatsApp Catalog
   */
  async syncCatalogProduct(
    catalogId: string,
    productData: {
      retailer_id: string;
      name: string;
      description?: string;
      price: number;
      currency: string;
      availability: 'in stock' | 'out of stock';
      image_url?: string;
      url?: string;
    },
    existingProductId?: string
  ): Promise<{ id: string }> {
    try {
      const endpoint = existingProductId
        ? `/${existingProductId}`
        : `/${catalogId}/products`;

      const response = await this.apiClient.post(endpoint, productData);

      const productId = response.data.id || existingProductId;
      this.logger.log(`Product ${existingProductId ? 'updated' : 'created'} in catalog: ${productId}`);

      return { id: productId };
    } catch (error) {
      this.logger.error('Failed to sync product to catalog:', error);
      throw error;
    }
  }

  /**
   * Delete product from WhatsApp Catalog
   */
  async deleteCatalogProduct(
    productId: string,
  ): Promise<{ success: boolean }> {
    try {
      await this.apiClient.delete(`/${productId}`);

      this.logger.log(`Product deleted from catalog: ${productId}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete product from catalog:', error);
      throw error;
    }
  }

  /**
   * Get catalog details
   */
  async getCatalog(
    catalogId: string,
  ): Promise<any> {
    try {
      const response = await this.apiClient.get(`/${catalogId}`, {
        params: {
          fields: 'id,name,vertical,product_count',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get catalog:', error);
      throw error;
    }
  }

  /**
   * Get products from catalog
   */
  async getCatalogProducts(
    catalogId: string,
    limit = 100
  ): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/${catalogId}/products`, {
        params: {
          fields: 'id,retailer_id,name,description,price,currency,availability,image_url',
          limit,
        },
      });

      return response.data.data || [];
    } catch (error) {
      this.logger.error('Failed to get catalog products:', error);
      throw error;
    }
  }

  /**
   * Get message template status
   */
  async getTemplateStatus(
    metaTemplateId: string,
  ): Promise<{ status: string; rejectedReason?: string }> {
    try {
      const response = await this.apiClient.get(`/${metaTemplateId}`, {
        params: { fields: 'status,quality_score,rejected_reason' },
      });

      return {
        status: response.data.status,
        rejectedReason: response.data.rejected_reason,
      };
    } catch (error) {
      this.logger.error('Failed to get template status:', error);
      throw error;
    }
  }

  /**
   * Subscribe the app to receive webhook events for a WhatsApp Business Account.
   * Must be called once when a new WABA is connected.
   * POST /{waba-id}/subscribed_apps
   */
  async subscribeToWebhooks(wabaId: string): Promise<void> {
    const response = await this.apiClient.post(
      `/${wabaId}/subscribed_apps`,
      {},
    );
    this.logger.log(`Subscribed WABA ${wabaId} to webhooks: ${JSON.stringify(response.data)}`);
  }

  // ─── Flows API ────────────────────────────────────────────────────────────

  async createFlow(wabaId: string, name: string, categories: string[]): Promise<{ id: string }> {
    const response = await this.apiClient.post(
      `/${wabaId}/flows`,
      { name, categories },
    );
    return response.data;
  }

  async uploadFlowAsset(flowId: string, flowJson: object, endpointUri?: string): Promise<any> {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(flowJson)], { type: 'application/json' });
    formData.append('file', jsonBlob, 'flow.json');
    formData.append('name', 'flow.json');
    formData.append('asset_type', 'FLOW_JSON');

    if (endpointUri) {
      formData.append('endpoint_uri', endpointUri);
    }

    const response = await this.apiClient.post(
      `/${flowId}/assets`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  }

  async updateFlow(flowId: string, fields: { endpoint_uri?: string; name?: string }): Promise<any> {
    const body = new URLSearchParams();
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) body.append(k, v); });

    const response = await this.apiClient.post(
      `/${flowId}`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    return response.data;
  }

  async publishFlow(flowId: string): Promise<any> {
    const response = await this.apiClient.post(`/${flowId}/publish`, {});
    return response.data;
  }

  async deprecateFlow(flowId: string): Promise<any> {
    const response = await this.apiClient.post(`/${flowId}/deprecate`, {});
    return response.data;
  }

  async deleteFlow(flowId: string): Promise<any> {
    const response = await this.apiClient.delete(`/${flowId}`);
    return response.data;
  }

  async listFlows(wabaId: string): Promise<any[]> {
    const response = await this.apiClient.get(
      `/${wabaId}/flows`,
      { params: { fields: 'id,name,status,categories,validation_errors,endpoint_uri' } },
    );
    return response.data.data || [];
  }

  async uploadBusinessPublicKey(phoneNumberId: string, publicKey: string): Promise<any> {
    const body = new URLSearchParams();
    body.append('business_public_key', publicKey);

    const response = await this.apiClient.post(
      `/${phoneNumberId}/whatsapp_business_encryption`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    return response.data;
  }

  async getBusinessPublicKey(phoneNumberId: string): Promise<any> {
    const response = await this.apiClient.get(`/${phoneNumberId}/whatsapp_business_encryption`);
    return response.data;
  }

  async getFlow(flowId: string): Promise<any> {
    const response = await this.apiClient.get(
      `/${flowId}`,
      {
        params: { fields: 'id,name,status,categories,validation_errors,endpoint_uri,json_version,data_api_version' },
      },
    );
    return response.data;
  }

  // ─── Phone Number Registration ───────────────────────────────────────────

  async registerPhoneNumber(phoneNumberId: string, pin: string): Promise<void> {
    await this.apiClient.post(`/${phoneNumberId}/register`, {
      messaging_product: 'whatsapp',
      pin,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Handle API errors
   */
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      this.logger.error(`WhatsApp API Error (${status}):`, {
        error: data.error,
        message: data.error?.message,
        code: data.error?.code,
        errorSubcode: data.error?.error_subcode,
        fbtraceId: data.error?.fbtrace_id,
      });

      // Handle specific error codes
      switch (status) {
        case 400:
          this.logger.warn('Bad Request - Check message format');
          break;
        case 401:
          this.logger.error('Unauthorized - Invalid access token');
          break;
        case 403:
          this.logger.error('Forbidden - Insufficient permissions');
          break;
        case 404:
          this.logger.error('Not Found - Resource does not exist');
          break;
        case 429:
          this.logger.warn('Rate Limit Exceeded - Backing off');
          break;
        case 500:
        case 502:
        case 503:
          this.logger.error('WhatsApp API Server Error - Retry later');
          break;
      }
    } else if (error.request) {
      this.logger.error('No response received from WhatsApp API:', error.message);
    } else {
      this.logger.error('Error setting up request:', error.message);
    }
  }
}
