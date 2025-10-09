import { v4 as uuidv4 } from 'uuid';

/**
 * Invoice entity
 */
export class Invoice {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly orderId: string;
  readonly organizationId: string;
  readonly customerId: string;

  private _lineItems: InvoiceLineItem[] = [];
  private _subtotal: number = 0;
  private _taxAmount: number = 0;
  private _discountAmount: number = 0;
  private _totalAmount: number = 0;
  private _status: InvoiceStatus;
  private _dueDate?: Date;
  private _paidAt?: Date;
  private _notes?: string;

  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    invoiceNumber: string;
    orderId: string;
    organizationId: string;
    customerId: string;
    status?: InvoiceStatus;
    dueDate?: Date;
    createdAt?: Date;
  }) {
    this.id = params.id || uuidv4();
    this.invoiceNumber = params.invoiceNumber;
    this.orderId = params.orderId;
    this.organizationId = params.organizationId;
    this.customerId = params.customerId;
    this._status = params.status || InvoiceStatus.DRAFT;
    this._dueDate = params.dueDate;
    this.createdAt = params.createdAt || new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get lineItems(): InvoiceLineItem[] {
    return [...this._lineItems];
  }

  get subtotal(): number {
    return this._subtotal;
  }

  get taxAmount(): number {
    return this._taxAmount;
  }

  get discountAmount(): number {
    return this._discountAmount;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get status(): InvoiceStatus {
    return this._status;
  }

  get dueDate(): Date | undefined {
    return this._dueDate;
  }

  get paidAt(): Date | undefined {
    return this._paidAt;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business logic
  addLineItem(item: InvoiceLineItem): void {
    this._lineItems.push(item);
    this.recalculate();
  }

  setDiscount(amount: number): void {
    if (amount < 0) {
      throw new Error('Discount cannot be negative');
    }

    this._discountAmount = amount;
    this.recalculate();
  }

  setDueDate(dueDate: Date): void {
    this._dueDate = dueDate;
    this._updatedAt = new Date();
  }

  setNotes(notes: string): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  issue(): void {
    if (this._status !== InvoiceStatus.DRAFT) {
      throw new Error('Only draft invoices can be issued');
    }

    if (this._lineItems.length === 0) {
      throw new Error('Cannot issue invoice with no line items');
    }

    this._status = InvoiceStatus.ISSUED;
    this._updatedAt = new Date();
  }

  markAsSent(): void {
    if (this._status !== InvoiceStatus.ISSUED) {
      throw new Error('Only issued invoices can be marked as sent');
    }

    this._status = InvoiceStatus.SENT;
    this._updatedAt = new Date();
  }

  markAsPaid(paidAt?: Date): void {
    if (this._status === InvoiceStatus.PAID) {
      throw new Error('Invoice is already paid');
    }

    this._status = InvoiceStatus.PAID;
    this._paidAt = paidAt || new Date();
    this._updatedAt = new Date();
  }

  void(): void {
    if (this._status === InvoiceStatus.PAID) {
      throw new Error('Cannot void a paid invoice');
    }

    this._status = InvoiceStatus.VOID;
    this._updatedAt = new Date();
  }

  isOverdue(): boolean {
    if (!this._dueDate || this._status === InvoiceStatus.PAID) {
      return false;
    }

    return new Date() > this._dueDate;
  }

  private recalculate(): void {
    this._subtotal = this._lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    this._taxAmount = this._lineItems.reduce((sum, item) => {
      const itemTotal = item.unitPrice * item.quantity;
      const itemTax = itemTotal * (item.taxRate || 0) / 100;
      return sum + itemTax;
    }, 0);

    this._totalAmount = this._subtotal + this._taxAmount - this._discountAmount;
    this._updatedAt = new Date();
  }
}

export interface InvoiceLineItem {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  VOID = 'void',
}
