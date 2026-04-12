import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Inject } from "@nestjs/common";
import * as winston from "winston";
import { TenantContext } from "../../prisma/tenant-context";

export interface LogContext {
  userId?: string;
  requestId?: string;
  service?: string;
  method?: string;
  [key: string]: any;
}

/**
 * AppLoggerService — wraps Winston via nest-winston.
 * All existing method signatures (logRequest, logError, logBusinessEvent, etc.)
 * are preserved — no consumers need to change.
 * Correlation IDs are automatically injected from AsyncLocalStorage.
 */
@Injectable()
export class AppLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: winston.Logger,
    private readonly configService: ConfigService,
  ) {}

  private enrichContext(context?: LogContext): Record<string, any> {
    return {
      ...(context || {}),
      correlationId: TenantContext.getCorrelationId(),
      tenantId: TenantContext.getTenantId(),
    };
  }

  log(message: any, context?: string) {
    this.winstonLogger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.winstonLogger.error(message, { context, stack: trace });
  }

  warn(message: any, context?: string) {
    this.winstonLogger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.winstonLogger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.winstonLogger.verbose(message, { context });
  }

  logWithContext(
    level: "log" | "error" | "warn" | "debug",
    message: string,
    context?: LogContext,
  ) {
    const enriched = this.enrichContext(context);
    const winstonLevel = level === "log" ? "info" : level;
    this.winstonLogger.log(winstonLevel, message, enriched);
  }

  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext,
  ) {
    this.winstonLogger.info(`${method} ${url} ${statusCode} ${responseTime}ms`, {
      ...this.enrichContext(context),
      method,
      url,
      statusCode,
      responseTime,
    });
  }

  logError(error: Error, context?: LogContext) {
    this.winstonLogger.error(error.message, {
      ...this.enrichContext(context),
      stack: error.stack,
      name: error.name,
    });
  }

  logBusinessEvent(event: string, data?: any, context?: LogContext) {
    this.winstonLogger.info(`Business Event: ${event}`, {
      ...this.enrichContext(context),
      eventData: data,
    });
  }

  logDatabaseQuery(query: string, duration: number, context?: LogContext) {
    this.winstonLogger.debug(`DB Query ${duration}ms`, {
      ...this.enrichContext(context),
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
      duration,
    });
  }

  logExternalService(
    service: string,
    operation: string,
    duration: number,
    success: boolean,
    context?: LogContext,
  ) {
    const level = success ? "info" : "warn";
    this.winstonLogger.log(level, `External: ${service}.${operation} ${success ? "OK" : "FAILED"} ${duration}ms`, {
      ...this.enrichContext(context),
      service,
      operation,
      duration,
      success,
    });
  }
}
