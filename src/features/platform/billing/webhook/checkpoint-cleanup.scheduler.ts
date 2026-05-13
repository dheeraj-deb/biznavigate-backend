import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../../prisma/prisma.service';

/**
 * Deletes expired LangGraph checkpoint rows nightly.
 * Without cleanup, checkpoint_blobs grows unbounded (binary blobs per AI session).
 * Runs at 03:00 every night.
 */
@Injectable()
export class CheckpointCleanupScheduler {
  private readonly logger = new Logger(CheckpointCleanupScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 3 * * *', { name: 'checkpoint-cleanup' })
  async cleanExpiredCheckpoints() {
    this.logger.log('Starting checkpoint cleanup...');

    try {
      const [blobs, writes, main] = await Promise.all([
        this.prisma.$executeRaw`
          DELETE FROM checkpoint_blobs WHERE expires_at < NOW()
        `,
        this.prisma.$executeRaw`
          DELETE FROM checkpoint_writes WHERE expires_at < NOW()
        `,
        this.prisma.$executeRaw`
          DELETE FROM checkpoints WHERE expires_at < NOW()
        `,
      ]);

      this.logger.log(
        `Checkpoint cleanup done — blobs: ${blobs}, writes: ${writes}, checkpoints: ${main}`,
      );
    } catch (err) {
      this.logger.error('Checkpoint cleanup failed', err?.message);
    }
  }
}
