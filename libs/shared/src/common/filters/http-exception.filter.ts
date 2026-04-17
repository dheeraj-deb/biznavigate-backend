import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      message: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log based on severity
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
