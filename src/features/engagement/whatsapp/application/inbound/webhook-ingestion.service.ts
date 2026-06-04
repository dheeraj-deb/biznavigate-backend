import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WhatsAppTemplatesService } from '../../../whatsapp-templates/whatsapp-templates.service';
import { WhatsAppWebhookDto } from '../../dto/webhook-event.dto';
import { WebhookValidatorService } from '../../infrastructure/webhook-validator.service';

export interface WhatsAppWebhookIngestionHandlers {
  onMessage(message: any, metadata: any, contacts: any[]): Promise<void>;
  onStatus(status: any, metadata: any): Promise<void>;
}

@Injectable()
export class WebhookIngestionService {
  private readonly logger = new Logger(WebhookIngestionService.name);

  constructor(
    private readonly webhookValidator: WebhookValidatorService,
    private readonly whatsappTemplatesService: WhatsAppTemplatesService,
  ) {}

  async processMetaWebhook(
    webhookData: WhatsAppWebhookDto,
    handlers: WhatsAppWebhookIngestionHandlers,
  ): Promise<void> {
    if (!this.webhookValidator.validateWebhookEvent(webhookData)) {
      throw new BadRequestException('Invalid webhook event structure');
    }

    for (const entry of webhookData.entry) {
      const changes = this.webhookValidator.extractChanges(entry);

      for (const change of changes) {
        const { value } = change;

        if (change.field === 'message_template_status_update') {
          await this.whatsappTemplatesService.handleMetaWebhook(value);
          continue;
        }

        const messages = this.webhookValidator.extractMessages(value);
        const statuses = this.webhookValidator.extractStatuses(value);
        if (messages.length || statuses.length) {
          const statusSummary = statuses
            .map((status: any) => `${status.id}:${status.status}:${status.recipient_id ?? 'unknown'}`)
            .join(', ');
          this.logger.log(
            `[Webhook] field=${change.field} phoneNumberId=${value.metadata?.phone_number_id ?? 'unknown'} messages=${messages.length} statuses=${statuses.length}${statusSummary ? ` (${statusSummary})` : ''}`,
          );
        }

        if (messages.length > 0) {
          await Promise.all(
            messages.map((message) => handlers.onMessage(message, value.metadata, value.contacts || [])),
          );
        }

        if (statuses.length > 0) {
          for (const status of statuses) {
            await handlers.onStatus(status, value.metadata);
          }
        }
      }
    }
  }
}
