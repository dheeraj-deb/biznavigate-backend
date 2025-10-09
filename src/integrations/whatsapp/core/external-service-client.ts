import { Injectable, Logger } from '@nestjs/common';
import { CircuitBreaker } from './circuit-breaker';

/**
 * Base class for external service clients with circuit breaker
 */
@Injectable()
export class ExternalServiceClient {
  protected readonly logger = new Logger(ExternalServiceClient.name);
  protected circuitBreaker: CircuitBreaker;

  constructor(serviceName: string) {
    this.circuitBreaker = new CircuitBreaker(serviceName, {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 10000,
      resetTimeout: 60000,
    });
  }

  /**
   * Execute request with circuit breaker protection
   */
  protected async executeWithCircuitBreaker<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    try {
      return await this.circuitBreaker.execute(fn);
    } catch (error) {
      this.logger.error('Service call failed:', error);

      if (fallback) {
        this.logger.log('Using fallback response');
        return await fallback();
      }

      throw error;
    }
  }

  /**
   * Get circuit breaker metrics
   */
  getCircuitMetrics() {
    return this.circuitBreaker.getMetrics();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuit(): void {
    this.circuitBreaker.reset();
  }
}
