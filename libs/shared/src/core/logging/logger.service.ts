import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";

export interface LogContext {
  userId?: string;
  requestId?: string;
  service?: string;
  method?: string;
  [key: string]: any;
}

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    const isProduction = this.configService.get("app.nodeEnv") === "production";

    this.logger = winston.createLogger({
      level: isProduction ? "warn" : "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        isProduction
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length
                  ? " " + JSON.stringify(meta, null, 2)
                  : "";
                return `${timestamp} [${level}] ${message}${metaStr}`;
              })
            )
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  logWithContext(
    level: "log" | "error" | "warn" | "debug",
    message: string,
    context?: LogContext
  ) {
    const winstonLevel = level === "log" ? "info" : level;
    this.logger.log(winstonLevel, message, context ?? {});
  }

  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext
  ) {
    this.logger.info(`${method} ${url} ${statusCode} ${responseTime}ms`, {
      type: "http_request",
      method,
      url,
      statusCode,
      responseTime,
      ...context,
    });
  }

  logError(error: Error, context?: LogContext) {
    this.logger.error(error.message, {
      type: "error",
      name: error.name,
      stack: error.stack,
      ...context,
    });
  }

  logBusinessEvent(event: string, data?: any, context?: LogContext) {
    this.logger.info(`Business Event: ${event}`, {
      type: "business_event",
      event,
      eventData: data,
      ...context,
    });
  }

  logDatabaseQuery(query: string, duration: number, context?: LogContext) {
    this.logger.debug(`DB Query ${duration}ms`, {
      type: "db_query",
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
      duration,
      ...context,
    });
  }

  logExternalService(
    service: string,
    operation: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ) {
    const level = success ? "info" : "warn";
    this.logger.log(level, `External Service: ${service}.${operation} ${success ? "SUCCESS" : "FAILED"} ${duration}ms`, {
      type: "external_service",
      service,
      operation,
      duration,
      success,
      ...context,
    });
  }
}
