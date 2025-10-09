/**
 * Command to confirm an order
 */
export class ConfirmOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly confirmedBy: string
  ) {}
}

export interface ConfirmOrderCommandHandler {
  execute(command: ConfirmOrderCommand): Promise<void>;
}
