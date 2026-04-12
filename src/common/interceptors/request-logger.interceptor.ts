import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../../core/logging/logger.service';

/**
 * RequestLoggerInterceptor — logs every HTTP request with method, path,
 * status code, and response time using the existing AppLoggerService.logRequest().
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode: number = response.statusCode;
        const duration = Date.now() - start;
        this.logger.logRequest(method, path, statusCode, duration, {
          correlationId: (request as any).correlationId,
        });
      }),
    );
  }
}
