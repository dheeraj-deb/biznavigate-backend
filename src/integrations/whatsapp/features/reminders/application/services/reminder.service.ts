import { Injectable, Logger } from '@nestjs/common';
import { Reminder, ReminderType, ReminderStatus } from '../../domain/reminder.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Reminder service for scheduling customer notifications
 */
@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('reminders') private reminderQueue: Queue
  ) {}

  /**
   * Schedule a reminder
   */
  async scheduleReminder(params: {
    organizationId: string;
    customerId: string;
    customerPhone: string;
    type: ReminderType;
    message: string;
    scheduledFor: Date;
    metadata?: Record<string, any>;
  }): Promise<Reminder> {
    this.logger.log(
      `Scheduling ${params.type} reminder for ${params.customerPhone} at ${params.scheduledFor}`
    );

    const reminder = new Reminder({
      organizationId: params.organizationId,
      customerId: params.customerId,
      customerPhone: params.customerPhone,
      type: params.type,
      message: params.message,
      scheduledFor: params.scheduledFor,
    });

    if (params.metadata) {
      Object.entries(params.metadata).forEach(([key, value]) => {
        reminder.setMetadata(key, value);
      });
    }

    await this.saveReminder(reminder);

    // Schedule job in queue
    const delay = params.scheduledFor.getTime() - Date.now();
    await this.reminderQueue.add(
      'send-reminder',
      {
        reminderId: reminder.id,
      },
      {
        delay: Math.max(0, delay),
        jobId: `reminder:${reminder.id}`,
      }
    );

    this.logger.log(`Reminder scheduled: ${reminder.id}`);

    return reminder;
  }

  /**
   * Schedule payment reminder
   */
  async schedulePaymentReminder(params: {
    organizationId: string;
    customerId: string;
    customerPhone: string;
    invoiceId: string;
    dueDate: Date;
    amount: number;
  }): Promise<Reminder> {
    const message = `💰 *Payment Reminder*\n\n` +
      `You have a payment of ₹${params.amount.toFixed(2)} due on ${params.dueDate.toLocaleDateString()}.\n\n` +
      `Invoice: ${params.invoiceId}\n\n` +
      `Please make the payment to avoid late fees.\n\n` +
      `Reply 'pay' to get payment details.`;

    // Schedule reminder 1 day before due date
    const scheduledFor = new Date(params.dueDate);
    scheduledFor.setDate(scheduledFor.getDate() - 1);

    return this.scheduleReminder({
      organizationId: params.organizationId,
      customerId: params.customerId,
      customerPhone: params.customerPhone,
      type: ReminderType.PAYMENT_DUE,
      message,
      scheduledFor,
      metadata: {
        invoiceId: params.invoiceId,
        amount: params.amount,
        dueDate: params.dueDate,
      },
    });
  }

  /**
   * Schedule abandoned cart reminder
   */
  async scheduleAbandonedCartReminder(params: {
    organizationId: string;
    customerId: string;
    customerPhone: string;
    cartId: string;
    itemCount: number;
  }): Promise<Reminder> {
    const message = `🛒 *You left items in your cart!*\n\n` +
      `You have ${params.itemCount} item(s) waiting for you.\n\n` +
      `Complete your order now and we'll process it right away!\n\n` +
      `Reply 'cart' to view your items.`;

    // Schedule reminder 1 hour after cart abandonment
    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + 1);

    return this.scheduleReminder({
      organizationId: params.organizationId,
      customerId: params.customerId,
      customerPhone: params.customerPhone,
      type: ReminderType.CART_ABANDONED,
      message,
      scheduledFor,
      metadata: {
        cartId: params.cartId,
        itemCount: params.itemCount,
      },
    });
  }

  /**
   * Send due reminders
   */
  async sendDueReminders(): Promise<number> {
    this.logger.log('Checking for due reminders...');

    const dueReminders = await this.findDueReminders();
    let sentCount = 0;

    for (const reminderData of dueReminders) {
      try {
        const reminder = this.hydrateReminder(reminderData);

        if (reminder.isReadyToSend()) {
          await this.reminderQueue.add('send-reminder', {
            reminderId: reminder.id,
          });
          sentCount++;
        }
      } catch (error) {
        this.logger.error(`Failed to queue reminder ${reminderData.id}:`, error);
      }
    }

    this.logger.log(`Queued ${sentCount} due reminders`);
    return sentCount;
  }

  /**
   * Cancel reminder
   */
  async cancelReminder(reminderId: string): Promise<void> {
    this.logger.log(`Cancelling reminder: ${reminderId}`);

    const reminder = await this.getReminder(reminderId);
    reminder.cancel();

    await this.saveReminder(reminder);

    // Remove from queue
    await this.reminderQueue.remove(`reminder:${reminderId}`);

    this.logger.log(`Reminder cancelled: ${reminderId}`);
  }

  /**
   * Get reminder by ID
   */
  async getReminder(reminderId: string): Promise<Reminder> {
    const data = await this.findReminderData(reminderId);
    if (!data) {
      throw new Error(`Reminder ${reminderId} not found`);
    }

    return this.hydrateReminder(data);
  }

  private async saveReminder(reminder: Reminder): Promise<void> {
    const reminderData = {
      id: reminder.id,
      organizationId: reminder.organizationId,
      customerId: reminder.customerId,
      customerPhone: reminder.customerPhone,
      type: reminder.type,
      message: reminder.message,
      scheduledFor: reminder.scheduledFor,
      status: reminder.status,
      sentAt: reminder.sentAt,
      failureReason: reminder.failureReason,
      metadata: reminder.metadata,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    };

    await this.prisma.whatsappMessage.upsert({
      where: {
        messageSid: `reminder:${reminder.id}`,
      },
      create: {
        messageSid: `reminder:${reminder.id}`,
        to: reminder.customerPhone,
        from: 'system',
        body: reminder.message,
        direction: 'outbound',
        providerResponse: reminderData,
      },
      update: {
        providerResponse: reminderData,
      },
    });
  }

  private async findReminderData(reminderId: string): Promise<any> {
    const record = await this.prisma.whatsappMessage.findUnique({
      where: { messageSid: `reminder:${reminderId}` },
    });

    return record?.providerResponse;
  }

  private async findDueReminders(): Promise<any[]> {
    const records = await this.prisma.whatsappMessage.findMany({
      where: {
        messageSid: { startsWith: 'reminder:' },
      },
    });

    return records
      .map((r) => r.providerResponse)
      .filter((r: any) => {
        return (
          r.status === ReminderStatus.SCHEDULED &&
          new Date(r.scheduledFor) <= new Date()
        );
      });
  }

  private hydrateReminder(data: any): Reminder {
    const reminder = new Reminder({
      id: data.id,
      organizationId: data.organizationId,
      customerId: data.customerId,
      customerPhone: data.customerPhone,
      type: data.type,
      message: data.message,
      scheduledFor: new Date(data.scheduledFor),
      status: data.status,
      createdAt: new Date(data.createdAt),
    });

    if (data.metadata) {
      Object.entries(data.metadata).forEach(([key, value]) => {
        reminder.setMetadata(key, value as any);
      });
    }

    return reminder;
  }
}
