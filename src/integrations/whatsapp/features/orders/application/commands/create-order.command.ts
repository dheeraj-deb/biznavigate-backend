import { OrderItem } from '../../domain/order.entity';

/**
 * Command to create a new order
 */
export class CreateOrderCommand {
  constructor(
    public readonly organizationId: string,
    public readonly customerId: string,
    public readonly customerPhone: string,
    public readonly items: OrderItem[],
    public readonly notes?: string
  ) {}
}

/**
 * Command handler
 */
export interface CreateOrderCommandHandler {
  execute(command: CreateOrderCommand): Promise<CreateOrderCommandResult>;
}

export interface CreateOrderCommandResult {
  orderId: string;
  totalAmount: number;
  createdAt: Date;
}
