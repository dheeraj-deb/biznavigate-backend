import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InvoiceService } from '../features/invoices/application/services/invoice.service';
import { WhatsAppService } from '../services/whatsapp.service';

/**
 * Worker for sending invoices
 */
@Processor('invoice-processing')
export class InvoiceWorker extends WorkerHost {
  private readonly logger = new Logger(InvoiceWorker.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly whatsappService: WhatsAppService
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { invoiceId, customerPhone, invoice } = job.data;

    this.logger.log(`Sending invoice ${invoiceId} to ${customerPhone}`);

    try {
      // Format invoice message
      const message = this.invoiceService.formatForWhatsApp(invoice);

      // Send via WhatsApp
      await this.whatsappService.sendMessage(
        customerPhone,
        invoice.organizationId,
        { message }
      );

      this.logger.log(`Invoice ${invoiceId} sent successfully`);

      return {
        invoiceId,
        status: 'sent',
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send invoice ${invoiceId}:`, error);
      throw error;
    }
  }
}
