import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReminderService } from '../features/reminders/application/services/reminder.service';
import { WhatsAppService } from '../services/whatsapp.service';

/**
 * Worker for sending scheduled reminders
 */
@Processor('reminders')
export class ReminderWorker extends WorkerHost {
  private readonly logger = new Logger(ReminderWorker.name);

  constructor(
    private readonly reminderService: ReminderService,
    private readonly whatsappService: WhatsAppService
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { reminderId } = job.data;

    this.logger.log(`Sending reminder: ${reminderId}`);

    try {
      // Get reminder
      const reminder = await this.reminderService.getReminder(reminderId);

      // Check if still ready to send
      if (!reminder.isReadyToSend()) {
        this.logger.warn(`Reminder ${reminderId} is not ready to send`);
        return { status: 'skipped', reason: 'not_ready' };
      }

      // Send via WhatsApp
      await this.whatsappService.sendMessage(
        reminder.customerPhone,
        reminder.organizationId,
        { message: reminder.message }
      );

      // Mark as sent
      reminder.markAsSent();
      await this.reminderService['saveReminder'](reminder);

      this.logger.log(`Reminder ${reminderId} sent successfully`);

      return {
        reminderId,
        status: 'sent',
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send reminder ${reminderId}:`, error);

      // Mark as failed
      try {
        const reminder = await this.reminderService.getReminder(reminderId);
        reminder.markAsFailed(error.message);
        await this.reminderService['saveReminder'](reminder);
      } catch (updateError) {
        this.logger.error('Failed to mark reminder as failed:', updateError);
      }

      throw error;
    }
  }
}
