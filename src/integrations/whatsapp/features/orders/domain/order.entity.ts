import { v4 as uuidv4 } from 'uuid';

/**
 * Order aggregate root
 */
export class Order {
  readonly id: string;
  readonly organizationId: string;
  readonly customerId: string;
  readonly customerPhone: string;

  private _items: OrderItem[] = [];
  private _status: OrderStatus;
  private _totalAmount: number = 0;
  private _notes?: string;
  private _metadata: Record<string, any> = {};

  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    organizationId: string;
    customerId: string;
    customerPhone: string;
    status?: OrderStatus;
    createdAt?: Date;
  }) {
    this.id = params.id || uuidv4();
    this.organizationId = params.organizationId;
    this.customerId = params.customerId;
    this.customerPhone = params.customerPhone;
    this._status = params.status || OrderStatus.DRAFT;
    this.createdAt = params.createdAt || new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get items(): OrderItem[] {
    return [...this._items];
  }

  get status(): OrderStatus {
    return this._status;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business logic
  addItem(item: OrderItem): void {
    this.ensureOrderIsEditable();

    // Check if item already exists
    const existingIndex = this._items.findIndex((i) => i.productId === item.productId);

    if (existingIndex >= 0) {
      // Update quantity
      this._items[existingIndex].quantity += item.quantity;
    } else {
      this._items.push(item);
    }

    this.recalculateTotal();
    this._updatedAt = new Date();
  }

  removeItem(productId: string): void {
    this.ensureOrderIsEditable();

    this._items = this._items.filter((item) => item.productId !== productId);
    this.recalculateTotal();
    this._updatedAt = new Date();
  }

  updateItemQuantity(productId: string, quantity: number): void {
    this.ensureOrderIsEditable();

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const item = this._items.find((i) => i.productId === productId);
    if (!item) {
      throw new Error(`Item with productId ${productId} not found`);
    }

    item.quantity = quantity;
    this.recalculateTotal();
    this._updatedAt = new Date();
  }

  confirm(): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new Error('Only draft orders can be confirmed');
    }

    if (this._items.length === 0) {
      throw new Error('Cannot confirm order with no items');
    }

    this._status = OrderStatus.CONFIRMED;
    this._updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (this._status === OrderStatus.DELIVERED || this._status === OrderStatus.CANCELLED) {
      throw new Error(`Cannot cancel order with status: ${this._status}`);
    }

    this._status = OrderStatus.CANCELLED;
    if (reason) {
      this._notes = (this._notes || '') + `\nCancellation reason: ${reason}`;
    }
    this._updatedAt = new Date();
  }

  markAsProcessing(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error('Only confirmed orders can be marked as processing');
    }

    this._status = OrderStatus.PROCESSING;
    this._updatedAt = new Date();
  }

  markAsShipped(trackingNumber?: string): void {
    if (this._status !== OrderStatus.PROCESSING) {
      throw new Error('Only processing orders can be marked as shipped');
    }

    this._status = OrderStatus.SHIPPED;
    if (trackingNumber) {
      this._metadata.trackingNumber = trackingNumber;
    }
    this._updatedAt = new Date();
  }

  markAsDelivered(): void {
    if (this._status !== OrderStatus.SHIPPED) {
      throw new Error('Only shipped orders can be marked as delivered');
    }

    this._status = OrderStatus.DELIVERED;
    this._updatedAt = new Date();
  }

  setNotes(notes: string): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  setMetadata(key: string, value: any): void {
    this._metadata[key] = value;
    this._updatedAt = new Date();
  }

  private ensureOrderIsEditable(): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new Error(`Cannot modify order with status: ${this._status}`);
    }
  }

  private recalculateTotal(): void {
    this._totalAmount = this._items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  taxRate?: number;
  discount?: number;
}

export enum OrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
