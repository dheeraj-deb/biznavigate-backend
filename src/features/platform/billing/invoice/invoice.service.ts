import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.billing_invoices.findMany({
        where: { business_id: businessId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.billing_invoices.count({ where: { business_id: businessId } }),
    ]);
    return { data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async generatePdf(invoiceId: string, businessId: string): Promise<Buffer> {
    const invoice = await this.prisma.billing_invoices.findUnique({
      where: { invoice_id: invoiceId },
      include: {
        businesses: { select: { business_name: true, phone: true, email: true } },
        subscription: { include: { plan: true } },
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.business_id !== businessId) throw new NotFoundException('Invoice not found');

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const subtotalRs = (invoice.subtotal / 100).toFixed(2);
      const taxRs = (invoice.tax_amount / 100).toFixed(2);
      const totalRs = (invoice.total_amount / 100).toFixed(2);
      const planName = invoice.subscription?.plan?.name ?? 'Subscription';

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('BizNavigate', 50, 50);
      doc.fontSize(10).font('Helvetica').fillColor('#666')
        .text('GST Invoice', 50, 75);

      doc.moveTo(50, 95).lineTo(545, 95).stroke('#ddd');

      // Invoice details (right side)
      doc.fillColor('#000').fontSize(10)
        .text(`Invoice #: ${invoiceId.slice(0, 8).toUpperCase()}`, 350, 50, { align: 'right' })
        .text(`Date: ${invoice.created_at.toLocaleDateString('en-IN')}`, 350, 65, { align: 'right' })
        .text(`Status: ${invoice.status.toUpperCase()}`, 350, 80, { align: 'right' });

      // Bill to
      doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, 115);
      doc.font('Helvetica').fontSize(10)
        .text(invoice.businesses?.business_name ?? 'Business', 50, 130)
        .text(invoice.businesses?.email ?? '', 50, 145)
        .text(invoice.businesses?.phone ?? '', 50, 160);

      // Table header
      doc.moveTo(50, 190).lineTo(545, 190).stroke('#ddd');
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Description', 50, 200)
        .text('Amount', 450, 200, { align: 'right' });
      doc.moveTo(50, 215).lineTo(545, 215).stroke('#ddd');

      // Line item
      doc.font('Helvetica').fontSize(10)
        .text(`${planName} — monthly subscription`, 50, 230)
        .text(`₹${subtotalRs}`, 450, 230, { align: 'right' });

      // Totals
      doc.moveTo(350, 260).lineTo(545, 260).stroke('#ddd');
      doc.font('Helvetica').fontSize(10)
        .text('Subtotal:', 350, 270)
        .text(`₹${subtotalRs}`, 450, 270, { align: 'right' })
        .text('GST (18%):', 350, 285)
        .text(`₹${taxRs}`, 450, 285, { align: 'right' });
      doc.moveTo(350, 300).lineTo(545, 300).stroke();
      doc.font('Helvetica-Bold').fontSize(11)
        .text('Total:', 350, 310)
        .text(`₹${totalRs}`, 450, 310, { align: 'right' });

      // Footer
      doc.moveTo(50, 740).lineTo(545, 740).stroke('#ddd');
      doc.font('Helvetica').fontSize(9).fillColor('#888')
        .text('This is a computer-generated invoice and does not require a signature.', 50, 750, { align: 'center' });

      doc.end();
    });
  }
}
