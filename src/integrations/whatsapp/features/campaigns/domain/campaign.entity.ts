import { v4 as uuidv4 } from 'uuid';

/**
 * Campaign entity for broadcast messaging
 */
export class Campaign {
  readonly id: string;
  readonly organizationId: string;

  private _name: string;
  private _message: string;
  private _type: CampaignType;
  private _status: CampaignStatus;
  private _targetAudience: TargetAudience;
  private _scheduledFor?: Date;
  private _startedAt?: Date;
  private _completedAt?: Date;

  // Metrics
  private _totalRecipients: number = 0;
  private _sentCount: number = 0;
  private _deliveredCount: number = 0;
  private _failedCount: number = 0;
  private _responseCount: number = 0;

  private _metadata: Record<string, any> = {};

  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    organizationId: string;
    name: string;
    message: string;
    type: CampaignType;
    targetAudience: TargetAudience;
    scheduledFor?: Date;
    status?: CampaignStatus;
    createdAt?: Date;
  }) {
    this.id = params.id || uuidv4();
    this.organizationId = params.organizationId;
    this._name = params.name;
    this._message = params.message;
    this._type = params.type;
    this._targetAudience = params.targetAudience;
    this._scheduledFor = params.scheduledFor;
    this._status = params.status || CampaignStatus.DRAFT;
    this.createdAt = params.createdAt || new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get message(): string {
    return this._message;
  }

  get type(): CampaignType {
    return this._type;
  }

  get status(): CampaignStatus {
    return this._status;
  }

  get targetAudience(): TargetAudience {
    return this._targetAudience;
  }

  get scheduledFor(): Date | undefined {
    return this._scheduledFor;
  }

  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get totalRecipients(): number {
    return this._totalRecipients;
  }

  get sentCount(): number {
    return this._sentCount;
  }

  get deliveredCount(): number {
    return this._deliveredCount;
  }

  get failedCount(): number {
    return this._failedCount;
  }

  get responseCount(): number {
    return this._responseCount;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Computed metrics
  get deliveryRate(): number {
    return this._sentCount > 0 ? (this._deliveredCount / this._sentCount) * 100 : 0;
  }

  get responseRate(): number {
    return this._deliveredCount > 0 ? (this._responseCount / this._deliveredCount) * 100 : 0;
  }

  // Business logic
  schedule(scheduledFor: Date): void {
    if (this._status !== CampaignStatus.DRAFT) {
      throw new Error('Only draft campaigns can be scheduled');
    }

    if (scheduledFor < new Date()) {
      throw new Error('Cannot schedule campaign in the past');
    }

    this._scheduledFor = scheduledFor;
    this._status = CampaignStatus.SCHEDULED;
    this._updatedAt = new Date();
  }

  start(totalRecipients: number): void {
    if (this._status !== CampaignStatus.SCHEDULED && this._status !== CampaignStatus.DRAFT) {
      throw new Error(`Cannot start campaign with status: ${this._status}`);
    }

    this._status = CampaignStatus.RUNNING;
    this._totalRecipients = totalRecipients;
    this._startedAt = new Date();
    this._updatedAt = new Date();
  }

  incrementSent(): void {
    this._sentCount++;
    this._updatedAt = new Date();
  }

  incrementDelivered(): void {
    this._deliveredCount++;
    this._updatedAt = new Date();
  }

  incrementFailed(): void {
    this._failedCount++;
    this._updatedAt = new Date();
  }

  incrementResponse(): void {
    this._responseCount++;
    this._updatedAt = new Date();
  }

  complete(): void {
    if (this._status !== CampaignStatus.RUNNING) {
      throw new Error('Only running campaigns can be completed');
    }

    this._status = CampaignStatus.COMPLETED;
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === CampaignStatus.COMPLETED || this._status === CampaignStatus.CANCELLED) {
      throw new Error(`Cannot cancel campaign with status: ${this._status}`);
    }

    this._status = CampaignStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  pause(): void {
    if (this._status !== CampaignStatus.RUNNING) {
      throw new Error('Only running campaigns can be paused');
    }

    this._status = CampaignStatus.PAUSED;
    this._updatedAt = new Date();
  }

  resume(): void {
    if (this._status !== CampaignStatus.PAUSED) {
      throw new Error('Only paused campaigns can be resumed');
    }

    this._status = CampaignStatus.RUNNING;
    this._updatedAt = new Date();
  }

  setMetadata(key: string, value: any): void {
    this._metadata[key] = value;
    this._updatedAt = new Date();
  }
}

export interface TargetAudience {
  type: 'all' | 'segment' | 'custom';
  filters?: {
    customerType?: string[];
    lastOrderDate?: { from?: Date; to?: Date };
    totalSpent?: { min?: number; max?: number };
    location?: string[];
  };
  customerIds?: string[];
}

export enum CampaignType {
  PROMOTIONAL = 'promotional',
  TRANSACTIONAL = 'transactional',
  ANNOUNCEMENT = 'announcement',
  FEEDBACK = 'feedback',
  REENGAGEMENT = 'reengagement',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
