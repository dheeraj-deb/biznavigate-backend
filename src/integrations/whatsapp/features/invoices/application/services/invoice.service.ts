import { Injectable, Logger } from '@nestjs/common';
import { Invoice, InvoiceLineItem, InvoiceStatus } from '../../domain/invoice.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Invoice service
 */
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('invoice-processing') private invoiceQueue: Queue
  ) {}

  /**
   * Generate invoice from order
   */
  async generateFromOrder(params: {
    orderId: string;
    organizationId: string;
    customerId: string;
    items: InvoiceLineItem[];
    dueDate?: Date;
    notes?: string;
  }): Promise<Invoice> {
    this.logger.log(`Generating invoice for order: ${params.orderId}`);

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(params.organizationId);

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      orderId: params.orderId,
      organizationId: params.organizationId,
      customerId: params.customerId,
      dueDate: params.dueDate,
    });

    // Add line items
    for (const item of params.items) {
      invoice.addLineItem(item);
    }

    if (params.notes) {
      invoice.setNotes(params.notes);
    }

    // Issue invoice
    invoice.issue();

    // Save to database
    await this.saveInvoice(invoice);

    this.logger.log(`Invoice generated: ${invoice.invoiceNumber}`);

    return invoice;
  }

  /**
   * Send invoice to customer via WhatsApp
   */
  async sendInvoice(invoiceId: string, customerPhone: string): Promise<void> {
    this.logger.log(`Sending invoice ${invoiceId} to ${customerPhone}`);

    const invoice = await this.getInvoice(invoiceId);

    // Mark as sent
    invoice.markAsSent();
    await this.saveInvoice(invoice);

    // Queue invoice delivery job
    await this.invoiceQueue.add('send-invoice', {
      invoiceId,
      customerPhone,
      invoice: this.serializeInvoice(invoice),
    });

    this.logger.log(`Invoice ${invoiceId} queued for delivery`);
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(invoiceId: string, paidAt?: Date): Promise<void> {
    this.logger.log(`Marking invoice ${invoiceId} as paid`);

    const invoice = await this.getInvoice(invoiceId);
    invoice.markAsPaid(paidAt);

    await this.saveInvoice(invoice);
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const data = await this.findInvoiceData(invoiceId);
    if (!data) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    return this.hydrateInvoice(data);
  }

  /**
   * Get invoices by customer
   */
  async getInvoicesByCustomer(customerId: string, limit: number = 10): Promise<Invoice[]> {
    const invoicesData = await this.findInvoicesByCustomer(customerId, limit);
    return invoicesData.map((data) => this.hydrateInvoice(data));
  }

  /**
   * Format invoice for WhatsApp message
   */
  formatForWhatsApp(invoice: Invoice): string {
    let message = `🧾 *Invoice ${invoice.invoiceNumber}*\n\n`;
    message += `📅 Date: ${invoice.createdAt.toLocaleDateString()}\n`;

    if (invoice.dueDate) {
      message += `⏰ Due: ${invoice.dueDate.toLocaleDateString()}\n`;
    }

    message += `\n📦 *Items:*\n`;

    for (const item of invoice.lineItems) {
      message += `• ${item.description}\n`;
      message += `  ${item.quantity} × ₹${item.unitPrice.toFixed(2)} = ₹${(item.quantity * item.unitPrice).toFixed(2)}\n`;
    }

    message += `\n💰 *Summary:*\n`;
    message += `Subtotal: ₹${invoice.subtotal.toFixed(2)}\n`;

    if (invoice.taxAmount > 0) {
      message += `Tax: ₹${invoice.taxAmount.toFixed(2)}\n`;
    }

    if (invoice.discountAmount > 0) {
      message += `Discount: -₹${invoice.discountAmount.toFixed(2)}\n`;
    }

    message += `\n*Total: ₹${invoice.totalAmount.toFixed(2)}*\n`;

    if (invoice.notes) {
      message += `\n📝 Notes: ${invoice.notes}\n`;
    }

    if (invoice.status === InvoiceStatus.PAID) {
      message += `\n✅ *PAID* on ${invoice.paidAt?.toLocaleDateString()}\n`;
    } else if (invoice.isOverdue()) {
      message += `\n⚠️ *OVERDUE* - Please pay as soon as possible\n`;
    }

    message += `\n🙏 Thank you for your business!`;

    return message;
  }

  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${prefix}-${timestamp}-${random}`;
  }

  private async saveInvoice(invoice: Invoice): Promise<void> {
    const invoiceData = this.serializeInvoice(invoice);

    await this.prisma.whatsappMessage.upsert({
      where: {
        messageSid: `invoice:${invoice.id}`,
      },
      create: {
        messageSid: `invoice:${invoice.id}`,
        to: invoice.customerId,
        from: 'system',
        body: `Invoice ${invoice.invoiceNumber}`,
        direction: 'outbound',
        providerResponse: invoiceData,
      },
      update: {
        providerResponse: invoiceData,
      },
    });
  }

  private async findInvoiceData(invoiceId: string): Promise<any> {
    const record = await this.prisma.whatsappMessage.findUnique({
      where: { messageSid: `invoice:${invoiceId}` },
    });

    return record?.providerResponse;
  }

  private async findInvoicesByCustomer(customerId: string, limit: number): Promise<any[]> {
    const records = await this.prisma.whatsappMessage.findMany({
      where: {
        to: customerId,
        messageSid: { startsWith: 'invoice:' },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map((r) => r.providerResponse);
  }

  private serializeInvoice(invoice: Invoice): any {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      organizationId: invoice.organizationId,
      customerId: invoice.customerId,
      lineItems: invoice.lineItems,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  private hydrateInvoice(data: any): Invoice {
    const invoice = new Invoice({
      id: data.id,
      invoiceNumber: data.invoiceNumber,
      orderId: data.orderId,
      organizationId: data.organizationId,
      customerId: data.customerId,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: new Date(data.createdAt),
    });

    for (const item of data.lineItems || []) {
      invoice.addLineItem(item);
    }

    if (data.discountAmount) {
      invoice.setDiscount(data.discountAmount);
    }

    if (data.notes) {
      invoice.setNotes(data.notes);
    }

    return invoice;
  }
}
