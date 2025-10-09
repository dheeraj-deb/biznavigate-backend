/**
 * Command to cancel an order
 */
export class CancelOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly reason?: string
  ) {}
}

export interface CancelOrderCommandHandler {
  execute(command: CancelOrderCommand): Promise<void>;
}
