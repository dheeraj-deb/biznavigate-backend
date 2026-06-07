import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongoDbConnectionGuard implements OnModuleInit {
  private readonly logger = new Logger(MongoDbConnectionGuard.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit(): Promise<void> {
    await this.assertConnected('startup');

    this.connection.on('connected', () => {
      this.logger.log(`MongoDB connected: ${this.describeConnection()}`);
    });

    this.connection.on('reconnected', () => {
      this.logger.log(`MongoDB reconnected: ${this.describeConnection()}`);
    });

    this.connection.on('error', (error) => {
      this.logger.error(`MongoDB connection error: ${error?.message ?? error}`);
    });

    this.connection.on('disconnected', () => {
      const message = `MongoDB disconnected: ${this.describeConnection()}`;
      this.logger.error(message);
      setImmediate(() => process.exit(1));
    });
  }

  private async assertConnected(reason: string): Promise<void> {
    if (this.connection.readyState !== 1 || !this.connection.db) {
      throw new Error(`MongoDB is not connected during ${reason}: ${this.describeConnection()}`);
    }

    await this.connection.db.admin().ping();
    this.logger.log(`MongoDB ready during ${reason}: ${this.describeConnection()}`);
  }

  private describeConnection(): string {
    return JSON.stringify({
      readyState: this.connection.readyState,
      readyStateLabel: this.readyStateLabel(this.connection.readyState),
      dbName: this.connection.name || null,
      host: this.connection.host || null,
    });
  }

  private readyStateLabel(state: number): string {
    switch (state) {
      case 0:
        return 'disconnected';
      case 1:
        return 'connected';
      case 2:
        return 'connecting';
      case 3:
        return 'disconnecting';
      default:
        return 'unknown';
    }
  }
}
