import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as any;
    
    // Handle class-validator errors
    const validationErrors = Array.isArray(exceptionResponse.message) 
      ? exceptionResponse.message 
      : [exceptionResponse.message];

    const errorResponse = {
      statusCode: status,
      message: 'Validation failed',
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      validationErrors,
    };

    this.logger.warn(
      `Validation failed for ${request.method} ${request.url}: ${validationErrors.join(', ')}`,
    );

    response.status(status).json(errorResponse);
  }
}
