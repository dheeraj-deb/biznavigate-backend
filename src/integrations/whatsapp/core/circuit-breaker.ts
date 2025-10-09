import { Logger } from '@nestjs/common';

/**
 * Circuit breaker pattern for external service calls
 */
export class CircuitBreaker {
  private readonly logger = new Logger(CircuitBreaker.name);

  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private nextAttemptTime?: Date;

  constructor(
    private readonly serviceName: string,
    private readonly options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      successThreshold: options.successThreshold || 2,
      timeout: options.timeout || 30000,
      resetTimeout: options.resetTimeout || 60000,
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.logger.log(`${this.serviceName}: Attempting to close circuit (half-open)`);
        this.state = CircuitState.HALF_OPEN;
      } else {
        const waitTime = this.nextAttemptTime
          ? Math.ceil((this.nextAttemptTime.getTime() - Date.now()) / 1000)
          : 0;

        throw new CircuitBreakerError(
          `Circuit breaker is OPEN for ${this.serviceName}. Retry in ${waitTime}s`,
          this.serviceName
        );
      }
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);

      // Success
      this.onSuccess();

      return result;
    } catch (error) {
      // Failure
      this.onFailure();

      throw error;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Reset circuit manually
   */
  reset(): void {
    this.logger.log(`${this.serviceName}: Circuit manually reset`);
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`${this.serviceName} timeout after ${this.options.timeout}ms`)),
          this.options.timeout
        )
      ),
    ]);
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.options.successThreshold!) {
        this.logger.log(`${this.serviceName}: Circuit closed after successful attempts`);
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.warn(`${this.serviceName}: Circuit opened after failure in half-open state`);
      this.openCircuit();
    } else if (this.failureCount >= this.options.failureThreshold!) {
      this.logger.warn(
        `${this.serviceName}: Circuit opened after ${this.failureCount} failures`
      );
      this.openCircuit();
    }
  }

  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = new Date(Date.now() + this.options.resetTimeout!);
  }

  private shouldAttemptReset(): boolean {
    return (
      this.nextAttemptTime !== undefined &&
      Date.now() >= this.nextAttemptTime.getTime()
    );
  }
}

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures before opening circuit
  successThreshold?: number; // Number of successes to close circuit from half-open
  timeout?: number; // Request timeout in ms
  resetTimeout?: number; // Time before attempting to close circuit in ms
}

export enum CircuitState {
  CLOSED = 'closed', // Normal operation
  OPEN = 'open', // Failing, rejecting requests
  HALF_OPEN = 'half-open', // Testing if service recovered
}

export class CircuitBreakerError extends Error {
  constructor(message: string, public readonly serviceName: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}
