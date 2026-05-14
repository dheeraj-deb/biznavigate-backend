import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationService } from '../../../../engagement/notifications/application/services/notification.service';
import { NotificationChannel } from '../../../../engagement/notifications/domain/entities';

export interface OrderNotificationJobData {
  type: 'confirmation' | 'payment' | 'shipping' | 'delivery';
  order: { order_id: string; order_number: string; business_id: string; tenant_id?: string; customer_id: string; total_amount: string | number; payment_method?: string };
  customer: { name?: string; email?: string; phone?: string };
  trackingNumber?: string;
  carrier?: string;
}

@Processor('order-notifications')
export class OrderNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderNotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<OrderNotificationJobData>): Promise<void> {
    const { type, order, customer, trackingNumber, carrier } = job.data;

    try {
      switch (type) {
        case 'confirmation':
          await this.notificationService.send({
            business_id: order.business_id,
            tenant_id: order.tenant_id,
            customer_id: order.customer_id,
            recipient_email: customer.email,
            recipient_phone: customer.phone,
            recipient_name: customer.name,
            channel: NotificationChannel.EMAIL,
            subject: `Order Confirmation - ${order.order_number}`,
            body: `Thank you for your order! Your order ${order.order_number} has been received and is being processed.`,
            html_body: `<h2>Order Confirmation</h2><p>Thank you for your order, ${customer.name || 'valued customer'}!</p><p>Order Number: <strong>${order.order_number}</strong></p><p>Order Total: <strong>₹${Number(order.total_amount).toFixed(2)}</strong></p>`,
            related_entity_type: 'order',
            related_entity_id: order.order_id,
          });
          break;

        case 'payment':
          await this.notificationService.send({
            business_id: order.business_id,
            tenant_id: order.tenant_id,
            customer_id: order.customer_id,
            recipient_email: customer.email,
            recipient_phone: customer.phone,
            recipient_name: customer.name,
            channel: NotificationChannel.EMAIL,
            subject: `Payment Received - ${order.order_number}`,
            body: `Payment received for order ${order.order_number}.`,
            html_body: `<h2>Payment Confirmation</h2><p>We've received your payment for order <strong>${order.order_number}</strong>. Amount: ₹${Number(order.total_amount).toFixed(2)}.</p>`,
            related_entity_type: 'order',
            related_entity_id: order.order_id,
          });
          break;

        case 'shipping':
          await this.notificationService.send({
            business_id: order.business_id,
            tenant_id: order.tenant_id,
            customer_id: order.customer_id,
            recipient_email: customer.email,
            recipient_phone: customer.phone,
            recipient_name: customer.name,
            channel: NotificationChannel.EMAIL,
            subject: `Order Shipped - ${order.order_number}`,
            body: `Your order ${order.order_number} has been shipped! Tracking: ${trackingNumber} (${carrier})`,
            html_body: `<h2>Order Shipped</h2><p>Your order <strong>${order.order_number}</strong> has been shipped. Carrier: ${carrier}, Tracking: ${trackingNumber}</p>`,
            related_entity_type: 'order',
            related_entity_id: order.order_id,
          });
          break;

        case 'delivery':
          await this.notificationService.send({
            business_id: order.business_id,
            tenant_id: order.tenant_id,
            customer_id: order.customer_id,
            recipient_email: customer.email,
            recipient_phone: customer.phone,
            recipient_name: customer.name,
            channel: NotificationChannel.EMAIL,
            subject: `Order Delivered - ${order.order_number}`,
            body: `Your order ${order.order_number} has been delivered!`,
            html_body: `<h2>Order Delivered</h2><p>Your order <strong>${order.order_number}</strong> has been successfully delivered. Thank you for shopping with us!</p>`,
            related_entity_type: 'order',
            related_entity_id: order.order_id,
          });
          break;
      }
      this.logger.log(`Order notification sent: type=${type} order=${order.order_number}`);
    } catch (err) {
      this.logger.error(`Order notification failed: type=${type} order=${order.order_number} — ${err.message}`);
      throw err; // let BullMQ retry
    }
  }
}
