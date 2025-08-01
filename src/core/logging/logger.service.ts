import { Injectable, LoggerService, ConsoleLogger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface LogContext {
  userId?: string;
  requestId?: string;
  service?: string;
  method?: string;
  [key: string]: any;
}

@Injectable()
export class AppLoggerService extends ConsoleLogger implements LoggerService {
  constructor(private readonly configService: ConfigService) {
    super();
    this.setLogLevel();
  }

  private setLogLevel() {
    const nodeEnv = this.configService.get("app.nodeEnv");
    const logLevels: import("@nestjs/common").LogLevel[] =
      nodeEnv === "production"
        ? ["error", "warn", "log"]
        : ["error", "warn", "log", "debug", "verbose"];

    this.setLogLevels(logLevels);
  }

  logWithContext(
    level: "log" | "error" | "warn" | "debug",
    message: string,
    context?: LogContext
  ) {
    const logMessage = context
      ? `${message} ${JSON.stringify(context)}`
      : message;

    switch (level) {
      case "error":
        this.error(logMessage);
        break;
      case "warn":
        this.warn(logMessage);
        break;
      case "debug":
        this.debug(logMessage);
        break;
      default:
        this.log(logMessage);
    }
  }

  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext
  ) {
    this.logWithContext(
      "log",
      `${method} ${url} - ${statusCode} - ${responseTime}ms`,
      context
    );
  }

  logError(error: Error, context?: LogContext) {
    this.logWithContext("error", `${error.message}`, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  }

  logBusinessEvent(event: string, data?: any, context?: LogContext) {
    this.logWithContext("log", `Business Event: ${event}`, {
      ...context,
      eventData: data,
    });
  }

  logDatabaseQuery(query: string, duration: number, context?: LogContext) {
    this.logWithContext("debug", `Database Query - ${duration}ms`, {
      ...context,
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
      duration,
    });
  }

  logExternalService(
    service: string,
    operation: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ) {
    const level = success ? "log" : "warn";
    this.logWithContext(
      level,
      `External Service: ${service}.${operation} - ${
        success ? "SUCCESS" : "FAILED"
      } - ${duration}ms`,
      context
    );
  }
}
