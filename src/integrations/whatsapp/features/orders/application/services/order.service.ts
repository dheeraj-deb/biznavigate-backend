import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Order, OrderItem, OrderStatus } from '../../domain/order.entity';
import { CreateOrderCommand, CreateOrderCommandResult } from '../commands/create-order.command';
import { ConfirmOrderCommand } from '../commands/confirm-order.command';
import { CancelOrderCommand } from '../commands/cancel-order.command';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Order service implementing CQRS command handlers
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('order-processing') private orderQueue: Queue
  ) {}

  /**
   * Create a new order
   */
  async createOrder(command: CreateOrderCommand): Promise<CreateOrderCommandResult> {
    this.logger.log(`Creating order for customer: ${command.customerId}`);

    // Create order entity
    const order = new Order({
      organizationId: command.organizationId,
      customerId: command.customerId,
      customerPhone: command.customerPhone,
    });

    // Add items
    for (const item of command.items) {
      order.addItem(item);
    }

    if (command.notes) {
      order.setNotes(command.notes);
    }

    // Persist to database
    await this.saveOrder(order);

    this.logger.log(`Order created: ${order.id}, Total: ${order.totalAmount}`);

    return {
      orderId: order.id,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    };
  }

  /**
   * Confirm order
   */
  async confirmOrder(command: ConfirmOrderCommand): Promise<void> {
    this.logger.log(`Confirming order: ${command.orderId}`);

    const order = await this.getOrder(command.orderId);
    order.confirm();

    await this.saveOrder(order);

    // Trigger order processing workflow
    await this.orderQueue.add('process-order', {
      orderId: order.id,
      confirmedBy: command.confirmedBy,
      timestamp: new Date(),
    });

    this.logger.log(`Order confirmed: ${order.id}`);
  }

  /**
   * Cancel order
   */
  async cancelOrder(command: CancelOrderCommand): Promise<void> {
    this.logger.log(`Cancelling order: ${command.orderId}`);

    const order = await this.getOrder(command.orderId);
    order.cancel(command.reason);

    await this.saveOrder(order);

    this.logger.log(`Order cancelled: ${order.id}`);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    // For now, we'll store orders in whatsappMessage metadata
    // In production, create a dedicated orders table
    const orderData = await this.findOrderData(orderId);

    if (!orderData) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return this.hydrateOrder(orderData);
  }

  /**
   * Get orders by customer
   */
  async getOrdersByCustomer(customerPhone: string, limit: number = 10): Promise<Order[]> {
    // Query from database
    const ordersData = await this.findOrdersByCustomer(customerPhone, limit);
    return ordersData.map((data) => this.hydrateOrder(data));
  }

  /**
   * Save order to database
   */
  private async saveOrder(order: Order): Promise<void> {
    const orderData = {
      id: order.id,
      organizationId: order.organizationId,
      customerId: order.customerId,
      customerPhone: order.customerPhone,
      items: order.items,
      status: order.status,
      totalAmount: order.totalAmount,
      notes: order.notes,
      metadata: order.metadata,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    // Store in whatsappMessage for now (temporary solution)
    // TODO: Create dedicated orders table
    await this.prisma.whatsappMessage.upsert({
      where: {
        messageSid: `order:${order.id}`,
      },
      create: {
        messageSid: `order:${order.id}`,
        to: order.customerPhone,
        from: 'system',
        body: `Order ${order.id}`,
        direction: 'outbound',
        providerResponse: orderData as any,
      },
      update: {
        providerResponse: orderData as any,
      },
    });
  }

  private async findOrderData(orderId: string): Promise<any> {
    const record = await this.prisma.whatsappMessage.findUnique({
      where: { messageSid: `order:${orderId}` },
    });

    return record?.providerResponse;
  }

  private async findOrdersByCustomer(customerPhone: string, limit: number): Promise<any[]> {
    const records = await this.prisma.whatsappMessage.findMany({
      where: {
        to: customerPhone,
        messageSid: { startsWith: 'order:' },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map((r) => r.providerResponse);
  }

  private hydrateOrder(data: any): Order {
    const order = new Order({
      id: data.id,
      organizationId: data.organizationId,
      customerId: data.customerId,
      customerPhone: data.customerPhone,
      status: data.status,
      createdAt: new Date(data.createdAt),
    });

    // Reconstruct state
    for (const item of data.items || []) {
      order.addItem(item);
    }

    if (data.notes) {
      order.setNotes(data.notes);
    }

    return order;
  }
}
