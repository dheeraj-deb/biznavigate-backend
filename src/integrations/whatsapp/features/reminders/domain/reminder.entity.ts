import { v4 as uuidv4 } from 'uuid';

/**
 * Reminder entity for scheduled customer notifications
 */
export class Reminder {
  readonly id: string;
  readonly organizationId: string;
  readonly customerId: string;
  readonly customerPhone: string;

  private _type: ReminderType;
  private _message: string;
  private _scheduledFor: Date;
  private _status: ReminderStatus;
  private _sentAt?: Date;
  private _failureReason?: string;
  private _metadata: Record<string, any> = {};

  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    organizationId: string;
    customerId: string;
    customerPhone: string;
    type: ReminderType;
    message: string;
    scheduledFor: Date;
    status?: ReminderStatus;
    createdAt?: Date;
  }) {
    this.id = params.id || uuidv4();
    this.organizationId = params.organizationId;
    this.customerId = params.customerId;
    this.customerPhone = params.customerPhone;
    this._type = params.type;
    this._message = params.message;
    this._scheduledFor = params.scheduledFor;
    this._status = params.status || ReminderStatus.SCHEDULED;
    this.createdAt = params.createdAt || new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get type(): ReminderType {
    return this._type;
  }

  get message(): string {
    return this._message;
  }

  get scheduledFor(): Date {
    return this._scheduledFor;
  }

  get status(): ReminderStatus {
    return this._status;
  }

  get sentAt(): Date | undefined {
    return this._sentAt;
  }

  get failureReason(): string | undefined {
    return this._failureReason;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business logic
  isReadyToSend(): boolean {
    return (
      this._status === ReminderStatus.SCHEDULED &&
      new Date() >= this._scheduledFor
    );
  }

  markAsSent(sentAt?: Date): void {
    if (this._status !== ReminderStatus.SCHEDULED) {
      throw new Error('Only scheduled reminders can be marked as sent');
    }

    this._status = ReminderStatus.SENT;
    this._sentAt = sentAt || new Date();
    this._updatedAt = new Date();
  }

  markAsFailed(reason: string): void {
    this._status = ReminderStatus.FAILED;
    this._failureReason = reason;
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this._status !== ReminderStatus.SCHEDULED) {
      throw new Error('Only scheduled reminders can be cancelled');
    }

    this._status = ReminderStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  reschedule(newTime: Date): void {
    if (this._status !== ReminderStatus.SCHEDULED) {
      throw new Error('Only scheduled reminders can be rescheduled');
    }

    if (newTime < new Date()) {
      throw new Error('Cannot reschedule to past time');
    }

    this._scheduledFor = newTime;
    this._updatedAt = new Date();
  }

  setMetadata(key: string, value: any): void {
    this._metadata[key] = value;
    this._updatedAt = new Date();
  }
}

export enum ReminderType {
  PAYMENT_DUE = 'payment_due',
  ORDER_FOLLOWUP = 'order_followup',
  RESTOCK = 'restock',
  CART_ABANDONED = 'cart_abandoned',
  CUSTOM = 'custom',
}

export enum ReminderStatus {
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
