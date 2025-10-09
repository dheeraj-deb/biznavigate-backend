import { Injectable, Logger } from '@nestjs/common';
import { MessageContext } from '../message-context';
import { MessageMiddleware } from './message-middleware.interface';

/**
 * Middleware pipeline executor
 */
@Injectable()
export class MiddlewarePipeline {
  private readonly logger = new Logger(MiddlewarePipeline.name);
  private middlewares: { middleware: MessageMiddleware; order: number }[] = [];

  /**
   * Register middleware with execution order
   */
  use(middleware: MessageMiddleware, order: number = 1000): void {
    this.middlewares.push({ middleware, order });
    this.middlewares.sort((a, b) => a.order - b.order);
    this.logger.log(`Registered middleware: ${middleware.constructor.name} (order: ${order})`);
  }

  /**
   * Execute middleware pipeline
   */
  async execute(context: MessageContext): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) {
        return;
      }

      const { middleware } = this.middlewares[index++];

      try {
        await middleware.process(context, next);
      } catch (error) {
        this.logger.error(
          `Middleware ${middleware.constructor.name} failed:`,
          error
        );
        context.setError(error);

        // Continue to error handling middleware
        if (index < this.middlewares.length) {
          await next();
        }
      }
    };

    await next();
  }
}
