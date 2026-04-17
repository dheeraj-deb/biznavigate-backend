import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TemplateSyncSchedulerService implements OnModuleInit {
    private readonly logger = new Logger(TemplateSyncSchedulerService.name);

    constructor(
        @InjectQueue('whatsapp-template-sync') private readonly syncQueue: Queue,
    ) { }

    async onModuleInit() {
        await this.setupScheduledJobs();
    }

    private async setupScheduledJobs() {
        try {
            // Runs every 15 minutes to pick up newly approved/rejected templates
            await this.syncQueue.add(
                'sync-pending-templates',
                {},
                {
                    repeat: { pattern: '*/15 * * * *' },
                    jobId: 'whatsapp-template-sync-recurring',
                },
            );
            this.logger.log('Template sync job scheduled (every 15 minutes)');
        } catch (error) {
            this.logger.error('Failed to setup template sync job:', error);
        }
    }

    async triggerSync() {
        await this.syncQueue.add('sync-pending-templates', {}, { priority: 1 });
        this.logger.log('Template sync job triggered manually');
    }
}
