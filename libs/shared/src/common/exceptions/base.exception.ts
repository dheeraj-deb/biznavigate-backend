import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class BaseException extends HttpException {
  public readonly timestamp: string;
  public readonly path?: string;

  constructor(
    message: string,
    status: HttpStatus,
    path?: string,
  ) {
    super(message, status);
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export class BusinessLogicException extends BaseException {
  constructor(message: string, path?: string) {
    super(message, HttpStatus.BAD_REQUEST, path);
  }
}

export class ResourceNotFoundException extends BaseException {
  constructor(resource: string, identifier: string, path?: string) {
    super(`${resource} with identifier '${identifier}' not found`, HttpStatus.NOT_FOUND, path);
  }
}

export class DuplicateResourceException extends BaseException {
  constructor(resource: string, field: string, value: string, path?: string) {
    super(`${resource} with ${field} '${value}' already exists`, HttpStatus.CONFLICT, path);
  }
}

export class ValidationException extends BaseException {
  constructor(errors: string[], path?: string) {
    super(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST, path);
  }
}

export class ExternalServiceException extends BaseException {
  constructor(service: string, message: string, path?: string) {
    super(`External service '${service}' error: ${message}`, HttpStatus.SERVICE_UNAVAILABLE, path);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized access', path?: string) {
    super(message, HttpStatus.UNAUTHORIZED, path);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden resource', path?: string) {
    super(message, HttpStatus.FORBIDDEN, path);
  }
}

export class RateLimitException extends BaseException {
  constructor(message: string = 'Rate limit exceeded', path?: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, path);
  }
}
