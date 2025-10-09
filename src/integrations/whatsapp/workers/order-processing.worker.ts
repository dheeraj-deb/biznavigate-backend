import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrderService } from '../features/orders/application/services/order.service';
import { InvoiceService } from '../features/invoices/application/services/invoice.service';
import { WhatsAppService } from '../services/whatsapp.service';

/**
 * Worker for processing orders asynchronously
 */
@Processor('order-processing')
export class OrderProcessingWorker extends WorkerHost {
  private readonly logger = new Logger(OrderProcessingWorker.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly invoiceService: InvoiceService,
    private readonly whatsappService: WhatsAppService
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { orderId, confirmedBy, timestamp } = job.data;

    this.logger.log(`Processing order: ${orderId}`);

    try {
      // Get order details
      const order = await this.orderService.getOrder(orderId);

      // Generate invoice
      const invoice = await this.invoiceService.generateFromOrder({
        orderId: order.id,
        organizationId: order.organizationId,
        customerId: order.customerId,
        items: order.items.map(item => ({
          productId: item.productId,
          description: item.productName,
          quantity: item.quantity,
          unitPrice: item.price,
          taxRate: item.taxRate,
        })),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      this.logger.log(`Invoice generated: ${invoice.invoiceNumber}`);

      // Send invoice to customer
      const invoiceMessage = this.invoiceService.formatForWhatsApp(invoice);

      await this.whatsappService.sendMessage(
        order.customerPhone,
        order.organizationId,
        { message: invoiceMessage }
      );

      invoice.markAsSent();

      this.logger.log(`Order ${orderId} processed successfully`);

      return {
        orderId,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: 'completed',
      };
    } catch (error) {
      this.logger.error(`Failed to process order ${orderId}:`, error);
      throw error; // BullMQ will retry based on job settings
    }
  }
}
